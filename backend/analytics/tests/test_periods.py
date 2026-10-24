import importlib.util
import json
from datetime import UTC, datetime, timedelta

import pytest
from django.conf import settings

from analytics.periods import add_term, renewal_cost, renewals_due
from customers.models import PaymentTerm

from .factories import NOW, make_service

TEST_DATA = settings.BASE_DIR.parent / 'test_data'
needs_test_data = pytest.mark.skipif(
    not TEST_DATA.exists(), reason='test_data не входит в образ backend',
)
WEEK_AHEAD = NOW + timedelta(days=7)


def load_generator():
    spec = importlib.util.spec_from_file_location('generate', TEST_DATA / 'generate.py')
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


@pytest.mark.parametrize(('start', 'term', 'expected'), [
    (datetime(2026, 1, 31, tzinfo=UTC), PaymentTerm.MONTH, datetime(2026, 2, 28, tzinfo=UTC)),
    (datetime(2028, 1, 31, tzinfo=UTC), PaymentTerm.MONTH, datetime(2028, 2, 29, tzinfo=UTC)),
    (datetime(2026, 11, 30, tzinfo=UTC), PaymentTerm.QUARTER_YEAR,
     datetime(2027, 2, 28, tzinfo=UTC)),
    (datetime(2026, 8, 31, tzinfo=UTC), PaymentTerm.HALF_YEAR, datetime(2027, 2, 28, tzinfo=UTC)),
    (datetime(2028, 2, 29, tzinfo=UTC), PaymentTerm.YEAR, datetime(2029, 2, 28, tzinfo=UTC)),
    (datetime(2026, 10, 19, 23, 30, tzinfo=UTC), PaymentTerm.HOUR,
     datetime(2026, 10, 20, 0, 30, tzinfo=UTC)),
    (datetime(2026, 12, 28, tzinfo=UTC), PaymentTerm.WEEK, datetime(2027, 1, 4, tzinfo=UTC)),
])
def test_add_term(start, term, expected):
    assert add_term(start, term) == expected


@needs_test_data
def test_add_term_matches_source_generator():
    generator = load_generator()
    start = datetime(2026, 1, 1, 12, 0, tzinfo=UTC)
    for day in range(0, 800, 3):
        moment = start + timedelta(days=day)
        for term in PaymentTerm.values:
            assert add_term(moment, term) == generator.add_term(moment, term), (moment, term)


@needs_test_data
def test_sample_services_cover_exactly_one_period():
    data = json.loads((TEST_DATA / 'data.json').read_text())
    for service in data['services']:
        created = datetime.fromisoformat(service['createdAt'])
        expires = datetime.fromisoformat(service['expiresAt'])
        assert add_term(created, service['paymentTerm']) == expires, service['id']


def test_no_renewal_when_expiry_is_beyond_window():
    service = make_service(expires_at=WEEK_AHEAD + timedelta(seconds=1))
    assert renewals_due(service, NOW, WEEK_AHEAD) == 0


def test_expiry_exactly_at_window_end_is_due():
    service = make_service(expires_at=WEEK_AHEAD)
    assert renewals_due(service, NOW, WEEK_AHEAD) == 1


@pytest.mark.parametrize(('term', 'expected'), [
    (PaymentTerm.HOUR, 7 * 24 + 1),  # каждый час, включая момент окончания окна
    (PaymentTerm.WEEK, 2),
    (PaymentTerm.MONTH, 1),
    (PaymentTerm.YEAR, 1),
])
def test_renewals_for_service_expiring_now(term, expected):
    service = make_service(payment_term=term, expires_at=NOW)
    assert renewals_due(service, NOW, WEEK_AHEAD) == expected


def test_overdue_service_is_renewed_from_now():
    # Истёкшая неделю назад недельная услуга: оплата сейчас и ещё одна через неделю.
    service = make_service(payment_term=PaymentTerm.WEEK, expires_at=NOW - timedelta(days=7))
    assert renewals_due(service, NOW, WEEK_AHEAD) == 2


def test_renewal_cost_sums_prices():
    services = [
        make_service(id=1, price=300, payment_term=PaymentTerm.MONTH, expires_at=NOW),
        make_service(id=2, price=10, payment_term=PaymentTerm.WEEK, expires_at=NOW),
        make_service(id=3, price=999, expires_at=WEEK_AHEAD + timedelta(days=1)),
    ]
    assert renewal_cost(services, NOW, WEEK_AHEAD) == 300 + 10 * 2
