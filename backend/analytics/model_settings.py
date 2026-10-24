"""Действующие настройки модели: чтение, схема для формы панели и проверка изменений.

Формат совпадает с контрактом GET|PATCH /api/v1/model/settings:
{"weights": {...}, "thresholds": {...}, "params": {...}, "schema": {...}}.
"""

import math
from collections.abc import Mapping
from dataclasses import asdict, dataclass
from typing import Any

from django.db import transaction

from .config import ModelConfig, Thresholds
from .context import ModelParams
from .features import FEATURES, Feature
from .models import ModelSettings
from .signals import settings_updated

WEIGHT_MIN, WEIGHT_MAX = 0, 100


@dataclass(frozen=True)
class FieldSpec:
    key: str
    title: str
    description: str
    type: str  # number | integer | boolean
    min: float | None = None
    max: float | None = None

    def schema(self, default) -> dict:
        item = {
            'key': self.key, 'title': self.title, 'description': self.description,
            'type': self.type, 'default': default,
        }
        if self.type != 'boolean':
            item |= {'min': self.min, 'max': self.max}
        return item


THRESHOLD_SPECS = (
    FieldSpec('medium', 'Порог среднего риска',
              'Score, начиная с которого риск считается средним.', 'number', 0, 100),
    FieldSpec('high', 'Порог высокого риска',
              'Score, начиная с которого риск считается высоким.', 'number', 0, 100),
)

PARAM_SPECS = (
    FieldSpec('expiry_horizon_days', 'Горизонт прогноза, дней',
              'На сколько дней вперёд учитывать окончание услуг и ближайшие продления.',
              'integer', 1, 90),
    FieldSpec('use_bonus_balance', 'Учитывать бонусный баланс',
              'Считать разблокированный бонусный баланс средствами для продлений.', 'boolean'),
    FieldSpec('loss_horizon_months', 'Горизонт потерь, месяцев',
              'За сколько месяцев считать ожидаемую потерю и выручку под риском.',
              'integer', 1, 12),
)

DEFAULT_THRESHOLDS = asdict(Thresholds())
DEFAULT_PARAMS = asdict(ModelParams())


@dataclass(frozen=True)
class SettingsError:
    path: str
    message: str


class SettingsValidationError(Exception):
    def __init__(self, errors: list[SettingsError]):
        self.errors = errors
        super().__init__(f'Настройки модели не прошли проверку: ошибок {len(errors)}')


# --- Чтение ---

def effective_values(
    stored: ModelSettings, features: Mapping[str, Feature] = FEATURES,
) -> dict[str, dict]:
    """Действующие значения: сохранённые поверх умолчаний; неизвестные ключи отбрасываются."""
    return {
        'weights': {
            key: stored.weights.get(key, feature.default_weight)
            for key, feature in features.items()
        },
        'thresholds': {key: stored.thresholds.get(key, d) for key, d in DEFAULT_THRESHOLDS.items()},
        'params': {key: stored.params.get(key, d) for key, d in DEFAULT_PARAMS.items()},
    }


def get_schema(features: Mapping[str, Feature] = FEATURES) -> dict[str, list[dict]]:
    """Описание полей формы: панель строит форму по нему без знания конкретных признаков."""
    return {
        'weights': [
            FieldSpec(key, f.title, f.description, 'number', WEIGHT_MIN, WEIGHT_MAX)
            .schema(f.default_weight)
            for key, f in features.items()
        ],
        'thresholds': [spec.schema(DEFAULT_THRESHOLDS[spec.key]) for spec in THRESHOLD_SPECS],
        'params': [spec.schema(DEFAULT_PARAMS[spec.key]) for spec in PARAM_SPECS],
    }


def settings_payload(features: Mapping[str, Feature] = FEATURES) -> dict[str, Any]:
    """Ответ GET /api/v1/model/settings."""
    return effective_values(ModelSettings.load(), features) | {'schema': get_schema(features)}


def to_config(values: Mapping[str, dict]) -> ModelConfig:
    return ModelConfig(
        weights=dict(values['weights']),
        thresholds=Thresholds(**values['thresholds']),
        params=ModelParams(**values['params']),
    )


