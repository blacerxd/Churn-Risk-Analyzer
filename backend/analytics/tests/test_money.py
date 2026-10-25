from fractions import Fraction

import pytest

from analytics.context import ModelParams
from analytics.formatting import money
from analytics.money import (
    CustomerMoney,
    PortfolioMoney,
    ServiceMoney,
    customer_money,
    explanation,
    monthly_equivalent,
    portfolio_money,
    probability_from_score,
    round_half_up,
)
from analytics.scoring import RiskLevel
from customers.models import PaymentTerm, ServiceStatus

from .factories import make_service

ONE_MONTH = ModelParams(loss_horizon_months=1)


@pytest.mark.parametrize(('price', 'term', 'expected'), [
    (95, PaymentTerm.HOUR, 69350),  # 95 × 730
    (368, PaymentTerm.WEEK, 1599),  # 368 × 365/84 = 1599,05
    (364, PaymentTerm.MONTH, 364),
    (827, PaymentTerm.QUARTER_YEAR, 276),  # 275,67
    (883, PaymentTerm.HALF_YEAR, 147),  # 147,17
    (550, PaymentTerm.YEAR, 46),  # 45,83
    (6, PaymentTerm.YEAR, 1),  # ровно 0,5 → вверх
    (0, PaymentTerm.MONTH, 0),
])
def test_monthly_equivalent(price, term, expected):
    assert monthly_equivalent(price, term) == expected


def test_week_factor_matches_plan_approximation():
    assert monthly_equivalent(100_000, PaymentTerm.WEEK) == pytest.approx(434_500, rel=1e-4)


@pytest.mark.parametrize(('value', 'expected'), [
    (Fraction(5, 2), 3), (Fraction(3, 2), 2), (Fraction(249, 100), 2), (Fraction(0), 0),
    (Fraction(-5, 2), -3),
])
def test_round_half_up(value, expected):
    assert round_half_up(value) == expected


@pytest.mark.parametrize(('score', 'expected'), [
    (71.6, Fraction(716, 1000)), (0.0, Fraction(0)), (100.0, Fraction(1)), (None, Fraction(0)),
])
def test_probability_from_score_is_exact(score, expected):
    assert probability_from_score(score) == expected


def test_customer_expected_loss_by_hand():
    services = [
        make_service(id=1, price=1000, payment_term=PaymentTerm.MONTH),
        make_service(id=2, price=2400, payment_term=PaymentTerm.YEAR),  # 200 в месяц
    ]

    result = customer_money(services, 71.6, ONE_MONTH)

    # 0,716 × 1000 = 716; 0,716 × 200 = 143,2 → 143
    assert result == CustomerMoney(
        monthly_revenue=1200,
        expected_loss=859,
        services=(ServiceMoney(1, 1000, 716), ServiceMoney(2, 200, 143)),
    )


def test_loss_horizon_multiplies_loss():
    services = [make_service(price=1000)]
    assert customer_money(services, 50.0, ModelParams(loss_horizon_months=3)).expected_loss == 1500


def test_only_scored_services_count():
    services = [
        make_service(id=1, price=1000, status=ServiceStatus.ACTIVE),
        make_service(id=2, price=1000, status=ServiceStatus.SUSPENDED),
        make_service(id=3, price=1000, status=ServiceStatus.PROLONG_WAIT),
        make_service(id=4, price=1000, status=ServiceStatus.DELETED),
        make_service(id=5, price=1000, status=ServiceStatus.BLOCKED),
    ]

    result = customer_money(services, 100.0, ONE_MONTH)

    assert [s.service_id for s in result.services] == [1, 2, 3]
    assert result.expected_loss == 3000


def test_not_assessed_customer_has_no_loss():
    assert customer_money([], None, ONE_MONTH) == CustomerMoney(0, 0, ())


def test_portfolio_totals():
    high = CustomerMoney(1000, 700, (ServiceMoney(1, 600, 420), ServiceMoney(2, 400, 280)))
    medium = CustomerMoney(500, 200, (ServiceMoney(3, 500, 200),))
    low = CustomerMoney(800, 80, (ServiceMoney(4, 800, 80),))

    result = portfolio_money(
        [(RiskLevel.HIGH, high), (RiskLevel.MEDIUM, medium), (RiskLevel.LOW, low),
         (RiskLevel.NONE, CustomerMoney(0, 0, ()))],
        ModelParams(loss_horizon_months=2),
    )

    # Потеря — по всем клиентам; выручка и услуги под риском — только medium и high.
    assert result == PortfolioMoney(services_at_risk=3, revenue_at_risk=3000, expected_loss=980)


def test_explanation_mentions_formula_balances_and_horizon():
    text = explanation(ModelParams(loss_horizon_months=3))

    assert 'шанс, что он уйдёт, × сколько он платит за услуги за 3 мес.' in text
    assert 'денег на балансе не хватает' in text
    assert f'ожидаемая потеря {money(2100)}' in text
    assert 'score' not in text and 'prolong_wait' not in text


def test_explanation_one_month_reads_naturally():
    text = explanation(ModelParams(loss_horizon_months=1))

    assert 'за месяц' in text
    assert f'ожидаемая потеря {money(700)}' in text
    assert len(text.split('\n')) == 6
