from unittest.mock import patch
from urllib.parse import parse_qs, urlparse

import pytest
from django.test import override_settings

from api import keycloak
from api.tests.test_oidc import OIDC

pytestmark = pytest.mark.django_db

URL = '/api/v1/auth/passkeys'


@pytest.fixture
def sso(settings):
    settings.OIDC_ENABLED = True
    settings.KEYCLOAK_PROVISIONER_SECRET = 'secret'


@pytest.fixture
def anna(django_user_model):
    return django_user_model.objects.create_user('anna', 'anna@example.test', 'Long-pass-123')


def client_for(api_client, user):
    api_client.force_authenticate(user)
    return api_client


def test_requires_login(api_client):
    assert api_client.get(URL).status_code == 401


def test_sso_disabled(api_client, anna):
    body = client_for(api_client, anna).get(URL).json()

    assert body == {'sso_enabled': False, 'sso_account': False, 'passkeys': []}
    assert client_for(api_client, anna).post(f'{URL}/setup').status_code == 404


def test_list(api_client, anna, sso):
    keys = [{'id': 'c1', 'label': 'Ноутбук', 'created': 1792900000000}]
    with patch('api.keycloak.user_id', return_value='kc-1'), patch('api.keycloak.list_passkeys', return_value=keys):
        body = client_for(api_client, anna).get(URL).json()

    assert body['sso_account'] is True
    assert body['passkeys'] == [{'id': 'c1', 'label': 'Ноутбук', 'created_at': '2026-10-25T03:46:40Z'}]


def test_setup_with_existing_account_returns_registration_url(api_client, anna, sso):
    with patch('api.keycloak.user_id', return_value='kc-1'), patch('api.keycloak.create_user') as create:
        response = client_for(api_client, anna).post(f'{URL}/setup')

    assert response.status_code == 200
    assert response.json()['url'].startswith('/api/v1/auth/oidc/passkey?next=/profile')
    create.assert_not_called()


def test_setup_creates_missing_account_after_password_check(api_client, anna, sso):
    client = client_for(api_client, anna)
    with patch('api.keycloak.user_id', return_value=None), patch('api.keycloak.create_user') as create:
        assert 'password' in client.post(f'{URL}/setup').json()['errors']
        assert client.post(f'{URL}/setup', {'password': 'wrong'}, format='json').json()['errors']['password'] == ['Неверный пароль']
        create.assert_not_called()

        response = client.post(f'{URL}/setup', {'password': 'Long-pass-123'}, format='json')

    assert response.status_code == 200
    assert create.call_args.args == (anna, 'Long-pass-123')


def test_keycloak_down(api_client, anna, sso):
    with patch('api.keycloak.user_id', side_effect=keycloak.KeycloakError('Keycloak недоступен')):
        response = client_for(api_client, anna).get(URL)

    assert response.status_code == 503
    assert response.json()['code'] == 'sso_unavailable'


def test_delete_only_own_passkey(api_client, anna, sso):
    client = client_for(api_client, anna)
    with (
        patch('api.keycloak.user_id', return_value='kc-1'),
        patch('api.keycloak.delete_passkey', return_value=True) as delete,
        patch('api.keycloak.logout_user') as kc_logout,
    ):
        assert client.delete(f'{URL}/c1').status_code == 204
    delete.assert_called_once_with('kc-1', 'c1')
    kc_logout.assert_called_once_with('anna')
    with patch('api.keycloak.user_id', return_value='kc-1'), patch('api.keycloak.delete_passkey', return_value=False):
        assert client.delete(f'{URL}/other').status_code == 404


@OIDC
def test_registration_redirect_asks_keycloak_for_passkey(client, anna):
    client.force_login(anna)

    response = client.get('/api/v1/auth/oidc/passkey', {'next': '/profile?passkey=added'})

    query = parse_qs(urlparse(response['Location']).query)
    assert response.status_code == 302
    assert query['kc_action'] == ['webauthn-register-passwordless']
    assert query['login_hint'] == ['anna']
    assert query['prompt'] == ['login']
    assert client.session['oidc_login_next'] == '/profile?passkey=added'


@OIDC
def test_registration_redirect_requires_login(client):
    response = client.get('/api/v1/auth/oidc/passkey')

    assert response['Location'] == '/login?next=/profile'


@override_settings(OIDC_ENABLED=False)
def test_registration_redirect_disabled(client, anna):
    client.force_login(anna)

    assert client.get('/api/v1/auth/oidc/passkey').status_code == 404


def test_list_passkeys_filters_by_type():
    credentials = [
        {'id': 'p', 'type': 'password'},
        {'id': 'k', 'type': 'webauthn-passwordless', 'userLabel': 'Телефон', 'createdDate': 1},
    ]
    with patch('api.keycloak._call') as call:
        call.return_value.json.return_value = credentials
        assert keycloak.list_passkeys('kc-1') == [{'id': 'k', 'label': 'Телефон', 'created': 1}]
        # the password is never deleted through this call
        assert keycloak.delete_passkey('kc-1', 'p') is False


@OIDC
@pytest.mark.parametrize('action_status, expected', [
    ('success', '/profile?passkey=added'),
    ('cancelled', '/profile?passkey=cancelled'),
    ('error', '/profile?passkey=cancelled'),
    (None, '/profile?passkey=added'),
])
def test_callback_reports_passkey_result(client, anna, action_status, expected):
    anna.last_login = anna.date_joined
    anna.save()
    client.force_login(anna)
    response = client.get('/api/v1/auth/oidc/passkey', {'next': '/profile?passkey=added'})
    state = parse_qs(urlparse(response['Location']).query)['state'][0]
    # Keycloak adds kc_action_status to the redirect back after a requested action
    params = {'code': 'code', 'state': state} | ({'kc_action_status': action_status} if action_status else {})
    backend = 'api.oidc.OIDCBackend'
    with (
        patch(f'{backend}.get_token', return_value={'id_token': 'id', 'access_token': 'access'}),
        patch(f'{backend}.verify_token', return_value={'nonce': client.session['oidc_states'][state]['nonce']}),
        patch(f'{backend}.get_userinfo', return_value={'sub': '1', 'email': 'anna@example.test', 'email_verified': True}),
    ):
        result = client.get('/api/v1/auth/oidc/callback', params)

    assert result['Location'] == expected
