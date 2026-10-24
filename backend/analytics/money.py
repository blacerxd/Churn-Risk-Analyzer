"""Денежная оценка риска.

Все суммы — целые единицы баланса (100 = €1). Промежуточные расчёты в точных дробях,
округление половины вверх выполняется один раз для каждой услуги. Суммы клиента и портфеля
складываются из уже округлённых значений, поэтому они согласованы точно.
"""

from collections.abc import Iterable
from dataclasses import dataclass
from fractions import Fraction

from customers.models import PaymentTerm

from .context import SCORED_STATUSES, ModelParams
from .formatting import money
from .scoring import RiskLevel

# Сколько раз за месяц оплачивается услуга: в среднем 365/12 дней в месяце.
MONTHLY_FACTORS = {
    PaymentTerm.HOUR: Fraction(365 * 24, 12),  # 730
    PaymentTerm.WEEK: Fraction(365, 12 * 7),  # ≈ 4,345
    PaymentTerm.MONTH: Fraction(1),
    PaymentTerm.QUARTER_YEAR: Fraction(1, 3),
    PaymentTerm.HALF_YEAR: Fraction(1, 6),
    PaymentTerm.YEAR: Fraction(1, 12),
}
AT_RISK_LEVELS = frozenset({RiskLevel.MEDIUM, RiskLevel.HIGH})


def round_half_up(value: Fraction) -> int:
    return int(value + Fraction(1, 2)) if value >= 0 else -round_half_up(-value)


def monthly_equivalent(price: int, payment_term: str) -> int:
    """Стоимость услуги в пересчёте на месяц, в единицах баланса."""
    return round_half_up(price * MONTHLY_FACTORS[payment_term])


def probability_from_score(score: float | None) -> Fraction:
    """Вероятность ухода из отображаемого score (одна цифра после запятой) без ошибок float."""
    return Fraction(0) if score is None else Fraction(round(score * 10), 1000)


@dataclass(frozen=True)
class ServiceMoney:
    service_id: int
    monthly_equivalent: int
    expected_loss: int


@dataclass(frozen=True)
class CustomerMoney:
    monthly_revenue: int  # месячная стоимость учитываемых услуг
    expected_loss: int
    services: tuple[ServiceMoney, ...]


def customer_money(services: Iterable, score: float | None, params: ModelParams) -> CustomerMoney:
    """Ожидаемая потеря клиента: вероятность × месячная стоимость услуг × горизонт потерь.

    Учитываются только услуги в статусах, по которым строится прогноз.
    """
    probability = probability_from_score(score)
    items = []
    for service in services:
        if service.status not in SCORED_STATUSES:
            continue
        monthly = monthly_equivalent(service.price, service.payment_term)
        loss = round_half_up(probability * monthly * params.loss_horizon_months)
        items.append(ServiceMoney(service.id, monthly, loss))
    return CustomerMoney(
        monthly_revenue=sum(item.monthly_equivalent for item in items),
        expected_loss=sum(item.expected_loss for item in items),
        services=tuple(items),
    )


@dataclass(frozen=True)
class PortfolioMoney:
    services_at_risk: int
    revenue_at_risk: int
    expected_loss: int


def portfolio_money(
    customers: Iterable[tuple[RiskLevel, CustomerMoney]], params: ModelParams,
) -> PortfolioMoney:
    """Итоги по всем клиентам. Под риском — услуги клиентов со средним и высоким уровнем."""
    services_at_risk = revenue_at_risk = expected_loss = 0
    for level, customer in customers:
        expected_loss += customer.expected_loss
        if level in AT_RISK_LEVELS:
            services_at_risk += len(customer.services)
            revenue_at_risk += customer.monthly_revenue * params.loss_horizon_months
    return PortfolioMoney(services_at_risk, revenue_at_risk, expected_loss)


def explanation(params: ModelParams) -> str:
    """Пояснение денежной оценки для панели (summary.explanation)."""
    months = params.loss_horizon_months
    return (
        'Ожидаемая потеря = сумма по клиентам: вероятность ухода клиента (score / 100) × '
        f'месячная стоимость его услуг × горизонт потерь ({months} мес.). '
        'Учитываются услуги в статусах active, suspended и prolong_wait. '
        'Месячная стоимость пересчитывается из периода оплаты: '
        'час × 730, неделя × 365/84, квартал ÷ 3, полугодие ÷ 6, год ÷ 12. '
        'Балансы входят в вероятность: если основного и доступного бонусного баланса не хватает '
        'на ближайшие продления, риск ухода растёт. '
        'Выручка под риском — стоимость услуг клиентов со средним и высоким риском '
        f'за {months} мес. '
        f'Пример: score 70 и услуги на {money(1000)} в месяц дают ожидаемую потерю '
        f'{money(700 * months)}.'
    )
