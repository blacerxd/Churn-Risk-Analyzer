"""Построители снимков в формате источника для тестов."""

import copy


def account(id=1, **overrides):
    return {
        'id': id, 'email': f'user-{id:04d}@example.test', 'balance': 1000, 'withdrawBalance': 0,
        'totalReplenished': 5000, 'bonusBalance': 500, 'bonusState': 'unlocked',
    } | overrides


def service(id=10, owner_id=1, **overrides):
    return {
        'id': id, 'name': f'service-{id:04d}', 'ownerId': owner_id, 'paymentTerm': 'month',
        'autoProlong': False, 'createdAt': '2026-10-01T00:00:00.000Z',
        'expiresAt': '2026-11-01T00:00:00.000Z', 'status': 'active', 'price': 3000,
    } | overrides


def transaction(id=100, service_id=10, **overrides):
    return {
        'id': id, 'amount': 300, 'status': 'performed',
        'performedAt': '2026-10-01T00:05:00.000Z', 'createdAt': '2026-10-01T00:00:00.000Z',
        'type': 'prolong', 'serviceId': service_id,
    } | overrides


def snapshot(accounts=None, services=None, transactions=None):
    """Валидный снимок: по умолчанию один клиент, одна услуга, одна транзакция."""
    return copy.deepcopy({
        'accounts': [account()] if accounts is None else accounts,
        'services': [service()] if services is None else services,
        'transactions': [transaction()] if transactions is None else transactions,
    })
