<!DOCTYPE html>

<html class="h-full bg-surface-canvas" lang="ru"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>Aéza Churn Risk — Источники данных и интеграции</title>
<!-- Fonts -->
<link href="https://fonts.googleapis.com" rel="preconnect"/>
<link crossorigin="" href="https://fonts.gstatic.com" rel="preconnect"/>
<link href="https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<!-- Tailwind CSS -->
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<script id="tailwind-config">
    tailwind.config = {
      darkMode: "class",
      theme: {
        extend: {
          "colors": {
            "inverse-surface": "#2a313d",
            "surface": "#f9f9ff",
            "risk-medium-surface": "#FEF3C7",
            "on-secondary-fixed-variant": "#47464a",
            "tertiary-fixed-dim": "#b6cacd",
            "risk-medium": "#F59E0B",
            "on-error-container": "#93000a",
            "secondary-fixed": "#e4e1e6",
            "text-muted": "#6B7280",
            "on-background": "#151c27",
            "on-primary": "#ffffff",
            "risk-low": "#10B981",
            "on-secondary": "#ffffff",
            "surface-card": "#F3F4F6",
            "tertiary": "#4f6264",
            "surface-tint": "#006877",
            "primary-fixed-dim": "#5cd6ee",
            "on-secondary-fixed": "#1b1b1e",
            "on-primary-container": "#003740",
            "primary-container": "#11a8bf",
            "on-tertiary": "#ffffff",
            "surface-container-low": "#f0f3ff",
            "on-secondary-container": "#656467",
            "on-surface": "#151c27",
            "surface-bright": "#f9f9ff",
            "outline-variant": "#bcc9cc",
            "outline": "#6d797c",
            "cyan-gradient-start": "#0891B2",
            "tertiary-fixed": "#d2e6e9",
            "surface-container-lowest": "#ffffff",
            "on-primary-fixed": "#001f25",
            "primary": "#006877",
            "inverse-primary": "#5cd6ee",
            "surface-variant": "#dce2f3",
            "background": "#f9f9ff",
            "accent-icon": "#0D8A9E",
            "inverse-on-surface": "#ebf1ff",
            "on-primary-fixed-variant": "#004e5a",
            "on-error": "#ffffff",
            "surface-container": "#e7eefe",
            "risk-high": "#EF4444",
            "on-tertiary-fixed": "#0c1e21",
            "on-tertiary-container": "#233537",
            "on-surface-variant": "#3d494c",
            "tertiary-container": "#8a9da0",
            "text-primary": "#111827",
            "on-tertiary-fixed-variant": "#384a4c",
            "error-container": "#ffdad6",
            "surface-container-highest": "#dce2f3",
            "surface-card-alt": "#F5F6F8",
            "cyan-gradient-end": "#15B8CF",
            "surface-canvas": "#FFFFFF",
            "secondary-fixed-dim": "#c8c5ca",
            "risk-low-surface": "#D1FAE5",
            "secondary": "#5f5e61",
            "risk-high-surface": "#FEE2E2",
            "secondary-container": "#e4e1e6",
            "primary-fixed": "#a4eeff",
            "error": "#ba1a1a",
            "surface-dim": "#d3daea",
            "surface-container-high": "#e2e8f8",
            "surface-canvas-subtle": "#F4F5F7"
          },
          "borderRadius": {
            "DEFAULT": "1rem",
            "lg": "2rem",
            "xl": "3rem",
            "full": "9999px"
          },
          "spacing": {
            "margin": "2rem",
            "space-lg": "1.5rem",
            "space-xl": "2rem",
            "space-sm": "0.5rem",
            "margin-mobile": "1rem",
            "space-md": "1rem",
            "gutter-mobile": "1rem",
            "gutter": "1.5rem",
            "space-xs": "0.25rem",
            "space-2xl": "3rem"
          },
          "fontFamily": {
            "display-mobile": ["Geist"],
            "stat-mono": ["Geist"],
            "headline-sm": ["Geist"],
            "label-sm": ["Geist"],
            "display": ["Geist"],
            "headline-md": ["Geist"],
            "title-md": ["Geist"],
            "body-md": ["Geist"],
            "body-sm": ["Geist"],
            "body-lg": ["Geist"],
            "headline-lg-mobile": ["Geist"],
            "label-md": ["Geist"],
            "headline-lg": ["Geist"],
            "label-lg": ["Geist"]
          },
          "fontSize": {
            "display-mobile": ["32px", { "lineHeight": "40px", "letterSpacing": "-0.02em", "fontWeight": "700" }],
            "stat-mono": ["28px", { "lineHeight": "32px", "letterSpacing": "-0.02em", "fontWeight": "700" }],
            "headline-sm": ["18px", { "lineHeight": "24px", "letterSpacing": "-0.01em", "fontWeight": "600" }],
            "label-sm": ["11px", { "lineHeight": "14px", "letterSpacing": "0.04em", "fontWeight": "600" }],
            "display": ["48px", { "lineHeight": "56px", "letterSpacing": "-0.03em", "fontWeight": "700" }],
            "headline-md": ["22px", { "lineHeight": "28px", "letterSpacing": "-0.015em", "fontWeight": "600" }],
            "title-md": ["16px", { "lineHeight": "22px", "letterSpacing": "-0.005em", "fontWeight": "600" }],
            "body-md": ["14px", { "lineHeight": "20px", "fontWeight": "400" }],
            "body-sm": ["12px", { "lineHeight": "16px", "fontWeight": "400" }],
            "body-lg": ["16px", { "lineHeight": "24px", "fontWeight": "400" }],
            "headline-lg-mobile": ["24px", { "lineHeight": "32px", "letterSpacing": "-0.01em", "fontWeight": "600" }],
            "label-md": ["12px", { "lineHeight": "16px", "fontWeight": "500" }],
            "headline-lg": ["32px", { "lineHeight": "40px", "letterSpacing": "-0.02em", "fontWeight": "700" }],
            "label-lg": ["14px", { "lineHeight": "20px", "fontWeight": "500" }]
          }
        }
      }
    }
  </script>
