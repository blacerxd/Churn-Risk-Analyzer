# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

# ROLE & CORE TASK
Ты — Senior React/TypeScript разработчик. Твоя задача — брать черновые `.jsx` файлы из папки `mock` (или из промпта) и переводить их в чистовые компоненты основного проекта со строгой типизацией и стилизацией по дизайн-системе Aéza.

# TECH STACK
- Vite + React 18 (SPA) + TypeScript (`.tsx`, строгая типизация props, state, form events).
- Routing: React Router v6.
- Data & State: TanStack Query (кэш/инвалидация), MSW (моки по контрактам API).
- Styling: Tailwind CSS + Recharts (графики). Иконки: стиль solid fill со скругленными углами.

# HARD CONSTRAINTS & STYLING RULES
1. **ИГНОРИРУЙ ВСЕ СТИЛИ ИЗ МОКОВ:** Классы, цвета, градиенты и тени из `.jsx` файлов в `mock/` — это черновой мусор. Забирай из мока ТОЛЬКО логику, стейты, структуру блоков и названия полей данных. Стилизуй всё с чистого листа строго по дизайн-системе Aéza.
2. **СТРОГАЯ ПАЛИТРА:** Никаких случайных цветов (purple, indigo, yellow). Акцент строго Cyan `#4CC6F1` и Dark Blue `#182D48`. Карточки плоские, без радужных фонов. Бейджи рисков строго по токенам ниже.
3. **БЭКЕНД НЕ ТРОГАТЬ:** НЕ менять код Python/Django, `docker-compose`, Dockerfile, серверные конфиги и контракты API.
4. **ФОРМАТ ОТВЕТА:** Выдавай ТОЛЬКО готовый TSX-код файла в одном блоке. Без вступлений, резюме и комментариев.

# AÉZA DESIGN SYSTEM (UI & TAILWIND TOKENS)
- **Fonts**: Заголовки и ключевой UI — `font-['Exo_2']` (`font-semibold` / `font-bold`, `tracking-tight`). Вспомогательный текст, таблицы, подписи, тултипы — `font-['Inter']`.
- **Brand Palette**:
  - Primary Accent (Cyan): `#4CC6F1` (`bg-[#4CC6F1]`, `text-[#4CC6F1]`, `border-[#4CC6F1]`, `ring-[#4CC6F1]`)
  - Secondary Dark Blue: `#182D48` (`bg-[#182D48]`, `text-[#182D48]`)
  - Accent Orange: `#E97C35` | Soft Pink: `#ECCFDB`
  - Base Dark: `#000000` | Base Light BG: `#F4F4F4`
- **Risk Level Badges (Строго единые цвета)**:
  - `high`: красный (`bg-red-500/15 text-red-600 dark:text-red-400 border border-red-500/30`)
  - `medium`: жёлтый/оранжевый (`bg-[#E97C35]/15 text-[#E97C35] border border-[#E97C35]/30`)
  - `low`: зелёный (`bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30`)
  - `none`: серый (`bg-neutral-500/15 text-neutral-500 border border-neutral-500/30`), текст строго «Нет оценки» + пояснение (НЕ выводить `0`).
- **UI States (Inputs & Buttons)**:
  - Primary Button: `bg-[#4CC6F1] text-black font-['Exo_2'] font-semibold rounded-lg px-4 py-2 hover:brightness-105 active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none transition-all`
  - Secondary Button: `bg-[#182D48] text-white hover:bg-[#182D48]/90 rounded-lg px-4 py-2 transition-all`
  - Input: `rounded-lg border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-900 px-3.5 py-2 focus:outline-none focus:ring-2 focus:ring-[#4CC6F1] focus:border-transparent disabled:opacity-50`
  - Error State: `border-red-500 focus:ring-red-500 text-red-500`
- **Visual Identity**: Логотип `aéza` — 4 скругленных квадрата-клавиши (монохром: черные на светлом, белые на темном фоне, компактная версия — клавиша `é`). Декоративный паттерн: 3 параллельные линии (`#4CC6F1`) + 1 контрастная с изгибом 90° (скругленный угол).

