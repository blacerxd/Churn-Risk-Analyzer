import json

import pytest
from django.core.files.uploadedfile import SimpleUploadedFile
from django.core.management import CommandError, call_command

from analytics.models import AnalyticsSnapshot, RiskAssessment
from customers.models import Customer, Service, Transaction
from customers.tests.snapshots import account, service, snapshot

pytestmark = pytest.mark.django_db

URL = '/api/v1/source/snapshot'


def counts():
    return Customer.objects.count(), Service.objects.count(), Transaction.objects.count()


def upload(data, name='snapshot.json'):
    content = data if isinstance(data, bytes) else json.dumps(data).encode()
    return SimpleUploadedFile(name, content, content_type='application/json')


def test_requires_auth(api_client):
    response = api_client.put(URL, snapshot(), format='json')

    assert response.status_code == 401


def test_loads_json_body(auth_client):
    response = auth_client.put(URL, snapshot(), format='json')

    assert response.status_code == 200
    body = response.json()
    assert body['accounts'] == 1
    assert body['services'] == 1
    assert body['transactions'] == 1
    assert body['status_changes'] == 0
    assert body['imported_at']
    assert body['recalculated_at'] == body['imported_at']
    assert counts() == (1, 1, 1)
    assert RiskAssessment.objects.count() == 1


def test_loads_multipart_file(auth_client):
    response = auth_client.put(URL, {'file': upload(snapshot())}, format='multipart')

    assert response.status_code == 200
    assert counts() == (1, 1, 1)


def test_replaces_previous_data(auth_client):
    auth_client.put(URL, snapshot(), format='json')
    data = snapshot(
        accounts=[account(1), account(2)],
        services=[service(10, status='prolong_wait'), service(11, owner_id=2)],
        transactions=[],
    )

    response = auth_client.put(URL, data, format='json')

    assert response.status_code == 200
    assert response.json()['status_changes'] == 1
    assert counts() == (2, 2, 0)


def test_invalid_snapshot_reports_errors_and_keeps_data(auth_client):
    auth_client.put(URL, snapshot(), format='json')
    recalculations = AnalyticsSnapshot.objects.count()
    data = snapshot(services=[service(owner_id=99, status='unknown')])

    response = auth_client.put(URL, data, format='json')

    assert response.status_code == 400
    body = response.json()
    assert body['code'] == 'invalid_snapshot'
    assert body['errors_total'] == len(body['errors'])
    paths = {error['path'] for error in body['errors']}
    assert {'services[0].status', 'services[0].ownerId'} <= paths
    assert counts() == (1, 1, 1)
    assert AnalyticsSnapshot.objects.count() == recalculations


def test_not_an_object(auth_client):
    response = auth_client.put(URL, [1, 2, 3], format='json')

    assert response.status_code == 400
    assert response.json()['code'] == 'invalid_snapshot'


def test_malformed_json_body(auth_client):
    response = auth_client.put(URL, '{"accounts": [', content_type='application/json')

    assert response.status_code == 400
    assert response.json()['code'] == 'parse_error'


def test_malformed_json_file(auth_client):
    response = auth_client.put(URL, {'file': upload(b'not json')}, format='multipart')

    assert response.status_code == 400
    assert response.json()['detail'] == 'Файл не является корректным JSON'


def test_multipart_without_file(auth_client):
    response = auth_client.put(URL, {'other': 'x'}, format='multipart')

    assert response.status_code == 400
    assert response.json()['detail'] == 'Не передан файл в поле file'


def test_too_large(auth_client, settings):
    settings.SNAPSHOT_MAX_BYTES = 100

    response = auth_client.put(URL, snapshot(), format='json')

    assert response.status_code == 413
    assert response.json()['code'] == 'too_large'
    assert counts() == (0, 0, 0)


def test_load_snapshot_command(tmp_path):
    path = tmp_path / 'data.json'
    path.write_text(json.dumps(snapshot()))

    call_command('load_snapshot', path)

    assert counts() == (1, 1, 1)


def test_load_snapshot_command_if_empty_skips_existing_data(tmp_path):
    first, second = tmp_path / 'first.json', tmp_path / 'second.json'
    first.write_text(json.dumps(snapshot()))
    second.write_text(json.dumps(snapshot(accounts=[account(1), account(2)])))
    call_command('load_snapshot', first)

    call_command('load_snapshot', second, '--if-empty')

    assert Customer.objects.count() == 1


def test_load_snapshot_command_reports_validation_errors(tmp_path):
    path = tmp_path / 'data.json'
    path.write_text(json.dumps(snapshot(services=[service(owner_id=99)])))

    with pytest.raises(CommandError, match=r'services\[0\]\.ownerId'):
        call_command('load_snapshot', path)