</head>
<body class="h-full bg-surface-canvas text-text-primary antialiased flex flex-row overflow-hidden font-body-md text-body-md">
<!-- 1. LEFT FIXED SIDEBAR (~240px) -->
<aside class="w-60 flex-shrink-0 bg-surface-canvas-subtle flex flex-col justify-between p-5 select-none h-full z-20">
<div class="flex flex-col gap-8">
<!-- Logo block -->
<div class="flex items-center gap-2.5 px-1 pt-1">
<div class="w-8 h-8 rounded-full bg-primary-container flex items-center justify-center text-on-primary font-bold text-headline-sm shadow-sm">
          é
        </div>
<span class="font-headline-sm text-headline-sm font-bold text-text-primary tracking-tight">aéza</span>
<span class="bg-surface-card text-text-muted px-2 py-0.5 rounded-full font-label-sm text-label-sm font-semibold">
          Intelligence
        </span>
</div>
<!-- Navigation links -->
<nav class="flex flex-col gap-1.5">
<a class="flex items-center gap-3 px-3.5 py-2.5 rounded-full font-label-lg text-label-lg text-text-muted hover:bg-surface-card transition-colors duration-200" href="#overview">
<span class="material-symbols-outlined text-outline text-[20px]">dashboard</span>
<span>Обзор</span>
</a>
<a class="flex items-center justify-between px-3.5 py-2.5 rounded-full font-label-lg text-label-lg text-text-muted hover:bg-surface-card transition-colors duration-200" href="#clients">
<div class="flex items-center gap-3">
<span class="material-symbols-outlined text-outline text-[20px]">group</span>
<span>Клиенты</span>
</div>
<span class="bg-surface-card font-label-sm text-label-sm text-text-muted px-2 py-0.5 rounded-full">300</span>
</a>
<a class="flex items-center gap-3 px-3.5 py-2.5 rounded-full font-label-lg text-label-lg text-text-muted hover:bg-surface-card transition-colors duration-200" href="#model">
<span class="material-symbols-outlined text-outline text-[20px]">neurology</span>
<span>Модель</span>
</a>
<!-- ACTIVE ITEM: Данные -->
<a class="flex items-center gap-3 px-3.5 py-2.5 rounded-full font-label-lg text-label-lg bg-[#18181B] text-on-primary font-semibold shadow-sm transition-transform active:scale-95 duration-150" href="#data">
<span class="material-symbols-outlined text-[20px] text-primary-fixed-dim" style="font-variation-settings: 'FILL' 1;">database</span>
<span>Данные</span>
</a>
</nav>
</div>
<!-- Sidebar Bottom info -->
<div class="flex flex-col gap-4 pt-4">
<div class="bg-surface-canvas rounded-2xl p-3 flex flex-col gap-1.5 shadow-sm">
<div class="flex items-center gap-1.5">
<span class="w-2 h-2 rounded-full bg-risk-low animate-pulse"></span>
<span class="font-label-sm text-label-sm font-semibold text-text-primary">CatBoost v2.4.1</span>
</div>
<p class="font-label-sm text-label-sm text-text-muted leading-tight">Инференс в реальном времени</p>
</div>
<div class="flex items-center gap-3 px-1.5 py-1">
<div class="w-9 h-9 rounded-full bg-surface-card flex items-center justify-center text-text-primary font-semibold font-title-md">
          А
        </div>
