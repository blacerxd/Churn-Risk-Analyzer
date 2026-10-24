from datetime import UTC, datetime, timedelta

import pytest
from django.db import IntegrityError, transaction
from django.db.models import ProtectedError

from customers.models import (
    BonusState,
    Customer,
    PaymentTerm,
    Service,
    ServiceStatus,
    Transaction,
    TransactionStatus,
    TransactionType,
)

pytestmark = pytest.mark.django_db

NOW = datetime(2026, 10, 19, 15, 0, tzinfo=UTC)


def make_customer(**overrides):
    fields = {
        'id': 1, 'email': 'user-0001@example.test', 'balance': 1000, 'withdraw_balance': 0,
        'bonus_balance': 500, 'bonus_state': BonusState.UNLOCKED, 'total_replenished': 5000,
    }
    return Customer.objects.create(**(fields | overrides))


def make_service(customer, **overrides):
    fields = {
        'id': 10, 'customer': customer, 'name': 'service-0010', 'status': ServiceStatus.ACTIVE,
        'payment_term': PaymentTerm.MONTH, 'price': 3000, 'auto_prolong': False,
        'created_at': NOW, 'expires_at': NOW + timedelta(days=30),
    }
    return Service.objects.create(**(fields | overrides))


def make_transaction(service, **overrides):
    fields = {
        'id': 100, 'service': service, 'type': TransactionType.PROLONG,
        'status': TransactionStatus.PERFORMED, 'amount': 300,
        'created_at': NOW, 'performed_at': NOW + timedelta(minutes=5),
    }
    return Transaction.objects.create(**(fields | overrides))


def assert_rejected(create):
    # atomic: после IntegrityError транзакция Postgres сломана, её нужно откатить до savepoint.
    with pytest.raises(IntegrityError), transaction.atomic():
        create()


def test_full_graph_is_saved_with_source_ids():
    customer = make_customer(id=42)
    service = make_service(customer, id=420)
    make_transaction(service, id=4200)

    assert Customer.objects.get().pk == 42
    assert list(customer.services.values_list('id', flat=True)) == [420]
    assert list(service.transactions.values_list('id', flat=True)) == [4200]


@pytest.mark.parametrize(('state', 'usable'), [
    (BonusState.UNLOCKED, True),
    (BonusState.LOCKED, False),
])
def test_bonus_usable(state, usable):
    assert make_customer(bonus_state=state).bonus_usable is usable


def test_email_is_unique():
    make_customer()
    assert_rejected(lambda: make_customer(id=2))


@pytest.mark.parametrize('field', [
    'balance', 'withdraw_balance', 'bonus_balance', 'total_replenished',
])
def test_customer_money_is_non_negative(field):
    assert_rejected(lambda: make_customer(**{field: -1}))


def test_customer_bonus_state_must_be_known():
    assert_rejected(lambda: make_customer(bonus_state='maybe'))


def test_service_price_is_non_negative():
    customer = make_customer()
    assert_rejected(lambda: make_service(customer, price=-1))


@pytest.mark.parametrize(('field', 'value'), [
    ('status', 'archived'),
    ('payment_term', 'quarter'),
])
def test_service_enums_must_be_known(field, value):
    customer = make_customer()
    assert_rejected(lambda: make_service(customer, **{field: value}))


def test_service_cannot_expire_before_creation():
    customer = make_customer()
    assert_rejected(lambda: make_service(customer, expires_at=NOW - timedelta(seconds=1)))


def test_service_may_expire_at_creation_moment():
    service = make_service(make_customer(), expires_at=NOW)
    assert service.expires_at == service.created_at


def test_transaction_amount_is_non_negative():
    service = make_service(make_customer())
    assert_rejected(lambda: make_transaction(service, amount=-1))


@pytest.mark.parametrize(('field', 'value'), [
    ('status', 'pending'),
    ('type', 'refund'),
])
def test_transaction_enums_must_be_known(field, value):
    service = make_service(make_customer())
    assert_rejected(lambda: make_transaction(service, **{field: value}))


def test_not_performed_transaction_has_no_performed_at():
    service = make_service(make_customer())
    make_transaction(service, status=TransactionStatus.NOT_PERFORMED, performed_at=None)
    assert_rejected(lambda: make_transaction(
        service, id=101, status=TransactionStatus.NOT_PERFORMED, performed_at=NOW,
    ))


def test_performed_transaction_requires_performed_at():
    # Регрессия: без явного IS NOT NULL сравнение с NULL даёт NULL, и Postgres пропускает строку.
    service = make_service(make_customer())
    assert_rejected(lambda: make_transaction(service, performed_at=None))


def test_performed_at_cannot_precede_creation():
    service = make_service(make_customer())
    assert_rejected(lambda: make_transaction(service, performed_at=NOW - timedelta(seconds=1)))


def test_customer_with_services_cannot_be_deleted():
    customer = make_customer()
    make_service(customer)
    with pytest.raises(ProtectedError):
        customer.delete()


def test_service_with_transactions_cannot_be_deleted():
    service = make_service(make_customer())
    make_transaction(service)
    with pytest.raises(ProtectedError):
        service.delete()
