<!DOCTYPE html>

<html class="h-full bg-[#FFFFFF]" lang="ru"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>Aéza Churn Risk — Настройки модели</title>
<!-- Google Fonts: Geist & Inter -->
<link href="https://fonts.googleapis.com" rel="preconnect"/>
<link crossorigin="" href="https://fonts.gstatic.com" rel="preconnect"/>
<link href="https://fonts.googleapis.com/css2?family=Geist:wght@300;400;500;600;700;800&amp;family=JetBrains+Mono:wght@400;500;600&amp;display=swap" rel="stylesheet"/>
<!-- Material Symbols Outlined -->
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<!-- Tailwind CSS CDN -->
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<script id="tailwind-config">
    tailwind.config = {
      darkMode: "class",
      theme: {
        extend: {
          colors: {
            "inverse-primary": "#5cd6ee",
            "on-primary-fixed": "#001f25",
            "on-tertiary-fixed": "#0c1e21",
            "outline-variant": "#bcc9cc",
            "surface-variant": "#dce2f3",
            "on-primary": "#ffffff",
            "accent-icon": "#0D8A9E",
            "surface-canvas": "#FFFFFF",
            "secondary": "#5f5e61",
            "tertiary-fixed": "#d2e6e9",
            "tertiary-fixed-dim": "#b6cacd",
            "on-error-container": "#93000a",
            "on-primary-container": "#003740",
            "secondary-fixed-dim": "#c8c5ca",
            "primary-container": "#11a8bf",
            "on-primary-fixed-variant": "#004e5a",
            "surface": "#f9f9ff",
            "risk-low-surface": "#D1FAE5",
            "surface-container-lowest": "#ffffff",
            "text-muted": "#6B7280",
            "primary": "#006877",
            "surface-card": "#F3F4F6",
            "secondary-fixed": "#e4e1e6",
            "surface-canvas-subtle": "#F4F5F7",
            "secondary-container": "#e4e1e6",
            "outline": "#6d797c",
            "surface-container": "#e7eefe",
            "on-surface-variant": "#3d494c",
            "inverse-surface": "#2a313d",
            "primary-fixed-dim": "#5cd6ee",
            "risk-high": "#EF4444",
            "text-primary": "#111827",
            "on-background": "#151c27",
            "on-surface": "#151c27",
            "surface-container-high": "#e2e8f8",
            "surface-bright": "#f9f9ff",
            "on-secondary": "#ffffff",
            "risk-high-surface": "#FEE2E2",
            "primary-fixed": "#a4eeff",
            "error-container": "#ffdad6",
            "risk-low": "#10B981",
            "on-secondary-fixed": "#1b1b1e",
            "error": "#ba1a1a",
            "on-secondary-container": "#656467",
            "on-secondary-fixed-variant": "#47464a",
            "background": "#f9f9ff",
            "on-tertiary": "#ffffff",
            "surface-container-low": "#f0f3ff",
            "tertiary": "#4f6264",
            "risk-medium": "#F59E0B",
            "on-error": "#ffffff",
            "tertiary-container": "#8a9da0",
            "surface-tint": "#006877",
            "inverse-on-surface": "#ebf1ff",
            "surface-dim": "#d3daea",
            "cyan-gradient-start": "#0891B2",
            "cyan-gradient-end": "#15B8CF",
            "surface-container-highest": "#dce2f3",
            "surface-card-alt": "#F5F6F8",
            "on-tertiary-fixed-variant": "#384a4c",
            "risk-medium-surface": "#FEF3C7",
            "on-tertiary-container": "#233537"
          },
          borderRadius: {
            "DEFAULT": "1rem",
            "lg": "2rem",
            "xl": "3rem",
            "full": "9999px"
          },
          fontFamily: {
            "label-lg": ["Geist"],
            "title-md": ["Geist"],
            "headline-lg-mobile": ["Geist"],
            "body-lg": ["Geist"],
            "headline-lg": ["Geist"],
            "display-mobile": ["Geist"],
            "headline-md": ["Geist"],
            "label-sm": ["Geist"],
            "body-md": ["Geist"],
            "stat-mono": ["Geist"],
            "headline-sm": ["Geist"],
            "display": ["Geist"],
            "body-sm": ["Geist"],
            "label-md": ["Geist"]
          },
          fontSize: {
            "label-lg": ["14px", { lineHeight: "20px", fontWeight: "500" }],
            "title-md": ["16px", { lineHeight: "22px", letterSpacing: "-0.005em", fontWeight: "600" }],
            "headline-lg-mobile": ["24px", { lineHeight: "32px", letterSpacing: "-0.01em", fontWeight: "600" }],
            "body-lg": ["16px", { lineHeight: "24px", fontWeight: "400" }],
            "headline-lg": ["32px", { lineHeight: "40px", letterSpacing: "-0.02em", fontWeight: "700" }],
            "display-mobile": ["32px", { lineHeight: "40px", letterSpacing: "-0.02em", fontWeight: "700" }],
            "headline-md": ["22px", { lineHeight: "28px", letterSpacing: "-0.015em", fontWeight: "600" }],
            "label-sm": ["11px", { lineHeight: "14px", letterSpacing: "0.04em", fontWeight: "600" }],
            "body-md": ["14px", { lineHeight: "20px", fontWeight: "400" }],
            "stat-mono": ["28px", { lineHeight: "32px", letterSpacing: "-0.02em", fontWeight: "700" }],
            "headline-sm": ["18px", { lineHeight: "24px", letterSpacing: "-0.01em", fontWeight: "600" }],
            "display": ["48px", { lineHeight: "56px", letterSpacing: "-0.03em", fontWeight: "700" }],
            "body-sm": ["12px", { lineHeight: "16px", fontWeight: "400" }],
            "label-md": ["12px", { lineHeight: "16px", fontWeight: "500" }]
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
    
    /* Clean custom input ranges */
    input[type=range] {
      -webkit-appearance: none;
      background: transparent;
    }
    input[type=range]:focus {
      outline: none;
    }
    input[type=range]::-webkit-slider-thumb {
      -webkit-appearance: none;
      height: 18px;
      width: 18px;
      border-radius: 50%;
      background: #11A8BF;
      cursor: pointer;
      box-shadow: 0 1px 4px rgba(0, 0, 0, 0.2);
      border: 2px solid #FFFFFF;
      transition: transform 0.1s ease;
    }
    input[type=range]::-webkit-slider-thumb:hover {
      transform: scale(1.15);
    }
    input[type=range]::-moz-range-thumb {
      height: 18px;
      width: 18px;
      border-radius: 50%;
      background: #11A8BF;
      cursor: pointer;
      border: 2px solid #FFFFFF;
    }

    /* Pulse dot animation */
    @keyframes subtlePulse {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.5; transform: scale(0.92); }
    }
    .pulse-live {
      animation: subtlePulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
    }
  </style>
</head>
<body class="h-full bg-[#FFFFFF] text-text-primary antialiased selection:bg-primary-fixed selection:text-on-primary-fixed flex flex-col font-body-md text-body-md overflow-x-hidden">
<!-- Desktop App Container -->
<div class="flex flex-1 min-h-screen w-full bg-[#FFFFFF]">
<!-- ========================================== -->
<!-- 1. LEFT FIXED SIDEBAR                      -->
<!-- ========================================== -->
<aside class="w-64 border-r border-[#F0F1F4] bg-[#FFFFFF] flex flex-col justify-between shrink-0 p-5 sticky top-0 h-screen select-none">
<!-- Top: Logo & Nav -->
<div class="flex flex-col gap-8">
<!-- Logo Aéza Intelligence -->
<div class="flex items-center gap-2.5 px-2">
<div class="w-9 h-9 rounded-2xl bg-surface-card flex items-center justify-center font-bold text-headline-sm text-text-primary shadow-sm border border-[#E5E7EB]/50">
            é
          </div>
<div class="flex items-baseline gap-2">
<span class="font-headline-sm text-headline-sm font-extrabold tracking-tight text-text-primary">aéza</span>
<span class="px-2 py-0.5 rounded-full bg-surface-card text-text-muted font-label-sm text-label-sm tracking-wide">Intelligence</span>
</div>
</div>
<!-- Navigation items -->
<nav aria-label="Основное меню" class="flex flex-col gap-1.5">
<!-- Обзор -->
<a class="flex items-center gap-3 px-3 py-2.5 rounded-2xl text-text-muted font-label-lg text-label-lg hover:bg-surface-card hover:text-text-primary transition-all duration-150" href="#">
<span class="material-symbols-outlined text-[20px]">dashboard</span>
<span>Обзор</span>
</a>
<!-- Клиенты (with badge 300) -->
<a class="flex items-center justify-between px-3 py-2.5 rounded-2xl text-text-muted font-label-lg text-label-lg hover:bg-surface-card hover:text-text-primary transition-all duration-150" href="#">
<div class="flex items-center gap-3">
<span class="material-symbols-outlined text-[20px]">group</span>
<span>Клиенты</span>
</div>
<span class="px-2 py-0.5 rounded-full bg-surface-card text-text-muted font-label-sm text-label-sm">300</span>
</a>
<!-- Модель (ACTIVE ITEM) -->
<a class="flex items-center gap-3 px-3 py-2.5 rounded-2xl bg-[#18181B] text-[#FFFFFF] font-label-lg text-label-lg shadow-sm transition-all duration-150" href="#">
<span class="material-symbols-outlined text-[20px]" style="font-variation-settings: 'FILL' 1;">tune</span>
<span class="font-semibold">Модель</span>
</a>
<!-- Данные -->
<a class="flex items-center gap-3 px-3 py-2.5 rounded-2xl text-text-muted font-label-lg text-label-lg hover:bg-surface-card hover:text-text-primary transition-all duration-150" href="#">
<span class="material-symbols-outlined text-[20px]">database</span>
<span>Данные</span>
</a>
</nav>
</div>
<!-- Bottom Sidebar: Inference widget & User Profile -->
<div class="flex flex-col gap-3">
<!-- Inference Status Card -->
<div class="p-3.5 rounded-2xl bg-surface-card flex flex-col gap-1.5">
<div class="flex items-center gap-2">
<span class="w-2 h-2 rounded-full bg-risk-low pulse-live"></span>
<span class="font-label-sm text-label-sm text-text-primary">CatBoost v2.4.1</span>
</div>
<p class="font-body-sm text-body-sm text-text-muted leading-tight">Инференс в реальном времени</p>
</div>
<!-- User Profile Pill -->
<div class="flex items-center gap-3 p-2.5 rounded-2xl hover:bg-surface-card transition-colors cursor-pointer">
<div class="w-9 h-9 rounded-full bg-[#E0F4F7] flex items-center justify-center text-primary font-bold text-label-md">
            А
          </div>
<div class="flex flex-col min-w-0">
<span class="font-label-md text-label-md text-text-primary truncate">Алексей</span>
<span class="font-body-sm text-body-sm text-text-muted truncate">Risk Analyst</span>
</div>
<span class="material-symbols-outlined text-text-muted ml-auto text-[18px]">more_vert</span>
</div>
</div>
</aside>
<!-- ========================================== -->
<!-- MAIN CONTENT AREA                          -->
<!-- ========================================== -->
<main class="flex-1 flex flex-col min-w-0 bg-[#FFFFFF]">
<!-- Top Status-Bar -->
<header class="h-16 px-8 border-b border-[#F0F1F4] flex items-center justify-between sticky top-0 bg-[#FFFFFF]/90 backdrop-blur-md z-30">
<!-- Breadcrumbs -->
<div class="flex items-center gap-2 font-label-md text-label-md text-text-muted">
<span>Платформа</span>
<span class="text-[#D1D5DB]">›</span>
<span class="text-text-primary font-semibold">Модель</span>
</div>
<!-- Right Tools Cluster -->
<div class="flex items-center gap-4">
<!-- WS Live indicator -->
<div class="flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-card text-text-primary font-label-sm text-label-sm">
<span class="w-2 h-2 rounded-full bg-risk-low pulse-live"></span>
<span>WS Live</span>
<span class="text-text-muted">• Обновлено 12 с назад</span>
</div>
<!-- Recalculate quick button -->
<button class="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-[#E5E7EB] hover:bg-surface-card text-text-primary font-label-sm text-label-sm transition-colors active:scale-95" type="button">
<span class="material-symbols-outlined text-[16px]">sync</span>
<span>Пересчитать</span>
</button>
<!-- Metrics Link -->
<a class="font-label-sm text-label-sm text-text-muted hover:text-text-primary transition-colors" href="#">
            /metrics
          </a>
<div class="h-4 w-[1px] bg-[#E5E7EB]"></div>
<!-- Language switch -->
<button class="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-text-primary font-label-sm text-label-sm hover:bg-surface-card transition-colors" type="button">
<span class="material-symbols-outlined text-[16px]">language</span>
<span>RU</span>
</button>
</div>
</header>
<!-- Scrollable Settings Viewport -->
<div class="p-8 max-w-6xl w-full mx-auto flex flex-col gap-8 pb-32">
<!-- Page Header & Production Tag -->
<div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
<div class="space-y-1">
<h1 class="font-headline-lg text-headline-lg text-text-primary tracking-tight">Параметры скоринговой модели</h1>
<p class="font-body-md text-body-md text-text-muted">Тонкая настройка весов признаков CatBoost, горизонта прогнозирования и порогов сегментации риска.</p>
</div>
<!-- Right Status Chips -->
<div class="flex items-center gap-2.5 shrink-0">
<div class="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#E0F4F7] text-primary font-label-sm text-label-sm">
<span class="w-1.5 h-1.5 rounded-full bg-primary"></span>
<span>CatBoost v2.4.1 Production</span>
</div>
<div class="px-3.5 py-1.5 rounded-full bg-surface-card text-text-muted font-label-sm text-label-sm">
<span class="text-text-primary font-semibold" id="active-features-count">7</span> признаков активно
            </div>
</div>
</div>
<!-- ========================================== -->
<!-- СЕКЦИЯ 1: ОБЩИЕ ПАРАМЕТРЫ МОДЕЛИ           -->
<!-- ========================================== -->
<section class="bg-surface-card rounded-3xl p-6 md:p-8 flex flex-col gap-8 transition-all">
<div class="flex items-center justify-between border-b border-[#E5E7EB]/60 pb-4">
<div class="flex items-center gap-2.5">
<span class="material-symbols-outlined text-primary text-[22px]">tune</span>
<h2 class="font-title-md text-title-md text-text-primary">Общие параметры модели</h2>
</div>
<span class="font-label-sm text-label-sm text-text-muted">Глобальная калибровка</span>
</div>
<div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
<!-- 1.1 Горизонт прогноза -->
<div class="flex flex-col gap-3 p-5 bg-[#FFFFFF] rounded-2xl">
<div class="flex justify-between items-center">
<label class="font-label-md text-label-md text-text-primary font-medium" for="horizon-range">Горизонт прогноза (дни)</label>
<div class="flex items-center gap-1.5">
<input class="w-16 px-2.5 py-1 text-right font-stat-mono text-body-md rounded-lg border border-[#E5E7EB] focus:ring-2 focus:ring-[#11A8BF] focus:outline-none" id="horizon-input" max="365" min="1" type="number" value="30"/>
<span class="font-body-sm text-body-sm text-text-muted">дней</span>
</div>
</div>
<input class="w-full accent-[#11A8BF] h-2 bg-[#F3F4F6] rounded-lg cursor-pointer" id="horizon-range" max="365" min="1" type="range" value="30"/>
<div class="flex justify-between font-label-sm text-label-sm text-text-muted">
<span>1 день</span>
<span class="text-text-primary font-medium">Текущее: 30 дней</span>
<span>365 дней</span>
</div>
</div>
<!-- 1.2 Скидка покрытия балансом (дисконт-фактор) -->
<div class="flex flex-col gap-3 p-5 bg-[#FFFFFF] rounded-2xl">
<div class="flex justify-between items-center">
<div class="flex flex-col">
<label class="font-label-md text-label-md text-text-primary font-medium" for="discount-range">Скидка покрытия балансом</label>
<span class="font-body-sm text-body-sm text-text-muted">Коэффициент смягчения риска</span>
</div>
<div class="flex items-center gap-1">
<input class="w-16 px-2.5 py-1 text-right font-stat-mono text-body-md rounded-lg border border-[#E5E7EB] focus:ring-2 focus:ring-[#11A8BF] focus:outline-none" id="discount-input" max="1" min="0" step="0.05" type="number" value="0.30"/>
</div>
</div>
<input class="w-full accent-[#11A8BF] h-2 bg-[#F3F4F6] rounded-lg cursor-pointer" id="discount-range" max="1" min="0" step="0.05" type="range" value="0.30"/>
<div class="flex justify-between font-label-sm text-label-sm text-text-muted">
<span>0.00 (Без скидки)</span>
<span class="text-text-primary font-medium">0.30</span>
<span>1.00 (Максимум)</span>
</div>
</div>
</div>
<!-- 1.3 Шкала порогов риска (0...100) с зонами -->
<div class="flex flex-col gap-4 p-5 bg-[#FFFFFF] rounded-2xl">
<div class="flex flex-col md:flex-row md:items-center justify-between gap-2">
<div>
<h3 class="font-label-md text-label-md text-text-primary font-medium">Шкала порогов сегментации риска (0 — 100)</h3>
<p class="font-body-sm text-body-sm text-text-muted">Определяет автоматическое присвоение классов риска на базе совокупного скора</p>
</div>
<!-- Indicators with exact badge values -->
<div class="flex items-center gap-2">
<span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-risk-low-surface text-risk-low font-label-sm text-label-sm">
<span class="w-2 h-2 rounded-full bg-risk-low"></span>
                  Низкий: 0 — <span id="label-low-val">30</span>
</span>
<span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-risk-medium-surface text-risk-medium font-label-sm text-label-sm">
<span class="w-2 h-2 rounded-full bg-risk-medium"></span>
                  Средний: <span id="label-med-start">30</span> — <span id="label-med-end">60</span>
</span>
<span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-risk-high-surface text-risk-high font-label-sm text-label-sm">
<span class="w-2 h-2 rounded-full bg-risk-high"></span>
                  Высокий: <span id="label-high-start">60</span> — 100
                </span>
</div>
</div>
<!-- Visual Bar Graphic -->
<div class="relative w-full h-8 rounded-full overflow-hidden flex bg-surface-card p-1 shadow-inner">
<div class="h-full bg-risk-low/80 rounded-l-full flex items-center justify-center text-white font-label-sm text-label-sm transition-all duration-150" id="bar-low" style="width: 30%;">
                0 - 30
              </div>
<div class="h-full bg-risk-medium/85 flex items-center justify-center text-white font-label-sm text-label-sm transition-all duration-150" id="bar-med" style="width: 30%;">
                30 - 60
              </div>
<div class="h-full bg-risk-high/85 rounded-r-full flex items-center justify-center text-white font-label-sm text-label-sm transition-all duration-150" id="bar-high" style="width: 40%;">
                60 - 100
              </div>
</div>
<!-- Two Threshold Sliders Controls -->
<div class="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
<div class="flex flex-col gap-1.5 p-3 rounded-xl bg-surface-card/60">
<div class="flex justify-between items-center">
<span class="font-label-sm text-label-sm text-text-muted">Порог среднего риска</span>
<span class="font-stat-mono text-body-md text-text-primary" id="thresh-mid-display">30</span>
</div>
<input class="w-full accent-[#F59E0B] h-1.5 bg-[#E5E7EB] rounded cursor-pointer" id="thresh-mid" max="50" min="10" type="range" value="30"/>
</div>
<div class="flex flex-col gap-1.5 p-3 rounded-xl bg-surface-card/60">
<div class="flex justify-between items-center">
<span class="font-label-sm text-label-sm text-text-muted">Порог высокого риска</span>
<span class="font-stat-mono text-body-md text-text-primary" id="thresh-high-display">60</span>
</div>
<input class="w-full accent-[#EF4444] h-1.5 bg-[#E5E7EB] rounded cursor-pointer" id="thresh-high" max="90" min="51" type="range" value="60"/>
</div>
</div>
</div>
</section>
<!-- ========================================== -->
<!-- СЕКЦИЯ 2: СПИСОК ПРИЗНАКОВ МОДЕЛИ          -->
<!-- ========================================== -->
<section class="flex flex-col gap-4">
<div class="flex items-center justify-between px-1">
<div class="flex items-center gap-2">
<span class="material-symbols-outlined text-primary text-[20px]">format_list_bulleted</span>
<h2 class="font-title-md text-title-md text-text-primary">Признаки модели (Feature Weights)</h2>
</div>
<span class="font-body-sm text-body-sm text-text-muted">7 признаков с весами от 0 до 100</span>
</div>
<!-- Feature Cards List -->
<div class="space-y-3" id="features-container">
<!-- Feature 1 -->
<div class="feature-item bg-surface-card rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-5 transition-all duration-200 hover:bg-surface-card-alt" data-default="30" data-id="1">
<div class="flex items-start gap-4 flex-1">
<!-- Custom Toggle Switch -->
<label class="relative inline-flex items-center cursor-pointer shrink-0 mt-0.5">
<input checked="" class="feature-toggle sr-only peer" type="checkbox"/>
<div class="w-11 h-6 bg-[#D1D5DB] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#11A8BF]"></div>
</label>
<div class="space-y-1">
<div class="flex items-center gap-2 flex-wrap">
<h3 class="font-label-lg text-label-lg font-semibold text-text-primary feature-title">Не хватает средств на продления</h3>
<span class="px-2 py-0.5 rounded-full bg-[#FFFFFF] border border-[#E5E7EB] text-text-muted font-label-sm text-label-sm">Balance Shortage</span>
</div>
<p class="font-body-sm text-body-sm text-text-muted feature-desc">Баланса и бонусов недостаточно для оплаты сервисов в горизонте 30 дней.</p>
</div>
</div>
<!-- Slider & Numeric Box Cluster -->
<div class="flex items-center gap-4 shrink-0 feature-controls">
<div class="flex flex-col items-end gap-1 w-44">
<input class="feature-range w-full accent-[#11A8BF] h-1.5 bg-[#E5E7EB] rounded cursor-pointer" max="100" min="0" type="range" value="30"/>
<span class="font-label-sm text-label-sm text-text-muted">по умолчанию: 30</span>
</div>
<div class="flex items-center">
<input class="feature-input w-16 px-2.5 py-1.5 text-center font-stat-mono text-body-md rounded-xl bg-[#FFFFFF] border border-[#E5E7EB] text-text-primary focus:ring-2 focus:ring-[#11A8BF] focus:outline-none" max="100" min="0" type="number" value="30"/>
</div>
</div>
</div>
<!-- Feature 2 -->
<div class="feature-item bg-surface-card rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-5 transition-all duration-200 hover:bg-surface-card-alt" data-default="30" data-id="2">
<div class="flex items-start gap-4 flex-1">
<label class="relative inline-flex items-center cursor-pointer shrink-0 mt-0.5">
<input checked="" class="feature-toggle sr-only peer" type="checkbox"/>
<div class="w-11 h-6 bg-[#D1D5DB] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#11A8BF]"></div>
</label>
<div class="space-y-1">
<div class="flex items-center gap-2 flex-wrap">
<h3 class="font-label-lg text-label-lg font-semibold text-text-primary feature-title">Услуга ждёт оплаты</h3>
<span class="px-2 py-0.5 rounded-full bg-[#FFFFFF] border border-[#E5E7EB] text-text-muted font-label-sm text-label-sm">Invoice Pending</span>
</div>
<p class="font-body-sm text-body-sm text-text-muted feature-desc">Сформирован неоплаченный инвойс, до удаления услуги менее 5 дней.</p>
</div>
</div>
<div class="flex items-center gap-4 shrink-0 feature-controls">
<div class="flex flex-col items-end gap-1 w-44">
<input class="feature-range w-full accent-[#11A8BF] h-1.5 bg-[#E5E7EB] rounded cursor-pointer" max="100" min="0" type="range" value="30"/>
<span class="font-label-sm text-label-sm text-text-muted">по умолчанию: 30</span>
</div>
<div class="flex items-center">
<input class="feature-input w-16 px-2.5 py-1.5 text-center font-stat-mono text-body-md rounded-xl bg-[#FFFFFF] border border-[#E5E7EB] text-text-primary focus:ring-2 focus:ring-[#11A8BF] focus:outline-none" max="100" min="0" type="number" value="30"/>
</div>
</div>
</div>
<!-- Feature 3 -->
<div class="feature-item bg-surface-card rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-5 transition-all duration-200 hover:bg-surface-card-alt" data-default="25" data-id="3">
<div class="flex items-start gap-4 flex-1">
<label class="relative inline-flex items-center cursor-pointer shrink-0 mt-0.5">
<input checked="" class="feature-toggle sr-only peer" type="checkbox"/>
<div class="w-11 h-6 bg-[#D1D5DB] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#11A8BF]"></div>
</label>
<div class="space-y-1">
<div class="flex items-center gap-2 flex-wrap">
<h3 class="font-label-lg text-label-lg font-semibold text-text-primary feature-title">Автопродление выключено, услуга заканчивается</h3>
<span class="px-2 py-0.5 rounded-full bg-[#FFFFFF] border border-[#E5E7EB] text-text-muted font-label-sm text-label-sm">Auto-renew Off</span>
</div>
<p class="font-body-sm text-body-sm text-text-muted feature-desc">У критически важных сервисов отключен автоплатеж, срок истекает через ≤ 7 дней.</p>
</div>
</div>
<div class="flex items-center gap-4 shrink-0 feature-controls">
<div class="flex flex-col items-end gap-1 w-44">
<input class="feature-range w-full accent-[#11A8BF] h-1.5 bg-[#E5E7EB] rounded cursor-pointer" max="100" min="0" type="range" value="25"/>
<span class="font-label-sm text-label-sm text-text-muted">по умолчанию: 25</span>
</div>
<div class="flex items-center">
<input class="feature-input w-16 px-2.5 py-1.5 text-center font-stat-mono text-body-md rounded-xl bg-[#FFFFFF] border border-[#E5E7EB] text-text-primary focus:ring-2 focus:ring-[#11A8BF] focus:outline-none" max="100" min="0" type="number" value="25"/>
</div>
</div>
</div>
<!-- Feature 4 -->
<div class="feature-item bg-surface-card rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-5 transition-all duration-200 hover:bg-surface-card-alt" data-default="15" data-id="4">
<div class="flex items-start gap-4 flex-1">
<label class="relative inline-flex items-center cursor-pointer shrink-0 mt-0.5">
<input checked="" class="feature-toggle sr-only peer" type="checkbox"/>
<div class="w-11 h-6 bg-[#D1D5DB] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#11A8BF]"></div>
</label>
<div class="space-y-1">
<div class="flex items-center gap-2 flex-wrap">
<h3 class="font-label-lg text-label-lg font-semibold text-text-primary feature-title">Есть заблокированные услуги</h3>
<span class="px-2 py-0.5 rounded-full bg-[#FFFFFF] border border-[#E5E7EB] text-text-muted font-label-sm text-label-sm">Suspended Servers</span>
</div>
<p class="font-body-sm text-body-sm text-text-muted feature-desc">Наличие серверов со статусом «Заблокирована» из-за ошибок списания или неоплаты.</p>
</div>
</div>
<div class="flex items-center gap-4 shrink-0 feature-controls">
<div class="flex flex-col items-end gap-1 w-44">
<input class="feature-range w-full accent-[#11A8BF] h-1.5 bg-[#E5E7EB] rounded cursor-pointer" max="100" min="0" type="range" value="15"/>
<span class="font-label-sm text-label-sm text-text-muted">по умолчанию: 15</span>
</div>
<div class="flex items-center">
<input class="feature-input w-16 px-2.5 py-1.5 text-center font-stat-mono text-body-md rounded-xl bg-[#FFFFFF] border border-[#E5E7EB] text-text-primary focus:ring-2 focus:ring-[#11A8BF] focus:outline-none" max="100" min="0" type="number" value="15"/>
</div>
</div>
</div>
<!-- Feature 5 -->
<div class="feature-item bg-surface-card rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-5 transition-all duration-200 hover:bg-surface-card-alt" data-default="10" data-id="5">
<div class="flex items-start gap-4 flex-1">
<label class="relative inline-flex items-center cursor-pointer shrink-0 mt-0.5">
<input checked="" class="feature-toggle sr-only peer" type="checkbox"/>
<div class="w-11 h-6 bg-[#D1D5DB] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#11A8BF]"></div>
</label>
<div class="space-y-1">
<div class="flex items-center gap-2 flex-wrap">
<h3 class="font-label-lg text-label-lg font-semibold text-text-primary feature-title">Неоплаченные заказы и продления</h3>
<span class="px-2 py-0.5 rounded-full bg-[#FFFFFF] border border-[#E5E7EB] text-text-muted font-label-sm text-label-sm">Failed Payments</span>
</div>
<p class="font-body-sm text-body-sm text-text-muted feature-desc">Неудачные попытки списания с привязанных банковских карт за последние 30 дней.</p>
</div>
</div>
<div class="flex items-center gap-4 shrink-0 feature-controls">
<div class="flex flex-col items-end gap-1 w-44">
<input class="feature-range w-full accent-[#11A8BF] h-1.5 bg-[#E5E7EB] rounded cursor-pointer" max="100" min="0" type="range" value="10"/>
<span class="font-label-sm text-label-sm text-text-muted">по умолчанию: 10</span>
</div>
<div class="flex items-center">
<input class="feature-input w-16 px-2.5 py-1.5 text-center font-stat-mono text-body-md rounded-xl bg-[#FFFFFF] border border-[#E5E7EB] text-text-primary focus:ring-2 focus:ring-[#11A8BF] focus:outline-none" max="100" min="0" type="number" value="10"/>
</div>
</div>
</div>
<!-- Feature 6 -->
<div class="feature-item bg-surface-card rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-5 transition-all duration-200 hover:bg-surface-card-alt" data-default="8" data-id="6">
<div class="flex items-start gap-4 flex-1">
<label class="relative inline-flex items-center cursor-pointer shrink-0 mt-0.5">
<input checked="" class="feature-toggle sr-only peer" type="checkbox"/>
<div class="w-11 h-6 bg-[#D1D5DB] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#11A8BF]"></div>
</label>
<div class="space-y-1">
<div class="flex items-center gap-2 flex-wrap">
<h3 class="font-label-lg text-label-lg font-semibold text-text-primary feature-title">Клиент выключил услуги</h3>
<span class="px-2 py-0.5 rounded-full bg-[#FFFFFF] border border-[#E5E7EB] text-text-muted font-label-sm text-label-sm">Power Off</span>
</div>
<p class="font-body-sm text-body-sm text-text-muted feature-desc">Пользователь вручную остановил серверы, средства продолжают списываться.</p>
</div>
</div>
<div class="flex items-center gap-4 shrink-0 feature-controls">
<div class="flex flex-col items-end gap-1 w-44">
<input class="feature-range w-full accent-[#11A8BF] h-1.5 bg-[#E5E7EB] rounded cursor-pointer" max="100" min="0" type="range" value="8"/>
<span class="font-label-sm text-label-sm text-text-muted">по умолчанию: 8</span>
</div>
<div class="flex items-center">
<input class="feature-input w-16 px-2.5 py-1.5 text-center font-stat-mono text-body-md rounded-xl bg-[#FFFFFF] border border-[#E5E7EB] text-text-primary focus:ring-2 focus:ring-[#11A8BF] focus:outline-none" max="100" min="0" type="number" value="8"/>
</div>
</div>
</div>
<!-- Feature 7 -->
<div class="feature-item bg-surface-card rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-5 transition-all duration-200 hover:bg-surface-card-alt" data-default="5" data-id="7">
<div class="flex items-start gap-4 flex-1">
<label class="relative inline-flex items-center cursor-pointer shrink-0 mt-0.5">
<input checked="" class="feature-toggle sr-only peer" type="checkbox"/>
<div class="w-11 h-6 bg-[#D1D5DB] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#11A8BF]"></div>
</label>
<div class="space-y-1">
<div class="flex items-center gap-2 flex-wrap">
<h3 class="font-label-lg text-label-lg font-semibold text-text-primary feature-title">Мало вложил за всё время (LTV)</h3>
<span class="px-2 py-0.5 rounded-full bg-[#E0F4F7] text-primary font-label-sm text-label-sm font-medium">Порог: €50</span>
</div>
<p class="font-body-sm text-body-sm text-text-muted feature-desc">Общая сумма пополнений существенно ниже медианы по всей базе клиентов.</p>
</div>
</div>
<div class="flex items-center gap-4 shrink-0 feature-controls">
<div class="flex flex-col items-end gap-1 w-44">
<input class="feature-range w-full accent-[#11A8BF] h-1.5 bg-[#E5E7EB] rounded cursor-pointer" max="100" min="0" type="range" value="5"/>
<span class="font-label-sm text-label-sm text-text-muted">по умолчанию: 5</span>
</div>
<div class="flex items-center">
<input class="feature-input w-16 px-2.5 py-1.5 text-center font-stat-mono text-body-md rounded-xl bg-[#FFFFFF] border border-[#E5E7EB] text-text-primary focus:ring-2 focus:ring-[#11A8BF] focus:outline-none" max="100" min="0" type="number" value="5"/>
</div>
</div>
</div>
</div>
</section>
</div>
<!-- ========================================== -->
<!-- 5. НИЖНЯЯ ЛИПКАЯ (STICKY) ПАНЕЛЬ УПРАВЛЕНИЯ -->
<!-- ========================================== -->
<footer class="sticky bottom-0 z-40 bg-[#FFFFFF]/95 backdrop-blur-md border-t border-[#F0F1F4] py-4 px-8 shadow-lg">
<div class="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
<!-- Information change badge -->
<div class="flex items-center gap-3">
<div class="w-8 h-8 rounded-full bg-risk-medium-surface flex items-center justify-center text-risk-medium transition-colors" id="status-icon-wrap">
<span class="material-symbols-outlined text-[18px]">info</span>
</div>
<div class="flex flex-col">
<span class="font-label-md text-label-md text-text-primary font-medium" id="status-text">Есть несохранённые изменения в весах модели</span>
<span class="font-body-sm text-body-sm text-text-muted">Конфигурация будет применена ко всем 300 клиентам</span>
</div>
</div>
<!-- Actions -->
<div class="flex items-center gap-3 shrink-0">
<!-- Reset default button -->
<button class="px-5 py-2.5 rounded-full bg-[#F3F4F6] hover:bg-[#E5E7EB] text-text-primary font-label-md text-label-md transition-all active:scale-95" id="reset-btn" type="button">
              Сбросить по умолчанию
            </button>
<!-- Primary Action Pill Button -->
<button class="flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#18181B] hover:bg-[#27272A] text-[#FFFFFF] font-label-md text-label-md shadow-md transition-all active:scale-95 group" id="apply-btn" type="button">
<span class="material-symbols-outlined text-[18px] text-[#5cd6ee] group-hover:rotate-45 transition-transform" id="btn-icon">bolt</span>
<span class="font-semibold" id="btn-text">Применить и пересчитать базу (300)</span>
</button>
</div>
</div>
</footer>
<!-- System Global Footer (Mandatory Anchor) -->
<footer class="bg-transparent text-primary text-body-sm py-6 px-8 max-w-7xl mx-auto w-full flex flex-col md:flex-row justify-between items-center gap-4 text-text-muted border-t border-[#F4F5F7] mt-auto">
<p class="font-body-sm text-body-sm">© 2025 Aéza Infrastructure Intelligence. All rights reserved.</p>
<div class="flex gap-6 font-label-sm text-label-sm">
<a class="hover:text-primary transition-colors duration-200" href="#">Security Architecture</a>
<a class="hover:text-primary transition-colors duration-200" href="#">System Status</a>
<a class="hover:text-primary transition-colors duration-200" href="#">Terms of Service</a>
<a class="hover:text-primary transition-colors duration-200" href="#">Privacy Policy</a>
</div>
</footer>
</main>
</div>
<!-- Micro-interactions & State Logic Script -->
<script>
    document.addEventListener('DOMContentLoaded', () => {
      // 1. Dual Slider & Thresholds Zone Update
      const threshMid = document.getElementById('thresh-mid');
      const threshHigh = document.getElementById('thresh-high');
      
      const labelLowVal = document.getElementById('label-low-val');
      const labelMedStart = document.getElementById('label-med-start');
      const labelMedEnd = document.getElementById('label-med-end');
      const labelHighStart = document.getElementById('label-high-start');
      
      const threshMidDisplay = document.getElementById('thresh-mid-display');
      const threshHighDisplay = document.getElementById('thresh-high-display');

      const barLow = document.getElementById('bar-low');
      const barMed = document.getElementById('bar-med');
      const barHigh = document.getElementById('bar-high');

      function updateThresholdBars() {
        const midVal = parseInt(threshMid.value);
        const highVal = parseInt(threshHigh.value);

        // sync texts
        labelLowVal.textContent = midVal;
        labelMedStart.textContent = midVal;
        labelMedEnd.textContent = highVal;
        labelHighStart.textContent = highVal;
        
        threshMidDisplay.textContent = midVal;
        threshHighDisplay.textContent = highVal;

        // update visual bar segments
        barLow.style.width = midVal + '%';
        barLow.textContent = `0 - ${midVal}`;
        
        const medWidth = highVal - midVal;
        barMed.style.width = medWidth + '%';
        barMed.textContent = `${midVal} - ${highVal}`;

        const highWidth = 100 - highVal;
        barHigh.style.width = highWidth + '%';
        barHigh.textContent = `${highVal} - 100`;

        markChanges();
      }

      threshMid.addEventListener('input', () => {
        if (parseInt(threshMid.value) >= parseInt(threshHigh.value)) {
          threshMid.value = parseInt(threshHigh.value) - 1;
        }
        updateThresholdBars();
      });

      threshHigh.addEventListener('input', () => {
        if (parseInt(threshHigh.value) <= parseInt(threshMid.value)) {
          threshHigh.value = parseInt(threshMid.value) + 1;
        }
        updateThresholdBars();
      });

      // 2. Horizon and Discount sync
      const horizonInput = document.getElementById('horizon-input');
      const horizonRange = document.getElementById('horizon-range');
      horizonInput.addEventListener('input', () => {
        horizonRange.value = horizonInput.value;
        markChanges();
      });
      horizonRange.addEventListener('input', () => {
        horizonInput.value = horizonRange.value;
        markChanges();
      });

      const discountInput = document.getElementById('discount-input');
      const discountRange = document.getElementById('discount-range');
      discountInput.addEventListener('input', () => {
        discountRange.value = discountInput.value;
        markChanges();
      });
      discountRange.addEventListener('input', () => {
        discountInput.value = parseFloat(discountRange.value).toFixed(2);
        markChanges();
      });

      // 3. Feature cards sync & toggle
      const featureItems = document.querySelectorAll('.feature-item');
      const activeCountBadge = document.getElementById('active-features-count');

      function updateActiveCount() {
        const count = document.querySelectorAll('.feature-toggle:checked').length;
        activeCountBadge.textContent = count;
      }

      featureItems.forEach(item => {
        const toggle = item.querySelector('.feature-toggle');
        const range = item.querySelector('.feature-range');
        const numInput = item.querySelector('.feature-input');

        range.addEventListener('input', () => {
          numInput.value = range.value;
          markChanges();
        });

        numInput.addEventListener('input', () => {
          let val = parseInt(numInput.value) || 0;
          if (val > 100) val = 100;
          if (val < 0) val = 0;
          range.value = val;
          markChanges();
        });

        toggle.addEventListener('change', () => {
          if (!toggle.checked) {
            item.classList.add('opacity-40');
            range.disabled = true;
            numInput.disabled = true;
          } else {
            item.classList.remove('opacity-40');
            range.disabled = false;
            numInput.disabled = false;
          }
          updateActiveCount();
          markChanges();
        });
      });

      // 4. Change State Banner Management
      const statusText = document.getElementById('status-text');
      const statusIconWrap = document.getElementById('status-icon-wrap');
      const applyBtn = document.getElementById('apply-btn');
      const resetBtn = document.getElementById('reset-btn');
      const btnIcon = document.getElementById('btn-icon');
      const btnText = document.getElementById('btn-text');

      function markChanges() {
        statusText.textContent = "Есть несохранённые изменения в весах модели";
        statusIconWrap.className = "w-8 h-8 rounded-full bg-risk-medium-surface flex items-center justify-center text-risk-medium transition-colors";
        statusIconWrap.innerHTML = '<span class="material-symbols-outlined text-[18px]">info</span>';
      }

      // Reset to defaults
      resetBtn.addEventListener('click', () => {
        threshMid.value = 30;
        threshHigh.value = 60;
        updateThresholdBars();

        horizonInput.value = 30;
        horizonRange.value = 30;

        discountInput.value = 0.30;
        discountRange.value = 0.30;

        featureItems.forEach(item => {
          const defVal = item.getAttribute('data-default');
          const toggle = item.querySelector('.feature-toggle');
          const range = item.querySelector('.feature-range');
          const numInput = item.querySelector('.feature-input');

          toggle.checked = true;
          item.classList.remove('opacity-40');
          range.disabled = false;
          numInput.disabled = false;
          range.value = defVal;
          numInput.value = defVal;
        });

        updateActiveCount();

        statusText.textContent = "Настройки сброшены к дефолтным значениям";
        statusIconWrap.className = "w-8 h-8 rounded-full bg-[#E0F4F7] flex items-center justify-center text-primary transition-colors";
        statusIconWrap.innerHTML = '<span class="material-symbols-outlined text-[18px]">restart_alt</span>';
      });

      // Apply changes animation
      applyBtn.addEventListener('click', () => {
        btnText.textContent = "Инференс и пересчёт базы...";
        btnIcon.textContent = "progress_activity";
        btnIcon.classList.add("animate-spin");
        applyBtn.disabled = true;

        setTimeout(() => {
          btnIcon.classList.remove("animate-spin");
          btnIcon.textContent = "check_circle";
          btnText.textContent = "Пересчитано успешно!";
          
          statusText.textContent = "Все 300 клиентов пересчитаны с новой матрицей весов";
          statusIconWrap.className = "w-8 h-8 rounded-full bg-risk-low-surface flex items-center justify-center text-risk-low transition-colors";
          statusIconWrap.innerHTML = '<span class="material-symbols-outlined text-[18px]">verified</span>';

          setTimeout(() => {
            btnIcon.textContent = "bolt";
            btnText.textContent = "Применить и пересчитать базу (300)";
            applyBtn.disabled = false;
          }, 2400);
        }, 1200);
      });
    });
  </script>
</body></html>