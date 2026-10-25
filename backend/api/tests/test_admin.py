import json
from datetime import UTC, datetime

import pytest
from django.conf import settings
from django.contrib.auth import get_user_model
from django.core.files.uploadedfile import SimpleUploadedFile

from analytics.models import AnalyticsSnapshot, ModelSettings
from customers.importer import replace_snapshot
from customers.models import Customer
from customers.tests.snapshots import account, service, snapshot

pytestmark = pytest.mark.django_db


@pytest.fixture
def admin_client(client):
    admin = get_user_model().objects.create_superuser('boss', 'boss@example.test', 'x')
    client.force_login(admin)
    return client


@pytest.fixture
def loaded():
    replace_snapshot(snapshot(
        accounts=[account(1, balance=0), account(2)],
        services=[service(10, owner_id=1), service(20, owner_id=2, autoProlong=True)],
    ), now=datetime(2026, 10, 28, tzinfo=UTC))


def test_index_shows_summary(admin_client, loaded):
    response = admin_client.get('/admin/')

    assert response.status_code == 200
    html = response.content.decode()
    assert 'Ожидаемая потеря' in html
    assert 'admin-theme/churn' in html
    assert 'Пересчёт: 28.10.2026 00:00 UTC' in html


@pytest.mark.parametrize('url', [
    '/admin/customers/customer/',
    '/admin/customers/customer/1/change/',
    '/admin/customers/service/',
    '/admin/customers/service/10/change/',
    '/admin/customers/transaction/',
    '/admin/customers/servicestatusevent/',
    '/admin/analytics/riskassessment/',
    '/admin/analytics/riskassessment/1/change/',
    '/admin/analytics/analyticssnapshot/',
    '/admin/auth/user/',
    '/admin/data/',
])
def test_pages_render(admin_client, loaded, url):
    assert admin_client.get(url).status_code == 200


def test_customer_list_has_level_badges(admin_client, loaded):
    html = admin_client.get('/admin/customers/customer/').content.decode()

    assert 'class="level level-' in html


def test_customer_card_links_to_panel(admin_client, loaded):
    html = admin_client.get('/admin/customers/customer/1/change/').content.decode()

    assert 'href="/customers/1"' in html
    assert 'factor-list' in html


def test_source_data_is_read_only(admin_client, loaded):
    assert admin_client.get('/admin/customers/customer/add/').status_code == 403
    response = admin_client.post('/admin/customers/customer/1/change/', {'email': 'x@example.test'})
    assert response.status_code == 403
    assert Customer.objects.get(pk=1).email != 'x@example.test'


def test_settings_list_opens_the_single_record(admin_client):
    response = admin_client.get('/admin/analytics/modelsettings/')

    assert response.status_code == 302
    assert response['Location'] == f'/admin/analytics/modelsettings/{ModelSettings.SINGLETON_ID}/change/'


def settings_form(client):
    # through the list, as in the admin menu: it creates the settings record if needed
    response = client.get('/admin/analytics/modelsettings/', follow=True)
    form = response.context['adminform'].form
    data = {}
    for name, field in form.fields.items():
        value = form[name].value()
        if isinstance(value, bool):
            if value:
                data[name] = 'on'
        else:
            data[name] = value
    return data


def test_settings_save_changed_fields_and_recalculate(admin_client, loaded):
    data = settings_form(admin_client)
    data['weights__prolong_wait'] = 40
    recalculations = AnalyticsSnapshot.objects.count()

    response = admin_client.post(f'/admin/analytics/modelsettings/{ModelSettings.SINGLETON_ID}/change/', data)

    assert response.status_code == 302
    assert ModelSettings.load().weights == {'prolong_wait': 40}
    assert ModelSettings.load().thresholds == {}
    assert AnalyticsSnapshot.objects.count() == recalculations + 1


def test_settings_validation_error_on_field(admin_client):
    data = settings_form(admin_client)
    data['thresholds__medium'] = 80
    data['thresholds__high'] = 50

    response = admin_client.post(f'/admin/analytics/modelsettings/{ModelSettings.SINGLETON_ID}/change/', data)

    assert response.status_code == 200
    assert 'thresholds__medium' in response.context['adminform'].form.errors
    assert ModelSettings.load().thresholds == {}


def test_data_upload(admin_client):
    upload = SimpleUploadedFile('s.json', json.dumps(snapshot()).encode(), content_type='application/json')

    response = admin_client.post('/admin/data/', {'file': upload}, follow=True)

    assert Customer.objects.count() == 1
    assert 'Загружено: клиентов 1' in response.content.decode()


def test_data_upload_shows_validation_errors(admin_client, loaded):
    bad = snapshot(services=[service(owner_id=99)])
    upload = SimpleUploadedFile('s.json', json.dumps(bad).encode(), content_type='application/json')

    response = admin_client.post('/admin/data/', {'file': upload})

    assert 'services[0].ownerId' in response.content.decode()
    assert Customer.objects.count() == 2


@pytest.mark.skipif(not settings.SAMPLE_DATA_DIR.exists(), reason='sample-data не смонтирован')
def test_data_sample_set(admin_client):
    admin_client.post('/admin/data/', {'action': 'sample-extended'})

    assert Customer.objects.count() == 22


def test_data_page_requires_staff(client, user):
    client.force_login(user)

    response = client.get('/admin/data/')

    assert response.status_code == 302
    assert '/admin/login/' in response['Location']