<div class="flex flex-col min-w-0">
<span class="font-label-lg text-label-lg font-semibold text-text-primary truncate">Алексей</span>
<span class="font-label-sm text-label-sm text-text-muted truncate">Risk Analyst</span>
</div>
</div>
</div>
</aside>
<!-- MAIN VIEWPORT WRAPPER -->
<div class="flex-1 flex flex-col h-full min-w-0 overflow-y-auto">
<!-- 2. TOP STATUS-BAR (Topbar) -->
<header class="w-full flex-shrink-0 bg-surface-canvas sticky top-0 z-10 flex items-center justify-between px-8 py-4">
<div class="flex items-center gap-2 font-label-lg text-label-lg">
<span class="text-text-muted">Платформа</span>
<span class="text-text-muted font-label-sm text-label-sm">›</span>
<span class="font-headline-sm text-headline-sm font-bold text-text-primary tracking-tight">Данные</span>
</div>
<div class="flex items-center gap-4">
<!-- Live status indicator -->
<div class="flex items-center gap-2 bg-surface-card px-3.5 py-1.5 rounded-full font-label-sm text-label-sm text-text-muted">
<span class="w-2 h-2 rounded-full bg-risk-low"></span>
<span class="font-semibold text-text-primary">WS Live</span>
<span class="text-text-muted">•</span>
<span>Обновлено 12 с назад</span>
</div>
<!-- Sync Button -->
<button class="flex items-center gap-1.5 bg-surface-card hover:bg-surface-variant/50 text-text-primary font-label-md text-label-md px-3.5 py-2 rounded-full transition-colors active:scale-95 duration-150" id="syncButton">
<span class="material-symbols-outlined text-[16px] text-accent-icon" id="syncIcon">sync</span>
<span>Синхронизировать</span>
</button>
<!-- Metrics Link -->
<a class="bg-surface-card hover:bg-surface-variant/50 text-text-primary font-label-md text-label-md px-3 py-2 rounded-full transition-colors" href="#metrics">
          /metrics
        </a>
<!-- Language Switcher -->
<button class="flex items-center gap-1 bg-surface-card hover:bg-surface-variant/50 text-text-primary font-label-md text-label-md px-3 py-2 rounded-full transition-colors">
<span>🌐</span>
<span class="font-semibold">RU</span>
</button>
</div>
</header>
<!-- 3. PAGE CONTENT CONTAINER -->
<main class="flex-1 px-8 py-6 max-w-7xl w-full mx-auto flex flex-col gap-6">
<!-- Page Headline & Subtitle -->
<div class="flex flex-col gap-1">
<h1 class="font-headline-lg text-headline-lg font-bold text-text-primary">
          Источники данных и интеграции
        </h1>
<p class="font-body-md text-body-md text-text-muted">
          Управление входящими потоками данных биллинга, подписок и транзакций для инференса модели.
        </p>
</div>
<!-- KPI / Source Summary Row (3 Bento cards, 24px rounded) -->
<div class="grid grid-cols-1 md:grid-cols-3 gap-6">
<!-- Card 1: Active Sources -->
<div class="bg-surface-card rounded-[24px] p-6 flex flex-col justify-between">
<div class="flex items-start justify-between">
<div class="flex flex-col gap-1">
<span class="font-label-md text-label-md text-text-muted">Активные источники</span>
<div class="flex items-baseline gap-2 mt-1">
<span class="font-stat-mono text-stat-mono text-text-primary">4</span>
<span class="font-label-md text-label-md text-text-muted">подключено</span>
</div>
</div>
<span class="bg-risk-low-surface text-risk-low font-label-sm text-label-sm px-2.5 py-1 rounded-full font-semibold">
              Все в норме
            </span>
