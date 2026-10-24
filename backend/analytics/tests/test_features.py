"""Граничные случаи признаков риска. Горизонт по умолчанию — 7 дней, now = NOW."""

from datetime import timedelta

import pytest

from analytics.context import ModelParams
from analytics.features.expiring import expiring_no_autoprolong
from analytics.features.funds import insufficient_funds
from analytics.features.payments import low_payment_success
from analytics.features.prolong_wait import prolong_wait
from analytics.formatting import NBSP
from customers.models import BonusState, PaymentTerm, ServiceStatus, TransactionStatus

from .factories import NOW, make_context, make_customer, make_service, make_transaction

HORIZON = timedelta(days=7)


def text(value):
    """Ожидаемый текст: неразрывные пробелы там же, где их ставит форматирование."""
    for word in ('день', 'дня', 'дней', '€'):
        value = value.replace(f' {word}', f'{NBSP}{word}')
    return value.replace('1 000', f'1{NBSP}000')


def context_with(*services, customer=None, **kwargs):
    customer = customer or make_customer()
    for service in services:
        service.customer = customer
    return make_context(customer, list(services), **kwargs)


# --- expiring_no_autoprolong ---

def test_expiring_far_beyond_horizon_is_zero():
    ctx = context_with(make_service(expires_at=NOW + HORIZON + timedelta(seconds=1)))
    assert expiring_no_autoprolong(ctx).value == 0


def test_expiring_exactly_at_horizon_is_zero():
    ctx = context_with(make_service(expires_at=NOW + HORIZON))
    assert expiring_no_autoprolong(ctx).value == 0


def test_expiring_grows_as_expiry_approaches():
    ctx = context_with(make_service(name='vps-1', expires_at=NOW + timedelta(days=3, hours=12)))

    result = expiring_no_autoprolong(ctx)

    assert result.value == pytest.approx(0.5)
    assert result.explanation == text(
        'vps-1 истекает 28.10.2026 (через 3 дня), автопродление выключено',
    )


def test_expired_service_without_autoprolong_is_maximal():
    # Тестовые данные заморожены: active-услуга с прошедшим expiresAt — истёкший срок.
    ctx = context_with(make_service(name='vps-1', expires_at=NOW - timedelta(days=5)))

    result = expiring_no_autoprolong(ctx)

    assert result.value == 1.0
    assert result.explanation == text(
        'Срок vps-1 истёк 19.10.2026 (5 дней назад), автопродление выключено',
    )


def test_autoprolong_disables_expiring_feature():
    ctx = context_with(make_service(auto_prolong=True, expires_at=NOW + timedelta(hours=1)))
    assert expiring_no_autoprolong(ctx).value == 0


@pytest.mark.parametrize(('status', 'counted'), [
    (ServiceStatus.ACTIVE, True),
    (ServiceStatus.SUSPENDED, True),  # выключена пользователем, но оплачивается
    (ServiceStatus.PROLONG_WAIT, False),  # учитывается признаком prolong_wait
    (ServiceStatus.DELETED, False),
    (ServiceStatus.BLOCKED, False),
])
def test_expiring_statuses(status, counted):
    ctx = context_with(make_service(status=status, expires_at=NOW + timedelta(days=1)))
    assert (expiring_no_autoprolong(ctx).value > 0) is counted


def test_expiring_picks_most_urgent_service():
    ctx = context_with(
        make_service(id=1, name='later', expires_at=NOW + timedelta(days=6)),
        make_service(id=2, name='sooner', expires_at=NOW + timedelta(days=1)),
    )

    result = expiring_no_autoprolong(ctx)

    assert result.value == pytest.approx(6 / 7)
    assert result.explanation.startswith('sooner истекает')
    assert result.explanation.endswith('; всего таких услуг: 2')


def test_expiring_respects_horizon_param():
    ctx = context_with(
        make_service(expires_at=NOW + timedelta(days=10)),
        params=ModelParams(expiry_horizon_days=20),
    )
    assert expiring_no_autoprolong(ctx).value == pytest.approx(0.5)


# --- insufficient_funds ---

def funds_customer(balance, bonus=0, bonus_state=BonusState.UNLOCKED):
    return make_customer(balance=balance, bonus_balance=bonus, bonus_state=bonus_state)


def test_autoprolong_with_enough_funds_is_zero():
    ctx = context_with(
        make_service(auto_prolong=True, price=3000, expires_at=NOW + timedelta(days=2)),
        customer=funds_customer(balance=3000),
    )

    result = insufficient_funds(ctx)

    assert result.value == 0
    assert result.explanation == text(
        'На продления в ближайшие 7 дней нужно 30,00 €, доступно 30,00 €',
    )


def test_zero_balance_is_maximal():
    ctx = context_with(make_service(price=3000, expires_at=NOW + timedelta(days=2)),
                       customer=funds_customer(balance=0))

    result = insufficient_funds(ctx)

    assert result.value == 1.0
    assert result.explanation.endswith(text(', не хватает 30,00 €'))


def test_partial_shortage():
    ctx = context_with(make_service(price=3000, expires_at=NOW + timedelta(days=2)),
                       customer=funds_customer(balance=1000))
    assert insufficient_funds(ctx).value == pytest.approx(2 / 3)


