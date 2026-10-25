from datetime import timedelta
from unittest.mock import patch

import pytest
from django.contrib.sessions.models import Session
from django.utils import timezone
from rest_framework.test import APIClient

from api.models import UserSession
from api.sessions import describe_agent
from api.tests.test_oidc import OIDC, finish_login, start_login

pytestmark = pytest.mark.django_db

URL = '/api/v1/auth/sessions'
CHROME = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36'
SAFARI = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1'


def sign_in(username='analyst', password='secret-pass', agent=CHROME, ip='203.0.113.7'):
    client = APIClient(HTTP_USER_AGENT=agent, HTTP_X_FORWARDED_FOR=f'{ip}, 172.18.0.1')
    assert client.post('/api/v1/auth/login', {'username': username, 'password': password}, format='json').status_code == 200
    return client


def test_requires_login(api_client):
    assert api_client.get(URL).status_code == 401


def test_login_is_remembered(user):
    client = sign_in()

    body = client.get(URL).json()

    assert len(body) == 1
    assert body[0]['device'] == 'Chrome · Windows'
    assert body[0]['ip'] == '203.0.113.7'
    assert body[0]['method'] == 'password'
    assert body[0]['current'] is True


def test_logout_forgets_session(user):
    client = sign_in()

    client.post('/api/v1/auth/logout')

    assert UserSession.objects.count() == 0


def test_lists_only_own_live_sessions(user, django_user_model):
    django_user_model.objects.create_user('boris', password='secret-pass')
    phone = sign_in(agent=SAFARI)
    laptop = sign_in()
    sign_in('boris')
    expired = sign_in()
    Session.objects.filter(session_key=expired.cookies['sessionid'].value).update(expire_date=timezone.now() - timedelta(minutes=1))

    body = laptop.get(URL).json()

    assert [row['device'] for row in body] == ['Chrome · Windows', 'Safari · iPhone']
    assert [row['current'] for row in body] == [True, False]
    # the expired row is cleaned up on the way
    assert UserSession.objects.filter(user=user).count() == 2
    assert phone.get('/api/v1/auth/me').status_code == 200


def test_end_other_session(user):
    phone = sign_in(agent=SAFARI)
    laptop = sign_in()
    other = UserSession.objects.get(session_key=phone.cookies['sessionid'].value)

    response = laptop.delete(f'{URL}/{other.pk}')

    assert response.status_code == 204
    assert phone.get('/api/v1/auth/me').status_code == 401
    assert laptop.get('/api/v1/auth/me').status_code == 200


def test_cannot_end_current_session(user):
    client = sign_in()
    current = UserSession.objects.get()

    response = client.delete(f'{URL}/{current.pk}')

    assert response.status_code == 400
    assert response.json()['code'] == 'current_session'


def test_cannot_end_someone_elses_session(user, django_user_model):
    django_user_model.objects.create_user('boris', password='secret-pass')
    boris = sign_in('boris')
    client = sign_in()
    row = UserSession.objects.get(user__username='boris')

    assert client.delete(f'{URL}/{row.pk}').status_code == 404
    assert boris.get('/api/v1/auth/me').status_code == 200


def test_end_others_keeps_current(user, settings):
    settings.OIDC_ENABLED = True
    settings.KEYCLOAK_PROVISIONER_SECRET = 'secret'
    phone = sign_in(agent=SAFARI)
    tablet = sign_in(agent=SAFARI)
    laptop = sign_in()

    with patch('api.views.sessions.keycloak.logout_user') as logout_user:
        response = laptop.post(f'{URL}/end-others')

    assert response.json() == {'ended': 2}
    logout_user.assert_called_once_with('analyst')
    assert phone.get('/api/v1/auth/me').status_code == 401
    assert tablet.get('/api/v1/auth/me').status_code == 401
    assert laptop.get('/api/v1/auth/me').status_code == 200


def test_end_others_works_when_keycloak_is_down(user, settings):
    from api import keycloak

    settings.OIDC_ENABLED = True
    settings.KEYCLOAK_PROVISIONER_SECRET = 'secret'
    sign_in(agent=SAFARI)
    laptop = sign_in()

    with patch('api.views.sessions.keycloak.logout_user', side_effect=keycloak.KeycloakError('down')):
        assert laptop.post(f'{URL}/end-others').json() == {'ended': 1}


def test_activity_is_touched_at_most_once_a_minute(user):
    client = sign_in()
    row = UserSession.objects.get()
    UserSession.objects.filter(pk=row.pk).update(last_seen_at=timezone.now() - timedelta(minutes=5))

    client.get('/api/v1/auth/me')
    first = UserSession.objects.get().last_seen_at
    client.get('/api/v1/auth/me')

    assert timezone.now() - first < timedelta(seconds=5)
    assert UserSession.objects.get().last_seen_at == first


@OIDC
def test_sso_login_is_marked(client, django_user_model):
    anna = django_user_model.objects.create_user('anna', 'analyst@example.test', 'Long-pass-123', last_login=timezone.now())
    _, query = start_login(client)

    finish_login(client, query['state'][0])

    assert UserSession.objects.get(user=anna).method == 'sso'


@pytest.mark.parametrize('agent, expected', [
    (CHROME, 'Chrome · Windows'),
    (SAFARI, 'Safari · iPhone'),
    ('Mozilla/5.0 (X11; Linux x86_64; rv:131.0) Gecko/20100101 Firefox/131.0', 'Firefox · Linux'),
    ('Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0) AppleWebKit/537.36 Chrome/130.0 Safari/537.36 Edg/130.0', 'Edge · macOS'),
    ('curl/8.10.1', 'curl'),
    ('', 'Неизвестное устройство'),
])
def test_describe_agent(agent, expected):
    assert describe_agent(agent) == expected


class TestAdmin:
    @pytest.fixture
    def admin_client(self, django_user_model):
        django_user_model.objects.create_user('chief', password='secret-pass', is_staff=True)
        return sign_in('chief')

    def test_staff_only(self, user):
        client = sign_in()

        assert client.get(f'/api/v1/admin/users/{user.pk}/sessions').status_code == 403

    def test_end_all_sessions_of_user(self, user, admin_client, settings):
        settings.OIDC_ENABLED = True
        settings.KEYCLOAK_PROVISIONER_SECRET = 'secret'
        phone = sign_in(agent=SAFARI)
        laptop = sign_in()
        assert len(admin_client.get(f'/api/v1/admin/users/{user.pk}/sessions').json()) == 2

        with patch('api.views.sessions.keycloak.logout_user') as logout_user:
            response = admin_client.delete(f'/api/v1/admin/users/{user.pk}/sessions')

        assert response.json() == {'ended': 2}
        logout_user.assert_called_once_with('analyst')
        assert phone.get('/api/v1/auth/me').status_code == 401
        assert laptop.get('/api/v1/auth/me').status_code == 401

    def test_not_own_account(self, admin_client):
        chief = UserSession.objects.get().user

        response = admin_client.delete(f'/api/v1/admin/users/{chief.pk}/sessions')

        assert response.status_code == 400
        assert admin_client.get('/api/v1/auth/me').status_code == 200

    def test_superuser_is_protected_from_staff(self, admin_client, django_user_model):
        root = django_user_model.objects.create_superuser('root', password='secret-pass')

        assert admin_client.delete(f'/api/v1/admin/users/{root.pk}/sessions').status_code == 403
