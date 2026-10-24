<!DOCTYPE html>

<html class="light" lang="ru"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>Aéza Churn Risk — Карточка клиента #42</title>
<link href="https://fonts.googleapis.com" rel="preconnect"/>
<link crossorigin="" href="https://fonts.gstatic.com" rel="preconnect"/>
<link href="https://fonts.googleapis.com/css2?family=Geist:wght@300;400;500;600;700&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<script id="tailwind-config">
    tailwind.config = {
      darkMode: "class",
      theme: {
        extend: {
          colors: {
            "on-secondary": "#ffffff",
            "surface-variant": "#dce2f3",
            "surface-container": "#e7eefe",
            "on-error-container": "#93000a",
            "surface-card-alt": "#F5F6F8",
            "on-tertiary-container": "#233537",
            "accent-icon": "#0D8A9E",
            "risk-high-surface": "#FEE2E2",
            "inverse-on-surface": "#ebf1ff",
            "primary-fixed": "#a4eeff",
            "surface-canvas-subtle": "#F8FAFC",
            "on-error": "#ffffff",
            "secondary-container": "#e4e1e6",
            "surface-bright": "#f9f9ff",
            "on-background": "#151c27",
            "risk-low": "#10B981",
            "on-secondary-container": "#656467",
            "outline": "#6d797c",
            "secondary-fixed-dim": "#c8c5ca",
            "surface-container-high": "#e2e8f8",
            "text-primary": "#111827",
            "on-surface": "#151c27",
            "risk-medium-surface": "#FEF3C7",
            "surface-canvas": "#FFFFFF",
            "text-muted": "#64748B",
            "outline-variant": "#E2E8F0",
            "on-primary-fixed-variant": "#004e5a",
            "on-surface-variant": "#3d494c",
            "risk-low-surface": "#D1FAE5",
            "surface": "#f9f9ff",
            "inverse-surface": "#2a313d",
            "primary": "#006877",
            "surface-card": "#F8FAFC",
            "on-secondary-fixed": "#1b1b1e",
            "risk-high": "#EF4444",
            "primary-container": "#0284C7",
            "on-tertiary-fixed": "#0c1e21",
            "surface-container-low": "#f0f3ff",
            "on-tertiary": "#ffffff",
            "tertiary-fixed-dim": "#b6cacd",
            "error-container": "#ffdad6",
            "on-secondary-fixed-variant": "#47464a",
            "on-primary": "#ffffff",
            "error": "#ba1a1a",
            "surface-dim": "#d3daea",
            "background": "#f9f9ff",
            "on-primary-container": "#003740",
            "cyan-gradient-start": "#0891B2",
            "on-primary-fixed": "#001f25",
            "tertiary-container": "#8a9da0",
            "tertiary": "#4f6264",
            "primary-fixed-dim": "#5cd6ee",
            "cyan-gradient-end": "#15B8CF",
            "risk-medium": "#F59E0B",
            "surface-container-highest": "#dce2f3",
            "surface-container-lowest": "#ffffff",
            "secondary": "#5f5e61",
            "on-tertiary-fixed-variant": "#384a4c",
            "inverse-primary": "#5cd6ee",
            "tertiary-fixed": "#d2e6e9",
            "surface-tint": "#006877",
            "secondary-fixed": "#e4e1e6"
          },
          borderRadius: {
            "DEFAULT": "1rem",
            "lg": "1.5rem",
            "xl": "2rem",
            "full": "9999px"
          },
          fontFamily: {
            "body-sm": ["Geist", "sans-serif"],
            "body-md": ["Geist", "sans-serif"],
            "title-md": ["Geist", "sans-serif"],
            "headline-sm": ["Geist", "sans-serif"],
            "headline-lg": ["Geist", "sans-serif"],
            "stat-mono": ["Geist", "sans-serif"]
          }
        }
      }
    };
  </script>
<style>
    .material-symbols-outlined {
      font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
      display: inline-block;
      vertical-align: middle;
      line-height: 1;
    }
    .material-symbols-outlined[data-weight="fill"] {
      font-variation-settings: 'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24;
    }
    .service-row.highlighted {
      background-color: #FEF3C7 !important;
      outline: 2px solid #F59E0B;
      transition: all 0.3s ease;
    }
    .transition-smooth {
      transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
    }
</style>
</head>
<body class="bg-[#F8FAFC] text-text-primary font-body-md antialiased min-h-screen flex flex-col selection:bg-primary-fixed selection:text-text-primary">
<div class="flex flex-1 w-full min-h-screen">
<!-- Left Minimal Sidebar -->
<aside class="w-64 bg-white border-r border-slate-200/80 p-5 flex flex-col justify-between shrink-0 hidden lg:flex">
<div class="flex flex-col gap-7">
<!-- Logo Brand Unit -->
<div class="flex items-center gap-3 px-1">
<div class="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-lg select-none shadow-sm">é</div>
<div class="flex flex-col">
<div class="flex items-center gap-1.5">
<span class="font-bold text-base tracking-tight text-slate-900">aéza</span>
<span class="text-[10px] font-semibold tracking-wider uppercase px-1.5 py-0.5 rounded bg-cyan-100 text-cyan-800">Intelligence</span>
</div>
<span class="text-xs text-text-muted">Churn Risk Platform</span>
</div>
</div>
<!-- Navigation Clusters -->
<nav class="flex flex-col gap-1">
<a class="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-slate-600 font-medium text-sm hover:bg-slate-100 hover:text-slate-900 transition-colors" href="#">
<span class="material-symbols-outlined text-slate-400">dashboard</span>
<span>Обзор</span>
</a>
<a class="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-slate-900 text-white font-medium text-sm transition-colors shadow-sm" href="#">
<div class="flex items-center gap-3">
<span class="material-symbols-outlined text-cyan-300" data-weight="fill">group</span>
<span>Клиенты</span>
</div>
<span class="px-2 py-0.5 rounded-full bg-slate-800 text-slate-200 text-xs font-semibold tabular-nums">300</span>
</a>
<a class="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-slate-600 font-medium text-sm hover:bg-slate-100 hover:text-slate-900 transition-colors" href="#">
<span class="material-symbols-outlined text-slate-400">tune</span>
<span>Модель</span>
</a>
<a class="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-slate-600 font-medium text-sm hover:bg-slate-100 hover:text-slate-900 transition-colors" href="#">
<span class="material-symbols-outlined text-slate-400">database</span>
<span>Данные</span>
</a>
</nav>
</div>
<!-- Bottom Profile & Model Version Status -->
<div class="flex flex-col gap-3 pt-4 border-t border-slate-100">
<div class="p-3 rounded-xl bg-slate-50 border border-slate-100 flex flex-col gap-0.5">
<div class="flex items-center gap-2">
<span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
<span class="text-xs font-semibold text-slate-800">CatBoost v2.4.1</span>
</div>
<span class="text-[11px] text-text-muted">Инференс в реальном времени</span>
</div>
<div class="flex items-center gap-3 px-1 pt-1">
<div class="w-8 h-8 rounded-lg bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-sm">А</div>
<div class="flex flex-col">
<span class="text-sm font-semibold text-slate-900 leading-tight">Алексей</span>
<span class="text-xs text-text-muted leading-tight">Risk Analyst</span>
</div>
</div>
</div>
</aside>
<!-- Main Fluid Canvas -->
<div class="flex-1 flex flex-col min-w-0 bg-[#F8FAFC]">
<!-- TopNavBar Header -->
<header class="bg-white/80 backdrop-blur sticky top-0 z-30 border-b border-slate-200/80">
<div class="flex justify-between items-center w-full px-6 py-3.5 max-w-7xl mx-auto">
<!-- Left: Breadcrumbs -->
<div class="flex items-center gap-3">
<div class="flex items-center gap-1.5 text-xs text-text-muted font-medium">
<span>Платформа</span>
<span class="material-symbols-outlined text-xs">chevron_right</span>
<a class="hover:text-text-primary transition-colors" href="#">Клиенты</a>
<span class="material-symbols-outlined text-xs">chevron_right</span>
<span class="text-slate-900 font-semibold text-sm">Клиент #42</span>
</div>
<div class="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-xs text-emerald-700 tabular-nums ml-2">
<span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
<span>WS Live • Обновлено 12 с назад</span>
</div>
</div>
<!-- Right: Controls & Actions -->
<div class="flex items-center gap-2.5">
<button class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 active:scale-95 transition-all" id="btn-recalculate">
<span class="material-symbols-outlined text-sm text-cyan-700">refresh</span>
<span>Пересчитать</span>
</button>
<a class="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-mono font-medium text-slate-700 transition-colors" href="#">
            /metrics
          </a>
