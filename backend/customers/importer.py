"""Импорт снимка исходных данных.

Единственное место, где формат источника (camelCase, см. «Формат снимка» в docs/api-contract.md)
переводится в модели. parse_snapshot() проверяет данные без обращения к БД,
replace_snapshot() атомарно заменяет данные целиком.
"""

import re
from collections.abc import Callable
from dataclasses import dataclass, field
from datetime import UTC, datetime
from typing import Any

from django.db import transaction
from django.utils import timezone

from .locking import lock_source_data
from .models import (
    SERVICE_NAME_PATTERN,
    TRANSACTION_AMOUNT_MAX,
    BonusState,
    Customer,
    PaymentTerm,
    Service,
    ServiceStatus,
    ServiceStatusEvent,
    Transaction,
    TransactionStatus,
    TransactionType,
)
from .signals import snapshot_replaced

MAX_ERRORS = 100
MAX_BIGINT = 2**63 - 1
BULK_BATCH_SIZE = 1000


@dataclass(frozen=True)
class SnapshotError:
    path: str
    message: str


class SnapshotValidationError(Exception):
    def __init__(self, errors: list[SnapshotError]):
        self.total = len(errors)
        self.errors = errors[:MAX_ERRORS]
        super().__init__(f'Снимок не прошёл проверку: ошибок {self.total}')


@dataclass(frozen=True)
class ParsedSnapshot:
    customers: list[Customer]
    services: list[Service]
    transactions: list[Transaction]


@dataclass(frozen=True)
class ImportResult:
    accounts: int
    services: int
    transactions: int
    status_changes: int
    imported_at: datetime


# --- Разбор отдельных значений. Каждый парсер возвращает значение или бросает ValueError. ---

def _integer(value):
    # bool является подклассом int в Python, но true вместо числа в JSON — ошибка данных.
    if isinstance(value, bool) or not isinstance(value, int):
        raise ValueError('ожидается целое число')
    if abs(value) > MAX_BIGINT:
        raise ValueError('слишком большое число')
    return value


def _identifier(value):
    value = _integer(value)
    if value < 1:
        raise ValueError('ожидается положительное целое число')
    return value


def _money(value):
    value = _integer(value)
    if value < 0:
        raise ValueError('сумма не может быть отрицательной')
    return value


def _transaction_amount(value):
    value = _money(value)
    if value > TRANSACTION_AMOUNT_MAX:
        raise ValueError(f'сумма транзакции больше {TRANSACTION_AMOUNT_MAX}')
    return value


def _string(value):
    if not isinstance(value, str):
        raise ValueError('ожидается строка')
    return value


def _service_name(value):
    value = _string(value)
    if not re.fullmatch(SERVICE_NAME_PATTERN, value):
        raise ValueError('допустимы только латинские буквы, цифры и дефис')
    return value


def _boolean(value):
    if not isinstance(value, bool):
        raise ValueError('ожидается true или false')
    return value


def _choice(choices):
    allowed = ', '.join(choices.values)

    def parse(value):
        if value not in choices.values:
            raise ValueError(f'недопустимое значение {value!r}, ожидается одно из: {allowed}')
        return value
    return parse


def _datetime(value):
    if not isinstance(value, str):
        raise ValueError('ожидается дата в формате ISO 8601')
    try:
        parsed = datetime.fromisoformat(value)
    except ValueError:
        raise ValueError('ожидается дата в формате ISO 8601') from None
    if parsed.tzinfo is None:
        raise ValueError('у даты нет часового пояса, ожидается UTC (суффикс Z)')
    return parsed.astimezone(UTC)


def _optional(parse):
    return lambda value: None if value is None else parse(value)


@dataclass(frozen=True)
class _Field:
    source: str
    target: str
    parse: Callable[[Any], Any]


ACCOUNT_FIELDS = (
    _Field('id', 'id', _identifier),
    _Field('email', 'email', _string),
    _Field('balance', 'balance', _money),
    _Field('withdrawBalance', 'withdraw_balance', _money),
    _Field('totalReplenished', 'total_replenished', _money),
    _Field('bonusBalance', 'bonus_balance', _money),
    _Field('bonusState', 'bonus_state', _choice(BonusState)),
)

SERVICE_FIELDS = (
    _Field('id', 'id', _identifier),
    _Field('name', 'name', _service_name),
    _Field('ownerId', 'customer_id', _identifier),
    _Field('paymentTerm', 'payment_term', _choice(PaymentTerm)),
    _Field('autoProlong', 'auto_prolong', _boolean),
    _Field('createdAt', 'created_at', _datetime),
    _Field('expiresAt', 'expires_at', _datetime),
    _Field('status', 'status', _choice(ServiceStatus)),
    _Field('price', 'price', _money),
)

TRANSACTION_FIELDS = (
    _Field('id', 'id', _identifier),
    _Field('amount', 'amount', _transaction_amount),
    _Field('status', 'status', _choice(TransactionStatus)),
    _Field('performedAt', 'performed_at', _optional(_datetime)),
    _Field('createdAt', 'created_at', _datetime),
    _Field('type', 'type', _choice(TransactionType)),
    _Field('serviceId', 'service_id', _identifier),
)


@dataclass
class _Section:
    """Разобранный раздел снимка: строки (только успешно разобранные поля) и их исходные индексы."""

    name: str
    rows: list[dict] = field(default_factory=list)
    ids: dict[int, int] = field(default_factory=dict)  # id -> индекс первой строки с этим id


