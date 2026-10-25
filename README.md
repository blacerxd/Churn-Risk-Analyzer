# Churn Risk Analyzer

Панель для поиска клиентов хостинга, которые могут уйти. По данным аккаунтов, услуг и
транзакций система считает для каждого клиента score риска оттока, объясняет причины и
оценивает, сколько денег можно потерять. Коэффициенты модели меняются в панели, результаты
пересчитываются и обновляются у всех открытых вкладок без перезагрузки.

Развёрнутая версия: https://churn-risk.duckdns.org

## Запуск

Нужны Docker и Docker Compose.

```bash
cp .env.example .env
docker compose up -d --build
```

Через минуту панель доступна на http://localhost:8080.

Логин и пароль берутся из `DJANGO_SUPERUSER_USERNAME` и `DJANGO_SUPERUSER_PASSWORD` в `.env`,
по умолчанию `admin` / `admin`. Администратор создаётся при первом старте.

| Адрес | Что там |
|---|---|
| http://localhost:8080 | Панель |
| http://localhost:8080/api/v1/docs | Swagger UI |
| http://localhost:8080/api/v1/schema | OpenAPI-схема (она же лежит в `backend/openapi.yml`) |
| http://localhost:8080/metrics | Метрики Prometheus, нужен токен |
| http://localhost:8080/admin | Админка Django |

```bash
curl -H "Authorization: Bearer <METRICS_TOKEN из .env>" http://localhost:8080/metrics
```

Настройки модели и данные хранятся в PostgreSQL на томе `pgdata` и переживают
`docker compose down && docker compose up`. Чтобы начать с чистой базы: `docker compose down -v`.

## Данные

При первом старте пустая база заполняется набором из кейса и демонстрационными сценариями,
даты сдвигаются так, что опорная дата набора совпадает с текущим моментом. Поведение
задаёт `SAMPLE_AUTOLOAD` в `.env`: `extended` (по умолчанию), `case` (только набор кейса) или `none`.

Загрузить заново или другой набор:

```bash
docker compose exec backend python manage.py load_sample --extended   # кейс + демо-сценарии
docker compose exec backend python manage.py load_sample              # только кейс
```

Свой снимок в формате исходной системы загружается на странице «Данные» или через API
`PUT /api/v1/source/snapshot`. Формат и ошибки проверки описаны в
[docs/api-contract.md](docs/api-contract.md), наборы и сценарии — в
[sample-data/README.md](sample-data/README.md).

Загрузка заменяет данные целиком в одной транзакции. Если снимок не прошёл проверку,
ничего не меняется, а в ответе есть список ошибок с путём к полю.

## Модель

Четыре признака из условий кейса, каждый даёт значение от 0 до 1 и текст причины:

| Признак | Вес по умолчанию |
|---|---|
| Услуга скоро заканчивается, автопродление выключено | 70 |
| Не хватает средств на ближайшие продления | 50 |
| Услуга в статусе `prolong_wait` | 80 |
| Клиент часто не оплачивает заказы (`not_performed`) | 20 |

Вес — вероятность ухода в процентах, если причина проявилась полностью. Признаки
считаются независимыми причинами: `score = (1 − Π(1 − вес/100 × значение)) × 100`.
Уровень `high` от 65, `medium` от 35, иначе `low`. Если у клиента нет действующих услуг,
оценки нет (`none`).

Ожидаемая потеря клиента = вероятность ухода × месячная стоимость его услуг × горизонт
потерь. Итог по портфелю — сумма по клиентам, пояснение формулы показано на главной.

Подробно, с обоснованием выбора формулы: [docs/model.md](docs/model.md).

### Как добавить признак

1. Создать модуль в `backend/analytics/features/` с функцией от `CustomerContext`, которая
   возвращает `FeatureResult(value, explanation)`, и обернуть её в
   `@feature(key, title, default_weight, description)`.
2. Импортировать модуль в `backend/analytics/features/__init__.py`.

Вес нового признака появится в настройках и в форме панели сам: форма строится по схеме
из `GET /api/v1/model/settings`, миграции не нужны.

## Как устроено

```
браузер ─► nginx (frontend) ─┬─► статика React
                             ├─► /api, /metrics ─► Django + DRF (uvicorn) ─► PostgreSQL
                             └─► /kc ─► Keycloak (если включён SSO)
```

- `backend/customers` — модели источника (клиенты, услуги, транзакции) и импорт снимка.
- `backend/analytics` — признаки, расчёт score и денег, настройки модели, пересчёт.
- `backend/api` — REST API, аутентификация, SSE, `/metrics`.
- `frontend` — React + TypeScript + TanStack Query.

Пересчёт запускается после загрузки снимка и после сохранения настроек, в той же транзакции.
Результаты пишутся в `RiskAssessment` (по клиенту) и `AnalyticsSnapshot` (итоги). Из
`AnalyticsSnapshot` читают и панель, и `/metrics`, поэтому цифры совпадают. После
пересчёта сервер отправляет событие `recalculated` в `GET /api/v1/events` (SSE), и панель
перезапрашивает данные.

