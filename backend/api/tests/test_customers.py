from datetime import UTC, datetime

import pytest

from analytics.models import RiskAssessment
from customers.importer import replace_snapshot
from customers.tests.snapshots import account, service, snapshot, transaction

pytestmark = pytest.mark.django_db

URL = '/api/v1/customers'
NOW = datetime(2026, 10, 28, 12, tzinfo=UTC)


@pytest.fixture
def portfolio():
    # 1: expires in 3 days without autoprolong, 2: autoprolong and money on balance, 3: deleted only
    replace_snapshot(snapshot(
        accounts=[
            account(1, email='risky@example.test', balance=0),
            account(2, email='calm@example.test', balance=100000),
            account(3, email='gone@example.test'),
        ],
        services=[
            service(10, owner_id=1),
            service(11, owner_id=1, status='deleted'),
            service(20, owner_id=2, autoProlong=True, expiresAt='2026-12-01T00:00:00.000Z'),
            service(30, owner_id=3, status='deleted'),
        ],
        transactions=[transaction(100, service_id=10), transaction(200, service_id=20)],
    ), now=NOW)
    return {item.customer_id: item for item in RiskAssessment.objects.all()}


def ids(response):
    return [row['id'] for row in response.json()['results']]


def test_requires_auth(api_client):
    assert api_client.get(URL).status_code == 401
    assert api_client.get(f'{URL}/1').status_code == 401


def test_list_row_format(auth_client, portfolio):
    response = auth_client.get(URL, {'ordering': 'id'})

    assert response.status_code == 200
    body = response.json()
    assert body['count'] == 3
    assert body['page'] == 1
    assert body['page_size'] == 25
    row = body['results'][0]
    risk = portfolio[1]
    assert row == {
        'id': 1, 'email': 'risky@example.test', 'balance_cents': 0,
        'total_replenished_cents': 5000, 'score': risk.score, 'level': risk.level,
        'top_reason': risk.top_reason, 'expected_loss_cents': risk.expected_loss,
    }


def test_default_ordering_is_most_risky_first(auth_client, portfolio):
    response = auth_client.get(URL)

    scores = [row['score'] for row in response.json()['results']]
    known = [score for score in scores if score is not None]
    assert known == sorted(known, reverse=True)
    # customers without assessment go last in both directions
    assert scores[len(known):] == [None] * (len(scores) - len(known))
    assert ids(auth_client.get(URL, {'ordering': 'score'}))[-1] == ids(response)[-1]


def test_filter_by_level(auth_client, portfolio):
    level = portfolio[1].level

    response = auth_client.get(URL, {'level': level})

    expected = sorted(pk for pk, risk in portfolio.items() if risk.level == level)
    assert sorted(ids(response)) == expected


def test_level_none_includes_customers_without_assessment(auth_client, portfolio):
    RiskAssessment.objects.filter(customer_id=2).delete()

    response = auth_client.get(URL, {'level': 'none'})

    assert 2 in ids(response)
    row = next(row for row in response.json()['results'] if row['id'] == 2)
    assert row['score'] is None
    assert row['top_reason'] == 'Недостаточно данных для оценки'
    assert row['expected_loss_cents'] == 0


def test_search_by_email_case_insensitive(auth_client, portfolio):
    assert ids(auth_client.get(URL, {'search': 'CALM'})) == [2]


@pytest.mark.parametrize('ordering, expected', [
    ('email', [2, 3, 1]),
    ('-email', [1, 3, 2]),
    ('-balance', [2, 3, 1]),
    ('-id', [3, 2, 1]),
])
def test_ordering(auth_client, portfolio, ordering, expected):
    assert ids(auth_client.get(URL, {'ordering': ordering})) == expected


@pytest.mark.parametrize('ordering', ['-level', 'level'])
def test_ordering_by_level_is_by_severity(auth_client, portfolio, ordering):
    RiskAssessment.objects.filter(customer_id=2).delete()
    rank = {'high': 3, 'medium': 2, 'low': 1}

    rows = auth_client.get(URL, {'ordering': ordering}).json()['results']

    scored = [(rank[row['level']], row['score']) for row in rows if row['level'] != 'none']
    assert scored == sorted(scored, reverse=ordering.startswith('-'))
    # unscored customers go last in both directions
    assert [row['level'] for row in rows[len(scored):]] == ['none'] * (len(rows) - len(scored))
    assert len(scored) < len(rows)


