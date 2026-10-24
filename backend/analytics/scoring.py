"""Движок оценки риска оттока (noisy-OR).

Каждый признак — независимая причина ухода. Вес признака (0–100) — вероятность ухода в
процентах, если причина проявилась полностью; значение признака (0–1) — насколько проявилась:

    pᵢ = вес_i / 100 × значение_i
    риск = 1 − Π(1 − pᵢ)          — вероятность, что сработает хотя бы одна причина
    score = риск × 100

Одна сильная причина сама даёт высокий риск, несколько слабых накапливаются. Вклад признака —
доля score, пропорциональная −ln(1 − pᵢ), поэтому сумма вкладов равна score.
"""

import math
from collections.abc import Mapping
from dataclasses import dataclass

from django.db import models

from .config import ModelConfig, Thresholds
from .context import CustomerContext
from .features import FEATURES, Feature

NO_DATA_REASON = 'Недостаточно данных для оценки'
NO_RISK_REASON = 'Признаков риска не обнаружено'
MAX_WEIGHT = 100


class RiskLevel(models.TextChoices):
    HIGH = 'high', 'Высокий'
    MEDIUM = 'medium', 'Средний'
    LOW = 'low', 'Низкий'
    NONE = 'none', 'Нет оценки'


@dataclass(frozen=True)
class FactorResult:
    key: str
    title: str
    value: float
    weight: float
    contribution: float
    explanation: str


@dataclass(frozen=True)
class Assessment:
    score: float | None
    level: RiskLevel
    probability: float | None
    factors: tuple[FactorResult, ...]  # по убыванию вклада

    @property
    def top_reason(self) -> str:
        if self.level == RiskLevel.NONE:
            return NO_DATA_REASON
        for factor in self.factors:
            if factor.contribution > 0:
                return factor.explanation
        return NO_RISK_REASON


NOT_ASSESSED = Assessment(score=None, level=RiskLevel.NONE, probability=None, factors=())


def level_for(score: float, thresholds: Thresholds) -> RiskLevel:
    if score >= thresholds.high:
        return RiskLevel.HIGH
    if score >= thresholds.medium:
        return RiskLevel.MEDIUM
    return RiskLevel.LOW


def combine(probabilities: list[float]) -> tuple[float, list[float]]:
    """Общий риск 0–100 и вклад каждой причины в баллах (сумма вкладов равна риску)."""
    risk = 1 - math.prod(1 - p for p in probabilities)
    if risk == 0:
        return 0.0, [0.0] * len(probabilities)

    certain = [p >= 1 for p in probabilities]
    if any(certain):
        # −ln(0) = ∞: весь риск приходится на причины, сработавшие с вероятностью 1.
        shares = [float(c) for c in certain]
    else:
        shares = [-math.log1p(-p) for p in probabilities]
    total = sum(shares)
    return risk * 100, [risk * 100 * share / total for share in shares]


def compute(
    ctx: CustomerContext,
    config: ModelConfig,
    features: Mapping[str, Feature] = FEATURES,
) -> Assessment:
    # Без услуг в учитываемых статусах прогнозировать нечего: явно «нет оценки», а не 0.
    if not ctx.scored_services:
        return NOT_ASSESSED

    weighted = [(feature, config.weight(feature)) for feature in features.values()]
    for feature, weight in weighted:
        if not 0 <= weight <= MAX_WEIGHT:
            raise ValueError(f'Вес признака {feature.key!r} должен быть от 0 до {MAX_WEIGHT}')

    results = [feature.compute(ctx) for feature, _ in weighted]
    raw_score, contributions = combine([
        weight / MAX_WEIGHT * result.value for (_, weight), result in zip(weighted, results)
    ])

    factors = [
        FactorResult(
            key=feature.key, title=feature.title, value=result.value, weight=weight,
            contribution=round(points, 1), explanation=result.explanation,
        )
        for (feature, weight), result, points in zip(weighted, results, contributions)
    ]
    factors.sort(key=lambda factor: factor.contribution, reverse=True)

    # Уровень считается от округлённого score: пользователь видит 65.0 и уровень «высокий».
    score = round(raw_score, 1)
    return Assessment(
        score=score,
        level=level_for(score, config.thresholds),
        probability=score / 100,
        factors=tuple(factors),
    )
