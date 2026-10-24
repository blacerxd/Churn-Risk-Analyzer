import pytest

from analytics.config import ModelConfig, Thresholds
from analytics.features import FeatureResult, feature
from analytics.scoring import (
    NO_DATA_REASON,
    NO_RISK_REASON,
    FactorResult,
    RiskLevel,
    combine,
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


# --- формула ---

def test_single_full_cause_gives_its_weight():
    assert score(registry_with(a=(70, 1.0))).score == 70.0


def test_partial_cause_scales_probability():
    assert score(registry_with(a=(80, 0.5))).score == 40.0


def test_causes_combine_as_noisy_or():
    # 1 − (1 − 0.35) × (1 − 0.2) = 0.48
    registry = registry_with(expiring=(70, 0.5), payments=(20, 1.0))

    result = score(registry)

    assert result.score == 48.0
    assert result.probability == 0.48
    assert result.level == RiskLevel.MEDIUM


def test_contributions_are_split_by_log_hazard():
    # −ln(0.65) = 0.431, −ln(0.8) = 0.223: доли 65,9 % и 34,1 % от 48 баллов.
    result = score(registry_with(expiring=(70, 0.5), payments=(20, 1.0)))

    assert result.factors == (
        FactorResult('expiring', 'Признак expiring', 0.5, 70, 31.6, 'причина expiring'),
        FactorResult('payments', 'Признак payments', 1.0, 20, 16.4, 'причина payments'),
    )


def test_equal_causes_share_equally():
    result = score(registry_with(a=(50, 1.0), b=(50, 1.0)))

    assert result.score == 75.0
    assert [f.contribution for f in result.factors] == [37.5, 37.5]


def test_contributions_add_up_to_score():
    result = score(registry_with(a=(70, 0.7), b=(50, 0.2), c=(80, 1.0), d=(20, 0.0)))

    assert sum(f.contribution for f in result.factors) == pytest.approx(result.score, abs=0.2)


def test_certain_cause_takes_whole_score():
    result = score(registry_with(sure=(100, 1.0), other=(50, 1.0)))

    assert result.score == 100.0
    assert {f.key: f.contribution for f in result.factors} == {'sure': 100.0, 'other': 0.0}


def test_combine_splits_between_several_certain_causes():
    assert combine([1.0, 1.0, 0.3]) == (100.0, [50.0, 50.0, 0.0])


def test_combine_without_causes():
    assert combine([0.0, 0.0]) == (0.0, [0.0, 0.0])
    assert combine([]) == (0.0, [])


def test_zero_weights_mean_no_risk():
    result = score(registry_with(a=(70, 1.0)), ModelConfig(weights={'a': 0}))

    assert (result.score, result.level, result.top_reason) == (0.0, RiskLevel.LOW, NO_RISK_REASON)


@pytest.mark.parametrize('weight', [-1, 100.1])
def test_weight_outside_0_100_is_rejected(weight):
    with pytest.raises(ValueError, match='от 0 до 100'):
        score(registry_with(a=(50, 1.0)), ModelConfig(weights={'a': weight}))


# --- свойства, важные для панели и расширяемости ---

def test_raising_weight_does_not_affect_customers_without_that_cause():
    registry = registry_with(a=(40, 0.0), b=(60, 0.5))
    before = score(registry, ModelConfig(weights={'a': 40, 'b': 60})).score

    after = score(registry, ModelConfig(weights={'a': 100, 'b': 60})).score

    assert before == after == 30.0


def test_raising_weight_never_lowers_score():
    registry = registry_with(a=(40, 0.3), b=(60, 0.5))
    scores = [
        score(registry, ModelConfig(weights={'a': weight, 'b': 60})).score
        for weight in range(0, 101, 10)
    ]
    assert scores == sorted(scores)


def test_new_feature_that_did_not_fire_keeps_score():
    base = score(registry_with(a=(70, 0.5), b=(50, 0.2))).score
    extended = score(registry_with(a=(70, 0.5), b=(50, 0.2), new=(90, 0.0))).score

    assert base == extended


# --- конфигурация, уровни, причины ---

def test_weights_from_config_override_defaults():
    registry = registry_with(a=(50, 1.0), b=(50, 1.0))

    assert score(registry, ModelConfig(weights={'a': 10, 'b': 0})).score == 10.0


def test_zero_weight_feature_is_reported_without_contribution():
    result = score(registry_with(a=(60, 0.5), muted=(0, 1.0)))

    assert result.score == 30.0
    muted = next(f for f in result.factors if f.key == 'muted')
    assert (muted.value, muted.weight, muted.contribution) == (1.0, 0, 0.0)


def test_factors_are_sorted_by_contribution():
    registry = registry_with(low=(10, 0.1), high=(50, 0.9), zero=(40, 0.0))

    assert [f.key for f in score(registry).factors] == ['high', 'low', 'zero']


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
    result = score(registry_with(a=(100, 0.6496)))

    assert (result.score, result.level) == (65.0, RiskLevel.HIGH)


def test_custom_thresholds():
    config = ModelConfig(weights={'a': 100}, thresholds=Thresholds(medium=20, high=50))

    assert score(registry_with(a=(100, 0.5)), config).level == RiskLevel.HIGH


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
    result = score(registry_with(a=(10, 0.0), b=(10, 0.0)))

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