<button class="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors">
<span class="material-symbols-outlined text-sm">language</span>
<span>RU</span>
<span class="material-symbols-outlined text-xs">expand_more</span>
</button>
</div>
</div>
</header>
<!-- Content Canvas -->
<main class="w-full max-w-7xl mx-auto px-6 py-6 flex flex-col gap-6 flex-1">
<!-- Back Navigation Anchor -->
<div>
<a class="inline-flex items-center gap-2 text-xs font-semibold text-text-muted hover:text-slate-900 transition-colors group" href="#">
<span class="material-symbols-outlined text-sm group-hover:-translate-x-0.5 transition-transform">arrow_back</span>
<span>Назад к списку (с сохранением фильтров)</span>
</a>
</div>
<!-- Customer Identity & Score Hero Unit (Monolithic, clean) -->
<section class="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
<div class="flex flex-col gap-3 flex-1">
<div class="flex flex-wrap items-center gap-3">
<h1 class="text-2xl font-bold tracking-tight text-slate-900">Клиент #42</h1>
<span class="px-3 py-1 rounded-full bg-rose-50 text-rose-600 border border-rose-200 font-semibold text-xs flex items-center gap-1.5 transition-all" id="risk-badge">
<span class="w-1.5 h-1.5 rounded-full bg-rose-500" id="risk-badge-dot"></span>
<span id="risk-badge-text">Высокий риск</span>
</span>
<span class="text-xs text-slate-400 font-medium hidden sm:inline">•</span>
<span class="flex items-center gap-1 text-xs text-text-muted">
<span class="material-symbols-outlined text-sm text-slate-400">mail</span>
              enterprise42@techcorp.de
            </span>
<span class="text-xs text-slate-400 font-medium hidden sm:inline">•</span>
<span class="flex items-center gap-1 text-xs text-text-muted">
<span class="material-symbols-outlined text-sm text-slate-400">calendar_today</span>
              Регистрация: 14.03.2023 (1 год 11 мес.)
            </span>
</div>
<!-- Highlighted Reason Strip -->
<div class="inline-flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-amber-50/70 border border-amber-200/70 text-slate-700 text-xs transition-smooth" id="main-reason-banner">
<span class="material-symbols-outlined text-amber-600 text-base shrink-0">error_outline</span>
<div>
<strong class="text-slate-900">Главная причина:</strong>
<span id="reason-text">Не хватает €31,40 на продление VPS Pro (доступно €15,50 из €47,00), автопродление отключено</span>
</div>
</div>
</div>
<!-- Risk Score Metric Card (Interactive live counter) -->
<div class="flex items-center gap-6 bg-slate-50 border border-slate-200/80 px-6 py-4 rounded-xl shrink-0 self-stretch lg:self-auto justify-between lg:justify-start">
<div class="flex flex-col">
<div class="flex items-center gap-2">
<span class="text-[11px] font-bold text-text-muted uppercase tracking-wider">SCORE ОТТОКА</span>
<span class="hidden text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-700" id="score-delta-tag">-53.6 pts</span>
</div>
<div class="flex items-baseline gap-1.5 mt-0.5">
<span class="text-3xl font-bold tracking-tight text-rose-600 tabular-nums transition-smooth" id="score-val">71,8</span>
<span class="text-xs text-text-muted font-medium">/ 100</span>
</div>
<span class="text-xs text-text-muted mt-0.5 tabular-nums transition-smooth" id="loyalty-val">Лояльность: 28,2%</span>
</div>
<div class="h-10 w-px bg-slate-200 hidden sm:block"></div>
<div class="w-12 h-12 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0 transition-smooth" id="score-icon-box">
<span class="material-symbols-outlined text-2xl" id="score-icon">warning</span>
</div>
</div>
</section>
<!-- UNIFIED MONOLITHIC FINANCIAL PROFILE & SIMULATOR PANEL -->
<section class="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm flex flex-col gap-6">
<div class="flex flex-col sm:flex-row justify-between sm:items-center pb-4 border-b border-slate-100 gap-3">
<div class="flex items-center gap-3">
<div class="w-9 h-9 rounded-xl bg-cyan-50 border border-cyan-200/70 text-cyan-700 flex items-center justify-center">
<span class="material-symbols-outlined text-xl">auto_fix_high</span>
</div>
<div>
<h2 class="text-base font-bold text-slate-900">Финансовый профиль &amp; Симулятор спасения клиента</h2>
<p class="text-xs text-text-muted">Моделирование превентивных мер и динамический пересчет вероятности оттока</p>
</div>
</div>
<div class="flex items-center gap-2">
<button class="px-3.5 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-semibold active:scale-95 transition-all shadow-sm flex items-center gap-1.5" id="sim-apply-all">
<span class="material-symbols-outlined text-sm">done_all</span>
<span>Применить все меры</span>
</button>
<button class="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold active:scale-95 transition-all" id="sim-reset">
              Сбросить
            </button>
