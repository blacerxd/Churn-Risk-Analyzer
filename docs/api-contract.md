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

Снимок передаётся JSON-телом (`Content-Type: application/json`) или файлом в поле `file`
(`multipart/form-data`). Максимальный размер 20 МБ.
Загрузка заменяет данные целиком, в одной транзакции БД (при ошибке валидации ничего не меняется).
В той же транзакции пересчитываются оценки всех клиентов. `recalculated_at` — момент, на который
посчитан риск (совпадает с `imported_at`), `null` означает, что пересчёт не выполнялся.

Ответ 200:

```json
{"accounts": 10, "services": 30, "transactions": 100, "status_changes": 2,
 "imported_at": "2026-10-25T10:00:00Z", "recalculated_at": "2026-10-25T10:00:00Z"}
```

`status_changes` — сколько услуг сменили статус по сравнению с прошлым снимком.

Ошибки:

| Код | `code` | Когда |
|---|---|---|
| 400 | `invalid_snapshot` | данные не прошли проверку, список в `errors`, всего `errors_total` (в ответе не больше 100) |
| 400 | `parse_error` | тело или файл не являются JSON, в multipart нет поля `file` |
| 413 | `too_large` | снимок больше 20 МБ |

```json
{"detail": "Снимок не прошёл проверку: ошибок 2", "code": "invalid_snapshot", "errors_total": 2,
 "errors": [{"path": "services[0].ownerId", "message": "accounts с id 99 не найден"},
            {"path": "services[0].status", "message": "недопустимое значение 'x', ожидается одно из: ..."}]}
```

При старте контейнера, если база пуста, загружается набор из `sample-data/` с датами, сдвинутыми
на текущий момент (`SAMPLE_AUTOLOAD`: `extended` по умолчанию, `case` или `none`).
Произвольный файл можно загрузить командой `manage.py load_snapshot <файл>`.

## `GET /api/v1/customers`

Параметры:

| Параметр | Значения |
|---|---|
| `level` | `high`, `medium`, `low`, `none` |
| `search` | часть email без учёта регистра |
| `ordering` | `id`, `email`, `balance`, `total_replenished`, `score`, `level`, `expected_loss`, с `-` по убыванию. По умолчанию `-score`. `level` упорядочен по смыслу (`-level`: высокий → средний → низкий), внутри уровня — по `score` в том же направлении; `expected_loss` при равной потере — тоже по `score`. Клиенты без оценки при сортировке по `score`, `level` и `expected_loss` всегда в конце |
| `page`, `page_size` | по умолчанию 1 и 25, `page_size` не больше 100 |

Недопустимое значение `level` или `ordering` — 400 `invalid` с полем в `errors`, страница за пределами списка — 404 `not_found`.

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
  "top_reason": "Услуга истекает через 2 дня, автопродление выключено",
  "expected_loss_cents": 23500,
  "calculated_at": "2026-10-25T10:00:00Z",
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

- `factors` — все признаки по убыванию вклада, `services` — все услуги клиента, включая удалённые
  (у них `expected_loss_cents` = 0), по возрастанию `expires_at`.
- `days_to_expiry` — целых суток от `calculated_at` до `expires_at`, отрицательное значение — оплата уже истекла.
- До первого пересчёта: `level` = `none`, `score` и `calculated_at` = `null`, `factors` пустой.
- Нет клиента — 404 `{"detail": "Клиент не найден", "code": "not_found"}`.

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

Итоги читаются из последнего пересчёта и на лету не считаются. До первого пересчёта
`calculated_at` равен `null`, остальные значения — нули.

Для графика (дополнительная функция): `GET /api/v1/analytics/churn-chart?days=30`

```json
{"series": [
  {"date": "2026-10-20", "kind": "fact", "deleted_services": 3, "services_at_risk": 40},
  {"date": "2026-10-26", "kind": "forecast", "expected_non_renewals": 0.58, "services_at_risk": 42}
]}
```

- `days` — от 1 до 90, по умолчанию 30. Отсчёт от времени последнего пересчёта (`summary.calculated_at`).
- `fact` — по дню на каждую дату окна: сколько услуг перешло в `deleted`. Истории в источнике нет,
  она копится из разницы между загруженными снимками, поэтому точки начинаются с первого
  обнаруженного удаления. Пока удалений не было, фактов нет. `services_at_risk` — по последнему
  пересчёту на конец дня.
- `forecast` — по дню на `days` дней вперёд: сумма вероятностей ухода владельцев услуг
  (`active`, `suspended`, `prolong_wait`), у которых в этот день заканчивается оплата.

## `GET|PATCH /api/v1/model/settings`

```json
{
  "weights": {"expiring_no_autoprolong": 70, "insufficient_funds": 50,
              "prolong_wait": 80, "low_payment_success": 20},
  "thresholds": {"medium": 35, "high": 65},
  "params": {"expiry_horizon_days": 7, "use_bonus_balance": true, "loss_horizon_months": 1},
  "schema": {
    "weights": [{"key": "expiring_no_autoprolong", "title": "...", "description": "...",
                 "type": "number", "default": 70, "min": 0, "max": 100}],
    "thresholds": [{"key": "medium", "title": "...", "description": "...",
                    "type": "number", "default": 35, "min": 0, "max": 100}],
    "params": [{"key": "expiry_horizon_days", "title": "...", "description": "...",
                "type": "integer", "default": 7, "min": 1, "max": 90},
               {"key": "use_bonus_balance", "title": "...", "description": "...",
                "type": "boolean", "default": true}]
  }
}
```

