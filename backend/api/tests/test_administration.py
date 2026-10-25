from datetime import UTC, datetime

from unittest.mock import patch

import pytest
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient

from api import keycloak
from customers.importer import replace_snapshot
from customers.tests.snapshots import service, snapshot

pytestmark = pytest.mark.django_db

USERS = '/api/v1/admin/users'
User = get_user_model()


def client_for(user):
    client = APIClient()
    client.force_authenticate(user)
    return client


@pytest.fixture
def superuser():
    return User.objects.create_superuser('root', 'root@example.test', 'x')


@pytest.fixture
def staff():
    return User.objects.create_user('manager', password='x', is_staff=True)


@pytest.mark.parametrize('url', [USERS, '/api/v1/admin/recalculations', '/api/v1/admin/status-events'])
def test_staff_only(api_client, user, url):
    assert api_client.get(url).status_code == 401
    assert client_for(user).get(url).status_code == 403


def test_me_reports_staff(staff):
    assert client_for(staff).get('/api/v1/auth/me').json()['is_staff'] is True


def test_list_and_search(superuser, user):
    client = client_for(superuser)

    body = client.get(USERS).json()
    assert body['count'] == 2
    assert {row['username'] for row in body['results']} == {'root', 'analyst'}
    assert 'password' not in body['results'][0]
    assert [row['username'] for row in client.get(USERS, {'search': 'ROO'}).json()['results']] == ['root']


NEW_USER = {
    'username': 'new', 'first_name': 'Анна', 'last_name': 'Петрова',
    'email': 'new@example.test', 'password': 'Long-pass-123',
}


def test_create_user(superuser):
    response = client_for(superuser).post(USERS, NEW_USER, format='json')

    assert response.status_code == 201
    created = User.objects.get(username='new')
    assert created.check_password('Long-pass-123')
    assert (created.first_name, created.last_name, created.email) == ('Анна', 'Петрова', 'new@example.test')
    assert created.last_login is None
    assert not created.is_staff


def test_create_requires_email_and_strong_password(superuser):
    client = client_for(superuser)

    errors = client.post(USERS, {'username': 'a'}, format='json').json()['errors']
    assert {'email', 'password'} <= set(errors)
    response = client.post(USERS, NEW_USER | {'password': '123'}, format='json')
    assert 'password' in response.json()['errors']


def test_email_is_unique(superuser, user):
    user.email = 'taken@example.test'
    user.save()

    response = client_for(superuser).post(USERS, NEW_USER | {'email': 'TAKEN@example.test'}, format='json')

    assert response.status_code == 400
    assert 'email' in response.json()['errors']


@pytest.fixture
def sso(settings):
    settings.OIDC_ENABLED = True
    settings.KEYCLOAK_PROVISIONER_SECRET = 'secret'
    with patch('api.keycloak.create_user') as create, patch('api.keycloak.update_user') as update:
        yield create, update


def test_create_mirrors_user_into_keycloak(superuser, sso):
    create, _ = sso

    client_for(superuser).post(USERS, NEW_USER, format='json')

    user, password = create.call_args.args
    assert user.username == 'new' and password == 'Long-pass-123'


def test_keycloak_failure_rolls_back(superuser, sso):
    create, _ = sso
    create.side_effect = keycloak.KeycloakError('Keycloak недоступен')

    response = client_for(superuser).post(USERS, NEW_USER, format='json')

    assert response.status_code == 400
    assert response.json()['errors']['non_field_errors'] == ['SSO: Keycloak недоступен']
    assert not User.objects.filter(username='new').exists()


def test_block_and_password_reach_keycloak(superuser, user, sso):
    _, update = sso

    client_for(superuser).patch(
        f'{USERS}/{user.id}', {'username': 'renamed', 'is_active': False, 'password': 'Another-pass-456'}, format='json',
    )

    synced, password = update.call_args.args
    assert (synced.username, synced.is_active, password) == ('renamed', False, 'Another-pass-456')
    assert update.call_args.kwargs == {'username': 'analyst'}


def test_no_keycloak_calls_without_sso(superuser):
    with patch('api.keycloak._call') as call:
        client_for(superuser).post(USERS, NEW_USER, format='json')

    call.assert_not_called()


def test_block_and_reset_password(superuser, user):
    response = client_for(superuser).patch(
        f'{USERS}/{user.id}', {'is_active': False, 'password': 'Another-pass-456'}, format='json',
    )

    assert response.status_code == 200
    user.refresh_from_db()
    assert not user.is_active
    assert user.check_password('Another-pass-456')


def test_cannot_block_or_demote_yourself(staff):
    client = client_for(staff)

    for field in ('is_active', 'is_staff'):
        response = client.patch(f'{USERS}/{staff.id}', {field: False}, format='json')
        assert response.status_code == 400
        assert field in response.json()['errors']


def test_only_superuser_grants_staff(staff, superuser, user):
    response = client_for(staff).patch(f'{USERS}/{user.id}', {'is_staff': True}, format='json')
    assert response.status_code == 400
    assert 'is_staff' in response.json()['errors']

    response = client_for(superuser).patch(f'{USERS}/{user.id}', {'is_staff': True}, format='json')
    assert response.status_code == 200
    user.refresh_from_db()
    assert user.is_staff


def test_staff_cannot_touch_superuser(staff, superuser):
    response = client_for(staff).patch(f'{USERS}/{superuser.id}', {'password': 'Another-pass-456'}, format='json')

    assert response.status_code == 400
    assert superuser.__class__.objects.get(pk=superuser.pk).check_password('x')


def test_no_delete(superuser, user):
    assert client_for(superuser).delete(f'{USERS}/{user.id}').status_code == 405


def test_recalculations_and_status_events(staff):
    replace_snapshot(snapshot(services=[service(10)]), now=datetime(2026, 10, 27, tzinfo=UTC))
    replace_snapshot(snapshot(services=[service(10, status='deleted')]), now=datetime(2026, 10, 28, tzinfo=UTC))
    client = client_for(staff)

    recalculations = client.get('/api/v1/admin/recalculations').json()
    assert recalculations['count'] == 2
    latest = recalculations['results'][0]
    assert latest['calculated_at'] == '2026-10-28T00:00:00Z'
    assert latest['reason'] == 'snapshot'
    assert set(latest['by_level']) == {'high', 'medium', 'low', 'none'}

    events = client.get('/api/v1/admin/status-events', {'new_status': 'deleted'}).json()
    assert events['count'] == 1
    assert events['results'][0] | {'id': 0} == {
        'id': 0, 'service_id': 10, 'customer_id': 1, 'old_status': 'active', 'new_status': 'deleted',
        'detected_at': '2026-10-28T00:00:00Z',
    }
    assert client.get('/api/v1/admin/status-events', {'new_status': 'blocked'}).json()['count'] == 0