</div>
<div class="mt-4 pt-4 border-t border-black/5 flex flex-wrap gap-1.5 font-label-sm text-label-sm text-text-muted">
<span class="bg-surface-canvas px-2.5 py-1 rounded-full">WHMCS</span>
<span class="bg-surface-canvas px-2.5 py-1 rounded-full">Aéza Cloud API</span>
<span class="bg-surface-canvas px-2.5 py-1 rounded-full">Stripe / ЮKassa</span>
<span class="bg-surface-canvas px-2.5 py-1 rounded-full">БД логов</span>
</div>
</div>
<!-- Card 2: Sample Volume -->
<div class="bg-surface-card rounded-[24px] p-6 flex flex-col justify-between">
<div class="flex items-start justify-between">
<div class="flex flex-col gap-1">
<span class="font-label-md text-label-md text-text-muted">Объем данных в выборке</span>
<div class="flex items-baseline gap-2 mt-1">
<span class="font-stat-mono text-stat-mono text-text-primary">300</span>
<span class="font-label-md text-label-md text-text-muted">клиентов</span>
</div>
</div>
<div class="w-8 h-8 rounded-full bg-[#E0F4F7] flex items-center justify-center text-accent-icon">
<span class="material-symbols-outlined text-[18px]">storage</span>
</div>
</div>
<div class="mt-4 pt-4 border-t border-black/5 flex justify-between font-label-sm text-label-sm text-text-muted">
<div>
<span class="font-bold text-text-primary">1 240</span> активных услуг
            </div>
<div>
<span class="font-bold text-text-primary">4 890</span> транзакций (90 дн)
            </div>
</div>
</div>
<!-- Card 3: Data Health -->
<div class="bg-surface-card rounded-[24px] p-6 flex flex-col justify-between">
<div class="flex items-start justify-between">
<div class="flex flex-col gap-1">
<span class="font-label-md text-label-md text-text-muted">Качество и полнота (Data Health)</span>
<div class="flex items-baseline gap-2 mt-1">
<span class="font-stat-mono text-stat-mono text-text-primary">98.4%</span>
<span class="font-label-sm text-label-sm text-risk-low bg-risk-low-surface px-2 py-0.5 rounded-full font-semibold">Валидно</span>
</div>
</div>
<div class="w-8 h-8 rounded-full bg-risk-low-surface flex items-center justify-center text-risk-low">
<span class="material-symbols-outlined text-[18px]">verified</span>
</div>
</div>
<div class="mt-4 pt-4 border-t border-black/5 flex items-center justify-between font-label-sm text-label-sm text-text-muted">
<span class="flex items-center gap-1">
<span class="w-1.5 h-1.5 rounded-full bg-risk-medium"></span>
              16 пропущенных значений
            </span>
<span class="text-text-muted">Автозаполнение медианой</span>
</div>
</div>
</div>
<!-- Drag & Drop / Dataset Upload Bento Section -->
<section class="bg-surface-card rounded-[24px] p-6 flex flex-col md:flex-row items-center justify-between gap-6 border-2 border-dashed border-outline-variant/60 hover:border-primary-container transition-colors duration-200">
<div class="flex items-center gap-5">
<div class="w-12 h-12 rounded-full bg-[#E0F4F7] flex items-center justify-center text-accent-icon flex-shrink-0">
<span class="material-symbols-outlined text-[24px]">cloud_upload</span>
</div>
<div class="flex flex-col gap-1">
<h2 class="font-headline-sm text-headline-sm font-semibold text-text-primary">
              Загрузить обновленный датасет клиентов или файл биллинга
            </h2>
<p class="font-body-sm text-body-sm text-text-muted">
              Перетащите файл сюда или выберите на диске. Поддерживаются форматы <span class="font-semibold text-text-primary">.csv</span>, <span class="font-semibold text-text-primary">.parquet</span>, <span class="font-semibold text-text-primary">.json</span> (до 250 MB).
            </p>
