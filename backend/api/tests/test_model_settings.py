import pytest

from analytics.models import AnalyticsSnapshot, ModelSettings, RiskAssessment
from customers.importer import replace_snapshot
from customers.tests.snapshots import snapshot

pytestmark = pytest.mark.django_db

URL = '/api/v1/model/settings'


def test_requires_auth(api_client):
    assert api_client.get(URL).status_code == 401
    assert api_client.patch(URL, {}, format='json').status_code == 401


def test_get_returns_values_and_schema(auth_client):
    body = auth_client.get(URL).json()

    assert set(body) == {'weights', 'thresholds', 'params', 'schema'}
    assert [field['key'] for field in body['schema']['weights']] == list(body['weights'])
    assert {'medium', 'high'} == set(body['thresholds'])
    assert [field['key'] for field in body['schema']['params']] == list(body['params'])


def test_patch_saves_and_recalculates(auth_client):
    replace_snapshot(snapshot())
    key = next(iter(auth_client.get(URL).json()['weights']))
    recalculations = AnalyticsSnapshot.objects.count()

    response = auth_client.patch(URL, {'weights': {key: 0}, 'thresholds': {'high': 90}}, format='json')

    assert response.status_code == 200
    body = response.json()
    assert body['weights'][key] == 0
    assert body['thresholds']['high'] == 90
    assert 'schema' in body
    assert ModelSettings.load().weights == {key: 0}
    assert AnalyticsSnapshot.objects.count() == recalculations + 1
    assert AnalyticsSnapshot.objects.latest().reason == 'settings'
    assert RiskAssessment.objects.count() == 1


def test_patch_is_partial(auth_client):
    before = auth_client.get(URL).json()

    auth_client.patch(URL, {'thresholds': {'medium': 10}}, format='json')

    after = auth_client.get(URL).json()
    assert after['thresholds']['medium'] == 10
    assert after['weights'] == before['weights']
    assert after['params'] == before['params']


def test_patch_field_errors_are_nested(auth_client):
    key = next(iter(auth_client.get(URL).json()['weights']))

    response = auth_client.patch(
        URL, {'weights': {key: -1, 'unknown': 5}, 'params': {'use_bonus_balance': 'yes'}}, format='json',
    )

    assert response.status_code == 400
    body = response.json()
    assert body['code'] == 'invalid'
    assert set(body['errors']['weights']) == {key, 'unknown'}
    assert isinstance(body['errors']['weights'][key], list)
    assert set(body['errors']['params']) == {'use_bonus_balance'}
    assert ModelSettings.load().weights == {}


def test_patch_threshold_order(auth_client):
    response = auth_client.patch(URL, {'thresholds': {'medium': 80, 'high': 50}}, format='json')

    assert response.status_code == 400
    assert 'medium' in response.json()['errors']['thresholds']


def test_patch_section_error_is_a_list(auth_client):
    weights = auth_client.get(URL).json()['weights']

    response = auth_client.patch(URL, {'weights': dict.fromkeys(weights, 0)}, format='json')

    assert response.status_code == 400
    errors = response.json()['errors']['weights']
    assert isinstance(errors, list) and errors


def test_patch_not_an_object(auth_client):
    response = auth_client.patch(URL, [1], format='json')

    assert response.status_code == 400
    assert response.json()['errors'] == {'non_field_errors': ['ожидается объект']}


def test_auth_config_is_public(api_client, settings):
    settings.OIDC_ENABLED = True

    response = api_client.get('/api/v1/auth/config')

    assert response.status_code == 200
    assert response.json() == {'oidc_enabled': True}
