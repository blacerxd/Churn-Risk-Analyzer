from datetime import timedelta

from analytics.formatting import date, days, relative
from customers.models import ServiceStatus

from .registry import FeatureResult, feature

# prolong_wait уже истёк и учитывается своим признаком; здесь — услуги, которые ещё работают.
RUNNING_STATUSES = frozenset({ServiceStatus.ACTIVE, ServiceStatus.SUSPENDED})


@feature(
    'expiring_no_autoprolong', 'Скоро истекает без автопродления', 70,
    'Услуга заканчивается в пределах горизонта прогноза, а автопродление выключено. '
    'Чем ближе дата окончания, тем выше значение; истёкший срок — максимум.',
)
def expiring_no_autoprolong(ctx):
    horizon = timedelta(days=ctx.params.expiry_horizon_days)
    expiring = [
        service for service in ctx.scored_services
        if service.status in RUNNING_STATUSES
        and not service.auto_prolong
        and service.expires_at - ctx.now <= horizon
    ]
    if not expiring:
        return FeatureResult(0.0, (
            'Нет услуг без автопродления, истекающих '
            f'в ближайшие {days(ctx.params.expiry_horizon_days)}'
        ))

    service = min(expiring, key=lambda s: s.expires_at)
    left = service.expires_at - ctx.now
    # left > 0 возможно только при horizon ≥ left > 0, поэтому деления на ноль нет.
    value = 1.0 if left <= timedelta(0) else max(0.0, 1 - left / horizon)

    if left > timedelta(0):
        text = f'{service.name} истекает {date(service.expires_at)} ({relative(left)})'
    else:
        text = f'Срок {service.name} истёк {date(service.expires_at)} ({relative(left)})'
    text += ', автопродление выключено'
    if len(expiring) > 1:
        text += f'; всего таких услуг: {len(expiring)}'
    return FeatureResult(value, text)
