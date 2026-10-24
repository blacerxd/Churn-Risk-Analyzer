"""Действующая конфигурация модели: веса признаков, пороги уровней и параметры.

Хранение и валидация — в модели настроек (B1.7); здесь только неизменяемое представление,
с которым работает движок оценки.
"""

from collections.abc import Mapping
from dataclasses import dataclass, field

from .context import ModelParams
from .features import FEATURES, Feature


@dataclass(frozen=True)
class Thresholds:
    medium: float = 35
    high: float = 65


@dataclass(frozen=True)
class ModelConfig:
    weights: Mapping[str, float] = field(default_factory=dict)
    thresholds: Thresholds = Thresholds()
    params: ModelParams = ModelParams()

    def weight(self, feature: Feature) -> float:
        # Признак, которого ещё нет в сохранённых настройках, работает с весом по умолчанию.
        return self.weights.get(feature.key, feature.default_weight)

    @classmethod
    def default(cls, features: Mapping[str, Feature] = FEATURES) -> 'ModelConfig':
        return cls(weights={key: f.default_weight for key, f in features.items()})
