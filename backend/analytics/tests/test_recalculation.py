from datetime import UTC, datetime

import pytest
from django.db import connection
from django.test.utils import CaptureQueriesContext

from analytics import recalculation
from analytics.context import CustomerContext
from analytics.model_settings import load_config, update_settings
from analytics.models import AnalyticsSnapshot, ModelSettings, RecalcReason, RiskAssessment
from analytics.recalculation import current_summary, recalculate_all
from analytics.scoring import NO_DATA_REASON, RiskLevel, compute
from analytics.signals import recalculated
from customers.importer import replace_snapshot
from customers.models import Customer
from customers.tests.snapshots import account, service, snapshot, transaction

pytestmark = pytest.mark.django_db

NOW = datetime(2026, 10, 24, 12, 0, tzinfo=UTC)
LATER = datetime(2026, 10, 24, 13, 0, tzinfo=UTC)


def portfolio(extra_customers=0):
    """#1 — prolong_wait без денег, #2 — только удалённая услуга, #3 — всё в порядке."""
    accounts = [
        account(1, balance=0, bonusBalance=0),
        account(2),
        account(3, balance=100_000),
    ]
    services = [
        service(10, 1, status='prolong_wait', expiresAt='2026-10-23T00:00:00.000Z'),
        service(20, 2, status='deleted'),
        service(30, 3, autoProlong=True),
    ]
    transactions = [transaction(100, 10), transaction(300, 30)]
    for n in range(extra_customers):
        customer_id, service_id = 1000 + n, 10_000 + n
        accounts.append(account(customer_id))
        services.append(service(service_id, customer_id))
        transactions.append(transaction(100_000 + n, service_id))
    return snapshot(accounts, services, transactions)


@pytest.fixture
def loaded():
    replace_snapshot(portfolio(), now=NOW)


def stored_levels():
    return dict(RiskAssessment.objects.values_list('customer_id', 'level'))


def test_snapshot_import_recalculates_in_same_transaction(loaded):
    assert stored_levels() == {1: RiskLevel.HIGH, 2: RiskLevel.NONE, 3: RiskLevel.LOW}
    latest = AnalyticsSnapshot.objects.latest()
    assert (latest.reason, latest.calculated_at) == (RecalcReason.SNAPSHOT, NOW)


def test_stored_assessment_matches_engine(loaded):
    customer = Customer.objects.get(pk=1)
    services = list(customer.services.all())
    ctx = CustomerContext(
        customer=customer, services=services,
        transactions=[t for s in services for t in s.transactions.all()],
        now=NOW, params=load_config().params,
    )
    expected = compute(ctx, load_config())

    stored = RiskAssessment.objects.get(pk=1)
    assert (stored.score, stored.level, stored.probability, stored.top_reason) == (
        expected.score, expected.level, expected.probability, expected.top_reason,
    )
    assert [f['key'] for f in stored.factors] == [f.key for f in expected.factors]
    assert stored.factors[0] == {
        'key': expected.factors[0].key, 'title': expected.factors[0].title,
        'value': expected.factors[0].value, 'weight': expected.factors[0].weight,
        'contribution': expected.factors[0].contribution,
        'explanation': expected.factors[0].explanation,
    }
    assert stored.services == [{
        'service_id': 10, 'monthly_equivalent': 3000, 'expected_loss': stored.expected_loss,
    }]
    assert stored.calculated_at == NOW


def test_customer_without_scored_services_is_not_assessed(loaded):
    stored = RiskAssessment.objects.get(pk=2)

    assert (stored.score, stored.probability, stored.top_reason) == (None, None, NO_DATA_REASON)
    assert (stored.services, stored.expected_loss) == ([], 0)


def test_summary_agrees_with_assessments(loaded):
    latest = AnalyticsSnapshot.objects.latest()
    assessments = list(RiskAssessment.objects.all())
    scores = [a.score for a in assessments if a.score is not None]

    assert latest.customers_total == Customer.objects.count() == 3
    assert (latest.customers_high, latest.customers_medium,
            latest.customers_low, latest.customers_none) == (1, 0, 1, 1)
    assert latest.expected_loss == sum(a.expected_loss for a in assessments)
    assert latest.services_at_risk == 1
    assert latest.revenue_at_risk == RiskAssessment.objects.get(pk=1).monthly_revenue
    assert latest.score_avg == round(sum(scores) / len(scores), 1)


