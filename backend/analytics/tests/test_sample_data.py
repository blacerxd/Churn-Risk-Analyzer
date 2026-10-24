"""Модель целиком на тестовых данных кейса (test_data/data.json), без БД."""

import json
from collections import defaultdict
from datetime import UTC, datetime

import pytest
from django.conf import settings

from analytics.config import ModelConfig
from analytics.context import CustomerContext
from analytics.scoring import NO_DATA_REASON, RiskLevel, compute
from customers.importer import parse_snapshot

SAMPLE_DATA = settings.BASE_DIR.parent / 'test_data' / 'data.json'
# Опорная дата генератора: на неё сформированы статусы и сроки в data.json.
REFERENCE_NOW = datetime(2026, 10, 19, 15, 0, tzinfo=UTC)

pytestmark = pytest.mark.skipif(not SAMPLE_DATA.exists(), reason='test_data не входит в образ')


@pytest.fixture(scope='module')
def assessments():
    parsed = parse_snapshot(json.loads(SAMPLE_DATA.read_text()))
    services, transactions, owner = defaultdict(list), defaultdict(list), {}
    for service in parsed.services:
        services[service.customer_id].append(service)
        owner[service.id] = service.customer_id
    for transaction in parsed.transactions:
        transactions[owner[transaction.service_id]].append(transaction)

    config = ModelConfig.default()
    result = {}
    for customer in parsed.customers:
        for service in services[customer.id]:
            service.customer = customer
        ctx = CustomerContext(
            customer, services[customer.id], transactions[customer.id],
            REFERENCE_NOW, config.params,
        )
        result[customer.id] = compute(ctx, config)
    return result


def test_customers_with_only_deleted_or_blocked_services_are_not_assessed(assessments):
    not_assessed = {cid for cid, a in assessments.items() if a.level == RiskLevel.NONE}

    # У клиентов 2 и 7 услуги только blocked/deleted, у 3 и 8 — только deleted.
    assert not_assessed == {2, 3, 7, 8}
    assert all(assessments[cid].top_reason == NO_DATA_REASON for cid in not_assessed)


def test_assessed_customers_have_score_and_reason(assessments):
    for cid, assessment in assessments.items():
        if assessment.level == RiskLevel.NONE:
            continue
        assert 0 <= assessment.score <= 100, cid
        assert assessment.top_reason and assessment.top_reason != NO_DATA_REASON, cid
        assert all(factor.explanation for factor in assessment.factors), cid


def test_every_feature_fires_on_sample_data(assessments):
    fired = {
        factor.key
        for assessment in assessments.values()
        for factor in assessment.factors
        if factor.value > 0
    }
    assert fired == set(ModelConfig.default().weights)