</div>
</div>
<!-- 3 Integrated Columns: Balances | Metrics & Coverage | Live Simulator -->
<div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
<!-- Col 1: Account Balances (3.5 cols) -->
<div class="lg:col-span-4 flex flex-col justify-between gap-4 p-4 rounded-xl bg-slate-50/70 border border-slate-200/70">
<div class="flex flex-col gap-3">
<div class="flex items-center justify-between">
<span class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Балансы клиента</span>
<span class="material-symbols-outlined text-slate-400 text-sm">account_balance_wallet</span>
</div>
<div class="p-3 bg-white rounded-xl border border-slate-200/80 shadow-xs">
<span class="text-xs text-text-muted block">Доступно к списанию</span>
<span class="text-2xl font-bold text-slate-900 tabular-nums" id="balance-available">€15,50</span>
</div>
<div class="space-y-2 text-xs">
<div class="flex justify-between items-center py-1 border-b border-slate-100">
<span class="text-slate-600">Основной баланс</span>
<span class="font-semibold text-slate-900 tabular-nums" id="balance-main">€12,50</span>
</div>
<div class="flex justify-between items-center py-1 border-b border-slate-100">
<div class="flex items-center gap-1.5">
<span class="text-slate-600">Бонусный</span>
<span class="px-1.5 py-0.5 rounded text-[10px] bg-emerald-100 text-emerald-800 font-medium">можно тратить</span>
</div>
<span class="font-semibold text-slate-900 tabular-nums">€3,00</span>
</div>
<div class="flex justify-between items-center py-1">
<div class="flex items-center gap-1.5">
<span class="text-slate-500">Реферальный</span>
<span class="px-1.5 py-0.5 rounded text-[10px] bg-slate-200 text-slate-600 font-medium">не участвует</span>
</div>
<span class="font-medium text-slate-400 tabular-nums">€50,00</span>
</div>
</div>
</div>
<div class="text-[11px] text-text-muted pt-2 border-t border-slate-200/60 flex items-center justify-between">
<span>Всего пополнено: <strong class="text-slate-800">€1 840</strong></span>
<span class="text-rose-600 font-medium">2 не оплачены</span>
</div>
</div>
<!-- Col 2: Money Evaluation & 30-Day Coverage (4.5 cols) -->
<div class="lg:col-span-4 flex flex-col justify-between gap-4 p-4 rounded-xl bg-slate-50/70 border border-slate-200/70">
<div class="flex flex-col gap-3">
<div class="flex items-center justify-between">
<span class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Денежная оценка (30 дн.)</span>
<span class="material-symbols-outlined text-slate-400 text-sm">payments</span>
</div>
<!-- Segmented Progress Bar -->
<div class="flex flex-col gap-1.5">
<div class="w-full h-3 rounded-full bg-slate-200 overflow-hidden flex">
<div class="h-full bg-emerald-500 transition-all duration-500" id="coverage-bar-green" style="width: 33%"></div>
<div class="h-full bg-rose-500 transition-all duration-500" id="coverage-bar-red" style="width: 67%"></div>
</div>
<div class="flex justify-between items-center text-[11px] font-medium tabular-nums">
<span class="text-emerald-700 flex items-center gap-1" id="coverage-covered-label">
<span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    Покрыто: €15,50 (33%)
                  </span>
<span class="text-rose-600 flex items-center gap-1" id="coverage-uncovered-label">
<span class="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                    Не покрыто: €31,50 (67%)
                  </span>
</div>
</div>
<!-- Mini KPIs in single row -->
<div class="grid grid-cols-2 gap-2 pt-1">
<div class="p-2.5 bg-white rounded-xl border border-slate-200/80">
<span class="text-[11px] text-text-muted block">Платежи в 30 дн.</span>
<span class="text-base font-bold text-slate-900 tabular-nums">€47,00</span>
</div>
<div class="p-2.5 bg-white rounded-xl border border-slate-200/80">
<span class="text-[11px] text-text-muted block">Вероятность оттока</span>
<span class="text-base font-bold text-rose-600 tabular-nums" id="churn-prob-val">0,72</span>
</div>
<div class="p-2.5 bg-white rounded-xl border border-slate-200/80">
<span class="text-[11px] text-text-muted block">Под угрозой</span>
<span class="text-base font-bold text-slate-900 tabular-nums">€47,00</span>
</div>
<div class="p-2.5 bg-rose-50 rounded-xl border border-rose-200/80 transition-smooth" id="exp-loss-card">
<span class="text-[11px] text-rose-700 font-medium block">Ожидаемая потеря</span>
<span class="text-base font-bold text-rose-700 tabular-nums" id="exp-loss-val">€26,03</span>
</div>
</div>
</div>
<!-- Single line compact formula -->
<div class="text-[11px] text-text-muted bg-white p-2 rounded-lg border border-slate-200/60 font-mono flex items-center gap-1.5 truncate" id="formula-pill">
<span class="material-symbols-outlined text-xs text-cyan-600">calculate</span>
<span id="formula-text">0,72 × (€31,50 + 0,3 × €15,50) = <strong>€26,03</strong></span>
</div>
</div>
<!-- Col 3: Interactive "What-If" Simulator Controls (4 cols) -->
<div class="lg:col-span-4 flex flex-col justify-between gap-3 p-4 rounded-xl bg-gradient-to-br from-cyan-50/50 to-slate-50 border border-cyan-200/70">
<div class="flex flex-col gap-2.5">
<div class="flex items-center justify-between">
<span class="text-xs font-bold text-cyan-900 uppercase tracking-wider flex items-center gap-1.5">
<span class="material-symbols-outlined text-sm text-cyan-700">tune</span>
                  Симулятор «Что если»
                </span>
