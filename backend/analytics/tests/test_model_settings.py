import pytest

from analytics.config import ModelConfig, Thresholds
from analytics.context import ModelParams
from analytics.features import FEATURES, feature
from analytics.model_settings import (
    SettingsError,
    SettingsValidationError,
    effective_values,
    get_schema,
    load_config,
    settings_payload,
    update_settings,
)
from analytics.models import ModelSettings

pytestmark = pytest.mark.django_db

DEFAULT_WEIGHTS = {
    'expiring_no_autoprolong': 70, 'insufficient_funds': 50,
    'prolong_wait': 80, 'low_payment_success': 20,
}


def errors_of(patch):
    with pytest.raises(SettingsValidationError) as exc_info:
        update_settings(patch)
    return exc_info.value.errors


def test_defaults_without_saved_settings():
    payload = settings_payload()

    assert payload['weights'] == DEFAULT_WEIGHTS
    assert payload['thresholds'] == {'medium': 35, 'high': 65}
    assert payload['params'] == {
        'expiry_horizon_days': 7, 'use_bonus_balance': True, 'loss_horizon_months': 1,
    }
    assert load_config() == ModelConfig(
        weights=DEFAULT_WEIGHTS, thresholds=Thresholds(), params=ModelParams(),
    )


def test_payload_matches_contract_shape():
    payload = settings_payload()

    assert set(payload) == {'weights', 'thresholds', 'params', 'schema'}
    first = payload['schema']['weights'][0]
    assert {'key', 'title', 'description', 'min', 'max'} <= set(first)


def test_schema_describes_every_field_with_defaults():
    schema = get_schema()

    assert [item['key'] for item in schema['weights']] == list(FEATURES)
    assert schema['weights'][0] == {
        'key': 'expiring_no_autoprolong', 'title': 'Скоро истекает без автопродления',
        'description': FEATURES['expiring_no_autoprolong'].description,
        'type': 'number', 'default': 70, 'min': 0, 'max': 100,
    }
    assert [item['key'] for item in schema['thresholds']] == ['medium', 'high']
    params = {item['key']: item for item in schema['params']}
    assert params['use_bonus_balance'] == {
        'key': 'use_bonus_balance', 'title': 'Учитывать бонусный баланс',
        'description': params['use_bonus_balance']['description'],
        'type': 'boolean', 'default': True,
    }
    assert (params['expiry_horizon_days']['min'], params['expiry_horizon_days']['max']) == (1, 90)


def test_partial_update_is_merged_and_persisted():
    result = update_settings({
        'weights': {'prolong_wait': 95},
        'params': {'loss_horizon_months': 3},
    })

    assert result['weights'] == DEFAULT_WEIGHTS | {'prolong_wait': 95}
    assert result['params']['loss_horizon_months'] == 3
    # Новое чтение из БД — то, что увидит приложение после перезапуска.
    reloaded = load_config()
    assert reloaded.weights['prolong_wait'] == 95
    assert reloaded.params.loss_horizon_months == 3
    assert reloaded.thresholds == Thresholds()


def test_only_changed_fields_are_stored():
    update_settings({'thresholds': {'high': 70}})

    stored = ModelSettings.load()
    assert (stored.weights, stored.thresholds, stored.params) == ({}, {'high': 70}, {})


def test_consecutive_updates_accumulate():
    update_settings({'weights': {'prolong_wait': 90}})
    update_settings({'weights': {'insufficient_funds': 10}})

    assert load_config().weights == DEFAULT_WEIGHTS | {'prolong_wait': 90, 'insufficient_funds': 10}


def test_integer_params_accept_whole_floats():
    result = update_settings({'params': {'expiry_horizon_days': 14.0}})

    assert result['params']['expiry_horizon_days'] == 14
    assert isinstance(result['params']['expiry_horizon_days'], int)


def test_empty_patch_changes_nothing():
    assert update_settings({}) == effective_values(ModelSettings.load())


def test_new_feature_gets_default_weight_without_migration():
    update_settings({'weights': {'prolong_wait': 90}})
    extended = dict(FEATURES)
    feature('new_signal', 'Новый признак', 15, registry=extended)(lambda ctx: None)

    values = effective_values(ModelSettings.load(), extended)

    assert values['weights'] == DEFAULT_WEIGHTS | {'prolong_wait': 90, 'new_signal': 15}
    assert get_schema(extended)['weights'][-1]['key'] == 'new_signal'


def test_weights_of_removed_features_are_ignored():
    ModelSettings.objects.create(weights={'removed_feature': 50, 'prolong_wait': 10})

    assert load_config().weights == DEFAULT_WEIGHTS | {'prolong_wait': 10}


@pytest.mark.parametrize(('patch', 'path', 'message'), [
    ([], '', 'ожидается объект'),
    ({'schema': {}}, 'schema', 'неизвестное поле'),
    ({'weights': [70]}, 'weights', 'ожидается объект'),
    ({'weights': {'unknown': 10}}, 'weights.unknown', 'неизвестное поле'),
    ({'weights': {'prolong_wait': -1}}, 'weights.prolong_wait', 'допустимо от 0 до 100'),
    ({'weights': {'prolong_wait': 100.5}}, 'weights.prolong_wait', 'допустимо от 0 до 100'),
    ({'weights': {'prolong_wait': '50'}}, 'weights.prolong_wait', 'ожидается число'),
    ({'weights': {'prolong_wait': True}}, 'weights.prolong_wait', 'ожидается число'),
    ({'weights': {'prolong_wait': float('nan')}}, 'weights.prolong_wait', 'ожидается число'),
    ({'thresholds': {'high': 101}}, 'thresholds.high', 'допустимо от 0 до 100'),
    ({'thresholds': {'low': 10}}, 'thresholds.low', 'неизвестное поле'),
    ({'params': {'expiry_horizon_days': 0}}, 'params.expiry_horizon_days', 'допустимо от 1 до 90'),
    ({'params': {'expiry_horizon_days': 7.5}}, 'params.expiry_horizon_days',
     'ожидается целое число'),
    ({'params': {'loss_horizon_months': 13}}, 'params.loss_horizon_months',
     'допустимо от 1 до 12'),
    ({'params': {'use_bonus_balance': 1}}, 'params.use_bonus_balance', 'ожидается true или false'),
])
def test_invalid_values(patch, path, message):
    assert errors_of(patch) == [SettingsError(path, message)]


@pytest.mark.parametrize('thresholds', [{'medium': 65}, {'medium': 70}, {'high': 35}])
def test_medium_must_be_below_high_after_merge(thresholds):
    assert errors_of({'thresholds': thresholds}) == [
        SettingsError(
            'thresholds.medium', 'порог среднего риска должен быть меньше порога высокого',
        ),
    ]


def test_at_least_one_weight_must_be_positive():
    assert errors_of({'weights': dict.fromkeys(DEFAULT_WEIGHTS, 0)}) == [
        SettingsError('weights', 'хотя бы один признак должен иметь вес больше 0'),
    ]


def test_some_weights_may_be_zero():
    result = update_settings({'weights': {'low_payment_success': 0}})
    assert result['weights']['low_payment_success'] == 0


def test_all_errors_are_reported_and_nothing_is_saved():
    errors = errors_of({
        'weights': {'prolong_wait': -5},
        'params': {'loss_horizon_months': 0},
        'extra': 1,
    })

    assert [error.path for error in errors] == [
        'weights.prolong_wait', 'params.loss_horizon_months', 'extra',
    ]
    assert load_config() == ModelConfig.default()