</div>
</div>
<div class="flex items-center gap-3 w-full md:w-auto justify-end flex-shrink-0">
<button class="bg-surface-canvas hover:bg-surface-card-alt text-text-primary font-label-md text-label-md px-4 py-2.5 rounded-full transition-colors border border-black/5 flex items-center gap-1.5 shadow-sm active:scale-95 duration-150">
<span class="material-symbols-outlined text-[16px] text-text-muted">download</span>
<span>Скачать шаблон CSV</span>
</button>
<label class="cursor-pointer bg-primary-container hover:bg-[#0EA1B7] text-on-primary font-label-md text-label-md px-5 py-2.5 rounded-full transition-transform active:scale-95 duration-150 shadow-sm flex items-center gap-2">
<span class="material-symbols-outlined text-[18px]">folder_open</span>
<span>Выбрать файл</span>
<input accept=".csv,.parquet,.json" class="hidden" type="file"/>
</label>
</div>
</section>
<!-- Connected Sources and Datasets Table -->
<section class="bg-surface-card rounded-[24px] p-6 flex flex-col gap-4">
<div class="flex items-center justify-between">
<div class="flex items-center gap-3">
<h2 class="font-headline-sm text-headline-sm font-semibold text-text-primary">
              Подключенные таблицы и пайплайны
            </h2>
<span class="bg-surface-canvas px-2.5 py-0.5 rounded-full font-label-sm text-label-sm text-text-muted font-semibold">
              4 таблицы
            </span>
</div>
<span class="font-label-sm text-label-sm text-text-muted">Периодичность опроса: каждые 60 секунд</span>
</div>
<!-- Table Container -->
<div class="overflow-x-auto">
<table class="w-full text-left border-collapse">
<thead>
<tr class="font-label-sm text-label-sm text-text-muted uppercase tracking-wider border-b border-black/5">
<th class="py-3 px-4 font-semibold">Источник / Таблица</th>
<th class="py-3 px-4 font-semibold">Тип</th>
<th class="py-3 px-4 font-semibold">Записей</th>
<th class="py-3 px-4 font-semibold">Синхронизация</th>
<th class="py-3 px-4 font-semibold">Статус</th>
<th class="py-3 px-4 font-semibold text-right">Действия</th>
</tr>
</thead>
<tbody class="divide-y divide-black/5 font-body-md text-body-md">
<!-- Row 1: customers_core -->
<tr class="hover:bg-surface-canvas/50 transition-colors">
<td class="py-4 px-4 flex items-center gap-3">
<div class="w-8 h-8 rounded-full bg-surface-canvas flex items-center justify-center text-primary">
<span class="material-symbols-outlined text-[18px]">badge</span>
</div>
<div class="flex flex-col">
<span class="font-semibold text-text-primary">customers_core</span>
<span class="font-label-sm text-label-sm text-text-muted">300 профилей (балансы, бонусы, рефералы)</span>
</div>
</td>
<td class="py-4 px-4">
<span class="bg-surface-canvas text-text-muted px-2.5 py-1 rounded-full font-label-sm text-label-sm">
                    API REST
                  </span>
</td>
<td class="py-4 px-4 font-semibold text-text-primary">300</td>
<td class="py-4 px-4 text-text-muted font-body-sm text-body-sm">2 мин назад</td>
<td class="py-4 px-4">
<span class="inline-flex items-center gap-1.5 bg-risk-low-surface text-risk-low font-label-sm text-label-sm px-2.5 py-1 rounded-full font-semibold">
<span class="w-1.5 h-1.5 rounded-full bg-risk-low"></span>
                    Синхронизировано
                  </span>
</td>
<td class="py-4 px-4 text-right">
<div class="inline-flex items-center gap-1">
<button class="px-3 py-1.5 rounded-full bg-surface-canvas hover:bg-surface-card-alt text-text-primary font-label-sm text-label-sm font-semibold transition-colors">
                      Обновить
                    </button>
