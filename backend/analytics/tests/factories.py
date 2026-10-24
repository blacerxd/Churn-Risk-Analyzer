"""Несохранённые объекты моделей и контексты для тестов движка (БД не нужна)."""

from datetime import UTC, datetime, timedelta

from analytics.context import CustomerContext, ModelParams
from customers.models import BonusState, Customer, PaymentTerm, Service, ServiceStatus

NOW = datetime(2026, 10, 24, 12, 0, tzinfo=UTC)


def make_customer(**overrides):
    fields = {
        'id': 1, 'email': 'user-0001@example.test', 'balance': 1000, 'withdraw_balance': 0,
        'bonus_balance': 500, 'bonus_state': BonusState.UNLOCKED, 'total_replenished': 5000,
    }
    return Customer(**(fields | overrides))


def make_service(customer=None, **overrides):
    fields = {
        'id': 10, 'customer': customer or make_customer(), 'name': 'service-0010',
        'status': ServiceStatus.ACTIVE, 'payment_term': PaymentTerm.MONTH, 'price': 3000,
        'auto_prolong': False, 'created_at': NOW - timedelta(days=25),
        'expires_at': NOW + timedelta(days=5),
    }
    return Service(**(fields | overrides))


def make_context(customer=None, services=None, transactions=(), now=NOW, params=None):
    customer = customer or make_customer()
    if services is None:
        services = [make_service(customer)]
    return CustomerContext(
        customer=customer, services=services, transactions=transactions,
        now=now, params=params or ModelParams(),
    )
