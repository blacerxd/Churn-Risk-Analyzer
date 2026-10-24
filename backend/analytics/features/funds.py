from datetime import timedelta

from analytics.formatting import days, money
from analytics.periods import renewal_cost

from .registry import FeatureResult, feature


def unused_bonus_note(ctx) -> str:
    """Пояснение, почему бонусный баланс не вошёл в доступные средства."""
    bonus = ctx.customer.bonus_balance
    if not bonus:
        return ''
    if not ctx.customer.bonus_usable:
        return f' (бонусы {money(bonus)} заблокированы)'
    if not ctx.params.use_bonus_balance:
        return f' (бонусы {money(bonus)} не учитываются настройками модели)'
    return ''


@feature(
    'insufficient_funds', 'Не хватает средств на продления', 50,
    'Доступных средств (основной баланс и бонусы, если их можно тратить) меньше, чем нужно '
    'на продления услуг в пределах горизонта прогноза. Значение — доля непокрытой суммы.',
)
def insufficient_funds(ctx):
    horizon_days = ctx.params.expiry_horizon_days
    due = renewal_cost(ctx.scored_services, ctx.now, ctx.now + timedelta(days=horizon_days))
    if due == 0:
        return FeatureResult(0.0, f'В ближайшие {days(horizon_days)} продлений не предстоит')

    available = ctx.available_funds
    shortage = max(0, due - available)
    summary = (
        f'На продления в ближайшие {days(horizon_days)} нужно {money(due)}, '
        f'доступно {money(available)}{unused_bonus_note(ctx)}'
    )
    if shortage:
        summary += f', не хватает {money(shortage)}'
    return FeatureResult(shortage / due, summary)