@pytest.mark.parametrize('ordering', ['-expected_loss', 'expected_loss'])
def test_ordering_by_expected_loss_keeps_unscored_last(auth_client, portfolio, ordering):
    RiskAssessment.objects.filter(customer_id=2).delete()

    rows = auth_client.get(URL, {'ordering': ordering}).json()['results']

    scored = [(row['expected_loss_cents'], row['score']) for row in rows if row['score'] is not None]
    assert scored == sorted(scored, reverse=ordering.startswith('-'))
    assert all(row['score'] is None for row in rows[len(scored):])
    assert len(scored) < len(rows)


def test_pagination(auth_client, portfolio):
    response = auth_client.get(URL, {'ordering': 'id', 'page': 2, 'page_size': 2})

    body = response.json()
    assert body['count'] == 3
    assert body['page'] == 2
    assert body['page_size'] == 2
    assert ids(response) == [3]


def test_page_out_of_range(auth_client, portfolio):
    response = auth_client.get(URL, {'page': 5})

    assert response.status_code == 404
    assert response.json()['code'] == 'not_found'


@pytest.mark.parametrize('params', [{'level': 'extreme'}, {'ordering': 'password'}])
def test_invalid_query(auth_client, params):
    response = auth_client.get(URL, params)

    assert response.status_code == 400
    assert response.json()['code'] == 'invalid'
    assert set(response.json()['errors']) == set(params)


def test_detail(auth_client, portfolio):
    response = auth_client.get(f'{URL}/1')

    assert response.status_code == 200
    body = response.json()
    risk = portfolio[1]
    assert body['email'] == 'risky@example.test'
    assert body['bonus_balance_cents'] == 500
    assert body['bonus_usable'] is True
    assert body['withdraw_balance_cents'] == 0
    assert body['score'] == risk.score
    assert body['level'] == risk.level
    assert body['expected_loss_cents'] == risk.expected_loss
    assert body['calculated_at'] == '2026-10-28T12:00:00Z'
    assert body['factors'] == risk.factors
    assert [item['key'] for item in body['factors']]


def test_detail_services(auth_client, portfolio):
    services = auth_client.get(f'{URL}/1').json()['services']

    by_id = {item['id']: item for item in services}
    assert set(by_id) == {10, 11}
    active = by_id[10]
    assert active['status'] == 'active'
    assert active['price_cents'] == 3000
    assert active['payment_term'] == 'month'
    assert active['autoprolong'] is False
    assert active['expires_at'] == '2026-11-01T00:00:00Z'
    assert active['days_to_expiry'] == 3
    assert active['monthly_equivalent_cents'] == 3000
    losses = {item['service_id']: item['expected_loss'] for item in portfolio[1].services}
    assert active['expected_loss_cents'] == losses[10]
    # deleted services are shown but not counted in losses
    assert by_id[11]['expected_loss_cents'] == 0


def test_detail_without_assessment(auth_client, portfolio):
    RiskAssessment.objects.filter(customer_id=3).delete()

    body = auth_client.get(f'{URL}/3').json()

    assert body['level'] == 'none'
    assert body['score'] is None
    assert body['calculated_at'] is None
    assert body['factors'] == []
    assert len(body['services']) == 1


def test_detail_not_found(auth_client):
    response = auth_client.get(f'{URL}/999')

    assert response.status_code == 404
    assert response.json()['code'] == 'not_found'


def test_list_query_count_does_not_grow(auth_client, django_assert_max_num_queries):
    many = [account(id, email=f'user-{id}@example.test') for id in range(1, 41)]
    replace_snapshot(snapshot(accounts=many, services=[service(10)], transactions=[]), now=NOW)

    # count + page, nothing per row
    with django_assert_max_num_queries(2):
        response = auth_client.get(URL, {'page_size': 40})

    assert len(response.json()['results']) == 40


def test_detail_query_count(auth_client, portfolio, django_assert_max_num_queries):
    # customer with assessment + services
    with django_assert_max_num_queries(2):
        auth_client.get(f'{URL}/1')
