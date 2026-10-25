from unittest.mock import patch
from urllib.parse import parse_qs, urlparse

import pytest
from django.contrib.auth import get_user_model
from django.test import override_settings

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
    assert query['state']


@OIDC
def test_callback_creates_user_and_session(client):
    _, query = start_login(client)

    response = finish_login(client, query['state'][0])

    assert response.status_code == 302
    assert response['Location'] == '/customers'
    user = get_user_model().objects.get()
    assert user.username == 'analyst@example.test'
    assert not user.is_staff
    me = client.get('/api/v1/auth/me')
    assert me.json()['username'] == 'analyst@example.test'


@OIDC
def test_second_login_reuses_user(client):
    for _ in range(2):
        _, query = start_login(client)
        finish_login(client, query['state'][0])

    assert get_user_model().objects.count() == 1


@OIDC
def test_unverified_email_is_rejected(client):
    _, query = start_login(client)

    response = finish_login(client, query['state'][0], CLAIMS | {'email_verified': False})

    assert response['Location'] == '/login?error=sso'
    assert client.get('/api/v1/auth/me').status_code == 401


@OIDC
def test_staff_account_is_not_taken_over(client):
    get_user_model().objects.create_superuser('analyst@example.test', 'analyst@example.test', 'x')
    _, query = start_login(client)

    response = finish_login(client, query['state'][0])

    assert response['Location'] == '/login?error=sso'
    assert client.get('/api/v1/auth/me').status_code == 401


@OIDC
def test_external_next_is_ignored(client):
    _, query = start_login(client, 'https://evil.example/')

    response = finish_login(client, query['state'][0])

    assert response['Location'] == '/'


@OIDC
def test_password_login_still_works(api_client, user):
    response = api_client.post(
        '/api/v1/auth/login', {'username': 'analyst', 'password': 'secret-pass'}, format='json',
    )

    assert response.status_code == 200
