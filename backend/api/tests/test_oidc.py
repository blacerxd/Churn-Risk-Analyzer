from unittest.mock import patch
from urllib.parse import parse_qs, urlparse

import pytest
from django.contrib.auth import get_user_model
from django.test import override_settings
from django.utils import timezone

pytestmark = pytest.mark.django_db

ISSUER = 'https://sso.example.test/realms/churn'
OIDC = override_settings(
    OIDC_ENABLED=True,
    AUTHENTICATION_BACKENDS=['django.contrib.auth.backends.ModelBackend', 'api.oidc.OIDCBackend'],
    OIDC_RP_CLIENT_ID='churn-panel',
    OIDC_RP_CLIENT_SECRET='secret',
    OIDC_RP_SIGN_ALGO='RS256',
    OIDC_RP_SCOPES='openid email profile',
    OIDC_USE_PKCE=True,
    OIDC_OP_AUTHORIZATION_ENDPOINT=f'{ISSUER}/protocol/openid-connect/auth',
    OIDC_OP_TOKEN_ENDPOINT=f'{ISSUER}/protocol/openid-connect/token',
    OIDC_OP_USER_ENDPOINT=f'{ISSUER}/protocol/openid-connect/userinfo',
    OIDC_OP_JWKS_ENDPOINT=f'{ISSUER}/protocol/openid-connect/certs',
    OIDC_AUTHENTICATION_CALLBACK_URL='oidc-callback',
    LOGIN_REDIRECT_URL='/',
    LOGIN_REDIRECT_URL_FAILURE='/login?error=sso',
    OIDC_CREATE_USER=False,
    OIDC_AUTH_REQUEST_EXTRA_PARAMS={'prompt': 'login'},
)
CLAIMS = {'sub': '1', 'email': 'analyst@example.test', 'email_verified': True}


def start_login(client, next_url='/customers'):
    response = client.get('/api/v1/auth/oidc/login', {'next': next_url})
    query = parse_qs(urlparse(response['Location']).query)
    return response, query


def finish_login(client, state, claims=CLAIMS):
    backend = 'api.oidc.OIDCBackend'
    with (
        patch(f'{backend}.get_token', return_value={'id_token': 'id', 'access_token': 'access'}),
        patch(f'{backend}.verify_token', return_value={'nonce': client.session['oidc_states'][state]['nonce']}),
        patch(f'{backend}.get_userinfo', return_value=claims),
    ):
        return client.get('/api/v1/auth/oidc/callback', {'code': 'code', 'state': state})


@pytest.mark.parametrize('url', ['/api/v1/auth/oidc/login', '/api/v1/auth/oidc/callback'])
def test_disabled(client, settings, url):
    settings.OIDC_ENABLED = False

    assert client.get(url).status_code == 404


@OIDC
def test_login_redirects_to_provider(client):
    response, query = start_login(client)

    assert response.status_code == 302
    assert response['Location'].startswith(f'{ISSUER}/protocol/openid-connect/auth?')
    assert query['client_id'] == ['churn-panel']
    assert query['redirect_uri'] == ['http://testserver/api/v1/auth/oidc/callback']
    assert query['code_challenge_method'] == ['S256']
    # the passkey is asked every time, even with a live Keycloak session
    assert query['prompt'] == ['login']
    assert query['state']


@pytest.fixture
def analyst(db):
    # created by an admin and already signed in once with the password
    user = get_user_model().objects.create_user('anna', 'analyst@example.test', 'Long-pass-123')
    user.last_login = timezone.now()
    user.save()
    return user


@OIDC
def test_callback_signs_in_existing_user_by_email(client, analyst):
    _, query = start_login(client)

    response = finish_login(client, query['state'][0], CLAIMS | {'email': 'ANALYST@example.test'})

    assert response.status_code == 302
    assert response['Location'] == '/customers'
    assert client.get('/api/v1/auth/me').json()['username'] == 'anna'
    assert get_user_model().objects.count() == 1


@OIDC
def test_unknown_email_is_not_created(client, analyst):
    _, query = start_login(client)

    response = finish_login(client, query['state'][0], CLAIMS | {'email': 'stranger@example.test'})

    assert response['Location'] == '/login?error=sso'
    assert get_user_model().objects.count() == 1


@OIDC
def test_first_sign_in_must_be_with_password(client, analyst):
    analyst.last_login = None
    analyst.save()
    _, query = start_login(client)

    response = finish_login(client, query['state'][0])

    assert response['Location'] == '/login?error=sso'
    assert client.get('/api/v1/auth/me').status_code == 401


@OIDC
def test_blocked_user_is_refused(client, analyst):
    analyst.is_active = False
    analyst.save()
    _, query = start_login(client)

    response = finish_login(client, query['state'][0])

    assert response['Location'] == '/login?error=sso'


@OIDC
def test_unverified_email_is_rejected(client, analyst):
    _, query = start_login(client)

    response = finish_login(client, query['state'][0], CLAIMS | {'email_verified': False})

    assert response['Location'] == '/login?error=sso'
    assert client.get('/api/v1/auth/me').status_code == 401


@OIDC
def test_external_next_is_ignored(client, analyst):
    _, query = start_login(client, 'https://evil.example/')

    response = finish_login(client, query['state'][0])

    assert response['Location'] == '/'


@OIDC
def test_password_login_still_works(api_client, user):
    response = api_client.post(
        '/api/v1/auth/login', {'username': 'analyst', 'password': 'secret-pass'}, format='json',
    )

    assert response.status_code == 200


def test_logout_ends_keycloak_sessions(api_client, user, settings):
    settings.OIDC_ENABLED = True
    settings.KEYCLOAK_PROVISIONER_SECRET = 'secret'
    api_client.force_authenticate(user)
    with patch('api.keycloak.logout_user') as kc_logout:
        response = api_client.post('/api/v1/auth/logout')

    assert response.status_code == 204
    kc_logout.assert_called_once_with('analyst')


def test_logout_works_when_keycloak_is_down(api_client, user, settings):
    from api import keycloak

    settings.OIDC_ENABLED = True
    settings.KEYCLOAK_PROVISIONER_SECRET = 'secret'
    api_client.force_authenticate(user)
    with patch('api.keycloak.logout_user', side_effect=keycloak.KeycloakError('Keycloak недоступен')):
        assert api_client.post('/api/v1/auth/logout').status_code == 204