<span class="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-200 text-slate-700" id="sim-status-chip">0 мер активно</span>
</div>
<!-- Interactive toggles -->
<div class="flex flex-col gap-2">
<!-- Measure 1 -->
<label class="flex items-start gap-2.5 p-2.5 rounded-xl bg-white border border-slate-200/80 hover:border-cyan-400 cursor-pointer transition-colors shadow-xs">
<input class="mt-0.5 w-4 h-4 rounded text-cyan-600 border-slate-300 focus:ring-cyan-500" id="sim-check-1" type="checkbox"/>
<div class="text-xs">
<span class="font-semibold text-slate-800 block">Пополнить на €31,40</span>
<span class="text-[11px] text-text-muted">Закрывает дефицит для продления VPS Pro</span>
</div>
</label>
<!-- Measure 2 -->
<label class="flex items-start gap-2.5 p-2.5 rounded-xl bg-white border border-slate-200/80 hover:border-cyan-400 cursor-pointer transition-colors shadow-xs">
<input class="mt-0.5 w-4 h-4 rounded text-cyan-600 border-slate-300 focus:ring-cyan-500" id="sim-check-2" type="checkbox"/>
<div class="text-xs">
<span class="font-semibold text-slate-800 block">Включить автопродление</span>
<span class="text-[11px] text-text-muted">Активировать на всех 4 сервисах клиента</span>
</div>
</label>
<!-- Measure 3 -->
<label class="flex items-start gap-2.5 p-2.5 rounded-xl bg-white border border-slate-200/80 hover:border-cyan-400 cursor-pointer transition-colors shadow-xs">
<input class="mt-0.5 w-4 h-4 rounded text-cyan-600 border-slate-300 focus:ring-cyan-500" id="sim-check-3" type="checkbox"/>
<div class="text-xs">
<span class="font-semibold text-slate-800 block">Разблокировать Dedicated EPYC</span>
<span class="text-[11px] text-text-muted">Обновить платежную карту и разморозить</span>
</div>
</label>
</div>
</div>
<div class="text-[11px] text-cyan-800 bg-cyan-100/60 px-2.5 py-1.5 rounded-lg flex items-center gap-1.5">
<span class="material-symbols-outlined text-xs shrink-0">info</span>
<span>Моделируйте спасение клиента в один клик без сохранения в БД</span>
</div>
</div>
</div>
</section>
<!-- RISK ATTRIBUTION / WHY THIS RISK (Clickable feature bars tied to table) -->
<section class="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm flex flex-col gap-4">
<div class="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
<div>
<div class="flex items-center gap-2">
<h2 class="text-base font-bold text-slate-900">Почему такой риск (сработавшие признаки)</h2>
<span class="text-[11px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-medium">Клик по фактору подсвечивает услугу</span>
</div>
<p class="text-xs text-text-muted">Анализ весов факторов модели CatBoost с прямой привязкой к инфраструктуре</p>
</div>
<div class="flex items-center gap-2 px-3 py-1 rounded-full bg-slate-50 border border-slate-200/70 text-xs">
<span class="text-text-muted">Суммарный вклад:</span>
<span class="font-bold text-rose-600 tabular-nums transition-smooth" id="feature-total-score">+61,8 score</span>
</div>
</div>
<!-- Factors List (Interactive row items) -->
<div class="space-y-2.5">
<!-- Factor 1: Funds -->
<div class="factor-interactive p-3.5 rounded-xl border border-slate-200/80 hover:border-cyan-400 hover:bg-slate-50/70 cursor-pointer transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3" data-target="vps" id="factor-row-1">
<div class="flex-1 flex flex-col gap-0.5">
<div class="flex items-center gap-2">
<span class="material-symbols-outlined text-sm text-rose-500 factor-icon">savings</span>
<span class="text-xs font-bold text-slate-800">Не хватает средств на продления</span>
<span class="px-1.5 py-0.2 rounded text-[10px] bg-slate-100 text-slate-600 font-medium tabular-nums">Вес 30%</span>
</div>
<p class="text-xs text-text-muted">Не хватает €31,40 на продления в ближайшие 30 дней (Cloud VPS Pro)</p>
</div>
<div class="flex items-center gap-3 sm:w-56 shrink-0">
<div class="flex-1 bg-slate-100 h-2 rounded-full overflow-hidden">
<div class="bg-rose-500 h-full rounded-full transition-all duration-300" id="factor-bar-1" style="width: 72%"></div>
</div>
<span class="text-xs font-bold text-rose-600 tabular-nums w-12 text-right transition-smooth" id="factor-score-1">+21,6</span>
</div>
</div>
<!-- Factor 2: Auto-renew -->
<div class="factor-interactive p-3.5 rounded-xl border border-slate-200/80 hover:border-cyan-400 hover:bg-slate-50/70 cursor-pointer transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3" data-target="autorenew" id="factor-row-2">
<div class="flex-1 flex flex-col gap-0.5">
<div class="flex items-center gap-2">
<span class="material-symbols-outlined text-sm text-rose-500 factor-icon">autorenew</span>
<span class="text-xs font-bold text-slate-800">Автопродление выключено у части сервисов</span>
<span class="px-1.5 py-0.2 rounded text-[10px] bg-slate-100 text-slate-600 font-medium tabular-nums">Вес 25%</span>
</div>
<p class="text-xs text-text-muted">Автопродление отключено на Dedicated EPYC и Cloud VPS Pro</p>
</div>
<div class="flex items-center gap-3 sm:w-56 shrink-0">
<div class="flex-1 bg-slate-100 h-2 rounded-full overflow-hidden">
<div class="bg-rose-500 h-full rounded-full transition-all duration-300" id="factor-bar-2" style="width: 60%"></div>
</div>
<span class="text-xs font-bold text-rose-600 tabular-nums w-12 text-right transition-smooth" id="factor-score-2">+18,0</span>
</div>
</div>
<!-- Factor 3: Pending Invoice -->
<div class="factor-interactive p-3.5 rounded-xl border border-slate-200/80 hover:border-cyan-400 hover:bg-slate-50/70 cursor-pointer transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3" data-target="backup" id="factor-row-3">
<div class="flex-1 flex flex-col gap-0.5">
<div class="flex items-center gap-2">
<span class="material-symbols-outlined text-sm text-amber-500 factor-icon">receipt_long</span>
<span class="text-xs font-bold text-slate-800">Услуга ждёт оплаты</span>
<span class="px-1.5 py-0.2 rounded text-[10px] bg-slate-100 text-slate-600 font-medium tabular-nums">Вес 30%</span>
</div>
<p class="text-xs text-text-muted">Инвойс на Backup Storage 100GB сформирован 3 дня назад</p>
</div>
<div class="flex items-center gap-3 sm:w-56 shrink-0">
<div class="flex-1 bg-slate-100 h-2 rounded-full overflow-hidden">
<div class="bg-amber-500 h-full rounded-full transition-all duration-300" id="factor-bar-3" style="width: 50%"></div>
</div>
<span class="text-xs font-bold text-amber-600 tabular-nums w-12 text-right transition-smooth" id="factor-score-3">+15,0</span>
</div>
</div>
<!-- Factor 4: Failed attempts -->
<div class="factor-interactive p-3.5 rounded-xl border border-slate-200/80 hover:border-cyan-400 hover:bg-slate-50/70 cursor-pointer transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3" data-target="dedicated" id="factor-row-4">
<div class="flex-1 flex flex-col gap-0.5">
<div class="flex items-center gap-2">
<span class="material-symbols-outlined text-sm text-amber-500 factor-icon">credit_card_off</span>
<span class="text-xs font-bold text-slate-800">Неоплаченные заказы и блокировка</span>
<span class="px-1.5 py-0.2 rounded text-[10px] bg-slate-100 text-slate-600 font-medium tabular-nums">Вес 10%</span>
</div>
<p class="text-xs text-text-muted">2 попытки списания завершились ошибкой, Dedicated заблокирован</p>
</div>
<div class="flex items-center gap-3 sm:w-56 shrink-0">
<div class="flex-1 bg-slate-100 h-2 rounded-full overflow-hidden">
<div class="bg-amber-500 h-full rounded-full transition-all duration-300" id="factor-bar-4" style="width: 24%"></div>
</div>
<span class="text-xs font-bold text-amber-600 tabular-nums w-12 text-right transition-smooth" id="factor-score-4">+7,2</span>
</div>
</div>
</div>
<!-- Collapsible Un-triggered factors -->
<div class="pt-1">
<button class="inline-flex items-center gap-1.5 text-xs font-semibold text-text-muted hover:text-slate-900 transition-colors" id="toggle-untriggered">
<span class="material-symbols-outlined text-sm transition-transform" id="toggle-untriggered-icon">expand_more</span>
<span>Не сработавшие признаки (3) — кликните для просмотра</span>
</button>
<div class="hidden mt-3 space-y-2 border-t border-slate-100 pt-3" id="untriggered-panel">
<div class="p-2.5 rounded-lg bg-slate-50 border border-slate-200/60 flex items-center justify-between text-xs text-slate-500">
<span class="flex items-center gap-2">
<span class="material-symbols-outlined text-emerald-500 text-sm">check_circle</span>
                Низкая активность в тикетах поддержки (0 обращений за 30 дней)
              </span>
