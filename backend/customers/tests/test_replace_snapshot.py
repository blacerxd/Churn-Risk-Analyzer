from datetime import UTC, datetime

import pytest
from django.db import connection

from customers.importer import ImportResult, SnapshotValidationError, replace_snapshot
from customers.models import Customer, Service, ServiceStatusEvent, Transaction
from customers.signals import snapshot_replaced

from .snapshots import account, service, snapshot, transaction

pytestmark = pytest.mark.django_db

T1 = datetime(2026, 10, 20, 10, 0, tzinfo=UTC)
T2 = datetime(2026, 10, 21, 10, 0, tzinfo=UTC)


def db_state():
    return (
        list(Customer.objects.values_list('id', 'email', 'balance')),
        list(Service.objects.values_list('id', 'customer_id', 'status')),
        list(Transaction.objects.values_list('id', 'service_id', 'status')),
    )


@pytest.fixture
def received():
    """Перехватывает сигнал snapshot_replaced."""
    calls = []

    def receiver(sender, result, **kwargs):
        calls.append(result)

    snapshot_replaced.connect(receiver)
    yield calls
    snapshot_replaced.disconnect(receiver)


def test_loads_snapshot():
    result = replace_snapshot(snapshot(), now=T1)

    assert result == ImportResult(
        accounts=1, services=1, transactions=1, status_changes=0, imported_at=T1,
    )
    assert db_state() == (
        [(1, 'user-0001@example.test', 1000)],
        [(10, 1, 'active')],
        [(100, 10, 'performed')],
    )


def test_second_snapshot_replaces_data_completely():
    replace_snapshot(snapshot(
        accounts=[account(1), account(2)],
        services=[service(10, owner_id=1), service(20, owner_id=2)],
        transactions=[transaction(100, service_id=10), transaction(200, service_id=20)],
    ), now=T1)

    replace_snapshot(snapshot(
        accounts=[account(2, balance=0), account(3)],
        services=[service(30, owner_id=3)],
        transactions=[],
    ), now=T2)

    assert db_state() == (
        [(2, 'user-0002@example.test', 0), (3, 'user-0003@example.test', 1000)],
        [(30, 3, 'active')],
        [],
    )


def test_empty_snapshot_clears_data():
    replace_snapshot(snapshot(), now=T1)
    replace_snapshot(snapshot(accounts=[], services=[], transactions=[]), now=T2)

    assert db_state() == ([], [], [])


def test_invalid_snapshot_leaves_data_untouched(received, django_capture_on_commit_callbacks):
    with django_capture_on_commit_callbacks(execute=True):
        replace_snapshot(snapshot(), now=T1)
    before = db_state()
    received.clear()

    with pytest.raises(SnapshotValidationError), \
            django_capture_on_commit_callbacks(execute=True) as callbacks:
        replace_snapshot(snapshot(services=[service(owner_id=99)]), now=T2)

    assert db_state() == before
    assert callbacks == []
    assert received == []


def test_first_load_records_no_status_events():
    replace_snapshot(snapshot(services=[service(status='deleted')]), now=T1)

    assert not ServiceStatusEvent.objects.exists()


def test_status_changes_are_recorded():
    replace_snapshot(snapshot(
        services=[service(10, status='active'), service(11, status='active')],
        transactions=[],
    ), now=T1)

    result = replace_snapshot(snapshot(
        services=[
            service(10, status='prolong_wait'),  # изменился
            service(11, status='active'),  # не изменился
            service(12, status='deleted'),  # новая услуга: истории нет
        ],
        transactions=[],
    ), now=T2)

    assert result.status_changes == 1
    assert list(ServiceStatusEvent.objects.values_list(
        'service_id', 'customer_id', 'old_status', 'new_status', 'detected_at',
    )) == [(10, 1, 'active', 'prolong_wait', T2)]


def test_status_history_survives_service_removal():
    replace_snapshot(snapshot(services=[service(10, status='prolong_wait')], transactions=[]), now=T1)
    replace_snapshot(snapshot(services=[service(10, status='deleted')], transactions=[]), now=T2)
    replace_snapshot(snapshot(accounts=[], services=[], transactions=[]), now=T2)

    assert list(ServiceStatusEvent.objects.values_list('service_id', 'old_status', 'new_status')) == [
        (10, 'prolong_wait', 'deleted'),
    ]


def test_signal_is_sent_inside_import_transaction():
    seen = []

    def receiver(sender, result, **kwargs):
        # Получатель (пересчёт) уже видит новые данные и работает в транзакции загрузки.
        seen.append((connection.in_atomic_block, Customer.objects.count(), result))

    snapshot_replaced.connect(receiver)
    try:
        result = replace_snapshot(snapshot(), now=T1)
    finally:
        snapshot_replaced.disconnect(receiver)

    assert seen == [(True, 1, result)]


def test_receiver_error_rolls_back_import():
    replace_snapshot(snapshot(), now=T1)
    before = db_state()

    def failing(sender, **kwargs):
        raise RuntimeError('пересчёт упал')

    snapshot_replaced.connect(failing)
    try:
        with pytest.raises(RuntimeError):
            replace_snapshot(snapshot(accounts=[account(balance=0)]), now=T2)
    finally:
        snapshot_replaced.disconnect(failing)

    assert db_state() == before
    assert not ServiceStatusEvent.objects.exists()
