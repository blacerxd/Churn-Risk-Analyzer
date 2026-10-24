"""Признаки риска.

Как добавить признак: создать модуль в этом пакете с функцией под декоратором @feature
(см. registry.py) и импортировать модуль ниже. Вес по умолчанию появится в настройках
модели и в форме UI без других правок.
"""

from .registry import FEATURES, Feature, FeatureResult, feature

# Порядок импорта задаёт порядок признаков в настройках и в форме UI.
from . import expiring, funds, prolong_wait, payments  # noqa: E402, F401  isort: skip

__all__ = ['FEATURES', 'Feature', 'FeatureResult', 'feature']
