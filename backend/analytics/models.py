from datetime import UTC

from django.db import models
from django.db.models import F, Q

from customers.models import Customer

from .scoring import RiskLevel


class ModelSettings(models.Model):
    """Настройки модели риска: единственная запись в БД, переживает перезапуск.

    Хранятся только значения, заданные через панель. Действующие значения (с умолчаниями
    для новых признаков) собирает analytics.model_settings, поэтому новый признак
    не требует миграции данных.
    """

    SINGLETON_ID = 1

    id = models.PositiveSmallIntegerField(primary_key=True, default=SINGLETON_ID)
    weights = models.JSONField('веса признаков', default=dict)
    thresholds = models.JSONField('пороги уровней', default=dict)
    params = models.JSONField('параметры', default=dict)
    updated_at = models.DateTimeField('изменено', auto_now=True)

    class Meta:
        verbose_name = 'настройки модели'
        verbose_name_plural = 'настройки модели'
        constraints = [
            models.CheckConstraint(condition=Q(id=1), name='model_settings_singleton'),
        ]

    def __str__(self):
        return 'Настройки модели'

    @classmethod
    def load(cls) -> 'ModelSettings':
        settings, _ = cls.objects.get_or_create(pk=cls.SINGLETON_ID)
        return settings


class RecalcReason(models.TextChoices):
    SNAPSHOT = 'snapshot', 'Загрузка снимка'
    SETTINGS = 'settings', 'Изменение настроек'


class RiskAssessment(models.Model):
    """Последняя оценка клиента. Полностью перезаписывается при каждом пересчёте.

    Суммы — в единицах баланса (100 = €1). factors — FactorResult по убыванию вклада,
    services — ServiceMoney по учитываемым услугам клиента.
    """

    customer = models.OneToOneField(
        Customer, on_delete=models.DB_CASCADE, primary_key=True, related_name='risk',
    )
    score = models.FloatField('score', null=True)
    level = models.CharField('уровень', max_length=8, choices=RiskLevel.choices)
    probability = models.FloatField('вероятность ухода', null=True)
    top_reason = models.TextField('главная причина')
    factors = models.JSONField('признаки', default=list)
    services = models.JSONField('потери по услугам', default=list)
    monthly_revenue = models.BigIntegerField('месячная стоимость услуг')
    expected_loss = models.BigIntegerField('ожидаемая потеря')
    calculated_at = models.DateTimeField('рассчитано')

    class Meta:
        verbose_name = 'оценка риска'
        verbose_name_plural = 'оценки риска'
        indexes = [
            models.Index(fields=['level']),
            models.Index(fields=['score']),
        ]
        constraints = [
            # «Нет оценки» — ровно тогда, когда score не выставлен. Явный isnull=False:
            # сравнение с NULL даёт NULL, и CHECK без него пропустил бы пустой score.
            models.CheckConstraint(
                condition=(
                    Q(level=RiskLevel.NONE, score__isnull=True, probability__isnull=True)
                    | Q(
                        ~Q(level=RiskLevel.NONE),
                        score__isnull=False, probability__isnull=False,
                        score__gte=0, score__lte=100, probability__gte=0, probability__lte=1,
                    )
                ),
                name='risk_assessment_score_matches_level',
            ),
            models.CheckConstraint(
                condition=Q(monthly_revenue__gte=0, expected_loss__gte=0),
                name='risk_assessment_money_non_negative',
            ),
        ]

    def __str__(self):
        return f'Оценка клиента {self.customer_id}'


class AnalyticsSnapshot(models.Model):
    """Итоги одного пересчёта: источник для summary и /metrics.

    Записи не перезаписываются: история пересчётов остаётся для графика и разбора.
    Действующие итоги — последняя запись (latest).
    """

    reason = models.CharField('причина', max_length=16, choices=RecalcReason.choices)
    calculated_at = models.DateTimeField('рассчитано', db_index=True)
    duration_seconds = models.FloatField('длительность, с')
    customers_total = models.PositiveIntegerField('клиентов')
    customers_high = models.PositiveIntegerField('высокий риск')
    customers_medium = models.PositiveIntegerField('средний риск')
    customers_low = models.PositiveIntegerField('низкий риск')
    customers_none = models.PositiveIntegerField('нет оценки')
    score_avg = models.FloatField('средний score', null=True)
    services_at_risk = models.PositiveIntegerField('услуг под риском')
    revenue_at_risk = models.BigIntegerField('выручка под риском')
    expected_loss = models.BigIntegerField('ожидаемая потеря')
    explanation = models.TextField('пояснение')

    class Meta:
        verbose_name = 'итоги пересчёта'
        verbose_name_plural = 'итоги пересчётов'
        get_latest_by = ('calculated_at', 'id')
        constraints = [
            models.CheckConstraint(
                condition=Q(customers_total=(
                    F('customers_high') + F('customers_medium')
                    + F('customers_low') + F('customers_none')
                )),
                name='analytics_snapshot_levels_sum_to_total',
            ),
            models.CheckConstraint(
                condition=Q(revenue_at_risk__gte=0, expected_loss__gte=0),
                name='analytics_snapshot_money_non_negative',
            ),
        ]

    def __str__(self):
        return f'Пересчёт {self.calculated_at:%d.%m.%Y %H:%M:%S}'

    def summary(self) -> dict:
        """Ответ GET /api/v1/analytics/summary (и данные SSE-события recalculated)."""
        return {
            'calculated_at': self.calculated_at.astimezone(UTC).isoformat().replace('+00:00', 'Z'),
            'customers_total': self.customers_total,
            'by_level': {
                'high': self.customers_high,
                'medium': self.customers_medium,
                'low': self.customers_low,
                'none': self.customers_none,
            },
            'services_at_risk': self.services_at_risk,
            'revenue_at_risk_cents': self.revenue_at_risk,
            'expected_loss_cents': self.expected_loss,
            'explanation': self.explanation,
        }
