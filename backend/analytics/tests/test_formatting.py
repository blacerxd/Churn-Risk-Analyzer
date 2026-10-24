import re
from datetime import UTC, datetime, timedelta, timezone

import pytest

from analytics.formatting import NBSP, date, days, money, plural, relative


def nbsp_after_numbers(text):
    return re.sub(r'(\d) ', rf'\1{NBSP}', text)


@pytest.mark.parametrize(('cents', 'expected'), [
    (0, '0,00 €'),
    (5, '0,05 €'),
    (100, '1,00 €'),
    (123456, '1 234,56 €'),
    (100_000_000, '1 000 000,00 €'),
    (-250, '−2,50 €'),
])
def test_money(cents, expected):
    assert money(cents) == expected.replace(' ', NBSP)


def test_date_is_rendered_in_utc():
    moscow = timezone(timedelta(hours=3))
    assert date(datetime(2026, 11, 1, 1, 0, tzinfo=moscow)) == '31.10.2026'
    assert date(datetime(2026, 11, 1, tzinfo=UTC)) == '01.11.2026'


@pytest.mark.parametrize(('number', 'expected'), [
    (0, 'дней'), (1, 'день'), (2, 'дня'), (4, 'дня'), (5, 'дней'), (11, 'дней'),
    (12, 'дней'), (14, 'дней'), (21, 'день'), (22, 'дня'), (111, 'дней'), (101, 'день'),
])
def test_plural(number, expected):
    assert plural(number, 'день', 'дня', 'дней') == expected


@pytest.mark.parametrize(('delta', 'expected'), [
    (timedelta(days=2, hours=5), 'через 2 дня'),
    (timedelta(days=1), 'через 1 день'),
    (timedelta(hours=3), 'менее чем через сутки'),
    (timedelta(0), 'менее суток назад'),
    (-timedelta(hours=3), 'менее суток назад'),
    (-timedelta(days=5, hours=1), '5 дней назад'),
])
def test_relative(delta, expected):
    assert relative(delta) == nbsp_after_numbers(expected)


def test_days():
    assert days(7) == f'7{NBSP}дней'