<button class="p-1.5 rounded-full bg-surface-canvas hover:bg-surface-card-alt text-text-muted hover:text-text-primary transition-colors" title="Настройки маппинга">
<span class="material-symbols-outlined text-[16px]">tune</span>
</button>
</div>
</td>
</tr>
<!-- Row 2: subscriptions_active -->
<tr class="hover:bg-surface-canvas/50 transition-colors">
<td class="py-4 px-4 flex items-center gap-3">
<div class="w-8 h-8 rounded-full bg-surface-canvas flex items-center justify-center text-primary">
<span class="material-symbols-outlined text-[18px]">dns</span>
</div>
<div class="flex flex-col">
<span class="font-semibold text-text-primary">subscriptions_active</span>
<span class="font-label-sm text-label-sm text-text-muted">1 240 сервисов (VPS, Dedicated, Storage, Domains)</span>
</div>
</td>
<td class="py-4 px-4">
<span class="bg-surface-canvas text-text-muted px-2.5 py-1 rounded-full font-label-sm text-label-sm">
                    PostgreSQL DB
                  </span>
</td>
<td class="py-4 px-4 font-semibold text-text-primary">1 240</td>
<td class="py-4 px-4 text-text-muted font-body-sm text-body-sm">5 мин назад</td>
<td class="py-4 px-4">
<span class="inline-flex items-center gap-1.5 bg-risk-low-surface text-risk-low font-label-sm text-label-sm px-2.5 py-1 rounded-full font-semibold">
<span class="w-1.5 h-1.5 rounded-full bg-risk-low"></span>
                    Синхронизировано
                  </span>
</td>
<td class="py-4 px-4 text-right">
<div class="inline-flex items-center gap-1">
<button class="px-3 py-1.5 rounded-full bg-surface-canvas hover:bg-surface-card-alt text-text-primary font-label-sm text-label-sm font-semibold transition-colors">
                      Обновить
                    </button>
<button class="p-1.5 rounded-full bg-surface-canvas hover:bg-surface-card-alt text-text-muted hover:text-text-primary transition-colors" title="Настройки маппинга">
<span class="material-symbols-outlined text-[16px]">tune</span>
</button>
</div>
</td>
</tr>
<!-- Row 3: billing_invoices -->
<tr class="hover:bg-surface-canvas/50 transition-colors">
<td class="py-4 px-4 flex items-center gap-3">
<div class="w-8 h-8 rounded-full bg-surface-canvas flex items-center justify-center text-primary">
<span class="material-symbols-outlined text-[18px]">receipt_long</span>
</div>
<div class="flex flex-col">
<span class="font-semibold text-text-primary">billing_invoices</span>
<span class="font-label-sm text-label-sm text-text-muted">4 890 инвойсов и списаний (статусы, даты удаления)</span>
</div>
</td>
<td class="py-4 px-4">
<span class="bg-surface-canvas text-text-muted px-2.5 py-1 rounded-full font-label-sm text-label-sm">
                    WHMCS Hook
                  </span>
</td>
<td class="py-4 px-4 font-semibold text-text-primary">4 890</td>
<td class="py-4 px-4 text-text-muted font-body-sm text-body-sm">12 сек назад</td>
<td class="py-4 px-4">
<span class="inline-flex items-center gap-1.5 bg-risk-low-surface text-risk-low font-label-sm text-label-sm px-2.5 py-1 rounded-full font-semibold">
<span class="w-1.5 h-1.5 rounded-full bg-risk-low"></span>
                    Синхронизировано
                  </span>
</td>
<td class="py-4 px-4 text-right">
<div class="inline-flex items-center gap-1">
<button class="px-3 py-1.5 rounded-full bg-surface-canvas hover:bg-surface-card-alt text-text-primary font-label-sm text-label-sm font-semibold transition-colors">
                      Обновить
                    </button>
<button class="p-1.5 rounded-full bg-surface-canvas hover:bg-surface-card-alt text-text-muted hover:text-text-primary transition-colors" title="Настройки маппинга">
<span class="material-symbols-outlined text-[16px]">tune</span>
</button>
</div>
</td>
</tr>
<!-- Row 4: usage_telemetry -->
<tr class="hover:bg-surface-canvas/50 transition-colors">
<td class="py-4 px-4 flex items-center gap-3">
<div class="w-8 h-8 rounded-full bg-surface-canvas flex items-center justify-center text-primary">
<span class="material-symbols-outlined text-[18px]">monitoring</span>
</div>
<div class="flex flex-col">
<span class="font-semibold text-text-primary">usage_telemetry</span>
<span class="font-label-sm text-label-sm text-text-muted">Метрики активности и выключения услуг</span>
</div>
</td>
<td class="py-4 px-4">
<span class="bg-surface-canvas text-text-muted px-2.5 py-1 rounded-full font-label-sm text-label-sm">
                    Kafka Stream
                  </span>