def test_summary_matches_contract(loaded):
    summary = AnalyticsSnapshot.objects.latest().summary()

    assert summary == {
        'calculated_at': '2026-10-24T12:00:00Z',
        'customers_total': 3,
        'by_level': {'high': 1, 'medium': 0, 'low': 1, 'none': 1},
        'services_at_risk': 1,
        'revenue_at_risk_cents': 3000,
        'expected_loss_cents': RiskAssessment.objects.get(pk=1).expected_loss,
        'explanation': summary['explanation'],
    }
    assert 'платит за услуги за месяц' in summary['explanation']


def test_settings_update_recalculates(loaded):
    update_settings({'thresholds': {'high': 99}})

    assert stored_levels()[1] == RiskLevel.MEDIUM
    assert AnalyticsSnapshot.objects.latest().reason == RecalcReason.SETTINGS
    assert AnalyticsSnapshot.objects.count() == 2  # история пересчётов сохраняется


def test_loss_horizon_from_settings_is_applied(loaded):
    one_month = RiskAssessment.objects.get(pk=1).expected_loss

    update_settings({'params': {'loss_horizon_months': 3}})

    latest = AnalyticsSnapshot.objects.latest()
    assert RiskAssessment.objects.get(pk=1).expected_loss == pytest.approx(3 * one_month, abs=1)
    assert latest.revenue_at_risk == 3 * 3000
    assert 'платит за услуги за 3 мес.' in latest.explanation


def test_failed_recalculation_rolls_back_settings(loaded, monkeypatch):
    monkeypatch.setattr(recalculation, 'compute', _fail)

    with pytest.raises(RuntimeError):
        update_settings({'weights': {'prolong_wait': 10}})

    assert ModelSettings.load().weights == {}
    assert AnalyticsSnapshot.objects.count() == 1


def test_failed_recalculation_rolls_back_snapshot(loaded, monkeypatch):
    monkeypatch.setattr(recalculation, 'compute', _fail)

    with pytest.raises(RuntimeError):
        replace_snapshot(snapshot([account(1)], [service(10, 1)], []), now=LATER)

    assert set(Customer.objects.values_list('id', flat=True)) == {1, 2, 3}
    assert stored_levels() == {1: RiskLevel.HIGH, 2: RiskLevel.NONE, 3: RiskLevel.LOW}


def test_assessments_of_removed_customers_are_dropped(loaded):
    replace_snapshot(snapshot([account(3)], [service(30, 3)], []), now=LATER)

    assert list(RiskAssessment.objects.values_list('customer_id', flat=True)) == [3]
    assert AnalyticsSnapshot.objects.latest().customers_total == 1


def test_empty_portfolio():
    snap = recalculate_all(RecalcReason.SNAPSHOT, now=NOW)

    assert (snap.customers_total, snap.expected_loss, snap.score_avg) == (0, 0, None)
    assert not RiskAssessment.objects.exists()


def test_recalculated_signal_carries_summary(loaded, django_capture_on_commit_callbacks):
    received = []

    def receiver(sender, reason, summary, **kwargs):
        received.append((reason, summary))

    recalculated.connect(receiver)
    try:
        with django_capture_on_commit_callbacks() as callbacks:
            snap = recalculate_all(RecalcReason.SETTINGS, now=LATER)
    finally:
        recalculated.disconnect(receiver)

    assert received == [(RecalcReason.SETTINGS, snap.summary())]
    assert len(callbacks) == 1  # SSE-рассылка отложена до коммита


def test_query_count_does_not_grow_with_customers():
    def queries(extra):
        replace_snapshot(portfolio(extra), now=NOW)
        with CaptureQueriesContext(connection) as ctx:
            recalculate_all(RecalcReason.SETTINGS, now=NOW)
        return len(ctx.captured_queries)

    assert queries(5) == queries(50)


def test_current_summary_before_first_recalculation():
    summary = current_summary()

    assert summary['calculated_at'] is None
    assert summary['by_level'] == {'high': 0, 'medium': 0, 'low': 0, 'none': 0}
    assert summary['customers_total'] == summary['expected_loss_cents'] == 0


def test_current_summary_is_latest_recalculation(loaded):
    recalculate_all(RecalcReason.SETTINGS, now=LATER)

    assert current_summary()['calculated_at'] == '2026-10-24T13:00:00Z'


def _fail(*args, **kwargs):
    raise RuntimeError('ошибка оценки')