Все эндпоинты, кроме входа, требуют сессии. `/metrics` закрыт отдельным токеном.

## Вход через SSO: OIDC и FIDO2

Кроме логина и пароля можно входить через OIDC-провайдера. Для демонстрации в Compose есть
Keycloak с готовым realm `churn` (`keycloak/churn-realm.json`) и пользователем `analyst`.
В Keycloak вход без пароля: по FIDO2-ключу или passkey (YubiKey, Touch ID, Windows Hello,
телефон). Панель получает от Keycloak обычный OIDC-ответ и про способ входа ничего не знает.

В `.env`:

```bash
COMPOSE_PROFILES=oidc
OIDC_ENABLED=true
OIDC_PUBLIC_URL=http://localhost:8080      # адрес, по которому открывают панель
OIDC_CLIENT_SECRET=<случайная строка>
OIDC_DEMO_PASSWORD=<пароль для первого входа analyst>
KEYCLOAK_ADMIN_PASSWORD=<случайная строка>
```

После `docker compose up -d` на странице входа появится кнопка «Войти через SSO».

1. Первый вход: логин `analyst`, пароль `OIDC_DEMO_PASSWORD`, затем Keycloak сразу просит
   зарегистрировать ключ.
2. Дальше: логин и подтверждение ключом. Как только у пользователя есть ключ, пароль
   на этом шаге не принимается.

WebAuthn работает только по HTTPS или на `localhost`, ключ привязан к домену панели.

Keycloak доступен через тот же nginx по пути `/kc`, наружу открыты только страницы входа.
Он работает в dev-режиме со встроенной базой на томе `keycloak-data`, поэтому
зарегистрированные ключи переживают перезапуск. Realm импортируется только в пустой том:
после правки `keycloak/churn-realm.json` выполните
`docker compose down keycloak && docker volume rm churn-risk-analyzer_keycloak-data`
(ключи придётся зарегистрировать заново).

Пользователь панели создаётся при первом входе, логин — его email. Локальные учётные
записи с правами staff через SSO не открываются. Для другого провайдера укажите
`OIDC_ISSUER_URL` и `OIDC_ISSUER_INTERNAL_URL` (оба — адрес issuer), `OIDC_CLIENT_ID` и
`OIDC_CLIENT_SECRET`, в провайдере разрешите redirect URI
`<адрес панели>/api/v1/auth/oidc/callback`. Пути эндпоинтов по умолчанию как у Keycloak,
для других провайдеров их можно задать через `OIDC_OP_AUTHORIZATION_ENDPOINT`,
`OIDC_OP_TOKEN_ENDPOINT`, `OIDC_OP_USER_ENDPOINT`, `OIDC_OP_JWKS_ENDPOINT`.

## Переменные окружения

| Переменная | Назначение |
|---|---|
| `DJANGO_SECRET_KEY` | Секретный ключ Django, на сервере — случайная строка |
| `DJANGO_DEBUG` | `true` только для разработки |
| `DJANGO_ALLOWED_HOSTS` | Домены, по которым открывается сайт, через запятую |
| `DJANGO_CSRF_TRUSTED_ORIGINS` | Те же адреса со схемой, например `https://example.com` |
| `DJANGO_SECURE_COOKIES` | `true`, если сайт открывается по HTTPS |
| `POSTGRES_DB`, `POSTGRES_USER`, `POSTGRES_PASSWORD` | База данных |
| `POSTGRES_HOST`, `POSTGRES_PORT` | Для запуска backend без Docker, в Compose подставляются сами |
| `DJANGO_SUPERUSER_USERNAME`, `DJANGO_SUPERUSER_PASSWORD`, `DJANGO_SUPERUSER_EMAIL` | Администратор, создаётся при старте |
| `METRICS_TOKEN` | Токен для `/metrics`, пустое значение закрывает эндпоинт |
| `SAMPLE_AUTOLOAD` | Чем заполнить пустую базу: `extended`, `case`, `none` |
| `SNAPSHOT_MAX_BYTES` | Максимальный размер снимка, по умолчанию 20 МБ |
| `OIDC_ENABLED` | Включить вход через SSO, см. раздел выше |
| `COMPOSE_PROFILES`, `OIDC_PUBLIC_URL`, `OIDC_CLIENT_SECRET`, `OIDC_DEMO_PASSWORD`, `KEYCLOAK_ADMIN_PASSWORD` | Встроенный Keycloak |

## Разработка

```bash
docker compose up -d db                 # PostgreSQL на localhost:5433

cd backend
python -m venv .venv && . .venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py load_sample --extended
python manage.py runserver

cd frontend
npm ci
npm run dev                             # http://localhost:5173, /api проксируется на :8000
npm run dev:mock                        # без backend, на моках MSW
```

Тесты и проверки, те же, что в CI:

```bash
cd backend && pytest
cd frontend && npm run lint && npm run build
```

После изменения API обновите схему: `python manage.py spectacular --file openapi.yml`,
иначе CI не пропустит изменения.

Каждый push в `main` прогоняет тесты в GitHub Actions и выкатывает проект на сервер.
