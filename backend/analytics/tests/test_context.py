from datetime import datetime

import pytest

from analytics.context import ModelParams
from customers.models import BonusState, ServiceStatus

from .factories import make_context, make_customer, make_service


def test_only_scored_statuses_are_considered():
    customer = make_customer()
    services = [
        make_service(customer, id=i, status=status)
        for i, status in enumerate(ServiceStatus.values)
    ]

    ctx = make_context(customer, services)

    assert {s.status for s in ctx.scored_services} == {'active', 'suspended', 'prolong_wait'}


@pytest.mark.parametrize(('bonus_state', 'use_bonus', 'expected'), [
    (BonusState.UNLOCKED, True, 1500),
    (BonusState.LOCKED, True, 1000),  # бонусы заблокированы
    (BonusState.UNLOCKED, False, 1000),  # бонусы отключены в настройках модели
])
def test_available_funds(bonus_state, use_bonus, expected):
    customer = make_customer(balance=1000, bonus_balance=500, bonus_state=bonus_state)
    ctx = make_context(customer, params=ModelParams(use_bonus_balance=use_bonus))

    assert ctx.available_funds == expected


def test_withdraw_balance_is_not_available_for_prolongation():
    ctx = make_context(make_customer(balance=0, withdraw_balance=9000, bonus_balance=0))
    assert ctx.available_funds == 0


def test_naive_now_is_rejected():
    with pytest.raises(ValueError, match='часовой пояс'):
        make_context(now=datetime(2026, 10, 24, 12, 0))
