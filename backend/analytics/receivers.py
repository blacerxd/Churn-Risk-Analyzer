"""Запуск пересчёта по событиям: загрузка снимка и сохранение настроек.

Оба сигнала отправляются внутри транзакции изменения, поэтому пересчёт выполняется в ней же.
"""

from django.dispatch import receiver

from customers.signals import snapshot_replaced

from .models import RecalcReason
from .recalculation import recalculate_all
from .signals import settings_updated


@receiver(snapshot_replaced)
def recalculate_after_snapshot(sender, result, **kwargs):
    recalculate_all(RecalcReason.SNAPSHOT, now=result.imported_at)


@receiver(settings_updated)
def recalculate_after_settings(sender, **kwargs):
    recalculate_all(RecalcReason.SETTINGS)