</td>
<td class="py-4 px-4 font-semibold text-text-primary">128 420</td>
<td class="py-4 px-4 text-text-muted font-body-sm text-body-sm">1 мин назад</td>
<td class="py-4 px-4">
<span class="inline-flex items-center gap-1.5 bg-primary-container/20 text-[#0891B2] font-label-sm text-label-sm px-2.5 py-1 rounded-full font-semibold">
<span class="w-1.5 h-1.5 rounded-full bg-[#0891B2] animate-pulse"></span>
                    В процессе
                  </span>
</td>
<td class="py-4 px-4 text-right">
<div class="inline-flex items-center gap-1">
<button class="px-3 py-1.5 rounded-full bg-surface-canvas hover:bg-surface-card-alt text-text-primary font-label-sm text-label-sm font-semibold transition-colors">
                      Обновить
                    </button>
<button class="p-1.5 rounded-full bg-surface-canvas hover:bg-surface-card-alt text-text-muted hover:text-text-primary transition-colors" title="Настройки маппинга">
<span class="material-symbols-outlined text-[16px]">tune</span>
</button>
</div>
</td>
</tr>
</tbody>
</table>
</div>
</section>
<!-- Feature Mapping & Validation Grid -->
<section class="bg-surface-card rounded-[24px] p-6 flex flex-col gap-4">
<div class="flex items-center justify-between">
<div class="flex flex-col gap-0.5">
<h2 class="font-headline-sm text-headline-sm font-semibold text-text-primary">
              Схема маппинга полей и валидация признаков
            </h2>
<p class="font-body-sm text-body-sm text-text-muted">
              Ключевые векторы фичей для инференса модели оттока CatBoost
            </p>
</div>
<span class="bg-risk-low-surface text-risk-low font-label-sm text-label-sm px-3 py-1 rounded-full font-semibold flex items-center gap-1">
<span class="material-symbols-outlined text-[14px]">check_circle</span>
            6/6 валидировано
          </span>
