# Контракты API v1

Все эндпоинты, кроме `auth/login` и `/metrics` (там свой токен), требуют сессии. Ошибки в едином формате: `{"detail": "...", "code": "..."}`.

## Формат снимка исходных данных (`PUT /api/v1/source/snapshot`)

Формат совпадает с исходной системой (`test_data/data.json`, схема `test_data/001_schema.up.sql`). Имена полей в camelCase принимаются как есть.

```json
{
  "accounts": [
    {"id": 1, "email": "a@b.c", "balance": 12000, "withdrawBalance": 0,
     "totalReplenished": 50000, "bonusBalance": 500, "bonusState": "unlocked"}
  ],
  "services": [
    {"id": 10, "name": "VPS-1", "ownerId": 1, "paymentTerm": "month",
     "autoProlong": false, "createdAt": "2026-10-01T00:00:00.000Z",
     "expiresAt": "2026-11-01T00:00:00.000Z", "status": "active", "price": 30000}
  ],
  "transactions": [
    {"id": 100, "amount": 300, "status": "performed",
     "performedAt": "2026-10-01T00:05:00.000Z", "createdAt": "2026-10-01T00:00:00.000Z",
     "type": "prolong", "serviceId": 10}
  ]
}
```

Допустимые значения и правила:

| Поле | Значения / правило |
|---|---|
| `accounts[].bonusState` | `locked` (бонусы тратить нельзя), `unlocked` |
| `services[].status` | `active`, `suspended`, `prolong_wait`, `deleted`, `blocked` |
| `services[].paymentTerm` | `hour`, `week`, `month`, `quarter_year`, `half_year`, `year` |
| `transactions[].status` | `performed`, `not_performed` |
| `transactions[].type` | `prolong`, `order` |
| Денежные поля | целые числа ≥ 0 в единицах баланса (100 = €1) |
| `transactions[].amount` | целое число от 0 до 1000 включительно |
| `email` | строка, уникальна; формат по RFC не проверяется (как в исходной схеме) |
| `services[].name` | только латинские буквы, цифры и дефис: `^[A-Za-z0-9-]+$` |
| `services[].ownerId` | ссылается на существующий `accounts[].id` |
| `transactions[].serviceId` | ссылается на существующий `services[].id` (транзакция привязана к услуге, клиент определяется через услугу) |
| Даты | ISO 8601 UTC; `expiresAt ≥ createdAt` |
| `performedAt` | `null` при `not_performed`; обязателен и `≥ createdAt` при `performed` |

Ответ: `{"accounts": N, "services": N, "transactions": N, "recalculated_at": "..."}`.
Загрузка заменяет данные целиком, в одной транзакции БД (при ошибке валидации ничего не меняется).

## `GET /api/v1/customers`

Параметры: `level` (`high|medium|low|none`), `search` (по email), `ordering` (`id`, `email`, `balance`, `total_replenished`, `score` с префиксом `-` для убывания), `page`, `page_size`.

```json
{
  "count": 120, "page": 1, "page_size": 25,
  "results": [
    {"id": 1, "email": "a@b.c", "balance_cents": 12000,
     "total_replenished_cents": 50000,
     "score": 78.5, "level": "high",
     "top_reason": "Услуга истекает через 2 дня, автопродление выключено",
     "expected_loss_cents": 23500}
  ]
}
```

Если данных для оценки недостаточно: `"score": null, "level": "none", "top_reason": "Недостаточно данных для оценки"`.

## `GET /api/v1/customers/{id}`

```json
{
  "id": 1, "email": "a@b.c",
  "balance_cents": 12000, "bonus_balance_cents": 500, "bonus_usable": true,
  "withdraw_balance_cents": 0, "total_replenished_cents": 50000,
  "score": 78.5, "level": "high",
  "expected_loss_cents": 23500,
  "factors": [
    {"key": "expiring_no_autoprolong", "title": "Скоро истекает без автопродления",
     "value": 1.0, "weight": 40, "contribution": 40.0,
     "explanation": "VPS-1 истекает 01.11.2026, автопродление выключено"}
  ],
  "services": [
    {"id": 10, "name": "VPS-1", "status": "active", "price_cents": 30000,
     "payment_term": "month", "autoprolong": false, "expires_at": "...",
     "days_to_expiry": 8, "monthly_equivalent_cents": 30000,
     "expected_loss_cents": 23500}
  ]
}
```

## `GET /api/v1/analytics/summary`

```json
{
  "calculated_at": "2026-10-24T10:00:00Z",
  "customers_total": 120,
  "by_level": {"high": 14, "medium": 31, "low": 70, "none": 5},
  "services_at_risk": 42,
  "revenue_at_risk_cents": 1250000,
  "expected_loss_cents": 480000,
  "explanation": "Ожидаемая потеря = сумма (месячная стоимость услуги × вероятность оттока клиента)."
}
```

Для графика (дополнительная функция): `GET /api/v1/analytics/churn-chart?days=30`

```json
{"series": [
  {"date": "2026-10-20", "kind": "fact", "deleted_services": 3, "services_at_risk": 40},
  {"date": "2026-10-26", "kind": "forecast", "expected_non_renewals": 5, "services_at_risk": 42}
]}
```

## `GET|PATCH /api/v1/model/settings`

```json
{
  "weights": {"expiring_no_autoprolong": 40, "insufficient_funds": 30, "prolong_wait": 20},
  "thresholds": {"medium": 35, "high": 65},
  "params": {"expiry_horizon_days": 7, "use_bonus_balance": true, "loss_horizon_months": 1},
  "schema": {
    "weights": [{"key": "expiring_no_autoprolong", "title": "...", "description": "...", "min": 0, "max": 100}]
  }
}
```

`PATCH` принимает частичный объект, валидирует (веса ≥ 0, `medium < high`), сохраняет, запускает пересчёт и шлёт SSE-событие. `schema` позволяет фронту нарисовать форму без хардкода признаков.

## Аутентификация

| Метод | Путь | Поведение |
|---|---|---|
| POST | `/api/v1/auth/login` | `{username, password}` → 200 + cookie сессии, 400/401 при ошибке |
| GET | `/api/v1/auth/me` | 200 `{id, username}` или 401/403 |
| POST | `/api/v1/auth/logout` | 204, сессия сброшена |
| GET | `/api/v1/auth/csrf` | выставляет cookie `csrftoken` (нужен SPA до первого POST) |

## SSE: `GET /api/v1/events`

Событие `recalculated`, данные: `{"reason": "settings|snapshot", "at": "...", "summary": {...}}`. Каждые 15 секунд `: ping`, чтобы соединение не рвалось прокси.
