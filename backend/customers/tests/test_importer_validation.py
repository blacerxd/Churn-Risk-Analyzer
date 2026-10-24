"""Проверка снимка без обращения к БД."""

import json
from datetime import UTC, datetime

import pytest
from django.conf import settings

from customers.importer import MAX_ERRORS, SnapshotError, SnapshotValidationError, parse_snapshot

from .snapshots import account, service, snapshot, transaction

SAMPLE_DATA = settings.BASE_DIR.parent / 'test_data' / 'data.json'


def errors_of(payload):
    with pytest.raises(SnapshotValidationError) as exc_info:
        parse_snapshot(payload)
    return exc_info.value.errors


def test_maps_source_fields_to_models():
    parsed = parse_snapshot(snapshot(
        accounts=[account(withdrawBalance=7, bonusState='locked')],
        services=[service(autoProlong=True, paymentTerm='quarter_year')],
    ))

    customer, = parsed.customers
    assert (customer.id, customer.withdraw_balance, customer.bonus_state) == (1, 7, 'locked')
    svc, = parsed.services
    assert (svc.customer_id, svc.auto_prolong, svc.payment_term) == (1, True, 'quarter_year')
    assert svc.expires_at == datetime(2026, 11, 1, tzinfo=UTC)
    txn, = parsed.transactions
    assert (txn.service_id, txn.type) == (10, 'prolong')


def test_dates_are_normalized_to_utc():
    parsed = parse_snapshot(snapshot(services=[service(
        createdAt='2026-10-01T03:00:00+03:00', expiresAt='2026-11-01T03:00:00+03:00',
    )]))

    assert parsed.services[0].created_at == datetime(2026, 10, 1, tzinfo=UTC)
    assert parsed.services[0].created_at.tzinfo is UTC


def test_empty_snapshot_is_valid():
    parsed = parse_snapshot(snapshot(accounts=[], services=[], transactions=[]))
    assert (parsed.customers, parsed.services, parsed.transactions) == ([], [], [])


@pytest.mark.skipif(not SAMPLE_DATA.exists(), reason='test_data не входит в образ backend')
def test_sample_data_from_case_is_accepted():
    parsed = parse_snapshot(json.loads(SAMPLE_DATA.read_text()))
    assert (len(parsed.customers), len(parsed.services), len(parsed.transactions)) == (10, 30, 100)


def test_payload_must_be_object():
    assert errors_of([]) == [
        SnapshotError('', 'ожидается объект со списками accounts, services, transactions'),
    ]


def test_missing_section_and_wrong_section_type():
    errors = errors_of({'accounts': {}, 'services': []})
    assert errors == [
        SnapshotError('accounts', 'ожидается массив'),
        SnapshotError('transactions', 'обязательный раздел отсутствует'),
    ]


def test_record_must_be_object():
    assert errors_of(snapshot(accounts=[account(), 'oops'])) == [
        SnapshotError('accounts[1]', 'ожидается объект'),
    ]


def test_missing_field_is_reported_with_path():
    record = service()
    del record['expiresAt']
    assert errors_of(snapshot(services=[record])) == [
        SnapshotError('services[0].expiresAt', 'обязательное поле'),
    ]


@pytest.mark.parametrize(('payload', 'path', 'message'), [
    (snapshot(accounts=[account(balance=True)]), 'accounts[0].balance', 'ожидается целое число'),
    (snapshot(accounts=[account(balance='100')]), 'accounts[0].balance', 'ожидается целое число'),
    (snapshot(accounts=[account(balance=1.5)]), 'accounts[0].balance', 'ожидается целое число'),
    (snapshot(accounts=[account(balance=2**63)]), 'accounts[0].balance', 'слишком большое число'),
    (snapshot(accounts=[account(bonusBalance=-1)]), 'accounts[0].bonusBalance',
     'сумма не может быть отрицательной'),
    (snapshot(accounts=[account(email='not-an-email')]), 'accounts[0].email', 'некорректный email'),
    (snapshot(services=[service(name='  ')]), 'services[0].name', 'ожидается непустая строка'),
    (snapshot(services=[service(autoProlong='false')]), 'services[0].autoProlong',
     'ожидается true или false'),
    (snapshot(services=[service(expiresAt='2026-11-01T00:00:00')]), 'services[0].expiresAt',
     'у даты нет часового пояса, ожидается UTC (суффикс Z)'),
    (snapshot(services=[service(expiresAt='завтра')]), 'services[0].expiresAt',
     'ожидается дата в формате ISO 8601'),
    (snapshot(transactions=[transaction(amount=-1)]), 'transactions[0].amount',
     'сумма не может быть отрицательной'),
])
def test_invalid_values(payload, path, message):
    assert errors_of(payload) == [SnapshotError(path, message)]


