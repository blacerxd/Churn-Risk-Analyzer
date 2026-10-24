"""Движок оценки риска оттока.

score = Σ(вес_i × значение_i) / Σ вес_i × 100, значения признаков в [0, 1].
Вклад признака — его доля в score в баллах, поэтому сумма вкладов равна score.
"""

from collections.abc import Mapping
from dataclasses import dataclass

from django.db import models

from .config import ModelConfig, Thresholds
from .context import CustomerContext
from .features import FEATURES, Feature

NO_DATA_REASON = 'Недостаточно данных для оценки'
NO_RISK_REASON = 'Признаков риска не обнаружено'


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


def compute(
    ctx: CustomerContext,
    config: ModelConfig,
    features: Mapping[str, Feature] = FEATURES,
) -> Assessment:
    # Без услуг в учитываемых статусах прогнозировать нечего: явно «нет оценки», а не 0.
    if not ctx.scored_services:
        return NOT_ASSESSED

    weighted = [(feature, config.weight(feature)) for feature in features.values()]
    if any(weight < 0 for _, weight in weighted):
        raise ValueError('Веса признаков не могут быть отрицательными')
    total_weight = sum(weight for _, weight in weighted)
    if total_weight <= 0:
        raise ValueError('Хотя бы один признак должен иметь положительный вес')

    raw_score = 0.0
    factors = []
    for feature, weight in weighted:
        result = feature.compute(ctx)
        points = weight * result.value / total_weight * 100
        raw_score += points
        factors.append(FactorResult(
            key=feature.key, title=feature.title, value=result.value, weight=weight,
            contribution=round(points, 1), explanation=result.explanation,
        ))

    # Уровень считается от округлённого score: пользователь видит 65.0 и уровень «высокий».
    score = round(raw_score, 1)
    factors.sort(key=lambda factor: factor.contribution, reverse=True)
    return Assessment(
        score=score,
        level=level_for(score, config.thresholds),
        probability=score / 100,
        factors=tuple(factors),
    )
