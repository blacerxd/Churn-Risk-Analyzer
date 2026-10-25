from datetime import UTC, date, datetime, timedelta

import pytest

from analytics.models import AnalyticsSnapshot, RiskAssessment
from customers.importer import replace_snapshot
from customers.tests.snapshots import account, service, snapshot

pytestmark = pytest.mark.django_db

SUMMARY_URL = '/api/v1/analytics/summary'
CHART_URL = '/api/v1/analytics/churn-chart'
NOW = datetime(2026, 10, 28, 12, tzinfo=UTC)


def load(now=NOW, **kwargs):
    replace_snapshot(snapshot(**kwargs), now=now)


def by_kind(response, kind):
    return [point for point in response.json()['series'] if point['kind'] == kind]


@pytest.mark.parametrize('url', [SUMMARY_URL, CHART_URL])
def test_requires_auth(api_client, url):
    assert api_client.get(url).status_code == 401


def test_summary_before_first_recalculation(auth_client):
    body = auth_client.get(SUMMARY_URL).json()

    assert body['calculated_at'] is None
    assert body['customers_total'] == 0
    assert body['by_level'] == {'high': 0, 'medium': 0, 'low': 0, 'none': 0}
    assert body['explanation']


def test_summary_is_latest_recalculation(auth_client):
    load()

    body = auth_client.get(SUMMARY_URL).json()

    assert body == AnalyticsSnapshot.objects.latest().summary()
    assert body['calculated_at'] == '2026-10-28T12:00:00Z'
    assert body['customers_total'] == 1


def test_chart_without_history_has_only_forecast(auth_client):
    load()

    response = auth_client.get(CHART_URL, {'days': 14})

    assert response.status_code == 200
    assert by_kind(response, 'fact') == []
    forecast = by_kind(response, 'forecast')
    assert [point['date'] for point in forecast] == [
        (date(2026, 10, 28) + timedelta(days=offset)).isoformat() for offset in range(1, 15)
    ]


def test_chart_forecast_sums_probabilities_of_expiring_services(auth_client):
    load(
        accounts=[account(1, balance=0), account(2, balance=0)],
        services=[
            service(10, owner_id=1, expiresAt='2026-11-01T00:00:00.000Z'),
            service(11, owner_id=1, expiresAt='2026-11-01T10:00:00.000Z'),
            service(20, owner_id=2, expiresAt='2026-11-01T00:00:00.000Z', status='deleted'),
            service(21, owner_id=2, expiresAt='2027-01-01T00:00:00.000Z'),
        ],
        transactions=[],
    )
    probability = RiskAssessment.objects.get(customer_id=1).probability

    forecast = by_kind(auth_client.get(CHART_URL, {'days': 7}), 'forecast')

    values = {point['date']: point['expected_non_renewals'] for point in forecast}
    # deleted and outside the window are not counted
    assert values['2026-11-01'] == round(2 * probability, 2)
    assert sum(values.values()) == values['2026-11-01']
    services_at_risk = AnalyticsSnapshot.objects.latest().services_at_risk
    assert {point['services_at_risk'] for point in forecast} == {services_at_risk}


def test_chart_facts_count_deleted_services_by_day(auth_client):
    services = [service(10), service(11), service(12)]
    load(now=NOW - timedelta(days=3), services=services, transactions=[])
    load(
        now=NOW - timedelta(days=2),
        services=[service(10, status='deleted'), service(11), service(12)], transactions=[],
    )
    load(
        now=NOW,
        services=[service(10, status='deleted'), service(11, status='deleted'), service(12, status='deleted')],
        transactions=[],
    )

    facts = by_kind(auth_client.get(CHART_URL, {'days': 30}), 'fact')

    # starts from the first detected deletion, zero-filled up to today
    assert [(point['date'], point['deleted_services']) for point in facts] == [
        ('2026-10-26', 1), ('2026-10-27', 0), ('2026-10-28', 2),
    ]
    assert facts[-1]['services_at_risk'] == AnalyticsSnapshot.objects.latest().services_at_risk


def test_chart_facts_limited_by_window(auth_client):
    load(now=NOW - timedelta(days=20), transactions=[])
    load(now=NOW - timedelta(days=10), services=[service(status='deleted')], transactions=[])
    # no status changes, only moves the reference time to NOW
    load(now=NOW, services=[service(status='deleted')], transactions=[])

    facts = by_kind(auth_client.get(CHART_URL, {'days': 5}), 'fact')

    assert facts[0]['date'] == '2026-10-24'
    assert len(facts) == 5
    assert all(point['deleted_services'] == 0 for point in facts)


@pytest.mark.parametrize('days', [0, 91, 'abc'])
def test_chart_invalid_days(auth_client, days):
    response = auth_client.get(CHART_URL, {'days': days})

    assert response.status_code == 400
    assert 'days' in response.json()['errors']
