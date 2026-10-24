import pytest

from analytics.config import ModelConfig
from analytics.features import FeatureResult, feature


def test_decorator_registers_feature_and_keeps_function():
    registry = {}

    @feature('sample', 'Пример', 25, 'Описание', registry=registry)
    def sample(ctx):
        return FeatureResult(0.5, 'причина')

    registered = registry['sample']
    assert registered.key == 'sample'
    assert registered.title == 'Пример'
    assert registered.default_weight == 25
    assert registered.description == 'Описание'
    assert registered.compute is sample
    assert sample(None) == FeatureResult(0.5, 'причина')


def test_duplicate_key_is_rejected():
    registry = {}
    feature('sample', 'Пример', 25, registry=registry)(lambda ctx: None)

    with pytest.raises(ValueError, match="'sample' уже зарегистрирован"):
        feature('sample', 'Другой', 10, registry=registry)(lambda ctx: None)


def test_negative_default_weight_is_rejected():
    with pytest.raises(ValueError, match='не может быть отрицательным'):
        feature('sample', 'Пример', -1, registry={})


@pytest.mark.parametrize('value', [0, 0.5, 1])
def test_feature_result_accepts_unit_interval(value):
    assert FeatureResult(value, '').value == value


@pytest.mark.parametrize('value', [-0.01, 1.01])
def test_feature_result_rejects_values_outside_unit_interval(value):
    with pytest.raises(ValueError, match=r'в \[0, 1\]'):
        FeatureResult(value, '')


def test_default_config_takes_weights_from_registry():
    registry = {}
    feature('a', 'A', 40, registry=registry)(lambda ctx: None)
    feature('b', 'B', 0, registry=registry)(lambda ctx: None)

    assert ModelConfig.default(registry).weights == {'a': 40, 'b': 0}


def test_config_falls_back_to_default_weight_for_new_feature():
    registry = {}
    feature('new', 'Новый', 15, registry=registry)(lambda ctx: None)

    assert ModelConfig(weights={'old': 50}).weight(registry['new']) == 15
    assert ModelConfig(weights={'new': 3}).weight(registry['new']) == 3