</div>
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
<!-- Field 1 -->
<div class="bg-surface-canvas p-3.5 rounded-2xl flex items-center justify-between">
<div class="flex items-center gap-2.5">
<span class="material-symbols-outlined text-risk-low text-[18px]">verified</span>
<div class="flex flex-col">
<code class="font-label-md text-label-md font-semibold text-text-primary">account_balance</code>
<span class="font-label-sm text-label-sm text-text-muted">Float64 • Текущий баланс</span>
</div>
</div>
<span class="font-label-sm text-label-sm text-risk-low font-semibold">100%</span>
</div>
<!-- Field 2 -->
<div class="bg-surface-canvas p-3.5 rounded-2xl flex items-center justify-between">
<div class="flex items-center gap-2.5">
<span class="material-symbols-outlined text-risk-low text-[18px]">verified</span>
<div class="flex flex-col">
<code class="font-label-md text-label-md font-semibold text-text-primary">unpaid_invoices</code>
<span class="font-label-sm text-label-sm text-text-muted">Int32 • Неоплаченные счета</span>
</div>
</div>
<span class="font-label-sm text-label-sm text-risk-low font-semibold">100%</span>
</div>
<!-- Field 3 -->
<div class="bg-surface-canvas p-3.5 rounded-2xl flex items-center justify-between">
<div class="flex items-center gap-2.5">
<span class="material-symbols-outlined text-risk-low text-[18px]">verified</span>
<div class="flex flex-col">
<code class="font-label-md text-label-md font-semibold text-text-primary">auto_renew_flag</code>
<span class="font-label-sm text-label-sm text-text-muted">Boolean • Автопродление</span>
</div>
</div>
<span class="font-label-sm text-label-sm text-risk-low font-semibold">100%</span>
</div>
<!-- Field 4 -->
<div class="bg-surface-canvas p-3.5 rounded-2xl flex items-center justify-between">
<div class="flex items-center gap-2.5">
<span class="material-symbols-outlined text-risk-low text-[18px]">verified</span>
<div class="flex flex-col">
<code class="font-label-md text-label-md font-semibold text-text-primary">days_to_expiration</code>
<span class="font-label-sm text-label-sm text-text-muted">Int32 • Дней до окончания</span>
</div>
</div>
<span class="font-label-sm text-label-sm text-risk-low font-semibold">100%</span>
</div>
<!-- Field 5 -->
<div class="bg-surface-canvas p-3.5 rounded-2xl flex items-center justify-between">
<div class="flex items-center gap-2.5">
<span class="material-symbols-outlined text-risk-low text-[18px]">verified</span>
<div class="flex flex-col">
<code class="font-label-md text-label-md font-semibold text-text-primary">service_status</code>
<span class="font-label-sm text-label-sm text-text-muted">Categorical • Статус услуги</span>
</div>
</div>
<span class="font-label-sm text-label-sm text-risk-low font-semibold">100%</span>
</div>
<!-- Field 6 -->
<div class="bg-surface-canvas p-3.5 rounded-2xl flex items-center justify-between">
<div class="flex items-center gap-2.5">
<span class="material-symbols-outlined text-risk-low text-[18px]">verified</span>
<div class="flex flex-col">
<code class="font-label-md text-label-md font-semibold text-text-primary">payment_attempts</code>
<span class="font-label-sm text-label-sm text-text-muted">Int32 • Попытки транзакций</span>
</div>
</div>
<span class="font-label-sm text-label-sm text-risk-low font-semibold">100%</span>
</div>
</div>
</section>
<!-- Bottom Actions Bar -->
<div class="flex items-center justify-between pt-2 pb-6">
<div class="flex items-center gap-2 text-text-muted font-label-md text-label-md">
<span class="material-symbols-outlined text-[18px] text-accent-icon">info</span>
<span>Последняя глобальная переиндексация векторов выполнена успешно.</span>
</div>
<div class="flex items-center gap-3">
<button class="bg-surface-card hover:bg-surface-variant/50 text-text-primary font-label-lg text-label-lg px-6 py-3 rounded-full transition-colors active:scale-95 duration-150 font-semibold">
            Проверить целостность
          </button>
<button class="bg-[#18181B] hover:bg-[#27272A] text-on-primary font-label-lg text-label-lg px-7 py-3 rounded-full transition-transform active:scale-95 duration-150 font-semibold shadow-sm flex items-center gap-2">
<span class="material-symbols-outlined text-[18px] text-primary-fixed-dim">sync_saved_locally</span>
<span>Применить и обновить базу модели</span>
</button>
</div>
</div>
</main>
<!-- FOOTER (Docked full-width bottom, matching Shared Components JSON) -->
<footer class="w-full bg-transparent flex-shrink-0">
<div class="flex flex-col md:flex-row justify-between items-center w-full px-8 py-6 max-w-7xl mx-auto gap-4 font-body-sm text-body-sm text-text-muted">
<div>
          © 2025 Aéza Infrastructure Intelligence. All rights reserved.
        </div>
<div class="flex flex-wrap items-center gap-6 font-label-sm text-label-sm">
<a class="hover:text-primary transition-colors duration-200" href="#security">Security Architecture</a>
<a class="hover:text-primary transition-colors duration-200" href="#status">System Status</a>
<a class="hover:text-primary transition-colors duration-200" href="#terms">Terms of Service</a>
<a class="hover:text-primary transition-colors duration-200" href="#privacy">Privacy Policy</a>
</div>
</div>
</footer>
</div>
<!-- Micro-interactions Script -->
<script>
    document.addEventListener('DOMContentLoaded', () => {
      const syncBtn = document.getElementById('syncButton');
      const syncIcon = document.getElementById('syncIcon');

      if (syncBtn && syncIcon) {
        syncBtn.addEventListener('click', () => {
          syncIcon.classList.add('animate-spin');
          syncBtn.setAttribute('disabled', 'true');
          syncBtn.classList.add('opacity-75');

          setTimeout(() => {
            syncIcon.classList.remove('animate-spin');
            syncBtn.removeAttribute('disabled');
            syncBtn.classList.remove('opacity-75');
          }, 1200);
        });
      }
    });
  </script>
</body></html>