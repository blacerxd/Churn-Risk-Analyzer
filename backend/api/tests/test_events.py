import asyncio
import json

import pytest
from asgiref.sync import sync_to_async
from django.db import connections
from django.test import AsyncClient

from analytics.signals import recalculated
from api.events import broker
from api.views.events import event_stream

EVENTS_URL = '/api/v1/events'


def parse(message):
    lines = dict(line.split(': ', 1) for line in message.strip().splitlines())
    return lines['event'], json.loads(lines['data'])


def test_events_requires_auth():
    response = asyncio.run(AsyncClient().get(EVENTS_URL))

    assert response.status_code == 401
    assert response.json()['code'] == 'not_authenticated'


@pytest.mark.django_db(transaction=True)
def test_events_stream_headers(user):
    async def scenario():
        client = AsyncClient()
        await client.aforce_login(user)
        response = await client.get(EVENTS_URL)
        first = await anext(aiter(response.streaming_content))
        await response.streaming_content.aclose()
        await sync_to_async(connections.close_all)()
        return response, first

    response, first = asyncio.run(scenario())

    assert response.status_code == 200
    assert response['Content-Type'] == 'text/event-stream'
    assert response['Cache-Control'] == 'no-cache'
    assert response['X-Accel-Buffering'] == 'no'
    assert first == b'retry: 3000\n\n'


def test_stream_delivers_published_event_and_pings():
    async def scenario():
        stream = event_stream(ping_interval=0.05)
        assert await anext(stream) == 'retry: 3000\n\n'

        pending = asyncio.ensure_future(anext(stream))
        await asyncio.sleep(0)
        await asyncio.to_thread(broker.publish, 'recalculated', {'reason': 'settings'})
        message = await pending

        ping = await anext(stream)
        await stream.aclose()
        return message, ping

    message, ping = asyncio.run(scenario())

    assert parse(message) == ('recalculated', {'reason': 'settings'})
    assert ping == ': ping\n\n'
    assert broker.subscriber_count == 0


@pytest.mark.django_db(transaction=True)
def test_recalculated_signal_is_broadcast():
    summary = {'customers_total': 10, 'by_level': {'high': 2}}

    def send_and_close():
        recalculated.send(sender=None, reason='snapshot', summary=summary)
        connections.close_all()

    async def scenario():
        stream = event_stream(ping_interval=5)
        await anext(stream)
        pending = asyncio.ensure_future(anext(stream))
        await asyncio.sleep(0)
        await asyncio.to_thread(send_and_close)
        message = await pending
        await stream.aclose()
        return message

    event, data = parse(asyncio.run(scenario()))

    assert event == 'recalculated'
    assert data['reason'] == 'snapshot'
    assert data['summary'] == summary
    assert data['at']


def test_slow_client_keeps_latest_events():
    async def scenario():
        subscription = broker.subscribe()
        _, queue = subscription
        for i in range(150):
            broker.publish('recalculated', {'n': i})
        await asyncio.sleep(0)
        broker.unsubscribe(subscription)
        return [parse(queue.get_nowait())[1]['n'] for _ in range(queue.qsize())]

    received = asyncio.run(scenario())

    assert len(received) == 100
    assert received[-1] == 149