Вес признака — вероятность ухода в процентах, если причина проявилась полностью (см. `docs/model.md`).

`PATCH` принимает частичный объект, например `{"weights": {"prolong_wait": 90}}`, сохраняет только переданные поля, запускает пересчёт и шлёт SSE-событие. Ответ — действующие настройки в том же формате. Правила проверки:

| Поле | Правило |
|---|---|
| `weights.*` | число от 0 до 100, только ключи зарегистрированных признаков; хотя бы один вес больше 0 |
| `thresholds.medium`, `thresholds.high` | число от 0 до 100, `medium < high` (после применения изменения) |
| `params.expiry_horizon_days` | целое от 1 до 90 |
| `params.loss_horizon_months` | целое от 1 до 12 |
| `params.use_bonus_balance` | `true` или `false` |
| Прочие ключи (в том числе `schema`) | ошибка «неизвестное поле» |

Ошибки проверки — 400 `invalid`, при ошибке ничего не сохраняется. `errors` в том же виде, что у остальных
эндпоинтов: ошибка поля — по пути к нему, ошибка раздела целиком — списком, ошибка всего тела — в `non_field_errors`.

```json
{"detail": "Некорректные данные", "code": "invalid",
 "errors": {"weights": {"prolong_wait": ["допустимо от 0 до 100"]},
            "thresholds": {"medium": ["порог среднего риска должен быть меньше порога высокого"]}}}
```

`{"weights": ["хотя бы один признак должен иметь вес больше 0"]}` — пример ошибки раздела.

`schema` позволяет фронту нарисовать форму без хардкода признаков: тип поля, диапазон и значение по умолчанию (для кнопки «Сбросить»).

## Аутентификация

| Метод | Путь | Поведение |
|---|---|---|
| POST | `/api/v1/auth/login` | `{username, password}` → 200 + cookie сессии, 400/401 при ошибке |
| GET | `/api/v1/auth/me` | 200 `{id, username, first_name, last_name, email, is_staff, is_superuser}` или 401/403 |
| GET | `/api/v1/auth/passkeys` | `{sso_enabled, sso_account, passkeys: [{id, label, created_at}]}` — свои ключи доступа для SSO |
| POST | `/api/v1/auth/passkeys/setup` | `{url}`: куда отправить браузер, чтобы создать ключ в Keycloak. Без учётной записи SSO нужен `{password}` от панели |
| DELETE | `/api/v1/auth/passkeys/{id}` | удалить свой ключ, 204 |
| GET | `/api/v1/auth/oidc/passkey?next=` | редирект в Keycloak на создание ключа (`kc_action`), затем обратно на `next` |
| GET | `/api/v1/auth/config` | без сессии, `{"oidc_enabled": false}`: показывать ли кнопку SSO (`OIDC_ENABLED` в `.env`) |
| GET | `/api/v1/auth/oidc/login?next=/customers` | редирект на страницу входа провайдера (404, если SSO выключен) |
| GET | `/api/v1/auth/oidc/callback` | сюда провайдер возвращает пользователя: сессия и редирект на `next`, при ошибке на `/login?error=sso` |

Через SSO входят только пользователи, заведённые в «Админке»: панель находит их по email
(провайдер должен его подтвердить) и пускает, если они уже входили по паролю и не заблокированы.
Новых пользователей SSO не создаёт.
| POST | `/api/v1/auth/logout` | 204, сессия сброшена |
| GET | `/api/v1/auth/csrf` | выставляет cookie `csrftoken` (нужен SPA до первого POST) |

## SSE: `GET /api/v1/events`

Событие `recalculated`, данные: `{"reason": "settings|snapshot", "at": "...", "summary": {...}}`. Каждые 15 секунд `: ping`, чтобы соединение не рвалось прокси.

## Администрирование (только `is_staff`)

Раздел «Админка» в панели. Без сессии 401, для пользователя без `is_staff` 403. Списки постраничные,
как `/customers`: `{count, page, page_size, results}`.

| Метод | Путь | Что делает |
|---|---|---|
| GET | `/api/v1/admin/users?search=` | пользователи: `id, username, first_name, last_name, email, is_active, is_staff, is_superuser, date_joined, last_login` |
| POST | `/api/v1/admin/users` | создать: `{username, first_name, last_name, email, password}`; email обязателен и уникален, пароль проверяется валидаторами Django. При включённом SSO пользователь сразу создаётся и в Keycloak |
| GET, PATCH | `/api/v1/admin/users/{id}` | изменить `is_active`, `is_staff`, `email`, задать новый `password`. Удаления нет, только блокировка |
| GET | `/api/v1/admin/recalculations` | история пересчётов: `reason`, `calculated_at`, `duration_seconds`, `by_level`, `score_avg`, деньги |
| GET | `/api/v1/admin/status-events?new_status=&customer_id=&service_id=` | журнал смен статусов услуг |

Правила для пользователей:

- у своей учётной записи нельзя изменить `is_active` и `is_staff`, чтобы не потерять доступ;
- `is_staff` выдаёт и снимает только суперпользователь;
- суперпользователя может изменить только суперпользователь;
- изменения уходят в Keycloak; если он недоступен — 400 с `non_field_errors: ["SSO: ..."]`, в панели ничего не меняется.

Ошибки — 400 `invalid`, сообщения по полям в `errors`, например `{"password": ["Введённый пароль слишком короткий..."]}`.
