"""Модель целиком на тестовых данных кейса (test_data/data.json), без БД."""

import json
from collections import defaultdict
from datetime import UTC, datetime

import pytest
from django.conf import settings

from analytics.config import ModelConfig
from analytics.context import CustomerContext
from analytics.money import customer_money, portfolio_money
from analytics.scoring import NO_DATA_REASON, RiskLevel, compute
from customers.importer import parse_snapshot

SAMPLE_DATA = settings.BASE_DIR.parent / 'test_data' / 'data.json'
# Опорная дата генератора: на неё сформированы статусы и сроки в data.json.
REFERENCE_NOW = datetime(2026, 10, 19, 15, 0, tzinfo=UTC)

pytestmark = pytest.mark.skipif(not SAMPLE_DATA.exists(), reason='test_data не входит в образ')


@pytest.fixture(scope='module')
def sample():
    """Клиенты, их услуги и транзакции из data.json."""
    parsed = parse_snapshot(json.loads(SAMPLE_DATA.read_text()))
    services, transactions, owner = defaultdict(list), defaultdict(list), {}
    for service in parsed.services:
        services[service.customer_id].append(service)
        owner[service.id] = service.customer_id
    for transaction in parsed.transactions:
        transactions[owner[transaction.service_id]].append(transaction)
    for customer in parsed.customers:
        for service in services[customer.id]:
            service.customer = customer
    return parsed.customers, services, transactions


@pytest.fixture(scope='module')
def sample_services(sample):
    return sample[1]


@pytest.fixture(scope='module')
def assessments(sample):
    customers, services, transactions = sample
    config = ModelConfig.default()
    return {
        customer.id: compute(
            CustomerContext(
                customer, services[customer.id], transactions[customer.id],
                REFERENCE_NOW, config.params,
            ),
            config,
        )
        for customer in customers
    }


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


def test_money_is_consistent_across_levels(assessments, sample_services):
    params = ModelConfig.default().params
    per_customer = {
        cid: customer_money(sample_services[cid], assessment.score, params)
        for cid, assessment in assessments.items()
    }
    totals = portfolio_money(
        [(assessments[cid].level, money) for cid, money in per_customer.items()], params,
    )

    for money in per_customer.values():
        assert money.expected_loss == sum(s.expected_loss for s in money.services)
    assert totals.expected_loss == sum(m.expected_loss for m in per_customer.values())
    # Вероятность не больше 1: потеря не превышает полной стоимости услуг за горизонт.
    full_revenue = sum(m.monthly_revenue for m in per_customer.values())
    assert 0 < totals.expected_loss <= full_revenue * params.loss_horizon_months


def test_results_documented_in_model_md(assessments, sample_services):
    """Таблица «Результаты на данных кейса» в docs/model.md: при изменении модели обновить её."""
    assert {cid: (a.score, a.level) for cid, a in assessments.items() if a.score is not None} == {
        9: (77.5, RiskLevel.HIGH), 1: (71.6, RiskLevel.HIGH), 5: (69.3, RiskLevel.HIGH),
        10: (51.1, RiskLevel.MEDIUM), 6: (8.2, RiskLevel.LOW), 4: (6.0, RiskLevel.LOW),
    }
    params = ModelConfig.default().params
    totals = portfolio_money([
        (a.level, customer_money(sample_services[cid], a.score, params))
        for cid, a in assessments.items()
    ], params)
    assert (totals.services_at_risk, totals.revenue_at_risk, totals.expected_loss) == (
        12, 1_171_604, 864_885,
    )


def test_every_feature_fires_on_sample_data(assessments):
    fired = {
        factor.key
        for assessment in assessments.values()
        for factor in assessment.factors
        if factor.value > 0
    }
    assert fired == set(ModelConfig.default().weights)
