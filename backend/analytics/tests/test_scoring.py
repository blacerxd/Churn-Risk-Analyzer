import pytest

from analytics.config import ModelConfig, Thresholds
from analytics.features import FeatureResult, feature
from analytics.scoring import (
    NO_DATA_REASON,
    NO_RISK_REASON,
    FactorResult,
    RiskLevel,
    compute,
    level_for,
)
from customers.models import ServiceStatus

from .factories import make_context, make_customer, make_service


def registry_with(**features):
    """Реестр с признаками, возвращающими фиксированные значения: {key: (вес, значение)}."""
    registry = {}
    for key, (weight, value) in features.items():
        feature(key, f'Признак {key}', weight, registry=registry)(
            lambda ctx, value=value, key=key: FeatureResult(value, f'причина {key}'),
        )
    return registry


def score(registry, config=None, ctx=None):
    return compute(ctx or make_context(), config or ModelConfig.default(registry), registry)


def test_weighted_score_and_contributions():
    registry = registry_with(expiring=(30, 1.0), funds=(10, 0.5))

    result = score(registry)

    # (30 × 1.0 + 10 × 0.5) / 40 × 100 = 87.5
    assert result.score == 87.5
    assert result.probability == 0.875
    assert result.level == RiskLevel.HIGH
    assert result.factors == (
        FactorResult('expiring', 'Признак expiring', 1.0, 30, 75.0, 'причина expiring'),
        FactorResult('funds', 'Признак funds', 0.5, 10, 12.5, 'причина funds'),
    )


def test_contributions_add_up_to_score():
    registry = registry_with(a=(40, 0.7), b=(30, 0.2), c=(20, 1.0), d=(10, 0.0))

    result = score(registry)

    assert sum(f.contribution for f in result.factors) == pytest.approx(result.score, abs=0.2)


def test_factors_are_sorted_by_contribution():
    registry = registry_with(low=(10, 0.1), high=(50, 0.9), zero=(40, 0.0))

    assert [f.key for f in score(registry).factors] == ['high', 'low', 'zero']


def test_weights_from_config_override_defaults():
    registry = registry_with(a=(50, 1.0), b=(50, 0.0))

    result = score(registry, ModelConfig(weights={'a': 10, 'b': 90}))

    assert result.score == 10.0


def test_zero_weight_feature_is_reported_without_contribution():
    registry = registry_with(a=(10, 0.5), muted=(0, 1.0))

    result = score(registry)

    assert result.score == 50.0
    muted = next(f for f in result.factors if f.key == 'muted')
    assert (muted.value, muted.weight, muted.contribution) == (1.0, 0, 0.0)


@pytest.mark.parametrize('weights', [{'a': 0, 'b': 0}, {'a': -5, 'b': 10}])
def test_invalid_weights_are_rejected(weights):
    registry = registry_with(a=(10, 1.0), b=(10, 1.0))
    with pytest.raises(ValueError):
        score(registry, ModelConfig(weights=weights))


@pytest.mark.parametrize(('value', 'level'), [
    (0.0, RiskLevel.LOW),
    (34.9, RiskLevel.LOW),
    (35.0, RiskLevel.MEDIUM),
    (64.9, RiskLevel.MEDIUM),
    (65.0, RiskLevel.HIGH),
    (100.0, RiskLevel.HIGH),
])
def test_level_thresholds_are_inclusive(value, level):
    assert level_for(value, Thresholds(medium=35, high=65)) == level


def test_level_is_derived_from_rounded_score():
    # 64.96 округляется до 65.0: пользователь видит 65.0, значит и уровень должен быть «высокий».
    registry = registry_with(a=(100, 0.6496))

    result = score(registry)

    assert (result.score, result.level) == (65.0, RiskLevel.HIGH)


def test_custom_thresholds():
    registry = registry_with(a=(100, 0.5))

    config = ModelConfig(weights={'a': 100}, thresholds=Thresholds(medium=20, high=50))

    result = score(registry, config)

    assert result.level == RiskLevel.HIGH


@pytest.mark.parametrize('services', [
    [],
    [make_service(status=ServiceStatus.DELETED), make_service(id=11, status=ServiceStatus.BLOCKED)],
])
def test_no_scored_services_means_no_assessment(services):
    calls = []
    registry = {}
    feature('spy', 'Шпион', 10, registry=registry)(
        lambda ctx: calls.append(ctx) or FeatureResult(1.0, ''),
    )

    result = score(registry, ctx=make_context(make_customer(), services))

    assert (result.score, result.level, result.probability, result.factors) == (
        None, RiskLevel.NONE, None, (),
    )
    assert result.top_reason == NO_DATA_REASON
    assert calls == []  # признаки не вызываются, оценивать нечего


def test_top_reason_is_explanation_of_main_factor():
    registry = registry_with(minor=(10, 0.2), major=(90, 0.5))

    assert score(registry).top_reason == 'причина major'


def test_top_reason_when_no_risk_signals():
    registry = registry_with(a=(10, 0.0), b=(10, 0.0))

    result = score(registry)

    assert (result.score, result.level) == (0.0, RiskLevel.LOW)
    assert result.top_reason == NO_RISK_REASON


def test_features_receive_context():
    seen = []
    registry = {}
    feature('spy', 'Шпион', 10, registry=registry)(
        lambda ctx: seen.append(ctx) or FeatureResult(0.0, ''),
    )
    ctx = make_context()

    score(registry, ctx=ctx)

    assert seen == [ctx]
