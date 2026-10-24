"""Форматирование значений в текстах причин: деньги, даты, интервалы."""

from datetime import UTC, datetime, timedelta

NBSP = ' '


def money(cents: int) -> str:
    """Единицы баланса в евро: 123456 → «1 234,56 €» (100 единиц = €1)."""
    sign = '−' if cents < 0 else ''
    euros, rest = divmod(abs(cents), 100)
    return f'{sign}{euros:,}'.replace(',', NBSP) + f',{rest:02d}{NBSP}€'


def date(value: datetime) -> str:
    return value.astimezone(UTC).strftime('%d.%m.%Y')


def plural(number: int, one: str, few: str, many: str) -> str:
    """Форма слова после числа: 1 день, 2 дня, 5 дней, 11 дней, 21 день."""
    tail = number % 100
    if 11 <= tail <= 14:
        return many
    if number % 10 == 1:
        return one
    if 2 <= number % 10 <= 4:
        return few
    return many


def days(number: int) -> str:
    return f'{number}{NBSP}{plural(number, "день", "дня", "дней")}'


def relative(delta: timedelta) -> str:
    """Интервал до события (delta > 0) или после него (delta ≤ 0) в целых сутках."""
    whole_days = abs(delta) // timedelta(days=1)
    if delta > timedelta(0):
        return f'через {days(whole_days)}' if whole_days else 'менее чем через сутки'
    return f'{days(whole_days)} назад' if whole_days else 'менее суток назад'