<span class="font-mono text-emerald-600 font-medium">0,0 score</span>
</div>
<div class="p-2.5 rounded-lg bg-slate-50 border border-slate-200/60 flex items-center justify-between text-xs text-slate-500">
<span class="flex items-center gap-2">
<span class="material-symbols-outlined text-emerald-500 text-sm">check_circle</span>
                Срок жизни клиента более 12 месяцев (1 год 11 мес.)
              </span>
<span class="font-mono text-emerald-600 font-medium">-4,5 score</span>
</div>
<div class="p-2.5 rounded-lg bg-slate-50 border border-slate-200/60 flex items-center justify-between text-xs text-slate-500">
<span class="flex items-center gap-2">
<span class="material-symbols-outlined text-emerald-500 text-sm">check_circle</span>
                Падение сетевого трафика &gt; 50% не обнаружено
              </span>
<span class="font-mono text-emerald-600 font-medium">0,0 score</span>
</div>
</div>
</div>
</section>
<!-- CLIENT SERVICES & SUBSCRIPTIONS TABLE (Interactive Quick Actions) -->
<section class="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm flex flex-col gap-5" id="services-section">
<div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
<div>
<h2 class="text-base font-bold text-slate-900">Услуги клиента</h2>
<p class="text-xs text-text-muted">Инфраструктурные подписки с интерактивным управлением статусами</p>
</div>
<!-- Filter chips -->
<div class="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 rounded-xl" id="filter-container">
<button class="filter-btn px-3 py-1 rounded-lg bg-white text-slate-900 font-semibold text-xs shadow-xs transition-all" data-filter="all">Все (4)</button>
<button class="filter-btn px-3 py-1 rounded-lg text-slate-600 hover:text-slate-900 font-medium text-xs transition-all" data-filter="active">Активные (1)</button>
<button class="filter-btn px-3 py-1 rounded-lg text-slate-600 hover:text-slate-900 font-medium text-xs transition-all" data-filter="pending">Ждут оплаты (2)</button>
<button class="filter-btn px-3 py-1 rounded-lg text-slate-600 hover:text-slate-900 font-medium text-xs transition-all" data-filter="blocked">Заблокированные (1)</button>
</div>
</div>
<!-- Table Container -->
<div class="overflow-x-auto">
<table class="w-full text-left border-collapse" id="services-table">
<thead>
<tr class="border-b border-slate-200 text-slate-400 text-xs font-semibold uppercase tracking-wider">
<th class="py-3 px-3">Услуга &amp; Конфигурация</th>
<th class="py-3 px-3">Статус</th>
<th class="py-3 px-3">Цена</th>
<th class="py-3 px-3">Период</th>
<th class="py-3 px-3">Автопродление</th>
<th class="py-3 px-3">Оплачено до</th>
<th class="py-3 px-3">Дней до удаления</th>
<th class="py-3 px-3">Ожидаемая потеря</th>
<th class="py-3 px-3 text-right">Быстрое действие</th>
</tr>
</thead>
<tbody class="divide-y divide-slate-100 text-xs">
<!-- Row 1: Dedicated Server -->
<tr class="service-row hover:bg-slate-50 transition-colors" data-category="dedicated autorenew" data-status="blocked" id="service-dedicated">
<td class="py-3.5 px-3">
<div class="flex items-center gap-2.5">
<div class="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700 shrink-0">
<span class="material-symbols-outlined text-base">dns</span>
</div>
<div>
<span class="font-semibold text-slate-900 block">Dedicated AMD EPYC 9454</span>
<span class="text-[11px] text-text-muted">FRA-1, 128GB RAM</span>
</div>
</div>
</td>
<td class="py-3.5 px-3">
<span class="status-badge px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-600 border border-rose-200 font-semibold whitespace-nowrap">
                    Заблокирована
                  </span>
</td>
<td class="py-3.5 px-3 font-semibold text-slate-900 tabular-nums">€189,00</td>
<td class="py-3.5 px-3 text-text-muted">Месяц</td>
<td class="py-3.5 px-3">
<span class="autorenew-label font-medium text-text-muted">Выкл</span>
</td>
<td class="py-3.5 px-3 text-rose-600 tabular-nums font-medium">
                  22.02.2025 <span class="text-text-muted text-[10px]">(истекла)</span>
</td>
<td class="py-3.5 px-3 tabular-nums font-semibold text-rose-600">3 дня</td>
<td class="py-3.5 px-3 font-semibold text-rose-600 tabular-nums">€189,00</td>
<td class="py-3.5 px-3 text-right">
<button class="btn-action-dedicated px-2.5 py-1 rounded-md bg-slate-100 hover:bg-cyan-50 hover:text-cyan-700 text-slate-700 font-medium transition-colors">
                    Разблокировать
                  </button>
