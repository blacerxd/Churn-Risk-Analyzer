"""Демонстрационные наборы после загрузки: уровни сценариев не зависят от дня загрузки."""

import runpy
from datetime import UTC, datetime

import pytest
from django.conf import settings

from analytics.models import RiskAssessment
from analytics.scoring import RiskLevel
from customers.sample_data import REFERENCE, load_sample

SAMPLE_DIR = settings.SAMPLE_DATA_DIR
DEMO_DAY = datetime(2026, 11, 3, 10, 27, 41, tzinfo=UTC)

pytestmark = [
    pytest.mark.django_db,
    pytest.mark.skipif(not SAMPLE_DIR.exists(), reason='sample-data не смонтирован'),
]


def assessments():
    return {a.customer_id: (a.score, a.level) for a in RiskAssessment.objects.all()}


def test_every_demo_scenario_gets_its_level():
    scenarios = runpy.run_path(str(SAMPLE_DIR / 'build_demo.py'))['SCENARIOS']

    load_sample(extended=True, now=DEMO_DAY)

    levels = {customer: level for customer, (_, level) in assessments().items()}
    assert {s['id']: levels[s['id']] for s in scenarios} == {
        s['id']: s['level'] for s in scenarios
    }
    assert set(levels.values()) == set(RiskLevel)  # в наборе есть все уровни


def test_results_do_not_depend_on_load_day():
    load_sample(extended=True, now=REFERENCE)
    at_reference = assessments()

    load_sample(extended=True, now=DEMO_DAY)

    assert assessments() == at_reference
