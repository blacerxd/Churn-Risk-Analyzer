from datetime import UTC, datetime

import pytest
from prometheus_client.parser import text_string_to_metric_families
from rest_framework.test import APIClient

from analytics.models import AnalyticsSnapshot
from customers.importer import replace_snapshot
from customers.tests.snapshots import account, service, snapshot

pytestmark = pytest.mark.django_db

URL = '/metrics'
TOKEN = 'metrics-secret'


@pytest.fixture(autouse=True)
def metrics_token(settings):
    settings.METRICS_TOKEN = TOKEN


def scrape(client, token=TOKEN):
    return client.get(URL, HTTP_AUTHORIZATION=f'Bearer {token}')


def samples(response):
    result = {}
    for family in text_string_to_metric_families(response.content.decode()):
        for sample in family.samples:
            key = sample.name + ''.join(f'{{{k}={v}}}' for k, v in sorted(sample.labels.items()))
            result[key] = sample.value
    return result


def test_requires_token(api_client):
    response = api_client.get(URL)

    assert response.status_code == 401
    assert response['WWW-Authenticate'] == 'Bearer'


@pytest.mark.parametrize('token', ['wrong', 'метрики'])
def test_wrong_token(api_client, token):
    response = scrape(api_client, token)

    assert response.status_code == 401
    assert response.json()['code'] == 'invalid_token'


def test_empty_setting_disables_endpoint(api_client, settings):
    settings.METRICS_TOKEN = ''

    assert scrape(api_client, '').status_code == 401
    assert scrape(api_client, 'anything').status_code == 401


def test_session_is_not_enough(client, user):
    client.force_login(user)

    assert client.get(URL).status_code == 401


def test_before_first_recalculation(api_client):
    response = scrape(api_client)

    assert response.status_code == 200
    assert response['Content-Type'].startswith('text/plain')
    values = samples(response)
    assert values['churn_customers{level=high}'] == 0
    assert values['churn_expected_loss_cents'] == 0
    assert 'churn_last_recalculation_timestamp' not in values


def test_matches_summary(auth_client):
    scraper = APIClient()
    replace_snapshot(snapshot(
        accounts=[account(1, balance=0), account(2, balance=100000)],
        services=[service(10, owner_id=1), service(20, owner_id=2, autoProlong=True)],
        transactions=[],
    ), now=datetime(2026, 10, 28, tzinfo=UTC))
    summary = auth_client.get('/api/v1/analytics/summary').json()
    latest = AnalyticsSnapshot.objects.latest()

    values = samples(scrape(scraper))

    for level, count in summary['by_level'].items():
        assert values[f'churn_customers{{level={level}}}'] == count
    assert values['churn_expected_loss_cents'] == summary['expected_loss_cents']
    assert values['churn_revenue_at_risk_cents'] == summary['revenue_at_risk_cents']
    assert values['churn_services_at_risk'] == summary['services_at_risk']
    assert values['churn_score_avg'] == latest.score_avg
    assert values['churn_last_recalculation_timestamp'] == latest.calculated_at.timestamp()
    assert values['churn_source_rows{kind=accounts}'] == 2
    assert values['churn_source_rows{kind=services}'] == 2