</td>
</tr>
<!-- Row 2: Cloud VPS Pro -->
<tr class="service-row hover:bg-slate-50 transition-colors" data-category="vps autorenew" data-status="pending" id="service-vps">
<td class="py-3.5 px-3">
<div class="flex items-center gap-2.5">
<div class="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700 shrink-0">
<span class="material-symbols-outlined text-base">cloud</span>
</div>
<div>
<span class="font-semibold text-slate-900 block">Cloud VPS Pro</span>
<span class="text-[11px] text-text-muted">AMS-2, 4 vCPU / 8GB</span>
</div>
</div>
</td>
<td class="py-3.5 px-3">
<span class="status-badge px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 font-semibold whitespace-nowrap">
                    Ждет оплаты
                  </span>
</td>
<td class="py-3.5 px-3 font-semibold text-slate-900 tabular-nums">€31,40</td>
<td class="py-3.5 px-3 text-text-muted">Месяц</td>
<td class="py-3.5 px-3">
<span class="autorenew-label font-medium text-text-muted">Выкл</span>
</td>
<td class="py-3.5 px-3 tabular-nums font-medium text-slate-700">
                  27.02.2025 <span class="text-text-muted text-[10px]">(через 2 дня)</span>
</td>
<td class="py-3.5 px-3 tabular-nums font-medium text-slate-700">5 дней</td>
<td class="py-3.5 px-3 font-semibold text-rose-600 tabular-nums">€31,40</td>
<td class="py-3.5 px-3 text-right">
<button class="btn-action-vps px-2.5 py-1 rounded-md bg-cyan-50 hover:bg-cyan-100 text-cyan-800 font-medium transition-colors">
                    Продлить сейчас
                  </button>
</td>
</tr>
<!-- Row 3: Backup Storage -->
<tr class="service-row hover:bg-slate-50 transition-colors" data-category="backup" data-status="pending" id="service-backup">
<td class="py-3.5 px-3">
<div class="flex items-center gap-2.5">
<div class="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700 shrink-0">
<span class="material-symbols-outlined text-base">hard_drive_2</span>
</div>
<div>
<span class="font-semibold text-slate-900 block">Backup Storage 100GB</span>
<span class="text-[11px] text-text-muted">NVMe High-Speed</span>
</div>
</div>
</td>
<td class="py-3.5 px-3">
<span class="status-badge px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 font-semibold whitespace-nowrap">
                    Ждет оплаты
                  </span>
</td>
<td class="py-3.5 px-3 font-semibold text-slate-900 tabular-nums">€15,60</td>
<td class="py-3.5 px-3 text-text-muted">Месяц</td>
<td class="py-3.5 px-3">
<span class="autorenew-label font-medium text-emerald-600">Вкл</span>
</td>
<td class="py-3.5 px-3 tabular-nums font-medium text-slate-700">
                  28.02.2025 <span class="text-text-muted text-[10px]">(через 3 дня)</span>
</td>
<td class="py-3.5 px-3 tabular-nums font-medium text-slate-700">5 дней</td>
<td class="py-3.5 px-3 font-semibold text-rose-600 tabular-nums">€15,60</td>
<td class="py-3.5 px-3 text-right">
<button class="btn-action-backup px-2.5 py-1 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition-colors">
                    Оплатить (€15,60)
                  </button>
</td>
</tr>
<!-- Row 4: Domain -->
<tr class="service-row hover:bg-slate-50 transition-colors" data-category="domain" data-status="active" id="service-domain">
<td class="py-3.5 px-3">
<div class="flex items-center gap-2.5">
<div class="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700 shrink-0">
<span class="material-symbols-outlined text-base">language</span>
</div>
<div>
<span class="font-semibold text-slate-900 block">Домен cloud-enterprise.eu</span>
<span class="text-[11px] text-text-muted">DNSSEC + SSL</span>
</div>
</div>
</td>
<td class="py-3.5 px-3">
<span class="status-badge px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold whitespace-nowrap">
                    Активна
                  </span>
</td>
<td class="py-3.5 px-3 font-semibold text-slate-900 tabular-nums">€14,00</td>
<td class="py-3.5 px-3 text-text-muted">Год</td>
<td class="py-3.5 px-3">
<span class="autorenew-label font-medium text-emerald-600">Вкл</span>
</td>
<td class="py-3.5 px-3 tabular-nums font-medium text-slate-700">
                  14.11.2025 <span class="text-text-muted text-[10px]">(через 260 дней)</span>
</td>
<td class="py-3.5 px-3 tabular-nums text-slate-400">—</td>
<td class="py-3.5 px-3 font-semibold text-emerald-600 tabular-nums">€0,00</td>
<td class="py-3.5 px-3 text-right">
<span class="text-[11px] text-slate-400 font-medium px-2 py-1">В норме</span>
</td>
</tr>
</tbody>
</table>
</div>
</section>
</main>
<!-- Footer from Shared Components -->
<footer class="bg-white border-t border-slate-200/80 mt-8 py-5">
<div class="flex flex-col md:flex-row justify-between items-center w-full px-6 max-w-7xl mx-auto gap-4 text-xs text-text-muted">
<div>
          © 2025 Aéza Infrastructure Intelligence. All rights reserved.
        </div>
