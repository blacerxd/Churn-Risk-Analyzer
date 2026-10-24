from datetime import timedelta

from analytics.formatting import date, money, plural, relative
from customers.models import ServiceStatus

from .funds import unused_bonus_note
from .registry import FeatureResult, feature

# По условиям кейса prolong_wait держится 5 дней после expiresAt, затем услуга удаляется.
PROLONG_WAIT_PERIOD = timedelta(days=5)
# Сам статус «ожидает оплаты» — сильный сигнал; нехватка средств доводит его до максимума.
BASE_VALUE = 0.6
FUNDS_SHARE = 1 - BASE_VALUE


@feature(
    'prolong_wait', 'Ожидает оплаты', 80,
    'Услуга истекла и ждёт оплаты (prolong_wait), через 5 дней она будет удалена. '
    'Значение растёт до максимума, если средств на оплату не хватает.',
)
def prolong_wait(ctx):
    waiting = [s for s in ctx.scored_services if s.status == ServiceStatus.PROLONG_WAIT]
    if not waiting:
        return FeatureResult(0.0, 'Нет услуг, ожидающих оплаты')

    due = sum(service.price for service in waiting)
    available = ctx.available_funds
    shortage = max(0, due - available)
    value = BASE_VALUE + FUNDS_SHARE * (shortage / due if due else 0.0)

    service = min(waiting, key=lambda s: s.expires_at)
    if len(waiting) == 1:
        text = f'{service.name} ожидает оплаты {money(due)}'
    else:
        count = len(waiting)
        noun = plural(count, 'услуга', 'услуги', 'услуг')
        text = f'{count} {noun} ожидают оплаты на {money(due)}'

    deleted_at = service.expires_at + PROLONG_WAIT_PERIOD
    if deleted_at > ctx.now:
        text += f', удаление {date(deleted_at)} ({relative(deleted_at - ctx.now)})'
    else:
        text += ', 5 дней ожидания оплаты уже прошли'

    if shortage:
        text += f'; доступно только {money(available)}{unused_bonus_note(ctx)}'
    else:
        text += '; средств на оплату достаточно'
    return FeatureResult(value, text)
