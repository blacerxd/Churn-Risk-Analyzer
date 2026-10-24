<!DOCTYPE html>

<html class="h-full bg-[#f9f9ff] text-text-primary antialiased" lang="ru"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>Aéza Churn Risk — Обзор</title>
<!-- Fonts -->
<link href="https://fonts.googleapis.com" rel="preconnect"/>
<link crossorigin="" href="https://fonts.gstatic.com" rel="preconnect"/>
<link href="https://fonts.googleapis.com/css2?family=Geist:wght@300;400;500;600;700&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<!-- Tailwind Script -->
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<script id="tailwind-config">
    tailwind.config = {
      darkMode: "class",
      theme: {
        extend: {
          colors: {
            "surface-canvas-subtle": "#F4F5F7",
            "on-tertiary-fixed-variant": "#384a4c",
            "on-error": "#ffffff",
            "on-tertiary-container": "#233537",
            "surface-container-lowest": "#ffffff",
            "risk-low-surface": "#D1FAE5",
            "on-error-container": "#93000a",
            "primary-fixed-dim": "#5cd6ee",
            "on-tertiary-fixed": "#0c1e21",
            "risk-medium-surface": "#FEF3C7",
            "on-primary": "#ffffff",
            "on-primary-fixed-variant": "#004e5a",
            "primary-fixed": "#a4eeff",
            "secondary": "#5f5e61",
            "error-container": "#ffdad6",
            "tertiary-container": "#8a9da0",
            "risk-medium": "#F59E0B",
            "on-secondary-fixed": "#1b1b1e",
            "tertiary": "#4f6264",
            "surface-dim": "#d3daea",
            "tertiary-fixed": "#d2e6e9",
            "on-background": "#151c27",
            "secondary-fixed-dim": "#c8c5ca",
            "surface-card-alt": "#F5F6F8",
            "primary-container": "#11a8bf",
            "surface-tint": "#006877",
            "surface-variant": "#dce2f3",
            "on-primary-container": "#003740",
            "text-muted": "#6B7280",
            "risk-high": "#EF4444",
            "on-secondary-container": "#656467",
            "surface-container-low": "#f0f3ff",
            "inverse-on-surface": "#ebf1ff",
            "background": "#f9f9ff",
            "on-secondary-fixed-variant": "#47464a",
            "accent-icon": "#0D8A9E",
            "surface-canvas": "#FFFFFF",
            "on-surface": "#151c27",
            "on-primary-fixed": "#001f25",
            "text-primary": "#111827",
            "on-tertiary": "#ffffff",
            "risk-high-surface": "#FEE2E2",
            "risk-low": "#10B981",
            "surface-container": "#e7eefe",
            "cyan-gradient-start": "#0891B2",
            "cyan-gradient-end": "#15B8CF",
            "outline": "#6d797c",
            "primary": "#006877",
            "outline-variant": "#bcc9cc",
            "on-surface-variant": "#3d494c",
            "surface-container-high": "#e2e8f8",
            "inverse-primary": "#5cd6ee",
            "on-secondary": "#ffffff",
            "surface-container-highest": "#dce2f3",
            "surface-card": "#F3F4F6",
            "inverse-surface": "#2a313d",
            "secondary-container": "#e4e1e6",
            "error": "#ba1a1a",
            "secondary-fixed": "#e4e1e6",
            "tertiary-fixed-dim": "#b6cacd",
            "surface-bright": "#f9f9ff",
            "surface": "#f9f9ff"
          },
          borderRadius: {
            "DEFAULT": "1rem",
            "lg": "2rem",
            "xl": "3rem",
            "full": "9999px"
          },
          fontFamily: {
            "title-md": ["Geist", "sans-serif"],
            "body-lg": ["Geist", "sans-serif"],
            "body-sm": ["Geist", "sans-serif"],
            "headline-lg": ["Geist", "sans-serif"],
            "label-lg": ["Geist", "sans-serif"],
            "stat-mono": ["Geist", "monospace"],
            "headline-md": ["Geist", "sans-serif"],
            "headline-lg-mobile": ["Geist", "sans-serif"],
            "headline-sm": ["Geist", "sans-serif"],
            "label-md": ["Geist", "sans-serif"],
            "display-mobile": ["Geist", "sans-serif"],
            "body-md": ["Geist", "sans-serif"],
            "display": ["Geist", "sans-serif"],
            "label-sm": ["Geist", "sans-serif"]
          }
        }
      }
    }
  </script>