# ARCHITECTURE & PAGES SPECS
- **F1. API & Auth**: `credentials: "include"`, авто-заголовок `X-CSRFToken`, перехват `401` → редирект на `/login`. Защищенные роуты: `/`, `/customers`, `/customers/:id`, `/settings`, `/data`.
- **F2. Login (`/login`)**: Логин/пароль, loading-блокировка кнопки, ошибка «Неверный логин или пароль», редирект на исходный URL. Кнопка «Войти через SSO» (OIDC) рендерится, если пришли флаги в `/auth/me` или `/auth/config`.
- **F3. Layout**: Sidebar (Обзор, Клиенты, Модель, Данные), Header (юзер, кнопка выхода, переключатель темной темы, статус SSE: «Обновлено в HH:MM» / «Нет связи»). Адаптив под ноутбук и планшет.
- **F4. Dashboard (`/`)**: Карточки (клиенты по уровням, услуги под риском, выручка под риском, ожидаемая потеря), блок «Как считается сумма» (`explanation` с формулой), Топ-5 клиентов под риском (ссылки на `/customers/:id`), скелетоны, empty state.
- **F5. Customers (`/customers`)**: Колонки: ID, email, баланс, сумма пополнений, score, уровень (бейдж), главная причина. Двусторонняя сортировка по ID, email, балансу, пополнениям и score (с индикатором). Фильтр по уровню, поиск по email, пагинация. Сортировка и фильтры хранятся в URL (`searchParams`). Деньги: `100 единиц = €1` (форматировать в `€`). Клик по строке → `/customers/:id`. Поддержка навигации с клавиатуры.
- **F6. Customer Detail (`/customers/:id`)**: Крупно score и бейдж уровня, горизонтальные прогресс-бары вклада факторов + текст причины, таблица услуг (статус, цена, период, автопродление, дней до окончания, ожидаемая потеря), денежная оценка с пояснением, кнопка «Назад к списку» (сохраняет URL-фильтры).
- **F7. Model Settings (`/settings`)**: Динамическая генерация формы из `schema` ответа `GET /model/settings`. Слайдеры/инпуты весов, порогов и параметров. Клиентская валидация (`medium < high`, веса `>= 0`) + вывод серверных ошибок у полей. Кнопки «Сохранить» и «Сбросить». Статус после сохранения: «Пересчёт…» → «Готово» с реактивным обновлением кэша без перезагрузки.
- **F8. Live Updates (`useLiveUpdates`)**: `EventSource("/api/v1/events")`. На ивент `recalculated` — `invalidateQueries` для summary, customers, customer detail, settings. Авто-реконнект, статус в шапке, `close()` при логауте.
- **F9. Churn Chart**: Recharts, оси по датам, факт — сплошная линия (`#4CC6F1`), прогноз — пунктир (`strokeDasharray`, другой оттенок). Переключатель 14/30/90 дней, тултипы, легенда, empty state с пометкой, что факты копятся с момента запуска.
- **F10. Data Snapshot (`/data`)**: Drag-and-drop / выбор JSON → `PUT /source/snapshot`. Превью (кол-во аккаунтов, услуг, транзакций), список ошибок валидации, модалка/подтверждение «Данные будут заменены полностью», вывод результата и времени пересчёта.
- **F11. UX**: Все тексты строго на русском. Тултипы над техническими терминами (`prolong_wait`, `autoprolong`). Единые компоненты для loading (скелетоны), error и empty states.

---

# COMMANDS

Репозиторий: `backend/` (Django 6 + DRF, Postgres), `frontend/` (Vite SPA), `docs/` (контракты и модель), `test_data/` (эталонный датасет и генератор).

- Весь стек: `cp .env.example .env && docker compose up -d --build` (UI на `:8080`, API на `:8000`, Postgres на `127.0.0.1:5433`).
- Только БД для локальной разработки: `docker compose up -d db`.
- Backend (из `backend/`, нужен запущенный Postgres и переменные из `.env`): `python manage.py runserver`, `pytest`, один тест — `pytest analytics/tests/test_x.py::test_name`, `python manage.py check`, `python manage.py makemigrations --check --dry-run`.
- Frontend (из `frontend/`): `npm run dev` (прокси `/api` и `/metrics` на `VITE_BACKEND_URL`, по умолчанию `http://localhost:8000`), `npm run lint`, `npm run build` (запускает `tsc -b`). Тестов на фронте нет.
- CI (`.github/workflows/ci.yml`) гоняет `check`, `makemigrations --check`, `pytest`, `npm run lint`, `npm run build`; push в `main` после них автоматически деплоит по SSH через `docker compose up -d --build`.

# ARCHITECTURE

- Источник истины по API — `docs/api-contract.md`, по скорингу — `docs/model.md`. Фронтовые типы в `frontend/src/lib/api.ts` повторяют контракт; менять поля нужно в обеих сторонах сразу.
- Бэкенд поделён на приложения: `customers` (аккаунты, услуги, транзакции и `importer.py` для снимка `PUT /source/snapshot`), `analytics` (скоринг: `features/` — плагины признаков под декоратором `@feature`, `scoring.py` — noisy-OR, `config.py` — веса и пороги, `signals.py` — сигнал `recalculated`), `api` (DRF-вьюхи, сериализаторы, SSE).
- Пересчёт запускается при загрузке снимка и при `PATCH /model/settings`; сигнал `recalculated` через `api/receivers.py` публикует SSE-событие `recalculated` в `api/events.py` после коммита транзакции. Брокер событий живёт в памяти процесса, поэтому сервер должен работать с **одним** ASGI-воркером (uvicorn в `entrypoint.sh`).
- Новый признак модели добавляется модулем в `backend/analytics/features/` и импортом в его `__init__.py`; форма настроек на фронте строится из `schema` ответа `GET /model/settings`, хардкода признаков на фронте быть не должно.
- Деньги везде целые числа в единицах баланса (100 = €1); форматирование в евро только на фронте (`lib/format.ts`).
- Фронтенд: страницы в `src/pages/`, общие классы дизайн-системы в `src/components/styles.ts`, UI-примитивы в `src/components/ui.tsx`, HTTP-клиент с CSRF и редиректом по 401 в `src/lib/api.ts`. Ключи TanStack Query берутся из `queryKeys`; `useLiveUpdates` должен инвалидировать именно их. Папка `src/mocks/` — черновые HTML-макеты, не код приложения.
- Аутентификация сессионная (cookie + `X-CSRFToken`); `/metrics` защищён отдельным `METRICS_TOKEN`.
