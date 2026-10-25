from unittest.mock import MagicMock, patch

import pytest
from django.contrib.auth import get_user_model

from api import keycloak

pytestmark = pytest.mark.django_db


def response(status=200, body=None):
    mock = MagicMock(status_code=status)
    mock.json.return_value = body
    return mock


@pytest.fixture
def kc(settings):
    settings.KEYCLOAK_REALM_URL = 'http://kc/realms/churn'
    settings.KEYCLOAK_ADMIN_URL = 'http://kc/admin/realms/churn'
    settings.KEYCLOAK_PROVISIONER_SECRET = 'secret'
    with patch('api.keycloak.requests.post', return_value=response(body={'access_token': 't'})) as token, \
            patch('api.keycloak.requests.request') as call:
        yield token, call


@pytest.fixture
def anna():
    return get_user_model()(username='anna', email='anna@example.test', first_name='Анна', last_name='Петрова')


def test_create_user_payload(kc, anna):
    token, call = kc
    call.return_value = response(201)

    keycloak.create_user(anna, 'Long-pass-123')

    assert token.call_args.kwargs['data']['grant_type'] == 'client_credentials'
    method, url = call.call_args.args
    body = call.call_args.kwargs['json']
    assert (method, url) == ('POST', 'http://kc/admin/realms/churn/users')
    assert call.call_args.kwargs['headers'] == {'Authorization': 'Bearer t'}
    assert body['email'] == 'anna@example.test' and body['emailVerified'] is True
    assert body['credentials'] == [{'type': 'password', 'value': 'Long-pass-123', 'temporary': False}]
    assert body['requiredActions'] == ['webauthn-register-passwordless']


def test_update_finds_by_old_username_and_resets_password(kc, anna):
    _, call = kc
    call.side_effect = [response(body=[{'id': 'kc-1'}]), response(204), response(204)]

    keycloak.update_user(anna, 'New-pass-456', username='old-name')

    lookup, profile, reset = call.call_args_list
    assert lookup.kwargs['params'] == {'username': 'old-name', 'exact': 'true'}
    assert profile.args == ('PUT', 'http://kc/admin/realms/churn/users/kc-1')
    assert profile.kwargs['json']['username'] == 'anna'
    assert reset.args[1].endswith('/users/kc-1/reset-password')


def test_update_of_user_missing_in_keycloak_creates_it_when_password_known(kc, anna):
    _, call = kc
    call.side_effect = [response(body=[]), response(201)]

    keycloak.update_user(anna, 'New-pass-456')

    assert call.call_args.args[0] == 'POST'


def test_conflict_is_reported(kc, anna):
    _, call = kc
    call.return_value = response(409)

    with pytest.raises(keycloak.KeycloakError, match='уже есть'):
        keycloak.create_user(anna, 'Long-pass-123')
