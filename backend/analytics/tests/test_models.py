from datetime import UTC, datetime

import pytest
from django.db import IntegrityError, transaction

from analytics.models import AnalyticsSnapshot, RiskAssessment
from customers.models import Customer

pytestmark = pytest.mark.django_db

NOW = datetime(2026, 10, 24, 12, 0, tzinfo=UTC)


@pytest.fixture
def customer():
    return Customer.objects.create(
        id=1, email='user-0001@example.test', balance=0, withdraw_balance=0,
        total_replenished=0, bonus_balance=0, bonus_state='locked',
    )


def assessment(customer, **overrides):
    fields = {
        'customer': customer, 'score': 50.0, 'level': 'medium', 'probability': 0.5,
        'top_reason': '...', 'monthly_revenue': 0, 'expected_loss': 0, 'calculated_at': NOW,
    }
    return RiskAssessment(**(fields | overrides))


@pytest.mark.parametrize('overrides', [
    {'level': 'none', 'score': None, 'probability': None},
    {'level': 'low', 'score': 0.0, 'probability': 0.0},
    {'level': 'high', 'score': 100.0, 'probability': 1.0},
])
def test_valid_assessments(customer, overrides):
    assessment(customer, **overrides).save()


@pytest.mark.parametrize('overrides', [
    {'level': 'high', 'score': None, 'probability': None},
    {'level': 'high', 'probability': None},
    {'level': 'none'},
    {'score': 100.1},
    {'probability': 1.1},
    {'expected_loss': -1},
])
def test_invalid_assessments_are_rejected(customer, overrides):
    with pytest.raises(IntegrityError), transaction.atomic():
        assessment(customer, **overrides).save()


def test_assessment_is_deleted_with_customer(customer):
    assessment(customer).save()

    Customer.objects.all().delete()

    assert not RiskAssessment.objects.exists()


def test_snapshot_levels_must_sum_to_total():
    with pytest.raises(IntegrityError), transaction.atomic():
        AnalyticsSnapshot.objects.create(
            reason='settings', calculated_at=NOW, duration_seconds=0,
            customers_total=2, customers_high=1, customers_medium=0, customers_low=0,
            customers_none=0, services_at_risk=0, revenue_at_risk=0, expected_loss=0,
            explanation='',
        )