def test_id_must_be_positive():
    errors = errors_of(snapshot(accounts=[account(id=0)], services=[], transactions=[]))
    assert errors == [SnapshotError('accounts[0].id', 'ожидается положительное целое число')]


@pytest.mark.parametrize(('payload', 'path'), [
    (snapshot(accounts=[account(bonusState=True)]), 'accounts[0].bonusState'),
    (snapshot(services=[service(status='archived')]), 'services[0].status'),
    (snapshot(services=[service(paymentTerm='quarter')]), 'services[0].paymentTerm'),
    (snapshot(transactions=[transaction(status='pending')]), 'transactions[0].status'),
    (snapshot(transactions=[transaction(type='refund')]), 'transactions[0].type'),
])
def test_unknown_enum_value(payload, path):
    error, = errors_of(payload)
    assert error.path == path
    assert error.message.startswith('недопустимое значение')


def test_duplicate_id_points_to_first_occurrence():
    errors = errors_of(snapshot(accounts=[account(1), account(2), account(1, email='x@example.test')]))
    assert errors == [SnapshotError('accounts[2].id', 'id 1 уже встречался в accounts[0]')]


def test_duplicate_email():
    errors = errors_of(snapshot(accounts=[account(1), account(2, email='user-0001@example.test')]))
    assert errors == [
        SnapshotError('accounts[1].email', "значение 'user-0001@example.test' уже встречалось в accounts[0]"),
    ]


def test_references_must_exist():
    errors = errors_of(snapshot(
        services=[service(owner_id=99)],
        transactions=[transaction(service_id=77)],
    ))
    assert errors == [
        SnapshotError('services[0].ownerId', 'accounts с id 99 не найден'),
        SnapshotError('transactions[0].serviceId', 'services с id 77 не найден'),
    ]


def test_service_cannot_expire_before_creation():
    errors = errors_of(snapshot(services=[service(expiresAt='2026-09-30T23:59:59.999Z')]))
    assert errors == [SnapshotError('services[0].expiresAt', 'раньше даты создания createdAt')]


def test_service_may_expire_at_creation_moment():
    parse_snapshot(snapshot(services=[service(expiresAt='2026-10-01T00:00:00.000Z')]))


@pytest.mark.parametrize(('overrides', 'message'), [
    ({'status': 'not_performed'}, 'должно быть null для невыполненной транзакции'),
    ({'performedAt': None}, 'обязательно для выполненной транзакции'),
    ({'performedAt': '2026-09-30T00:00:00.000Z'}, 'раньше даты создания createdAt'),
])
def test_performed_at_rules(overrides, message):
    errors = errors_of(snapshot(transactions=[transaction(**overrides)]))
    assert errors == [SnapshotError('transactions[0].performedAt', message)]


def test_not_performed_without_performed_at_is_valid():
    parse_snapshot(snapshot(transactions=[transaction(status='not_performed', performedAt=None)]))


def test_all_errors_are_collected_at_once():
    errors = errors_of(snapshot(
        accounts=[account(balance=-1, email='bad')],
        services=[service(price=-5)],
    ))
    assert [error.path for error in errors] == [
        'accounts[0].email', 'accounts[0].balance', 'services[0].price',
    ]


def test_errors_are_truncated_but_total_is_kept():
    accounts = [account(i, balance=-1) for i in range(1, MAX_ERRORS + 11)]
    with pytest.raises(SnapshotValidationError) as exc_info:
        parse_snapshot(snapshot(accounts=accounts, services=[], transactions=[]))

    assert exc_info.value.total == MAX_ERRORS + 10
    assert len(exc_info.value.errors) == MAX_ERRORS