<style>
    .material-symbols-outlined {
      font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 20;
      font-size: 18px;
      line-height: 1;
      display: inline-block;
      vertical-align: middle;
    }
    @keyframes spin-once {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
    .animate-spin-custom {
      animation: spin-once 0.75s cubic-bezier(0.4, 0, 0.2, 1);
    }
  </style>
</head>
<body class="min-h-full flex bg-[#f9f9ff] text-text-primary selection:bg-primary-fixed selection:text-on-primary-fixed font-['Geist',sans-serif]">
<!-- ================= SIDEBAR ================= -->
<aside class="w-64 flex-shrink-0 border-r border-[#e7eefe]/80 bg-white flex flex-col justify-between p-6 select-none z-20 min-h-screen sticky top-0">
<div>
<!-- Brand Logo (é aéza Intelligence style) -->
<div class="flex items-center gap-3 mb-8">
<div class="w-9 h-9 rounded-xl bg-text-primary text-white flex items-center justify-center font-bold text-lg tracking-tight shadow-sm shadow-text-primary/10">
          é
        </div>
<div>
<div class="flex items-center gap-1.5">
<span class="text-[17px] font-bold tracking-tight text-text-primary">aéza</span>
<span class="text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded bg-primary-fixed/60 text-primary tracking-wider">Risk</span>
</div>
<p class="text-[11px] text-text-muted font-medium">Intelligence Lab</p>
</div>
</div>
<!-- Navigation Links -->
<nav class="space-y-1.5">
<a class="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-surface-card text-primary font-medium text-sm transition-all" href="#">
<div class="flex items-center gap-3">
<span class="material-symbols-outlined text-primary" data-icon="dashboard">dashboard</span>
<span>Обзор</span>
</div>
<span class="w-1.5 h-1.5 rounded-full bg-primary-container"></span>
</a>
<a class="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-text-muted hover:text-text-primary hover:bg-surface-card transition-all font-medium text-sm" href="#">
<div class="flex items-center gap-3">
<span class="material-symbols-outlined" data-icon="group">group</span>
<span>Клиенты</span>
</div>
<span class="text-xs px-2 py-0.5 rounded-full bg-surface-card text-text-muted font-mono tabular-nums">300</span>
</a>
<a class="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-text-muted hover:text-text-primary hover:bg-surface-card transition-all font-medium text-sm" href="#">
<div class="flex items-center gap-3">
<span class="material-symbols-outlined" data-icon="neurology">neurology</span>
<span>Модель</span>
</div>
</a>
<a class="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-text-muted hover:text-text-primary hover:bg-surface-card transition-all font-medium text-sm" href="#">
<div class="flex items-center gap-3">
<span class="material-symbols-outlined" data-icon="database">database</span>
<span>Данные</span>
</div>
</a>
</nav>
</div>
<!-- Bottom Sidebar Section -->
<div class="space-y-4 pt-4 border-t border-surface-card">
<!-- Status Card -->
<div class="bg-surface-card rounded-2xl p-3 border border-outline-variant/20">
<div class="flex items-center gap-2 mb-1">
<span class="relative flex h-2 w-2">
<span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-risk-low opacity-75"></span>
<span class="relative inline-flex rounded-full h-2 w-2 bg-risk-low"></span>
</span>
<span class="text-xs text-text-primary font-semibold">CatBoost v2.4.1</span>
</div>
<p class="text-[11px] text-text-muted">Инференс в реальном времени</p>
</div>
<!-- User Profile -->
<div class="flex items-center gap-3 px-1">
<div class="w-8 h-8 rounded-full bg-surface-card flex items-center justify-center text-text-primary font-semibold text-sm border border-outline-variant/30">
          А
        </div>
<div class="overflow-hidden">
<p class="text-xs font-semibold text-text-primary truncate">Алексей</p>
<p class="text-[11px] text-text-muted truncate">Risk Analyst</p>
</div>
</div>
</div>
</aside>
<!-- ================= MAIN CONTENT WRAPPER ================= -->
<div class="flex-1 flex flex-col min-w-0 overflow-y-auto">
<!-- Top App Bar (Header) -->
<header class="w-full bg-[#f9f9ff]/90 sticky top-0 z-10 backdrop-blur-md border-b border-[#e7eefe]/60">
<div class="max-w-7xl mx-auto px-8 py-3.5 flex justify-between items-center gap-4">
<!-- Breadcrumb & Live Sync -->
<div class="flex items-center gap-3">
<div class="flex items-center gap-1.5 text-xs text-text-muted">
<span>Платформа</span>
<span class="material-symbols-outlined text-outline-variant text-[14px]" data-icon="chevron_right">chevron_right</span>
<span class="font-semibold text-text-primary">Обзор</span>
</div>
<div class="h-3.5 w-px bg-outline-variant/40"></div>
<div class="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-white shadow-xs border border-outline-variant/20">
<span class="w-2 h-2 rounded-full bg-risk-low animate-pulse"></span>
<span class="text-[11px] text-text-primary font-medium tracking-tight">WS Live • Обновлено 12 с назад</span>
</div>
</div>
<!-- Trailing Actions Cluster -->
<div class="flex items-center gap-2">
<button class="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white hover:bg-surface-card text-text-primary text-xs font-medium border border-outline-variant/30 transition-all active:scale-95 duration-150 shadow-xs" id="refreshBtn" onclick="triggerRefresh()">
<span class="material-symbols-outlined text-primary text-[15px]" data-icon="refresh" id="refreshIcon">refresh</span>
<span>Пересчитать</span>
</button>
<a class="px-3 py-1.5 rounded-full bg-white hover:bg-surface-card text-text-muted hover:text-text-primary text-xs font-mono border border-outline-variant/30 transition-colors shadow-xs" href="#">
            /metrics
          </a>
<button class="px-2.5 py-1.5 rounded-full bg-white hover:bg-surface-card text-xs font-medium text-text-primary border border-outline-variant/30 transition-colors shadow-xs flex items-center gap-1">
<span>🌐</span>
<span class="font-semibold text-[11px]">RU</span>
</button>
</div>
</div>
</header>
<!-- Canvas Container -->
<main class="max-w-7xl w-full mx-auto px-8 py-6 space-y-6">
<!-- ================= 1. BENTO-БЛОК: ФИНАНСОВЫЙ АКЦЕНТ И СЕГМЕНТАЦИЯ БАЗЫ ================= -->
<section class="grid grid-cols-1 lg:grid-cols-12 gap-5">
<!-- А: Главный финансовый акцент (Col 7) -->
<div class="lg:col-span-7 rounded-3xl p-6 text-white relative overflow-hidden shadow-lg shadow-cyan-900/10 flex flex-col justify-between" style="background: linear-gradient(135deg, #11a8bf 0%, #0e8fa3 100%);">
<!-- Subtle Glow Pattern -->
<div class="absolute -right-10 -bottom-10 w-60 h-60 rounded-full bg-white/10 blur-2xl pointer-events-none"></div>
<div>
<div class="flex items-center justify-between mb-3">
<div class="flex items-center gap-2">
<span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/15 backdrop-blur-md text-[11px] font-semibold text-white tracking-wide border border-white/20">
<span class="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
                  МАТЕМАТИЧЕСКОЕ ОЖИДАНИЕ
                </span>
<span class="px-2 py-0.5 rounded-full bg-white/20 text-white text-[11px] font-mono">
                  43,6% от риска
                </span>
</div>
<button class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/15 hover:bg-white/25 text-white text-xs font-medium backdrop-blur-sm transition-all border border-white/20 active:scale-95" onclick="toggleFormulaModal()" title="Показать формулу расчёта">
<span>Формула расчёта</span>
<span class="material-symbols-outlined text-sm transition-transform duration-200" data-icon="expand_more" id="formulaChevron">expand_more</span>
</button>
</div>
<div class="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end mt-2">
<div>
<p class="text-xs text-white/80 font-medium">Ожидаемые потери (Expected Loss)</p>
<div class="text-3xl sm:text-4xl font-bold tracking-tight text-white font-mono mt-0.5 tabular-nums">
                  €4 812
                </div>
<p class="text-[11px] text-white/85 mt-1 leading-snug">
                  С учетом балансов клиентов и вероятности непродления CatBoost
                </p>
</div>
<div class="sm:border-l sm:border-white/20 sm:pl-4">
<p class="text-xs text-white/80 font-medium">Всего под угрозой (Exposure)</p>
<div class="text-2xl font-bold tracking-tight text-white font-mono mt-0.5 tabular-nums">
                  €11 031
                </div>
<p class="text-[11px] text-white/85 mt-1 leading-snug">
                  Суммарная стоимость услуг 125 клиентов в зоне риска (30 дней)
                </p>
</div>
</div>
</div>
<!-- Раскрывающаяся компактная формула расчёта -->
<div class="hidden mt-4 pt-4 border-t border-white/20 transition-all duration-300" id="formulaDrawer">
<div class="bg-black/15 backdrop-blur-md rounded-2xl p-3.5 border border-white/15 text-xs text-white space-y-2">
<div class="flex items-center justify-between">
<span class="font-mono text-[13px] font-semibold tracking-tight">
                  Потеря = Вероятность × (Не покрыто + 0,3 × Покрыто)
                </span>
<span class="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-white/20">Формула Aéza</span>
</div>
<div class="grid grid-cols-2 gap-2 pt-1 text-[11px] text-white/90">
<div class="bg-white/10 rounded-xl p-2">
<span class="text-white/70 block text-[10px]">Покрыто балансом</span>
<span class="font-mono font-bold text-xs text-white">€3 920</span> (автопродление сработает)
                </div>
<div class="bg-white/10 rounded-xl p-2">
<span class="text-white/70 block text-[10px]">Не покрыто</span>
<span class="font-mono font-bold text-xs text-white">€9 870</span> (требует ручного платежа)
                </div>
</div>
</div>
</div>
<div class="mt-4 pt-3 flex items-center justify-between border-t border-white/20 text-xs">
<span class="text-white/80 text-[11px]">Балансы сглаживают потенциальный отток на 28,4%</span>
<a class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white text-text-primary text-xs font-semibold hover:bg-surface-canvas-subtle transition-all active:scale-95 shadow-sm" href="#clients-section">
<span>К клиентам риска</span>
<span class="material-symbols-outlined text-xs text-primary" data-icon="arrow_forward">arrow_forward</span>
</a>
</div>
</div>
<!-- Б: Сегментация базы (300 клиентов) (Col 5) -->
<div class="lg:col-span-5 bg-white rounded-3xl p-6 border border-[#e7eefe]/80 shadow-xs flex flex-col justify-between">
<div>
<div class="flex items-center justify-between mb-2">
<div>
<h3 class="text-sm font-semibold text-text-primary">Сегментация клиентской базы</h3>
<p class="text-xs text-text-muted">Всего клиентов под мониторингом: <span class="font-mono font-semibold text-text-primary">300</span></p>
</div>
<button class="hidden text-xs text-primary font-medium hover:underline flex items-center gap-1" id="resetFilterBtn" onclick="filterBySegment('all')">
<span class="material-symbols-outlined text-xs" data-icon="close">close</span>
<span>Сбросить</span>
</button>
</div>
<!-- Интерактивная сегментированная полоса распределения -->
<div class="w-full h-3 rounded-full bg-surface-card flex overflow-hidden p-0.5 my-3.5 gap-0.5 shadow-inner">
<div class="h-full bg-risk-high rounded-l-full cursor-pointer transition-all hover:opacity-85" onclick="filterBySegment('high')" style="width: 11.3%" title="Высокий риск: 34 (11,3%)"></div>
<div class="h-full bg-risk-medium cursor-pointer transition-all hover:opacity-85" onclick="filterBySegment('medium')" style="width: 30.3%" title="Средний риск: 91 (30,3%)"></div>
<div class="h-full bg-risk-low cursor-pointer transition-all hover:opacity-85" onclick="filterBySegment('low')" style="width: 49.3%" title="Низкий риск: 148 (49,3%)"></div>
<div class="h-full bg-outline-variant/60 rounded-r-full cursor-pointer transition-all hover:opacity-85" onclick="filterBySegment('none')" style="width: 9.1%" title="Без оценки: 27 (9,0%)"></div>
</div>
<!-- 4 кликабельных фильтр-кнопки -->
<div class="grid grid-cols-2 gap-2.5 mt-3">
<!-- Высокий -->
<button class="segment-filter-btn flex items-center justify-between p-2.5 rounded-2xl bg-surface-card hover:bg-surface-card-alt border border-transparent transition-all text-left" id="filter-btn-high" onclick="filterBySegment('high')">
<div class="flex items-center gap-2">
<span class="w-2.5 h-2.5 rounded-full bg-risk-high shrink-0"></span>
<span class="text-xs font-medium text-text-primary">Высокий</span>
</div>
<div class="text-right">
<span class="text-xs font-mono font-bold text-text-primary block tabular-nums">34</span>
<span class="text-[10px] text-text-muted font-mono">11,3%</span>
</div>
</button>
<!-- Средний -->
<button class="segment-filter-btn flex items-center justify-between p-2.5 rounded-2xl bg-surface-card hover:bg-surface-card-alt border border-transparent transition-all text-left" id="filter-btn-medium" onclick="filterBySegment('medium')">
<div class="flex items-center gap-2">
<span class="w-2.5 h-2.5 rounded-full bg-risk-medium shrink-0"></span>
<span class="text-xs font-medium text-text-primary">Средний</span>
</div>
<div class="text-right">
<span class="text-xs font-mono font-bold text-text-primary block tabular-nums">91</span>
<span class="text-[10px] text-text-muted font-mono">30,3%</span>
</div>
</button>
<!-- Низкий -->
<button class="segment-filter-btn flex items-center justify-between p-2.5 rounded-2xl bg-surface-card hover:bg-surface-card-alt border border-transparent transition-all text-left" id="filter-btn-low" onclick="filterBySegment('low')">
<div class="flex items-center gap-2">
<span class="w-2.5 h-2.5 rounded-full bg-risk-low shrink-0"></span>
<span class="text-xs font-medium text-text-primary">Низкий</span>
</div>
<div class="text-right">
<span class="text-xs font-mono font-bold text-text-primary block tabular-nums">148</span>
<span class="text-[10px] text-text-muted font-mono">49,3%</span>
</div>
</button>
<!-- Без оценки -->
<button class="segment-filter-btn flex items-center justify-between p-2.5 rounded-2xl bg-surface-card hover:bg-surface-card-alt border border-transparent transition-all text-left" id="filter-btn-none" onclick="filterBySegment('none')">
<div class="flex items-center gap-2">
<span class="w-2.5 h-2.5 rounded-full bg-outline-variant shrink-0"></span>
<span class="text-xs font-medium text-text-primary">Без оценки</span>
</div>
<div class="text-right">
<span class="text-xs font-mono font-bold text-text-primary block tabular-nums">27</span>
<span class="text-[10px] text-text-muted font-mono">9,0%</span>
</div>
</button>
</div>
</div>
<div class="mt-3 pt-2.5 border-t border-surface-card flex items-center justify-between text-[11px] text-text-muted">
<span class="flex items-center gap-1">
<span class="material-symbols-outlined text-xs text-primary" data-icon="filter_alt">filter_alt</span>
<span>Нажмите сегмент для фильтрации списка</span>
</span>
<span class="font-mono text-text-primary font-medium" id="activeFilterLabel">Все клиенты</span>
</div>
</div>
</section>
<!-- ================= 2. КРАСИВАЯ И ИНТЕРАКТИВНАЯ РЕТРОСПЕКТИВА (ГРАФИК ОТТОКА) ================= -->
<section class="bg-white rounded-3xl p-7 border border-[#e7eefe]/80 shadow-xs space-y-5">
<!-- Верхняя панель графика с переключателями -->
<div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-1">
<div>
<div class="flex items-center gap-2">
<h2 class="text-lg font-bold text-text-primary">Отток: факт и прогноз</h2>
<span class="text-[11px] font-mono px-2 py-0.5 rounded-full bg-surface-card text-text-muted font-medium">F9 ML Forecast</span>
</div>
<p class="text-xs text-text-muted mt-0.5">Ретроспектива за выбранный период и форвардное прогнозирование непродлений</p>
</div>
<div class="flex flex-wrap items-center gap-3">
<!-- Переключатель метрики: [В деньгах (€)] [В клиентах (шт)] -->
<div class="inline-flex p-1 bg-surface-card rounded-xl text-xs">
<button class="px-3 py-1 rounded-lg font-medium bg-white text-text-primary shadow-xs transition-all" id="metricMoneyBtn" onclick="switchMetric('money')">
                В деньгах (€)
              </button>
<button class="px-3 py-1 rounded-lg font-medium text-text-muted hover:text-text-primary transition-all" id="metricQtyBtn" onclick="switchMetric('qty')">
                В клиентах (шт)
              </button>
</div>
<!-- Горизонт дней [14 дней] [30 дней] [90 дней] -->
<div class="inline-flex p-1 bg-surface-card rounded-xl text-xs font-mono">
<button class="px-3 py-1 rounded-lg text-text-muted hover:text-text-primary transition-all" id="range14Btn" onclick="switchRange(14)">
                14 дн
              </button>
<button class="px-3 py-1 rounded-lg bg-text-primary text-white font-medium shadow-xs transition-all" id="range30Btn" onclick="switchRange(30)">
                30 дн
              </button>
<button class="px-3 py-1 rounded-lg text-text-muted hover:text-text-primary transition-all" id="range90Btn" onclick="switchRange(90)">
                90 дн
              </button>
</div>
</div>
</div>
<!-- Интерактивная карточка среза на точке «Сегодня» -->
<div class="bg-gradient-to-r from-surface-card via-white to-surface-card rounded-2xl p-3.5 border border-[#e7eefe] flex flex-wrap items-center justify-between gap-3">
<div class="flex items-center gap-2.5">
<span class="w-2.5 h-2.5 rounded-full bg-primary-container animate-ping"></span>
<span class="text-xs font-semibold text-text-primary" id="sliceCardTitle">
              Срез на сегодня (0 дн):
            </span>
<span class="text-xs text-text-muted" id="sliceCardFact">
              Факт списаний: <strong class="text-text-primary font-mono" id="sliceFactVal">€3 240</strong>
</span>
<span class="text-text-muted/40">•</span>
<span class="text-xs text-text-muted" id="sliceCardForecast">
              Прогноз непродлений: <strong class="text-primary font-mono" id="sliceForecastVal">+€1 420</strong>
</span>
</div>
<div class="flex items-center gap-3 text-xs">
<span class="px-2.5 py-1 rounded-full bg-risk-high-surface text-risk-high font-semibold text-[11px] tabular-nums" id="sliceRiskBadge">
              12 клиентов под прямым риском
            </span>
</div>
</div>
<!-- Контейнер SVG Графика с hover-слоем и тултипом -->
<div class="relative bg-white rounded-2xl border border-surface-card p-4 select-none" id="chartWrapper">
<!-- Легенда -->
<div class="flex items-center justify-between text-xs text-text-muted mb-2 px-2">
<div class="flex items-center gap-4">
<span class="inline-flex items-center gap-1.5 font-medium text-text-primary">
<span class="w-3 h-0.5 bg-text-primary rounded-full"></span>
                Факт (удаления и списания)
              </span>
<span class="inline-flex items-center gap-1.5 font-medium text-primary">
<span class="w-3.5 h-0.5 border-b-2 border-primary border-dashed"></span>
                Прогноз непродлений
              </span>
<span class="inline-flex items-center gap-1.5 font-medium text-primary/70">
<span class="w-3 h-2 rounded bg-primary-container/20 border border-primary-container/40"></span>
                Зона неопределенности
              </span>
</div>
<span class="font-mono text-[11px] text-text-muted">Ось Y: <span id="yAxisUnit">Евро (€)</span></span>
</div>
<!-- SVG Canvas -->
<svg class="w-full h-64 overflow-visible" id="churnChart" preserveaspectratio="none" viewbox="0 0 900 240">
<defs>
<!-- Градиент под фактом -->
<lineargradient id="factAreaGrad" x1="0" x2="0" y1="0" y2="1">
<stop offset="0%" stop-color="#111827" stop-opacity="0.08"></stop>
<stop offset="100%" stop-color="#111827" stop-opacity="0.00"></stop>
</lineargradient>
<!-- Градиент доверительного интервала прогноза -->
<lineargradient id="forecastUncertaintyGrad" x1="0" x2="0" y1="0" y2="1">
<stop offset="0%" stop-color="#11a8bf" stop-opacity="0.22"></stop>
<stop offset="100%" stop-color="#11a8bf" stop-opacity="0.02"></stop>
</lineargradient>
<!-- Градиент под линией прогноза -->
<lineargradient id="forecastLineGrad" x1="0" x2="0" y1="0" y2="1">
<stop offset="0%" stop-color="#0891b2" stop-opacity="0.15"></stop>
<stop offset="100%" stop-color="#0891b2" stop-opacity="0.00"></stop>
</lineargradient>
</defs>
<!-- Горизонтальные сетки -->
<line stroke="#f0f2f5" stroke-width="1" x1="40" x2="860" y1="30" y2="30"></line>
<line stroke="#f0f2f5" stroke-width="1" x1="40" x2="860" y1="80" y2="80"></line>
<line stroke="#f0f2f5" stroke-width="1" x1="40" x2="860" y1="130" y2="130"></line>
<line stroke="#f0f2f5" stroke-width="1" x1="40" x2="860" y1="180" y2="180"></line>
<line stroke="#e5e7eb" stroke-width="1" x1="40" x2="860" y1="215" y2="215"></line>
<!-- Метки оси Y (динамические) -->
<text class="font-mono" fill="#9ca3af" font-family="Geist" font-size="10" id="yLabel4" text-anchor="end" x="35" y="34">€5k</text>
<text class="font-mono" fill="#9ca3af" font-family="Geist" font-size="10" id="yLabel3" text-anchor="end" x="35" y="84">€3.5k</text>
<text class="font-mono" fill="#9ca3af" font-family="Geist" font-size="10" id="yLabel2" text-anchor="end" x="35" y="134">€2k</text>
<text class="font-mono" fill="#9ca3af" font-family="Geist" font-size="10" id="yLabel1" text-anchor="end" x="35" y="184">€1k</text>
<text class="font-mono" fill="#9ca3af" font-family="Geist" font-size="10" id="yLabel0" text-anchor="end" x="35" y="218">0</text>
<!-- Область доверительного интервала (прогноз неопределенности) -->
<path d="M 450 115 Q 550 90 650 65 T 850 35 L 850 120 Q 750 140 650 150 T 450 115 Z" fill="url(#forecastUncertaintyGrad)" id="uncertaintyArea"></path>
<!-- Заливка под фактом -->
<path d="M 50 180 Q 150 165 250 140 T 450 115 L 450 215 L 50 215 Z" fill="url(#factAreaGrad)" id="factArea"></path>
<!-- Вертикальная ось «Сегодня» (x = 450) -->
<line stroke="#11a8bf" stroke-dasharray="4 3" stroke-width="1.5" x1="450" x2="450" y1="20" y2="215"></line>
<!-- Линия факта (solid black) -->
<path d="M 50 180 Q 150 165 250 140 T 450 115" fill="none" id="factPath" stroke="#111827" stroke-linecap="round" stroke-width="2.5"></path>
<!-- Линия прогноза (dashed teal #11a8bf) -->
<path d="M 450 115 Q 550 95 650 75 T 850 45" fill="none" id="forecastPath" stroke="#11a8bf" stroke-dasharray="6 5" stroke-linecap="round" stroke-width="2.5"></path>
<!-- Узловые интерактивные точки -->
<g id="chartNodes">
<!-- Point -30d -->
<circle class="cursor-pointer transition-all hover:r-6" cx="50" cy="180" data-idx="0" fill="#111827" r="4.5" stroke="#ffffff" stroke-width="2"></circle>
<!-- Point -20d -->
<circle class="cursor-pointer transition-all hover:r-6" cx="180" cy="160" data-idx="1" fill="#111827" r="4.5" stroke="#ffffff" stroke-width="2"></circle>
<!-- Point -10d -->
<circle class="cursor-pointer transition-all hover:r-6" cx="310" cy="135" data-idx="2" fill="#111827" r="4.5" stroke="#ffffff" stroke-width="2"></circle>
<!-- Point TODAY -->
<circle class="cursor-pointer transition-all hover:r-7 shadow-lg" cx="450" cy="115" data-idx="3" fill="#11a8bf" r="6" stroke="#ffffff" stroke-width="2.5"></circle>
<!-- Point +10d -->
<circle class="cursor-pointer transition-all hover:r-6" cx="580" cy="88" data-idx="4" fill="#11a8bf" r="4.5" stroke="#ffffff" stroke-width="2"></circle>
<!-- Point +20d -->
<circle class="cursor-pointer transition-all hover:r-6" cx="710" cy="65" data-idx="5" fill="#11a8bf" r="4.5" stroke="#ffffff" stroke-width="2"></circle>
<!-- Point +30d -->
<circle class="cursor-pointer transition-all hover:r-7" cx="850" cy="45" data-idx="6" fill="#0891b2" r="5" stroke="#ffffff" stroke-width="2"></circle>
</g>
<!-- Сегодня индикатор текст -->
<text fill="#11a8bf" font-family="Geist" font-size="11" font-weight="600" x="455" y="105">Сегодня</text>
<text fill="#ef4444" font-family="Geist" font-size="11" font-weight="600" id="finalForecastText" x="800" y="35">+34 риск</text>
</svg>
<!-- Интерактивный Floating Tooltip -->
<div class="absolute pointer-events-none hidden bg-text-primary text-white rounded-xl py-2 px-3 shadow-xl border border-white/20 text-xs transition-opacity duration-150 z-30" id="chartTooltip" style="transform: translate(-50%, -120%);">
<div class="font-semibold text-[11px] text-white/80" id="tooltipDate">24 Окт (Сегодня)</div>
<div class="font-mono text-sm font-bold text-white mt-0.5" id="tooltipVal">€3 240 факт</div>
<div class="text-[10px] text-primary-fixed mt-0.5" id="tooltipDetail">18 сервисов отключено</div>
</div>
<!-- Метки временной шкалы внизу -->
<div class="flex justify-between items-center text-xs font-mono text-text-muted mt-2 pt-2 border-t border-surface-card px-1" id="timeLabelsRow">
<span class="hover:text-text-primary cursor-pointer" onclick="inspectNode(0)">-30 дн</span>
<span class="hover:text-text-primary cursor-pointer" onclick="inspectNode(1)">-20 дн</span>
<span class="hover:text-text-primary cursor-pointer" onclick="inspectNode(2)">-10 дн</span>
<span class="font-semibold text-primary px-2.5 py-0.5 rounded-full bg-surface-card cursor-pointer shadow-xs" onclick="inspectNode(3)">Сегодня (0 дн)</span>
<span class="hover:text-text-primary cursor-pointer" onclick="inspectNode(4)">+10 дн</span>
<span class="hover:text-text-primary cursor-pointer" onclick="inspectNode(5)">+20 дн</span>
<span class="hover:text-text-primary cursor-pointer" onclick="inspectNode(6)">+30 дн</span>
</div>
</div>
</section>
<!-- ================= 3. ТОП-5 КЛИЕНТОВ ПОД РИСКОМ ================= -->
<section class="bg-white rounded-3xl p-7 border border-[#e7eefe]/80 shadow-xs space-y-4" id="clients-section">
<div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
<div>
<div class="flex items-center gap-2">
<h2 class="text-lg font-bold text-text-primary">Топ-5 клиентов под риском</h2>
<span class="text-xs px-2.5 py-0.5 rounded-full bg-surface-card text-text-muted font-medium" id="clientListSegmentBadge">Все категории</span>
</div>
<p class="text-xs text-text-muted mt-0.5">Аккаунты с подтверждёнными биллинговыми причинами, требующие превентивного контакта</p>
</div>
<div class="flex items-center gap-3">
<!-- Поиск по email или ID -->
<div class="relative">
<span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-sm" data-icon="search">search</span>
<input class="pl-8 pr-3 py-1.5 rounded-full bg-surface-card border-none text-xs text-text-primary placeholder:text-text-muted focus:ring-1 focus:ring-primary w-48 sm:w-60" id="clientSearchInput" oninput="handleClientSearch()" placeholder="Поиск по клиентам..." type="text"/>
</div>
<a class="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-surface-card hover:bg-surface-card-alt text-text-primary text-xs font-semibold transition-all group shrink-0" href="#">
<span>Все клиенты (300)</span>
<span class="material-symbols-outlined text-xs text-primary group-hover:translate-x-0.5 transition-transform" data-icon="arrow_forward">arrow_forward</span>
</a>
</div>
</div>
<!-- Таблица клиентов -->
<div class="overflow-x-auto">
<table class="w-full text-left border-separate border-spacing-y-2">
<thead>
<tr class="text-[11px] font-semibold text-text-muted uppercase tracking-wider px-4">
<th class="py-2 px-4">Клиент</th>
<th class="py-2 px-4">Реальная биллинговая причина риска</th>
<th class="py-2 px-4">Score оттока</th>
<th class="py-2 px-4 text-right">Ожидаемая потеря</th>
<th class="py-2 px-4 text-center">Действия</th>
</tr>
</thead>
<tbody class="text-xs" id="clientsTableBody">
<!-- Row 1 -->
<tr class="client-row bg-surface-card hover:bg-surface-card-alt/80 rounded-2xl transition-all" data-search="ae-9481 tech-lead@nordic-media.fi backup" data-segment="high">
<td class="py-3.5 px-4 rounded-l-2xl">
<div class="font-mono text-text-muted text-[11px]">#AE-9481</div>
<div class="font-semibold text-text-primary text-xs">tech-lead@nordic-media.fi</div>
</td>
<td class="py-3.5 px-4">
<span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-risk-high-surface text-risk-high text-[11px] font-medium">
<span class="w-1.5 h-1.5 rounded-full bg-risk-high"></span>
                    Услуга Backup 100GB ждёт оплаты, удаление через 2 дня
                  </span>
</td>
<td class="py-3.5 px-4">
<div class="flex items-center gap-2">
<span class="font-mono font-bold text-text-primary tabular-nums">94</span>
<div class="w-20 h-1.5 bg-white rounded-full overflow-hidden">
<div class="h-full bg-risk-high rounded-full" style="width: 94%"></div>
</div>
</div>
</td>
<td class="py-3.5 px-4 text-right font-mono text-sm font-bold text-text-primary tabular-nums">
                  €1 420
                </td>
<td class="py-3.5 px-4 rounded-r-2xl text-center">
<div class="inline-flex items-center gap-1.5">
<button class="notify-btn px-2.5 py-1 rounded-full bg-white hover:bg-primary hover:text-white text-text-primary text-[11px] font-medium border border-outline-variant/30 transition-all shadow-xs" onclick="notifyClient(this, '#AE-9481')">
                      Уведомить
                    </button>
<button class="w-7 h-7 rounded-full bg-white hover:bg-surface-card text-accent-icon inline-flex items-center justify-center transition-colors shadow-xs" title="В карточку клиента">
<span class="material-symbols-outlined text-xs" data-icon="arrow_forward">arrow_forward</span>
</button>
</div>
</td>
</tr>
<!-- Row 2 -->
<tr class="client-row bg-surface-card hover:bg-surface-card-alt/80 rounded-2xl transition-all" data-search="ae-8820 infra@krakow-fintech.pl vps pro" data-segment="high">
<td class="py-3.5 px-4 rounded-l-2xl">
<div class="font-mono text-text-muted text-[11px]">#AE-8820</div>
<div class="font-semibold text-text-primary text-xs">infra@krakow-fintech.pl</div>
</td>
<td class="py-3.5 px-4">
<span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-risk-high-surface text-risk-high text-[11px] font-medium">
<span class="w-1.5 h-1.5 rounded-full bg-risk-high"></span>
                    Не хватает €31,40 на продление VPS Pro (автопродление выключено)
                  </span>
</td>
<td class="py-3.5 px-4">
<div class="flex items-center gap-2">
<span class="font-mono font-bold text-text-primary tabular-nums">88</span>
<div class="w-20 h-1.5 bg-white rounded-full overflow-hidden">
<div class="h-full bg-risk-high rounded-full" style="width: 88%"></div>
</div>
</div>
</td>
<td class="py-3.5 px-4 text-right font-mono text-sm font-bold text-text-primary tabular-nums">
                  €980
                </td>
<td class="py-3.5 px-4 rounded-r-2xl text-center">
<div class="inline-flex items-center gap-1.5">
<button class="notify-btn px-2.5 py-1 rounded-full bg-white hover:bg-primary hover:text-white text-text-primary text-[11px] font-medium border border-outline-variant/30 transition-all shadow-xs" onclick="notifyClient(this, '#AE-8820')">
                      Уведомить
                    </button>
<button class="w-7 h-7 rounded-full bg-white hover:bg-surface-card text-accent-icon inline-flex items-center justify-center transition-colors shadow-xs" title="В карточку клиента">
<span class="material-symbols-outlined text-xs" data-icon="arrow_forward">arrow_forward</span>
</button>
</div>
</td>
</tr>
<!-- Row 3 -->
<tr class="client-row bg-surface-card hover:bg-surface-card-alt/80 rounded-2xl transition-all" data-search="ae-7132 devops@berlin-gaming.de автопродление" data-segment="medium">
<td class="py-3.5 px-4 rounded-l-2xl">
<div class="font-mono text-text-muted text-[11px]">#AE-7132</div>
<div class="font-semibold text-text-primary text-xs">devops@berlin-gaming.de</div>
</td>
<td class="py-3.5 px-4">
<span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-risk-medium-surface text-risk-medium text-[11px] font-medium">
<span class="w-1.5 h-1.5 rounded-full bg-risk-medium"></span>
                    Автопродление выключено у 3 серверов
                  </span>
</td>
<td class="py-3.5 px-4">
<div class="flex items-center gap-2">
<span class="font-mono font-bold text-text-primary tabular-nums">76</span>
<div class="w-20 h-1.5 bg-white rounded-full overflow-hidden">
<div class="h-full bg-risk-medium rounded-full" style="width: 76%"></div>
</div>
</div>
</td>
<td class="py-3.5 px-4 text-right font-mono text-sm font-bold text-text-primary tabular-nums">
                  €740
                </td>
<td class="py-3.5 px-4 rounded-r-2xl text-center">
<div class="inline-flex items-center gap-1.5">
<button class="notify-btn px-2.5 py-1 rounded-full bg-white hover:bg-primary hover:text-white text-text-primary text-[11px] font-medium border border-outline-variant/30 transition-all shadow-xs" onclick="notifyClient(this, '#AE-7132')">
                      Уведомить
                    </button>
<button class="w-7 h-7 rounded-full bg-white hover:bg-surface-card text-accent-icon inline-flex items-center justify-center transition-colors shadow-xs" title="В карточку клиента">
<span class="material-symbols-outlined text-xs" data-icon="arrow_forward">arrow_forward</span>
</button>
</div>
</td>
</tr>
<!-- Row 4 -->
<tr class="client-row bg-surface-card hover:bg-surface-card-alt/80 rounded-2xl transition-all" data-search="ae-6590 admin@amsterdam-cdn.nl карта ошибка" data-segment="medium">
<td class="py-3.5 px-4 rounded-l-2xl">
<div class="font-mono text-text-muted text-[11px]">#AE-6590</div>
<div class="font-semibold text-text-primary text-xs">admin@amsterdam-cdn.nl</div>
</td>
<td class="py-3.5 px-4">
<span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-risk-medium-surface text-risk-medium text-[11px] font-medium">
<span class="w-1.5 h-1.5 rounded-full bg-risk-medium"></span>
                    Ошибка списания с карты, 2 неудачные попытки
                  </span>
</td>
<td class="py-3.5 px-4">
<div class="flex items-center gap-2">
<span class="font-mono font-bold text-text-primary tabular-nums">69</span>
<div class="w-20 h-1.5 bg-white rounded-full overflow-hidden">
<div class="h-full bg-risk-medium rounded-full" style="width: 69%"></div>
</div>
</div>
</td>
<td class="py-3.5 px-4 text-right font-mono text-sm font-bold text-text-primary tabular-nums">
                  €610
                </td>
<td class="py-3.5 px-4 rounded-r-2xl text-center">
<div class="inline-flex items-center gap-1.5">
<button class="notify-btn px-2.5 py-1 rounded-full bg-white hover:bg-primary hover:text-white text-text-primary text-[11px] font-medium border border-outline-variant/30 transition-all shadow-xs" onclick="notifyClient(this, '#AE-6590')">
                      Уведомить
                    </button>
<button class="w-7 h-7 rounded-full bg-white hover:bg-surface-card text-accent-icon inline-flex items-center justify-center transition-colors shadow-xs" title="В карточку клиента">
<span class="material-symbols-outlined text-xs" data-icon="arrow_forward">arrow_forward</span>
</button>
</div>
</td>
</tr>
<!-- Row 5 -->
<tr class="client-row bg-surface-card hover:bg-surface-card-alt/80 rounded-2xl transition-all" data-search="ae-5012 billing@stockholm-vps.se отключил услуги" data-segment="medium">
<td class="py-3.5 px-4 rounded-l-2xl">
<div class="font-mono text-text-muted text-[11px]">#AE-5012</div>
<div class="font-semibold text-text-primary text-xs">billing@stockholm-vps.se</div>
</td>
<td class="py-3.5 px-4">
<span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-risk-medium-surface text-risk-medium text-[11px] font-medium">
<span class="w-1.5 h-1.5 rounded-full bg-risk-medium"></span>
                    Отключил 2 услуги из 3 за неделю
                  </span>
</td>
<td class="py-3.5 px-4">
<div class="flex items-center gap-2">
<span class="font-mono font-bold text-text-primary tabular-nums">64</span>
<div class="w-20 h-1.5 bg-white rounded-full overflow-hidden">
<div class="h-full bg-risk-medium rounded-full" style="width: 64%"></div>
</div>
</div>
</td>
<td class="py-3.5 px-4 text-right font-mono text-sm font-bold text-text-primary tabular-nums">
                  €495
                </td>
<td class="py-3.5 px-4 rounded-r-2xl text-center">
<div class="inline-flex items-center gap-1.5">
<button class="notify-btn px-2.5 py-1 rounded-full bg-white hover:bg-primary hover:text-white text-text-primary text-[11px] font-medium border border-outline-variant/30 transition-all shadow-xs" onclick="notifyClient(this, '#AE-5012')">
                      Уведомить
                    </button>
<button class="w-7 h-7 rounded-full bg-white hover:bg-surface-card text-accent-icon inline-flex items-center justify-center transition-colors shadow-xs" title="В карточку клиента">
<span class="material-symbols-outlined text-xs" data-icon="arrow_forward">arrow_forward</span>
</button>
</div>
</td>
</tr>
</tbody>
</table>
</div>
</section>
</main>
<!-- ================= FOOTER ================= -->
<footer class="mt-auto bg-transparent border-t border-[#e7eefe]/80 py-6">
<div class="flex flex-col md:flex-row justify-between items-center w-full px-8 max-w-7xl mx-auto gap-4">
<div class="flex items-center gap-3">
<span class="font-bold text-text-primary text-sm tracking-tight">Aéza</span>
<span class="text-xs text-text-muted">© 2025 Aéza Infrastructure Intelligence. All rights reserved.</span>
</div>
<div class="flex flex-wrap items-center gap-6 text-xs text-text-muted">
<a class="hover:text-primary transition-colors duration-200" href="#">Security Architecture</a>
<a class="hover:text-primary transition-colors duration-200" href="#">System Status</a>
<a class="hover:text-primary transition-colors duration-200" href="#">Terms of Service</a>
<a class="hover:text-primary transition-colors duration-200" href="#">Privacy Policy</a>
</div>
</div>
</footer>
</div>
<!-- ================= JAVASCRIPT LOGIC ================= -->
<script>
    // --- 1. Кнопка «Пересчитать» со спиннером ---
    function triggerRefresh() {
      const icon = document.getElementById('refreshIcon');
      const btn = document.getElementById('refreshBtn');
      icon.classList.add('animate-spin-custom');
      btn.classList.add('opacity-70');
      
      setTimeout(() => {
        icon.classList.remove('animate-spin-custom');
        btn.classList.remove('opacity-70');
      }, 750);
    }

    // --- 2. Раскрытие формулы потерь ---
    function toggleFormulaModal() {
      const drawer = document.getElementById('formulaDrawer');
      const chevron = document.getElementById('formulaChevron');
      if (drawer.classList.contains('hidden')) {
        drawer.classList.remove('hidden');
        chevron.style.transform = 'rotate(180deg)';
      } else {
        drawer.classList.add('hidden');
        chevron.style.transform = 'rotate(0deg)';
      }
    }

    // --- 3. Фильтрация сегментов базы и таблицы ---
    let currentSegment = 'all';

    function filterBySegment(segment) {
      currentSegment = segment;
      const resetBtn = document.getElementById('resetFilterBtn');
      const label = document.getElementById('activeFilterLabel');
      const badge = document.getElementById('clientListSegmentBadge');

      const buttons = document.querySelectorAll('.segment-filter-btn');
      buttons.forEach(b => {
        b.classList.remove('ring-2', 'ring-primary', 'bg-surface-card-alt');
      });

      if (segment === 'all') {
        resetBtn.classList.add('hidden');
        label.textContent = 'Все клиенты';
        badge.textContent = 'Все категории';
      } else {
        resetBtn.classList.remove('hidden');
        const activeBtn = document.getElementById(`filter-btn-${segment}`);
        if (activeBtn) {
          activeBtn.classList.add('ring-2', 'ring-primary', 'bg-surface-card-alt');
        }

        const titles = {
          high: 'Высокий риск (34)',
          medium: 'Средний риск (91)',
          low: 'Низкий риск (148)',
          none: 'Без оценки (27)'
        };
        label.textContent = titles[segment] || segment;
        badge.textContent = titles[segment] || segment;
      }

      applyTableFilters();
    }

    function handleClientSearch() {
      applyTableFilters();
    }

    function applyTableFilters() {
      const query = document.getElementById('clientSearchInput').value.toLowerCase().trim();
      const rows = document.querySelectorAll('.client-row');

      rows.forEach(row => {
        const seg = row.getAttribute('data-segment');
        const searchData = row.getAttribute('data-search') || '';
        const matchSegment = (currentSegment === 'all') || (seg === currentSegment);
        const matchQuery = !query || searchData.includes(query);

        if (matchSegment && matchQuery) {
          row.style.display = '';
        } else {
          row.style.display = 'none';
        }
      });
    }

    // --- 4. Кнопка «Уведомить» клиента ---
    function notifyClient(btn, clientId) {
      btn.innerHTML = 'Отправлено ✓';
      btn.classList.remove('bg-white', 'text-text-primary', 'hover:bg-primary', 'hover:text-white');
      btn.classList.add('bg-risk-low-surface', 'text-risk-low', 'font-semibold', 'border-transparent');
      btn.disabled = true;
    }

    // --- 5. Интерактивный график оттока (Chart Data & Logic) ---
    const chartState = {
      metric: 'money', // 'money' or 'qty'
      range: 30        // 14, 30, 90
    };

    // Данные для узлов (-30, -20, -10, 0, +10, +20, +30)
    const chartData = {
      money: {
        unit: 'Евро (€)',
        yLabels: ['€5k', '€3.5k', '€2k', '€1k', '0'],
        nodes: [
          { label: '30 дн назад', value: '€920 факт', detail: '8 сервисов списано', cx: 50, cy: 180 },
          { label: '20 дн назад', value: '€1 680 факт', detail: '11 сервисов списано', cx: 180, cy: 160 },
          { label: '10 дн назад', value: '€2 410 факт', detail: '14 сервисов списано', cx: 310, cy: 135 },
          { label: 'Сегодня (0 дн)', value: '€3 240 факт', detail: 'Срез: 18 сервисов, 12 под риском', cx: 450, cy: 115 },
          { label: 'Через 10 дн', value: '€3 950 прогноз', detail: 'Ожидается непродлений: +8', cx: 580, cy: 88 },
          { label: 'Через 20 дн', value: '€4 430 прогноз', detail: 'Ожидается непродлений: +18', cx: 710, cy: 65 },
          { label: 'Через 30 дн', value: '€4 812 прогноз', detail: 'Полный горизонт: +34 риска', cx: 850, cy: 45 }
        ],
        sliceFact: '€3 240',
        sliceForecast: '+€1 420',
        finalBadge: '+€4 812 риск'
      },
      qty: {
        unit: 'Клиенты / Сервисы (шт)',
        yLabels: ['50 шт', '35 шт', '20 шт', '10 шт', '0'],
        nodes: [
          { label: '30 дн назад', value: '6 клиентов', detail: '8 серверов удалено', cx: 50, cy: 190 },
          { label: '20 дн назад', value: '11 клиентов', detail: '14 серверов удалено', cx: 180, cy: 165 },
          { label: '10 дн назад', value: '15 клиентов', detail: '19 серверов удалено', cx: 310, cy: 140 },
          { label: 'Сегодня (0 дн)', value: '18 клиентов', detail: '12 клиентов в опасности', cx: 450, cy: 120 },
          { label: 'Через 10 дн', value: '24 клиента', detail: 'Прогноз непродлений: +6', cx: 580, cy: 92 },
          { label: 'Через 20 дн', value: '29 клиентов', detail: 'Прогноз непродлений: +11', cx: 710, cy: 70 },
          { label: 'Через 30 дн', value: '34 клиента', detail: 'Прогноз непродлений: +16', cx: 850, cy: 50 }
        ],
        sliceFact: '18 клиентов',
        sliceForecast: '+12 клиентов',
        finalBadge: '+34 клиента'
      }
    };

    function switchMetric(metric) {
      chartState.metric = metric;
      const moneyBtn = document.getElementById('metricMoneyBtn');
      const qtyBtn = document.getElementById('metricQtyBtn');

      if (metric === 'money') {
        moneyBtn.className = 'px-3 py-1 rounded-lg font-medium bg-white text-text-primary shadow-xs transition-all';
        qtyBtn.className = 'px-3 py-1 rounded-lg font-medium text-text-muted hover:text-text-primary transition-all';
      } else {
        qtyBtn.className = 'px-3 py-1 rounded-lg font-medium bg-white text-text-primary shadow-xs transition-all';
        moneyBtn.className = 'px-3 py-1 rounded-lg font-medium text-text-muted hover:text-text-primary transition-all';
      }

      updateChartRendering();
    }

    function switchRange(days) {
      chartState.range = days;
      [14, 30, 90].forEach(d => {
        const btn = document.getElementById(`range${d}Btn`);
        if (d === days) {
          btn.className = 'px-3 py-1 rounded-lg bg-text-primary text-white font-medium shadow-xs transition-all';
        } else {
          btn.className = 'px-3 py-1 rounded-lg text-text-muted hover:text-text-primary transition-all';
        }
      });

      // Обновляем метки временной шкалы
      const timeLabelsRow = document.getElementById('timeLabelsRow');
      if (days === 14) {
        timeLabelsRow.innerHTML = `
          <span class="hover:text-text-primary cursor-pointer" onclick="inspectNode(0)">-14 дн</span>
          <span class="hover:text-text-primary cursor-pointer" onclick="inspectNode(1)">-10 дн</span>
          <span class="hover:text-text-primary cursor-pointer" onclick="inspectNode(2)">-5 дн</span>
          <span class="font-semibold text-primary px-2.5 py-0.5 rounded-full bg-surface-card cursor-pointer shadow-xs" onclick="inspectNode(3)">Сегодня (0 дн)</span>
          <span class="hover:text-text-primary cursor-pointer" onclick="inspectNode(4)">+5 дн</span>
          <span class="hover:text-text-primary cursor-pointer" onclick="inspectNode(5)">+10 дн</span>
          <span class="hover:text-text-primary cursor-pointer" onclick="inspectNode(6)">+14 дн</span>
        `;
      } else if (days === 90) {
        timeLabelsRow.innerHTML = `
          <span class="hover:text-text-primary cursor-pointer" onclick="inspectNode(0)">-90 дн</span>
          <span class="hover:text-text-primary cursor-pointer" onclick="inspectNode(1)">-60 дн</span>
          <span class="hover:text-text-primary cursor-pointer" onclick="inspectNode(2)">-30 дн</span>
          <span class="font-semibold text-primary px-2.5 py-0.5 rounded-full bg-surface-card cursor-pointer shadow-xs" onclick="inspectNode(3)">Сегодня (0 дн)</span>
          <span class="hover:text-text-primary cursor-pointer" onclick="inspectNode(4)">+30 дн</span>
          <span class="hover:text-text-primary cursor-pointer" onclick="inspectNode(5)">+60 дн</span>
          <span class="hover:text-text-primary cursor-pointer" onclick="inspectNode(6)">+90 дн</span>
        `;
      } else {
        timeLabelsRow.innerHTML = `
          <span class="hover:text-text-primary cursor-pointer" onclick="inspectNode(0)">-30 дн</span>
          <span class="hover:text-text-primary cursor-pointer" onclick="inspectNode(1)">-20 дн</span>
          <span class="hover:text-text-primary cursor-pointer" onclick="inspectNode(2)">-10 дн</span>
          <span class="font-semibold text-primary px-2.5 py-0.5 rounded-full bg-surface-card cursor-pointer shadow-xs" onclick="inspectNode(3)">Сегодня (0 дн)</span>
          <span class="hover:text-text-primary cursor-pointer" onclick="inspectNode(4)">+10 дн</span>
          <span class="hover:text-text-primary cursor-pointer" onclick="inspectNode(5)">+20 дн</span>
          <span class="hover:text-text-primary cursor-pointer" onclick="inspectNode(6)">+30 дн</span>
        `;
      }

      updateChartRendering();
    }

    function updateChartRendering() {
      const data = chartData[chartState.metric];
      document.getElementById('yAxisUnit').textContent = data.unit;

      // Обновляем метки Y
      document.getElementById('yLabel4').textContent = data.yLabels[0];
      document.getElementById('yLabel3').textContent = data.yLabels[1];
      document.getElementById('yLabel2').textContent = data.yLabels[2];
      document.getElementById('yLabel1').textContent = data.yLabels[3];
      document.getElementById('yLabel0').textContent = data.yLabels[4];

      // Срез на сегодня
      document.getElementById('sliceFactVal').textContent = data.sliceFact;
      document.getElementById('sliceForecastVal').textContent = data.sliceForecast;
      document.getElementById('finalForecastText').textContent = data.finalBadge;
    }

    // --- Hover и Tooltip по узлам графика ---
    const tooltip = document.getElementById('chartTooltip');
    const chartWrapper = document.getElementById('chartWrapper');
    const nodes = document.querySelectorAll('#chartNodes circle');

    nodes.forEach(node => {
      node.addEventListener('mouseenter', (e) => {
        const idx = parseInt(e.target.getAttribute('data-idx'));
        inspectNode(idx, e.target);
      });

      node.addEventListener('mouseleave', () => {
        tooltip.classList.add('hidden');
      });
    });

    function inspectNode(idx, targetEl) {
      const data = chartData[chartState.metric].nodes[idx];
      if (!data) return;

      document.getElementById('tooltipDate').textContent = data.label;
      document.getElementById('tooltipVal').textContent = data.value;
      document.getElementById('tooltipDetail').textContent = data.detail;

      // Вычисление координат тултипа
      const svg = document.getElementById('churnChart');
      const svgRect = svg.getBoundingClientRect();
      const wrapperRect = chartWrapper.getBoundingClientRect();

      const scaleX = svgRect.width / 900;
      const scaleY = svgRect.height / 240;

      const posX = (svgRect.left - wrapperRect.left) + (data.cx * scaleX);
      const posY = (svgRect.top - wrapperRect.top) + (data.cy * scaleY);

      tooltip.style.left = `${posX}px`;
      tooltip.style.top = `${posY}px`;
      tooltip.classList.remove('hidden');
    }

    // Инициализация
    updateChartRendering();
  </script>
</body></html>