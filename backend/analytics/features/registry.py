"""Реестр признаков риска.

Признак — функция от CustomerContext, возвращающая FeatureResult. Регистрируется декоратором
@feature; вес по умолчанию попадает в настройки модели и в схему формы UI автоматически.
"""

from __future__ import annotations

from collections.abc import Callable
from dataclasses import dataclass
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from analytics.context import CustomerContext


@dataclass(frozen=True)
class FeatureResult:
    """Значение признака от 0 (риска нет) до 1 (максимальный риск) и причина на русском."""

    value: float
    explanation: str

    def __post_init__(self):
        # Не обрезаем молча: значение вне диапазона — ошибка в реализации признака.
        if not 0 <= self.value <= 1:
            raise ValueError(f'Значение признака должно быть в [0, 1], получено {self.value}')


@dataclass(frozen=True)
class Feature:
    key: str
    title: str
    default_weight: float
    description: str
    compute: Callable[[CustomerContext], FeatureResult]


FEATURES: dict[str, Feature] = {}


def feature(key, title, default_weight, description='', *, registry=FEATURES):
    """Регистрирует функцию как признак риска. registry подменяется в тестах.

    default_weight — вероятность ухода в процентах (0–100), если причина проявилась полностью.
    """
    if not 0 <= default_weight <= 100:
        raise ValueError(f'Вес признака {key!r} должен быть от 0 до 100')

    def decorator(fn):
        if key in registry:
            raise ValueError(f'Признак {key!r} уже зарегистрирован')
        registry[key] = Feature(key, title, default_weight, description, fn)
        return fn
    return decorator
