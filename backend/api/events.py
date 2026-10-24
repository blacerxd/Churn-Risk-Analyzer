import asyncio
import json
import threading

QUEUE_SIZE = 100


def format_sse(event, data):
    payload = json.dumps(data, ensure_ascii=False, default=str)
    return f'event: {event}\ndata: {payload}\n\n'


class EventBroker:
    """In-process fan-out of server-sent events.

    Works with a single ASGI worker. publish() may be called from any thread,
    each subscriber queue lives on its own event loop.
    """

    def __init__(self):
        self._subscribers = set()
        self._lock = threading.Lock()

    def subscribe(self):
        subscription = (asyncio.get_running_loop(), asyncio.Queue(maxsize=QUEUE_SIZE))
        with self._lock:
            self._subscribers.add(subscription)
        return subscription

    def unsubscribe(self, subscription):
        with self._lock:
            self._subscribers.discard(subscription)

    @property
    def subscriber_count(self):
        return len(self._subscribers)

    def publish(self, event, data):
        message = format_sse(event, data)
        with self._lock:
            subscribers = list(self._subscribers)
        for loop, queue in subscribers:
            try:
                loop.call_soon_threadsafe(self._put, queue, message)
            except RuntimeError:
                self.unsubscribe((loop, queue))

    @staticmethod
    def _put(queue, message):
        if queue.full():
            queue.get_nowait()
        queue.put_nowait(message)


broker = EventBroker()
