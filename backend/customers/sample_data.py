"""Демонстрационные наборы данных из sample-data/.

Наборы сформированы на опорную дату кейса. Данные в кейсе поступают в реальном времени,
поэтому при загрузке все даты сдвигаются так, чтобы опорная дата совпала с текущим
моментом: сроки услуг и статусы выглядят так же, как в кейсе, в любой день демонстрации.
"""

import copy
import json
from datetime import UTC, datetime, timedelta
from pathlib import Path
from typing import Any

from django.conf import settings
from django.utils import timezone

from .importer import ImportResult, replace_snapshot

# Опорная дата test_data/generate.py: на неё рассчитаны статусы и сроки в обоих наборах.
REFERENCE = datetime(2026, 10, 19, 15, 0, tzinfo=UTC)
CASE_FILE = 'case.json'  # копия test_data/data.json без изменений
DEMO_FILE = 'demo.json'  # сценарии для демонстрации, собирается build_demo.py
DATE_FIELDS = {
    'services': ('createdAt', 'expiresAt'),
    'transactions': ('createdAt', 'performedAt'),
}


def read(name: str) -> dict[str, list]:
    return json.loads((Path(settings.SAMPLE_DATA_DIR) / name).read_text(encoding='utf-8'))


def merge(*payloads: dict[str, list]) -> dict[str, list]:
    return {
        key: [item for payload in payloads for item in payload.get(key, [])]
        for key in ('accounts', 'services', 'transactions')
    }


def _shift(value: str | None, delta: timedelta) -> str | None:
    # Неразбираемые значения остаются как есть: их отклонит проверка снимка с путём к полю.
    if not isinstance(value, str):
        return value
    try:
        moment = datetime.fromisoformat(value)
    except ValueError:
        return value
    return (moment + delta).astimezone(UTC).isoformat(timespec='milliseconds').replace(
        '+00:00', 'Z',
    )


def shift_dates(payload: dict[str, Any], delta: timedelta) -> dict[str, Any]:
    """Копия снимка, в которой все даты сдвинуты на delta."""
    shifted = copy.deepcopy(payload)
    for section, fields in DATE_FIELDS.items():
        for record in shifted.get(section, []):
            for name in fields:
                if name in record:
                    record[name] = _shift(record[name], delta)
    return shifted


def load_sample(*, extended: bool = False, now: datetime | None = None) -> ImportResult:
    """Загружает набор кейса (и демонстрационные сценарии, если extended) на момент now."""
    payload = read(CASE_FILE)
    if extended:
        payload = merge(payload, read(DEMO_FILE))
    # Сдвиг на целые секунды: даты в наборе с точностью до миллисекунд.
    delta = timedelta(seconds=round(((now or timezone.now()) - REFERENCE).total_seconds()))
    return replace_snapshot(shift_dates(payload, delta), now=REFERENCE + delta)