def test_locked_bonus_is_not_available():
    ctx = context_with(
        make_service(price=3000, expires_at=NOW + timedelta(days=2)),
        customer=funds_customer(balance=1000, bonus=2000, bonus_state=BonusState.LOCKED),
    )

    result = insufficient_funds(ctx)

    assert result.value == pytest.approx(2 / 3)
    assert result.explanation == text(
        'На продления в ближайшие 7 дней нужно 30,00 €, доступно 10,00 € '
        '(бонусы 20,00 € заблокированы), не хватает 20,00 €',
    )


def test_unlocked_bonus_covers_renewal():
    ctx = context_with(
        make_service(price=3000, expires_at=NOW + timedelta(days=2)),
        customer=funds_customer(balance=1000, bonus=2000),
    )
    assert insufficient_funds(ctx).value == 0


def test_bonus_can_be_excluded_by_settings():
    ctx = context_with(
        make_service(price=3000, expires_at=NOW + timedelta(days=2)),
        customer=funds_customer(balance=1000, bonus=2000),
        params=ModelParams(use_bonus_balance=False),
    )

    result = insufficient_funds(ctx)

    assert result.value == pytest.approx(2 / 3)
    assert 'не учитываются настройками модели' in result.explanation


def test_withdraw_balance_does_not_cover_renewal():
    customer = make_customer(balance=0, bonus_balance=0, withdraw_balance=100_000)
    ctx = context_with(make_service(price=3000, expires_at=NOW + timedelta(days=2)),
                       customer=customer)
    assert insufficient_funds(ctx).value == 1.0


def test_nothing_due_within_horizon():
    ctx = context_with(make_service(expires_at=NOW + timedelta(days=30)),
                       customer=funds_customer(balance=0))

    result = insufficient_funds(ctx)

    assert result.value == 0
    assert result.explanation == text('В ближайшие 7 дней продлений не предстоит')


def test_hourly_service_needs_payment_for_every_hour():
    # 95 единиц в час: на неделю 169 оплат (включая момент окончания окна) = 160,55 €.
    ctx = context_with(
        make_service(payment_term=PaymentTerm.HOUR, price=95, expires_at=NOW),
        customer=funds_customer(balance=10_000),
    )

    result = insufficient_funds(ctx)

    assert result.value == pytest.approx((16055 - 10000) / 16055)
    assert text('нужно 160,55 €') in result.explanation


def test_deleted_and_blocked_services_need_no_funds():
    ctx = context_with(
        make_service(id=1, status=ServiceStatus.DELETED, expires_at=NOW),
        make_service(id=2, status=ServiceStatus.BLOCKED, expires_at=NOW),
        make_service(id=3, expires_at=NOW + timedelta(days=30)),
        customer=funds_customer(balance=0),
    )
    assert insufficient_funds(ctx).value == 0


# --- prolong_wait ---

def waiting_service(**overrides):
    fields = {'status': ServiceStatus.PROLONG_WAIT, 'price': 3000, 'name': 'vps-1',
              'expires_at': NOW - timedelta(days=3)}
    return make_service(**(fields | overrides))


def test_no_waiting_services():
    ctx = context_with(make_service())
    assert prolong_wait(ctx).value == 0


def test_waiting_with_enough_funds_is_base_value():
    ctx = context_with(waiting_service(), customer=funds_customer(balance=3000))

    result = prolong_wait(ctx)

    assert result.value == pytest.approx(0.6)
    assert result.explanation == text(
        'vps-1 ожидает оплаты 30,00 €, удаление 26.10.2026 (через 2 дня); '
        'средств на оплату достаточно',
    )


def test_waiting_without_funds_is_maximal():
    ctx = context_with(waiting_service(), customer=funds_customer(balance=0))

    result = prolong_wait(ctx)

    assert result.value == 1.0
    assert result.explanation.endswith(text('; доступно только 0,00 €'))


def test_waiting_with_partial_funds():
    ctx = context_with(waiting_service(), customer=funds_customer(balance=1500))
    assert prolong_wait(ctx).value == pytest.approx(0.6 + 0.4 * 0.5)


def test_waiting_after_five_days_is_reported():
    ctx = context_with(waiting_service(expires_at=NOW - timedelta(days=40)),
                       customer=funds_customer(balance=0))
    assert ', 5 дней ожидания оплаты уже прошли' in prolong_wait(ctx).explanation


def test_several_waiting_services():
    ctx = context_with(
        waiting_service(id=1, price=1000),
        waiting_service(id=2, price=2000, expires_at=NOW - timedelta(days=1)),
        customer=funds_customer(balance=10_000),
    )
    assert prolong_wait(ctx).explanation.startswith(text('2 услуги ожидают оплаты на 30,00 €'))


# --- low_payment_success ---

def payments_context(statuses):
    service = make_service()
    transactions = [make_transaction(service, id=i, status=s) for i, s in enumerate(statuses)]
    return make_context(service.customer, [service], transactions)


def test_too_few_transactions_are_not_assessed():
    ctx = payments_context([TransactionStatus.NOT_PERFORMED] * 2)

    result = low_payment_success(ctx)

    assert result.value == 0
    assert result.explanation == 'Транзакций для оценки мало: 2 при минимуме 3'


def test_share_of_not_performed_transactions():
    ctx = payments_context(
        [TransactionStatus.NOT_PERFORMED] * 3 + [TransactionStatus.PERFORMED] * 7,
    )

    result = low_payment_success(ctx)

    assert result.value == pytest.approx(0.3)
    assert result.explanation == 'Не оплачено транзакций: 3 из 10 (30%)'


def test_all_transactions_paid():
    ctx = payments_context([TransactionStatus.PERFORMED] * 3)
    assert low_payment_success(ctx).value == 0
