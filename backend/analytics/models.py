from django.db import models
from django.db.models import Q


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
