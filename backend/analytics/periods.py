"""Периоды оплаты услуг: следующая дата окончания и число продлений в окне.

Календарная арифметика повторяет генератор исходных данных (test_data/generate.py):
месяц, квартал, полугодие и год прибавляются календарно, день ограничивается последним
днём целевого месяца.
"""

import calendar
from datetime import datetime, timedelta

from customers.models import PaymentTerm, Service

FIXED_TERMS = {
    PaymentTerm.HOUR: timedelta(hours=1),
    PaymentTerm.WEEK: timedelta(weeks=1),
}
CALENDAR_TERMS_MONTHS = {
    PaymentTerm.MONTH: 1,
    PaymentTerm.QUARTER_YEAR: 3,
    PaymentTerm.HALF_YEAR: 6,
    PaymentTerm.YEAR: 12,
}


def add_term(value: datetime, term: str) -> datetime:
    if term in FIXED_TERMS:
        return value + FIXED_TERMS[term]
    month_index = value.year * 12 + value.month - 1 + CALENDAR_TERMS_MONTHS[term]
    year, month = divmod(month_index, 12)
    month += 1
    day = min(value.day, calendar.monthrange(year, month)[1])
    return value.replace(year=year, month=month, day=day)


def renewals_due(service: Service, now: datetime, until: datetime) -> int:
    """Сколько раз услугу нужно оплатить, чтобы она проработала до момента until.

    Истёкшая услуга (в том числе prolong_wait) требует оплаты сразу: следующий период
    отсчитывается от now. Окончание ровно в until считается продлением внутри окна.
    """
    start = max(service.expires_at, now)
    if start > until:
        return 0
    term = service.payment_term
    if term in FIXED_TERMS:
        return (until - start) // FIXED_TERMS[term] + 1
    count = 0
    while start <= until:
        count += 1
        start = add_term(start, term)
    return count


def renewal_cost(services, now: datetime, until: datetime) -> int:
    """Сумма продлений всех услуг до момента until, в единицах баланса."""
    return sum(service.price * renewals_due(service, now, until) for service in services)