<div class="flex flex-wrap items-center gap-5">
<a class="hover:text-cyan-700 transition-colors" href="#">Security Architecture</a>
<a class="hover:text-cyan-700 transition-colors" href="#">System Status</a>
<a class="hover:text-cyan-700 transition-colors" href="#">Terms of Service</a>
<a class="hover:text-cyan-700 transition-colors" href="#">Privacy Policy</a>
</div>
</div>
</footer>
</div>
</div>
<!-- Interactive Client-side Script -->
<script>
document.addEventListener('DOMContentLoaded', () => {
  // Elements
  const check1 = document.getElementById('sim-check-1');
  const check2 = document.getElementById('sim-check-2');
  const check3 = document.getElementById('sim-check-3');
  const btnApplyAll = document.getElementById('sim-apply-all');
  const btnReset = document.getElementById('sim-reset');
  const simStatusChip = document.getElementById('sim-status-chip');
  const btnRecalculate = document.getElementById('btn-recalculate');

  // Dynamic Indicators
  const riskBadge = document.getElementById('risk-badge');
  const riskBadgeDot = document.getElementById('risk-badge-dot');
  const riskBadgeText = document.getElementById('risk-badge-text');
  const scoreVal = document.getElementById('score-val');
  const loyaltyVal = document.getElementById('loyalty-val');
  const scoreIconBox = document.getElementById('score-icon-box');
  const scoreIcon = document.getElementById('score-icon');
  const scoreDeltaTag = document.getElementById('score-delta-tag');
  const reasonBanner = document.getElementById('main-reason-banner');
  const reasonText = document.getElementById('reason-text');

  // Financial coverage elements
  const balanceAvailable = document.getElementById('balance-available');
  const balanceMain = document.getElementById('balance-main');
  const coverageGreen = document.getElementById('coverage-bar-green');
  const coverageRed = document.getElementById('coverage-bar-red');
  const labelCovered = document.getElementById('coverage-covered-label');
  const labelUncovered = document.getElementById('coverage-uncovered-label');
  const churnProbVal = document.getElementById('churn-prob-val');
  const expLossVal = document.getElementById('exp-loss-val');
  const expLossCard = document.getElementById('exp-loss-card');
  const formulaText = document.getElementById('formula-text');

  // Factors
  const featureTotalScore = document.getElementById('feature-total-score');
  const factorBar1 = document.getElementById('factor-bar-1');
  const factorBar2 = document.getElementById('factor-bar-2');
  const factorBar3 = document.getElementById('factor-bar-3');
  const factorBar4 = document.getElementById('factor-bar-4');
  const factorScore1 = document.getElementById('factor-score-1');
  const factorScore2 = document.getElementById('factor-score-2');
  const factorScore3 = document.getElementById('factor-score-3');
  const factorScore4 = document.getElementById('factor-score-4');
  const factorRows = document.querySelectorAll('.factor-interactive');

  // Simulation State Calculation
  function updateSimulation() {
    const c1 = check1.checked;
    const c2 = check2.checked;
    const c3 = check3.checked;
    const activeCount = [c1, c2, c3].filter(Boolean).length;

    simStatusChip.textContent = `${activeCount} ${activeCount === 1 ? 'мера активна' : 'мер активно'}`;
    if (activeCount > 0) {
      simStatusChip.className = 'text-[10px] font-semibold px-2 py-0.5 rounded-full bg-cyan-100 text-cyan-800';
    } else {
      simStatusChip.className = 'text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-200 text-slate-700';
    }

    // Base values
    let score = 71.8;
    let loyalty = 28.2;
    let churnProb = 0.72;
    let expLoss = 26.03;
    let availableBal = 15.50;
    let mainBal = 12.50;

    let f1 = 21.6;
    let f2 = 18.0;
    let f3 = 15.0;
    let f4 = 7.2;

    if (c1) {
      score -= 21.6;
      availableBal += 31.40;
      mainBal += 31.40;
      f1 = 0;
    }
    if (c2) {
      score -= 18.0;
      f2 = 0;
    }
    if (c3) {
      score -= 14.0;
      f4 = 0;
    }

    const totalF = f1 + f2 + f3 + f4;
    score = Math.max(18.2, Number(score.toFixed(1)));
    loyalty = Number((100 - score).toFixed(1));

    // Update visuals
    scoreVal.textContent = score.toString().replace('.', ',');
    loyaltyVal.textContent = `Лояльность: ${loyalty.toString().replace('.', ',')}%`;

    // High vs Low Risk Mode
    if (score < 30) {
      riskBadge.className = 'px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold text-xs flex items-center gap-1.5 transition-all';
      riskBadgeDot.className = 'w-1.5 h-1.5 rounded-full bg-emerald-500';
      riskBadgeText.textContent = 'Низкий риск';

      scoreVal.className = 'text-3xl font-bold tracking-tight text-emerald-600 tabular-nums transition-smooth';
      scoreIconBox.className = 'w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 transition-smooth';
      scoreIcon.textContent = 'verified_user';
      scoreDeltaTag.classList.remove('hidden');

      churnProbVal.textContent = '0,08';
      churnProbVal.className = 'text-base font-bold text-emerald-600 tabular-nums';

      expLossVal.textContent = '€0,00';
      expLossVal.className = 'text-base font-bold text-emerald-700 tabular-nums';
      expLossCard.className = 'p-2.5 bg-emerald-50 rounded-xl border border-emerald-200/80 transition-smooth';

      coverageGreen.style.width = '100%';
      coverageRed.style.width = '0%';
      labelCovered.innerHTML = '<span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Покрыто: €47,00 (100%)';
      labelUncovered.innerHTML = '<span class="text-emerald-700 font-medium">Дефицита нет</span>';

      formulaText.innerHTML = '0,08 × (€0,00 + 0,3 × €46,90) = <strong>€0,00</strong>';
      reasonBanner.className = 'inline-flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-emerald-50 border border-emerald-200 text-slate-700 text-xs transition-smooth';
      reasonText.innerHTML = '<strong class="text-emerald-800">Риск устранен:</strong> баланс покрывает все продления, автопродление защищает услуги.';
    } else {
      riskBadge.className = 'px-3 py-1 rounded-full bg-rose-50 text-rose-600 border border-rose-200 font-semibold text-xs flex items-center gap-1.5 transition-all';
      riskBadgeDot.className = 'w-1.5 h-1.5 rounded-full bg-rose-500';
      riskBadgeText.textContent = 'Высокий риск';

      scoreVal.className = 'text-3xl font-bold tracking-tight text-rose-600 tabular-nums transition-smooth';
      scoreIconBox.className = 'w-12 h-12 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0 transition-smooth';
      scoreIcon.textContent = 'warning';
      scoreDeltaTag.classList.add('hidden');

      const ratio = c1 ? 1 : 0.33;
      coverageGreen.style.width = c1 ? '100%' : '33%';
      coverageRed.style.width = c1 ? '0%' : '67%';

      if (c1) {
        labelCovered.innerHTML = '<span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Покрыто: €46,90 (100%)';
        labelUncovered.innerHTML = '<span class="text-emerald-700 font-medium">Дефицита нет</span>';
        churnProbVal.textContent = '0,34';
        expLossVal.textContent = '€5,20';
        expLossCard.className = 'p-2.5 bg-amber-50 rounded-xl border border-amber-200/80 transition-smooth';
        formulaText.innerHTML = '0,34 × (€0,00 + 0,3 × €46,90) = <strong>€5,20</strong>';
      } else {
        labelCovered.innerHTML = '<span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Покрыто: €15,50 (33%)';
        labelUncovered.innerHTML = '<span class="w-1.5 h-1.5 rounded-full bg-rose-500"></span> Не покрыто: €31,50 (67%)';
        churnProbVal.textContent = '0,72';
        expLossVal.textContent = '€26,03';
        expLossCard.className = 'p-2.5 bg-rose-50 rounded-xl border border-rose-200/80 transition-smooth';
        formulaText.innerHTML = '0,72 × (€31,50 + 0,3 × €15,50) = <strong>€26,03</strong>';
      }

      reasonBanner.className = 'inline-flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-amber-50/70 border border-amber-200/70 text-slate-700 text-xs transition-smooth';
      reasonText.innerHTML = 'Не хватает €31,40 на продление VPS Pro (доступно €15,50 из €47,00), автопродление отключено';
    }

    balanceAvailable.textContent = `€${availableBal.toFixed(2).replace('.', ',')}`;
    balanceMain.textContent = `€${mainBal.toFixed(2).replace('.', ',')}`;

    // Update factor bars
    featureTotalScore.textContent = `+${totalF.toFixed(1).replace('.', ',')} score`;
    factorScore1.textContent = f1 === 0 ? '0,0' : `+${f1.toFixed(1).replace('.', ',')}`;
    factorBar1.style.width = f1 === 0 ? '0%' : '72%';
    factorScore2.textContent = f2 === 0 ? '0,0' : `+${f2.toFixed(1).replace('.', ',')}`;
    factorBar2.style.width = f2 === 0 ? '0%' : '60%';
    factorScore4.textContent = f4 === 0 ? '0,0' : `+${f4.toFixed(1).replace('.', ',')}`;
    factorBar4.style.width = f4 === 0 ? '0%' : '24%';

    // Visual cue on factors when deactivated
    document.getElementById('factor-row-1').style.opacity = f1 === 0 ? '0.45' : '1';
    document.getElementById('factor-row-2').style.opacity = f2 === 0 ? '0.45' : '1';
    document.getElementById('factor-row-4').style.opacity = f4 === 0 ? '0.45' : '1';

    // Synchronize Table Statuses with toggles
    const rowDedicated = document.getElementById('service-dedicated');
    const badgeDedicated = rowDedicated.querySelector('.status-badge');
    const autoDedicated = rowDedicated.querySelector('.autorenew-label');
    const rowVps = document.getElementById('service-vps');
    const badgeVps = rowVps.querySelector('.status-badge');
    const autoVps = rowVps.querySelector('.autorenew-label');

    if (c2) {
      autoDedicated.textContent = 'Вкл';
      autoDedicated.className = 'autorenew-label font-medium text-emerald-600';
      autoVps.textContent = 'Вкл';
      autoVps.className = 'autorenew-label font-medium text-emerald-600';
    } else {
      autoDedicated.textContent = 'Выкл';
      autoDedicated.className = 'autorenew-label font-medium text-text-muted';
      autoVps.textContent = 'Выкл';
      autoVps.className = 'autorenew-label font-medium text-text-muted';
    }

    if (c3) {
      badgeDedicated.textContent = 'Активна';
      badgeDedicated.className = 'status-badge px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold';
      rowDedicated.setAttribute('data-status', 'active');
    } else {
      badgeDedicated.textContent = 'Заблокирована';
      badgeDedicated.className = 'status-badge px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-600 border border-rose-200 font-semibold';
      rowDedicated.setAttribute('data-status', 'blocked');
    }

    if (c1) {
      badgeVps.textContent = 'Продлена';
      badgeVps.className = 'status-badge px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold';
      rowVps.setAttribute('data-status', 'active');
    } else {
      badgeVps.textContent = 'Ждет оплаты';
      badgeVps.className = 'status-badge px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 font-semibold';
      rowVps.setAttribute('data-status', 'pending');
    }
  }

  [check1, check2, check3].forEach(el => el.addEventListener('change', updateSimulation));

  btnApplyAll.addEventListener('click', () => {
    check1.checked = true;
    check2.checked = true;
    check3.checked = true;
    updateSimulation();
  });

  btnReset.addEventListener('click', () => {
    check1.checked = false;
    check2.checked = false;
    check3.checked = false;
    updateSimulation();
  });

  btnRecalculate.addEventListener('click', () => {
    btnRecalculate.classList.add('animate-spin');
    setTimeout(() => {
      btnRecalculate.classList.remove('animate-spin');
      updateSimulation();
    }, 400);
  });

  // Interactive Linking: Click Factor -> Highlight Service in Table
  factorRows.forEach(row => {
    row.addEventListener('click', () => {
      const targetCategory = row.getAttribute('data-target');
      document.querySelectorAll('.service-row').forEach(r => r.classList.remove('highlighted'));

      const targetRows = document.querySelectorAll(`.service-row[data-category*="${targetCategory}"]`);
      targetRows.forEach(r => {
        r.classList.add('highlighted');
        setTimeout(() => r.classList.remove('highlighted'), 2400);
      });

      // Smooth scroll to services
      document.getElementById('services-section').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    });
  });

  // Table Filter Tabs
  const filterBtns = document.querySelectorAll('.filter-btn');
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => {
        b.className = 'filter-btn px-3 py-1 rounded-lg text-slate-600 hover:text-slate-900 font-medium text-xs transition-all';
      });
      btn.className = 'filter-btn px-3 py-1 rounded-lg bg-white text-slate-900 font-semibold text-xs shadow-xs transition-all';

      const filter = btn.getAttribute('data-filter');
      const rows = document.querySelectorAll('.service-row');
      rows.forEach(r => {
        if (filter === 'all') {
          r.style.display = '';
        } else {
          r.style.display = r.getAttribute('data-status') === filter ? '' : 'none';
        }
      });
    });
  });

  // Table Quick Action Buttons
  document.querySelector('.btn-action-dedicated')?.addEventListener('click', (e) => {
    e.stopPropagation();
    check3.checked = !check3.checked;
    updateSimulation();
  });

  document.querySelector('.btn-action-vps')?.addEventListener('click', (e) => {
    e.stopPropagation();
    check1.checked = !check1.checked;
    updateSimulation();
  });

  document.querySelector('.btn-action-backup')?.addEventListener('click', (e) => {
    e.stopPropagation();
    const btn = e.currentTarget;
    const badge = document.querySelector('#service-backup .status-badge');
    badge.textContent = 'Оплачена';
    badge.className = 'status-badge px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold';
    btn.textContent = 'Готово ✓';
    btn.className = 'px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 font-medium cursor-default';
    document.getElementById('factor-bar-3').style.width = '0%';
    document.getElementById('factor-score-3').textContent = '0,0';
    document.getElementById('factor-row-3').style.opacity = '0.45';
  });

  // Untriggered collapse
  const toggleBtn = document.getElementById('toggle-untriggered');
  const untriggeredPanel = document.getElementById('untriggered-panel');
  const toggleIcon = document.getElementById('toggle-untriggered-icon');
  toggleBtn.addEventListener('click', () => {
    const isHidden = untriggeredPanel.classList.toggle('hidden');
    toggleIcon.style.transform = isHidden ? 'rotate(0deg)' : 'rotate(180deg)';
  });
});
</script>
</body></html>