def _parse_section(payload, name, fields, errors) -> _Section:
    section = _Section(name)
    records = payload.get(name)
    if records is None:
        errors.append(SnapshotError(name, 'обязательный раздел отсутствует'))
        return section
    if not isinstance(records, list):
        errors.append(SnapshotError(name, 'ожидается массив'))
        return section

    for index, record in enumerate(records):
        path = f'{name}[{index}]'
        if not isinstance(record, dict):
            errors.append(SnapshotError(path, 'ожидается объект'))
            continue

        row = {'_path': path}
        for spec in fields:
            if spec.source not in record:
                errors.append(SnapshotError(f'{path}.{spec.source}', 'обязательное поле'))
                continue
            try:
                row[spec.target] = spec.parse(record[spec.source])
            except ValueError as exc:
                errors.append(SnapshotError(f'{path}.{spec.source}', str(exc)))

        if 'id' in row:
            first = section.ids.setdefault(row['id'], index)
            if first != index:
                errors.append(SnapshotError(
                    f'{path}.id', f'id {row["id"]} уже встречался в {name}[{first}]',
                ))
        section.rows.append(row)
    return section


def _check_unique(section, target, source, errors):
    seen = {}
    for row in section.rows:
        if target not in row:
            continue
        first = seen.setdefault(row[target], row['_path'])
        if first != row['_path']:
            errors.append(SnapshotError(
                f'{row["_path"]}.{source}', f'значение {row[target]!r} уже встречалось в {first}',
            ))


def _check_reference(section, target, source, parent, errors):
    for row in section.rows:
        if target in row and row[target] not in parent.ids:
            errors.append(SnapshotError(
                f'{row["_path"]}.{source}', f'{parent.name} с id {row[target]} не найден',
            ))


def _check_service_dates(services, errors):
    for row in services.rows:
        if {'created_at', 'expires_at'} <= row.keys() and row['expires_at'] < row['created_at']:
            errors.append(SnapshotError(
                f'{row["_path"]}.expiresAt', 'раньше даты создания createdAt',
            ))


def _check_transaction_performed_at(transactions, errors):
    for row in transactions.rows:
        if not {'status', 'performed_at'} <= row.keys():
            continue
        path = f'{row["_path"]}.performedAt'
        performed_at = row['performed_at']
        if row['status'] == TransactionStatus.NOT_PERFORMED:
            if performed_at is not None:
                errors.append(SnapshotError(path, 'должно быть null для невыполненной транзакции'))
        elif performed_at is None:
            errors.append(SnapshotError(path, 'обязательно для выполненной транзакции'))
        elif 'created_at' in row and performed_at < row['created_at']:
            errors.append(SnapshotError(path, 'раньше даты создания createdAt'))


def _build(model, section):
    return [
        model(**{key: value for key, value in row.items() if key != '_path'})
        for row in section.rows
    ]


def parse_snapshot(payload: Any) -> ParsedSnapshot:
    """Проверяет снимок целиком и возвращает несохранённые объекты моделей.

    Собирает все ошибки сразу (а не до первой), каждая с путём к полю в исходном JSON.
    """
    if not isinstance(payload, dict):
        raise SnapshotValidationError([
            SnapshotError('', 'ожидается объект со списками accounts, services, transactions'),
        ])

    errors: list[SnapshotError] = []
    accounts = _parse_section(payload, 'accounts', ACCOUNT_FIELDS, errors)
    services = _parse_section(payload, 'services', SERVICE_FIELDS, errors)
    transactions = _parse_section(payload, 'transactions', TRANSACTION_FIELDS, errors)

    _check_unique(accounts, 'email', 'email', errors)
    _check_reference(services, 'customer_id', 'ownerId', accounts, errors)
    _check_reference(transactions, 'service_id', 'serviceId', services, errors)
    _check_service_dates(services, errors)
    _check_transaction_performed_at(transactions, errors)

    if errors:
        raise SnapshotValidationError(errors)
    return ParsedSnapshot(
        customers=_build(Customer, accounts),
        services=_build(Service, services),
        transactions=_build(Transaction, transactions),
    )


def _status_events(previous, services, detected_at):
    """События смены статуса для услуг, которые есть и в старом, и в новом снимке."""
    return [
        ServiceStatusEvent(
            service_id=service.id, customer_id=service.customer_id,
            old_status=previous[service.id], new_status=service.status, detected_at=detected_at,
        )
        for service in services
        if service.id in previous and previous[service.id] != service.status
    ]


def replace_snapshot(payload: Any, *, now: datetime | None = None) -> ImportResult:
    """Полностью заменяет исходные данные снимком в одной транзакции.

    При ошибке валидации бросает SnapshotValidationError, данные в БД не меняются.
    Сигнал snapshot_replaced отправляется внутри той же транзакции: по нему пересчитываются
    оценки риска, поэтому данные и оценки меняются вместе, а ошибка пересчёта откатывает
    загрузку целиком.
    """
    parsed = parse_snapshot(payload)
    now = now or timezone.now()

    with transaction.atomic():
        lock_source_data()

        previous = dict(Service.objects.values_list('id', 'status'))
        events = _status_events(previous, parsed.services, now)

        # Порядок важен: внешние ключи PROTECT не дают удалить родителя раньше детей.
        Transaction.objects.all().delete()
        Service.objects.all().delete()
        Customer.objects.all().delete()

        Customer.objects.bulk_create(parsed.customers, batch_size=BULK_BATCH_SIZE)
        Service.objects.bulk_create(parsed.services, batch_size=BULK_BATCH_SIZE)
        Transaction.objects.bulk_create(parsed.transactions, batch_size=BULK_BATCH_SIZE)
        ServiceStatusEvent.objects.bulk_create(events, batch_size=BULK_BATCH_SIZE)

        result = ImportResult(
            accounts=len(parsed.customers),
            services=len(parsed.services),
            transactions=len(parsed.transactions),
            status_changes=len(events),
            imported_at=now,
        )
        snapshot_replaced.send(sender=None, result=result)
    return result
