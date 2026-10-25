import pytest
from rest_framework.test import APIClient

pytestmark = pytest.mark.django_db

LOGIN_URL = '/api/v1/auth/login'
ME_URL = '/api/v1/auth/me'
LOGOUT_URL = '/api/v1/auth/logout'
CSRF_URL = '/api/v1/auth/csrf'


def test_login_success_creates_session(api_client, user):
    response = api_client.post(LOGIN_URL, {'username': 'analyst', 'password': 'secret-pass'}, format='json')

    assert response.status_code == 200
    assert response.json() == {'id': user.id, 'username': 'analyst', 'is_staff': False, 'is_superuser': False}
    assert api_client.get(ME_URL).status_code == 200


def test_login_wrong_password(api_client, user):
    response = api_client.post(LOGIN_URL, {'username': 'analyst', 'password': 'wrong'}, format='json')

    assert response.status_code == 401
    assert response.json() == {'detail': 'Неверный логин или пароль', 'code': 'invalid_credentials'}


def test_login_missing_fields(api_client):
    response = api_client.post(LOGIN_URL, {'username': 'analyst'}, format='json')

    assert response.status_code == 400
    body = response.json()
    assert body['code'] == 'invalid'
    assert 'password' in body['errors']


def test_login_requires_csrf():
    client = APIClient(enforce_csrf_checks=True)

    response = client.post(LOGIN_URL, {'username': 'analyst', 'password': 'secret-pass'}, format='json')

    assert response.status_code == 403
    assert response.json()['code'] == 'permission_denied'


def test_login_with_csrf_token(user):
    client = APIClient(enforce_csrf_checks=True)
    token = client.get(CSRF_URL).cookies['csrftoken'].value

    response = client.post(
        LOGIN_URL,
        {'username': 'analyst', 'password': 'secret-pass'},
        format='json',
        HTTP_X_CSRFTOKEN=token,
    )

    assert response.status_code == 200


def test_login_throttled(api_client, settings):
    for _ in range(10):
        api_client.post(LOGIN_URL, {'username': 'x', 'password': 'y'}, format='json')

    response = api_client.post(LOGIN_URL, {'username': 'x', 'password': 'y'}, format='json')

    assert response.status_code == 429
    assert response.json()['code'] == 'throttled'


def test_me_returns_current_user(auth_client, user):
    response = auth_client.get(ME_URL)

    assert response.status_code == 200
    assert response.json() == {'id': user.id, 'username': 'analyst', 'is_staff': False, 'is_superuser': False}


def test_logout_ends_session(api_client, user):
    api_client.login(username='analyst', password='secret-pass')

    assert api_client.post(LOGOUT_URL).status_code == 204
    assert api_client.get(ME_URL).status_code == 401


@pytest.mark.parametrize(
    'method, url',
    [
        ('get', ME_URL),
        ('post', LOGOUT_URL),
    ],
)
def test_protected_endpoints_require_auth(api_client, method, url):
    response = getattr(api_client, method)(url)

    assert response.status_code == 401
    assert response.json()['code'] == 'not_authenticated'