def load_config(features: Mapping[str, Feature] = FEATURES) -> ModelConfig:
    return to_config(effective_values(ModelSettings.load(), features))


# --- Проверка ---

def _check_value(spec: FieldSpec, value) -> str | None:
    """Текст ошибки или None, если значение подходит под описание поля."""
    if spec.type == 'boolean':
        return None if isinstance(value, bool) else 'ожидается true или false'
    # bool — подкласс int в Python, но true вместо числа — ошибка.
    if isinstance(value, bool) or not isinstance(value, int | float) or not math.isfinite(value):
        return 'ожидается число'
    if spec.type == 'integer' and not float(value).is_integer():
        return 'ожидается целое число'
    if not spec.min <= value <= spec.max:
        return f'допустимо от {spec.min} до {spec.max}'
    return None


def _apply_section(section, patch, specs, merged, errors):
    if not isinstance(patch, dict):
        errors.append(SettingsError(section, 'ожидается объект'))
        return
    for key, value in patch.items():
        path = f'{section}.{key}'
        spec = specs.get(key)
        if spec is None:
            errors.append(SettingsError(path, 'неизвестное поле'))
            continue
        error = _check_value(spec, value)
        if error:
            errors.append(SettingsError(path, error))
        elif spec.type == 'integer':
            merged[section][key] = int(value)
        else:
            merged[section][key] = value


def apply_patch(
    current: Mapping[str, dict], patch: Any, features: Mapping[str, Feature] = FEATURES,
) -> dict[str, dict]:
    """Накладывает частичное изменение на действующие значения и проверяет результат."""
    if not isinstance(patch, dict):
        raise SettingsValidationError([SettingsError('', 'ожидается объект')])

    weight_specs = {
        key: FieldSpec(key, f.title, f.description, 'number', WEIGHT_MIN, WEIGHT_MAX)
        for key, f in features.items()
    }
    specs = {
        'weights': weight_specs,
        'thresholds': {spec.key: spec for spec in THRESHOLD_SPECS},
        'params': {spec.key: spec for spec in PARAM_SPECS},
    }
    merged = {section: dict(values) for section, values in current.items()}
    errors: list[SettingsError] = []

    for section, section_patch in patch.items():
        if section not in specs:
            errors.append(SettingsError(section, 'неизвестное поле'))
            continue
        _apply_section(section, section_patch, specs[section], merged, errors)

    # Проверки, связывающие несколько полей, — только для разделов без ошибок в отдельных полях.
    failed = {error.path.split('.')[0] for error in errors}
    if 'weights' not in failed and not any(merged['weights'].values()):
        errors.append(SettingsError('weights', 'хотя бы один признак должен иметь вес больше 0'))
    thresholds = merged['thresholds']
    if 'thresholds' not in failed and not thresholds['medium'] < thresholds['high']:
        errors.append(SettingsError(
            'thresholds.medium', 'порог среднего риска должен быть меньше порога высокого',
        ))

    if errors:
        raise SettingsValidationError(errors)
    return merged


def update_settings(patch: Any, features: Mapping[str, Feature] = FEATURES) -> dict[str, dict]:
    """Проверяет и сохраняет частичное изменение настроек, возвращает действующие значения.

    Сохраняются только переданные поля: значения, которые через панель не меняли, продолжают
    следовать умолчаниям из кода. Чтение, слияние и запись — под блокировкой строки,
    чтобы одновременные PATCH не затирали изменения друг друга. В той же транзакции
    по сигналу settings_updated пересчитываются оценки всех клиентов.
    """
    ModelSettings.load()  # создать запись, если её ещё нет
    with transaction.atomic():
        stored = ModelSettings.objects.select_for_update().get(pk=ModelSettings.SINGLETON_ID)
        merged = apply_patch(effective_values(stored, features), patch, features)
        for section, section_patch in patch.items():
            saved = getattr(stored, section)
            for key in section_patch:
                saved[key] = merged[section][key]
        stored.save()
        settings_updated.send(sender=ModelSettings)
    return merged
