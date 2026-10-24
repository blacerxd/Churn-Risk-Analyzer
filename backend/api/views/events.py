import asyncio

from django.http import JsonResponse, StreamingHttpResponse
from django.views.decorators.http import require_GET

from api.events import broker

PING_INTERVAL = 15


async def event_stream(ping_interval=PING_INTERVAL):
    subscription = broker.subscribe()
    _, queue = subscription
    try:
        yield 'retry: 3000\n\n'
        while True:
            try:
                yield await asyncio.wait_for(queue.get(), timeout=ping_interval)
            except TimeoutError:
                yield ': ping\n\n'
    finally:
        broker.unsubscribe(subscription)


@require_GET
async def events(request):
    user = await request.auser()
    if not user.is_authenticated:
        return JsonResponse(
            {'detail': 'Учетные данные не были предоставлены.', 'code': 'not_authenticated'},
            status=401,
            json_dumps_params={'ensure_ascii': False},
        )

    response = StreamingHttpResponse(event_stream(), content_type='text/event-stream')
    response['Cache-Control'] = 'no-cache'
    response['X-Accel-Buffering'] = 'no'
    return response
