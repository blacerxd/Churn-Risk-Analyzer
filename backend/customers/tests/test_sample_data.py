import json
import runpy
from datetime import UTC, datetime, timedelta
from io import StringIO

import pytest
from django.conf import settings
from django.core.management import call_command

from customers.importer import ImportResult
from customers.models import Customer, Service, ServiceStatusEvent
from customers.sample_data import (
    CASE_FILE,
    DEMO_FILE,
    REFERENCE,
    load_sample,
    merge,
    read,
    shift_dates,
)

from .snapshots import service, snapshot, transaction

SAMPLE_DIR = settings.SAMPLE_DATA_DIR
TEST_DATA = settings.BASE_DIR.parent / 'test_data' / 'data.json'

pytestmark = pytest.mark.skipif(not SAMPLE_DIR.exists(), reason='sample-data не смонтирован')


def test_shift_dates_moves_every_date_and_keeps_format():
    payload = snapshot(
        services=[service(createdAt='2026-10-01T00:00:00.000Z',
                          expiresAt='2026-10-31T23:30:00.000Z')],
        transactions=[transaction(), transaction(101, status='not_performed', performedAt=None)],
    )

    shifted = shift_dates(payload, timedelta(hours=1, seconds=5))

    assert shifted['services'][0]['createdAt'] == '2026-10-01T01:00:05.000Z'
    assert shifted['services'][0]['expiresAt'] == '2026-11-01T00:30:05.000Z'
    assert shifted['transactions'][0]['performedAt'] == '2026-10-01T01:05:05.000Z'
    assert shifted['transactions'][1]['performedAt'] is None
    assert shifted['accounts'] == payload['accounts']
    assert payload['services'][0]['createdAt'] == '2026-10-01T00:00:00.000Z'  # копия


def test_shift_dates_leaves_invalid_values_for_validation():
    payload = snapshot(services=[service(createdAt='вчера')])

    assert shift_dates(payload, timedelta(days=1))['services'][0]['createdAt'] == 'вчера'


def test_merge_concatenates_sections():
    merged = merge(snapshot(), snapshot(accounts=[], services=[], transactions=[]))

    assert {key: len(value) for key, value in merged.items()} == {
        'accounts': 1, 'services': 1, 'transactions': 1,
    }


@pytest.mark.skipif(not TEST_DATA.exists(), reason='test_data не смонтирован')
def test_case_set_is_unchanged_copy_of_test_data():
    assert read(CASE_FILE) == json.loads(TEST_DATA.read_text())


def test_demo_set_is_built_by_script():
    builder = runpy.run_path(str(SAMPLE_DIR / 'build_demo.py'))

    assert read(DEMO_FILE) == builder['build']()


def test_demo_ids_and_emails_do_not_clash_with_case():
    case, demo = read(CASE_FILE), read(DEMO_FILE)
    for section in ('accounts', 'services', 'transactions'):
        assert not {r['id'] for r in case[section]} & {r['id'] for r in demo[section]}
    assert not {a['email'] for a in case['accounts']} & {a['email'] for a in demo['accounts']}


@pytest.mark.django_db
def test_load_at_reference_keeps_original_dates():
    result = load_sample(now=REFERENCE)

    assert result == ImportResult(
        accounts=10, services=30, transactions=100, status_changes=0, imported_at=REFERENCE,
    )
    first = read(CASE_FILE)['services'][0]
    stored = Service.objects.get(pk=first['id'])
    assert stored.expires_at == datetime.fromisoformat(first['expiresAt'])


@pytest.mark.django_db
def test_load_shifts_reference_to_now():
    now = datetime(2026, 12, 1, 9, 17, 33, 400_000, tzinfo=UTC)

    result = load_sample(now=now)

    delta = result.imported_at - REFERENCE
    assert delta == timedelta(days=42, hours=18, minutes=17, seconds=33)  # целые секунды
    first = read(CASE_FILE)['services'][0]
    stored = Service.objects.get(pk=first['id'])
    assert stored.expires_at == datetime.fromisoformat(first['expiresAt']) + delta


@pytest.mark.django_db
def test_extended_adds_demo_customers():
    result = load_sample(extended=True, now=REFERENCE)

    assert result.accounts == 10 + len(read(DEMO_FILE)['accounts'])
    assert Customer.objects.filter(email__startswith='demo-').count() == 12


@pytest.mark.django_db
def test_repeated_load_records_no_status_changes():
    load_sample(now=REFERENCE)
    load_sample(now=REFERENCE + timedelta(days=1))

    assert not ServiceStatusEvent.objects.exists()


@pytest.mark.django_db
def test_command():
    out = StringIO()

    call_command('load_sample', '--extended', stdout=out)

    assert 'клиентов 22, услуг 42' in out.getvalue()
    assert Customer.objects.count() == 22
