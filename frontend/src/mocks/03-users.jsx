<!DOCTYPE html>

<html lang="ru"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>Aéza Churn Risk — Клиенты (/customers)</title>
<link href="https://fonts.googleapis.com" rel="preconnect"/>
<link crossorigin="" href="https://fonts.gstatic.com" rel="preconnect"/>
<link href="https://fonts.googleapis.com/css2?family=Geist:wght@300;400;500;600;700&family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Geist:wght@100..900&display=swap" rel="stylesheet"/>
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<script id="tailwind-config">
    tailwind.config = {
      darkMode: "class",
      theme: {
        extend: {
          "colors": {
            "background": "#f9f9ff",
            "risk-low": "#10B981",
            "accent-icon": "#0D8A9E",
            "on-primary-fixed": "#001f25",
            "risk-high-surface": "#FEE2E2",
            "risk-low-surface": "#D1FAE5",
            "on-primary-container": "#003740",
            "on-tertiary": "#ffffff",
            "primary-fixed": "#a4eeff",
            "inverse-on-surface": "#ebf1ff",
            "risk-medium-surface": "#FEF3C7",
            "on-secondary-container": "#656467",
            "surface-container-lowest": "#ffffff",
            "primary-container": "#11a8bf",
            "inverse-primary": "#5cd6ee",
            "on-secondary": "#ffffff",
            "surface-dim": "#d3daea",
            "surface-variant": "#dce2f3",
            "on-secondary-fixed-variant": "#47464a",
            "risk-medium": "#F59E0B",
            "surface-card-alt": "#F5F6F8",
            "primary": "#006877",
            "secondary-fixed": "#e4e1e6",
            "on-primary-fixed-variant": "#004e5a",
            "on-secondary-fixed": "#1b1b1e",
            "on-error": "#ffffff",
            "surface-bright": "#f9f9ff",
            "risk-high": "#EF4444",
            "on-surface-variant": "#3d494c",
            "surface-card": "#F3F4F6",
            "tertiary-fixed-dim": "#b6cacd",
            "on-error-container": "#93000a",
            "on-primary": "#ffffff",
            "surface-canvas": "#FFFFFF",
            "surface-container-high": "#e2e8f8",
            "secondary": "#5f5e61",
            "surface-tint": "#006877",
            "cyan-gradient-end": "#15B8CF",
            "tertiary-container": "#8a9da0",
            "text-primary": "#111827",
            "tertiary": "#4f6264",
            "on-tertiary-fixed": "#0c1e21",
            "cyan-gradient-start": "#0891B2",
            "surface": "#f9f9ff",
            "error-container": "#ffdad6",
            "surface-container": "#e7eefe",
            "secondary-container": "#e4e1e6",
            "inverse-surface": "#2a313d",
            "primary-fixed-dim": "#5cd6ee",
            "on-tertiary-fixed-variant": "#384a4c",
            "on-tertiary-container": "#233537",
            "error": "#ba1a1a",
            "surface-container-low": "#f0f3ff",
            "secondary-fixed-dim": "#c8c5ca",
            "on-surface": "#151c27",
            "surface-canvas-subtle": "#F4F5F7",
            "on-background": "#151c27",
            "surface-container-highest": "#dce2f3",
            "outline": "#6d797c",
            "outline-variant": "#bcc9cc",
            "tertiary-fixed": "#d2e6e9",
            "text-muted": "#6B7280"
          },
          "borderRadius": {
            "DEFAULT": "1rem",
            "lg": "2rem",
            "xl": "3rem",
            "full": "9999px"
          },
          "spacing": {
            "space-xl": "2rem",
            "gutter": "1.5rem",
            "space-sm": "0.5rem",
            "space-xs": "0.25rem",
            "space-2xl": "3rem",
            "margin": "2rem",
            "margin-mobile": "1rem",
            "space-lg": "1.5rem",
            "gutter-mobile": "1rem",
            "space-md": "1rem"
          },
          "fontFamily": {
            "body-md": ["Geist"],
            "label-sm": ["Geist"],
            "display": ["Geist"],
            "headline-lg-mobile": ["Geist"],
            "headline-md": ["Geist"],
            "label-md": ["Geist"],
            "label-lg": ["Geist"],
            "body-lg": ["Geist"],
            "body-sm": ["Geist"],
            "stat-mono": ["Geist"],
            "display-mobile": ["Geist"],
            "headline-lg": ["Geist"],
            "headline-sm": ["Geist"],
            "title-md": ["Geist"]
          },
          "fontSize": {
            "body-md": ["14px", { "lineHeight": "20px", "fontWeight": "400" }],
            "label-sm": ["11px", { "lineHeight": "14px", "letterSpacing": "0.04em", "fontWeight": "600" }],
            "display": ["48px", { "lineHeight": "56px", "letterSpacing": "-0.03em", "fontWeight": "700" }],
            "headline-lg-mobile": ["24px", { "lineHeight": "32px", "letterSpacing": "-0.01em", "fontWeight": "600" }],
            "headline-md": ["22px", { "lineHeight": "28px", "letterSpacing": "-0.015em", "fontWeight": "600" }],
            "label-md": ["12px", { "lineHeight": "16px", "fontWeight": "500" }],
            "label-lg": ["14px", { "lineHeight": "20px", "fontWeight": "500" }],
            "body-lg": ["16px", { "lineHeight": "24px", "fontWeight": "400" }],
            "body-sm": ["12px", { "lineHeight": "16px", "fontWeight": "400" }],
            "stat-mono": ["28px", { "lineHeight": "32px", "letterSpacing": "-0.02em", "fontWeight": "700" }],
            "display-mobile": ["32px", { "lineHeight": "40px", "letterSpacing": "-0.02em", "fontWeight": "700" }],
            "headline-lg": ["32px", { "lineHeight": "40px", "letterSpacing": "-0.02em", "fontWeight": "700" }],
            "headline-sm": ["18px", { "lineHeight": "24px", "letterSpacing": "-0.01em", "fontWeight": "600" }],
            "title-md": ["16px", { "lineHeight": "22px", "letterSpacing": "-0.005em", "fontWeight": "600" }]
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
    .custom-scrollbar::-webkit-scrollbar {
      height: 6px;
      width: 6px;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb {
      background: #e2e8f0;
      border-radius: 9999px;
    }
    .custom-scrollbar::-webkit-scrollbar-track {
      background: transparent;
    }
  </style>
</head>
<body class="bg-surface-canvas text-text-primary antialiased font-body-md min-h-screen flex flex-col selection:bg-primary-fixed selection:text-on-primary-fixed">
<!-- TOP STATUS BAR -->
<header class="w-full bg-surface-canvas border-b border-surface-card-alt sticky top-0 z-40 backdrop-blur-md bg-white/90">
<div class="max-w-[1440px] mx-auto px-6 h-14 flex items-center justify-between">
<!-- Breadcrumbs & Section Indicator -->
<div class="flex items-center gap-3">
<span class="text-text-muted font-label-md text-label-md">Платформа</span>
<span class="text-outline-variant font-label-sm text-label-sm">›</span>
<span class="text-text-primary font-headline-sm text-title-md font-semibold tracking-tight">Клиенты</span>
<div class="h-4 w-px bg-surface-variant ml-2"></div>
<!-- Live WebSocket pill -->
<div class="flex items-center gap-2 px-3 py-1 bg-surface-canvas-subtle rounded-full text-label-sm font-label-sm text-text-muted border border-surface-variant/40">
<span class="w-2 h-2 rounded-full bg-risk-low animate-pulse"></span>
<span>WS Live • Обновлено 12 с назад</span>
</div>
</div>
<!-- Action Items & Shared Utilities -->
<div class="flex items-center gap-3">
<button class="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-label-md font-label-md text-text-primary hover:bg-surface-card transition-colors duration-200 border border-outline-variant/30 active:scale-95" id="recalc-btn" onclick="triggerRecalc()">
<span class="material-symbols-outlined text-accent-icon text-sm" data-icon="refresh">refresh</span>
<span>Пересчитать</span>
</button>
<a class="px-3 py-1.5 rounded-full text-label-sm font-label-sm text-text-muted hover:text-text-primary hover:bg-surface-card transition-colors duration-200 font-mono" href="#metrics">
          /metrics
        </a>
<div class="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-label-md font-label-md text-text-primary bg-surface-card-alt">
<span class="material-symbols-outlined text-sm text-secondary" data-icon="language">language</span>
<span class="font-medium">RU</span>
</div>
<button class="w-8 h-8 rounded-full flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-surface-card transition-colors">
<span class="material-symbols-outlined text-base" data-icon="help_outline">help_outline</span>
</button>
<button class="w-8 h-8 rounded-full flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-surface-card transition-colors">
<span class="material-symbols-outlined text-base" data-icon="dark_mode">dark_mode</span>
</button>
</div>
</div>
</header>
<!-- MAIN APP CONTAINER -->
<div class="flex-1 flex max-w-[1440px] w-full mx-auto">
<!-- LEFT SIDEBAR -->
<aside class="w-64 flex-shrink-0 flex flex-col justify-between py-6 px-4 bg-surface-canvas border-r border-surface-card-alt sticky top-14 h-[calc(100vh-3.5rem)]">
<div class="space-y-6">
<!-- Logo Aéza Intelligence -->
<div class="flex items-center gap-2.5 px-2">
<div class="w-9 h-9 rounded-2xl bg-surface-card flex items-center justify-center font-bold text-text-primary shadow-xs border border-outline-variant/40">
<span class="text-cyan-gradient-start font-display text-lg">é</span>
</div>
<div class="flex items-baseline gap-1.5">
<span class="font-bold text-title-md tracking-tight text-text-primary">aéza</span>
<span class="px-2 py-0.5 rounded-full text-label-sm font-label-sm bg-surface-card text-text-muted border border-outline-variant/30">Intelligence</span>
</div>
</div>
<!-- Navigation Menu -->
<nav class="space-y-1">
<!-- Item 1: Обзор -->
<a class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-text-muted hover:bg-surface-card/60 transition-colors font-label-lg text-label-lg group" href="#">
<span class="material-symbols-outlined text-secondary group-hover:text-text-primary text-xl" data-icon="dashboard">dashboard</span>
<span>Обзор</span>
</a>
<!-- Item 2: Клиенты (ACTIVE) -->
<a class="flex items-center justify-between px-3 py-2.5 rounded-xl bg-text-primary text-white font-label-lg text-label-lg shadow-sm" href="#">
<div class="flex items-center gap-3">
<span class="material-symbols-outlined text-cyan-gradient-end text-xl" data-icon="group">group</span>
<span class="font-semibold text-white">Клиенты</span>
</div>
<span class="px-2 py-0.5 rounded-full text-label-sm font-label-sm bg-white/20 text-white font-semibold">300</span>
</a>
<!-- Item 3: Модель -->
<a class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-text-muted hover:bg-surface-card/60 transition-colors font-label-lg text-label-lg group" href="#">
<span class="material-symbols-outlined text-secondary group-hover:text-text-primary text-xl" data-icon="memory">memory</span>
<span>Модель</span>
</a>
<!-- Item 4: Данные -->
<a class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-text-muted hover:bg-surface-card/60 transition-colors font-label-lg text-label-lg group" href="#">
<span class="material-symbols-outlined text-secondary group-hover:text-text-primary text-xl" data-icon="database">database</span>
<span>Данные</span>
</a>
</nav>
</div>
<!-- Bottom Sidebar Status & User Profile -->
<div class="space-y-4 pt-4 border-t border-surface-card-alt">
<!-- Inference Status -->
<div class="p-3 bg-surface-card-alt rounded-2xl border border-surface-variant/40">
<div class="flex items-center gap-2 mb-1">
<span class="w-2 h-2 rounded-full bg-risk-low"></span>
<span class="text-label-sm font-label-sm font-semibold text-text-primary">CatBoost v2.4.1</span>
</div>
<p class="text-body-sm text-text-muted pl-4">Инференс в реальном времени</p>
</div>
<!-- User Profile Card -->
<div class="flex items-center gap-3 px-2 py-1.5">
<div class="w-10 h-10 rounded-full bg-gradient-to-tr from-cyan-gradient-start to-cyan-gradient-end text-white font-bold flex items-center justify-center text-sm shadow-sm">
            A
          </div>
<div class="overflow-hidden">
<div class="text-body-md font-semibold text-text-primary truncate">Алексей</div>
<div class="text-label-sm font-label-sm text-text-muted truncate">Risk Analyst</div>
</div>
<button class="ml-auto text-text-muted hover:text-text-primary transition-colors p-1">
<span class="material-symbols-outlined text-sm" data-icon="more_vert">more_vert</span>
</button>
</div>
</div>
</aside>
<!-- MAIN CONTENT AREA -->
<main class="flex-1 min-w-0 py-6 px-8 flex flex-col space-y-6">
<!-- HEADER ACTION & KPI BANNER (Bento Flow) -->
<div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
<div>
<h1 class="text-headline-lg font-headline-lg text-text-primary tracking-tight font-bold">База клиентов и риск оттока</h1>
<p class="text-body-md font-body-md text-text-muted mt-0.5">Консолидированный анализ 300 инфраструктурных профилей с вероятностным прогнозом</p>
</div>
<div class="flex items-center gap-3">
<button class="flex items-center gap-2 px-4 py-2.5 rounded-full bg-surface-card hover:bg-surface-variant/60 text-text-primary font-label-md font-label-md transition-all active:scale-95 border border-outline-variant/30" onclick="exportCSV()">
<span class="material-symbols-outlined text-accent-icon text-lg" data-icon="download">download</span>
<span>Экспорт CSV</span>
</button>
<button class="flex items-center gap-2 px-5 py-2.5 rounded-full bg-text-primary hover:bg-[#27272A] text-white font-label-md font-label-md shadow-xs transition-all active:scale-95">
<span class="material-symbols-outlined text-lg text-cyan-gradient-end" data-icon="add">add</span>
<span>Сегментировать</span>
</button>
</div>
</div>
<!-- FILTER & SEARCH PANEL -->
<section class="bg-surface-card p-4 rounded-3xl border border-surface-variant/40 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
<!-- Left: Search Box -->
<div class="relative flex-1 max-w-md">
<span class="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted text-lg pointer-events-none" data-icon="search">search</span>
<input class="w-full pl-10 pr-9 py-2 rounded-full bg-white text-body-md font-body-md text-text-primary border border-surface-variant placeholder:text-text-muted/70 focus:outline-none focus:ring-2 focus:ring-primary-container focus:border-transparent transition-all" id="searchInput" oninput="handleSearch(this.value)" placeholder="Поиск по email или ID..." type="text"/>
<button class="hidden absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary" id="clearSearchBtn" onclick="clearSearch()">
<span class="material-symbols-outlined text-sm" data-icon="close">close</span>
</button>
</div>
<!-- Center: Multi-risk Category Chips -->
<div class="flex items-center flex-wrap gap-2" id="filterChips">
<!-- All -->
<button class="risk-chip active flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-label-md font-label-md transition-all bg-text-primary text-white font-medium shadow-xs" data-risk="all" onclick="setRiskFilter('all')">
<span>Все (300)</span>
</button>
<!-- High -->
<button class="risk-chip flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-label-md font-label-md transition-all bg-white hover:bg-surface-card-alt text-text-primary border border-outline-variant/30" data-risk="high" onclick="setRiskFilter('high')">
<span class="w-2 h-2 rounded-full bg-risk-high"></span>
<span>Высокий (34)</span>
</button>
<!-- Medium -->
<button class="risk-chip flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-label-md font-label-md transition-all bg-white hover:bg-surface-card-alt text-text-primary border border-outline-variant/30" data-risk="medium" onclick="setRiskFilter('medium')">
<span class="w-2 h-2 rounded-full bg-risk-medium"></span>
<span>Средний (91)</span>
</button>
<!-- Low -->
<button class="risk-chip flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-label-md font-label-md transition-all bg-white hover:bg-surface-card-alt text-text-primary border border-outline-variant/30" data-risk="low" onclick="setRiskFilter('low')">
<span class="w-2 h-2 rounded-full bg-risk-low"></span>
<span>Низкий (148)</span>
</button>
<!-- None / No score -->
<button class="risk-chip flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-label-md font-label-md transition-all bg-white hover:bg-surface-card-alt text-text-primary border border-outline-variant/30" data-risk="none" onclick="setRiskFilter('none')">
<span class="w-2 h-2 rounded-full bg-secondary"></span>
<span>Нет оценки (27)</span>
</button>
</div>
<!-- Right: Counter -->
<div class="text-label-md font-label-md text-text-muted self-center lg:self-auto text-right whitespace-nowrap">
<span id="filteredCountLabel">Показано 1–25 из 300</span>
</div>
</section>
<!-- DATA TABLE BENTO CONTAINER -->
<div class="bg-surface-canvas rounded-3xl border border-surface-card-alt shadow-xs overflow-hidden flex flex-col">
<div class="overflow-x-auto custom-scrollbar">
<table class="w-full text-left border-collapse" id="customersTable">
<!-- Table Header -->
<thead>
<tr class="bg-surface-card-alt/80 border-b border-surface-card-alt text-text-muted text-label-sm font-label-sm uppercase tracking-wider select-none">
<!-- 1. ID -->
<th class="py-3 px-4 cursor-pointer hover:text-text-primary transition-colors whitespace-nowrap" onclick="sortTable('id')">
<div class="flex items-center gap-1">
<span>ID</span>
<span class="sort-icon material-symbols-outlined text-xs" data-col="id" data-icon="unfold_more">unfold_more</span>
</div>
</th>
<!-- 2. Email -->
<th class="py-3 px-4 cursor-pointer hover:text-text-primary transition-colors whitespace-nowrap" onclick="sortTable('email')">
<div class="flex items-center gap-1">
<span>Email</span>
<span class="sort-icon material-symbols-outlined text-xs" data-col="email" data-icon="unfold_more">unfold_more</span>
</div>
</th>
<!-- 3. Баланс -->
<th class="py-3 px-4 cursor-pointer hover:text-text-primary transition-colors text-right whitespace-nowrap" onclick="sortTable('balance')">
<div class="flex items-center justify-end gap-1">
<span>Баланс</span>
<span class="sort-icon material-symbols-outlined text-xs" data-col="balance" data-icon="unfold_more">unfold_more</span>
</div>
</th>
<!-- 4. Пополнено всего -->
<th class="py-3 px-4 cursor-pointer hover:text-text-primary transition-colors text-right whitespace-nowrap" onclick="sortTable('totalDeposited')">
<div class="flex items-center justify-end gap-1">
<span>Пополнено всего</span>
<span class="sort-icon material-symbols-outlined text-xs" data-col="totalDeposited" data-icon="unfold_more">unfold_more</span>
</div>
</th>
<!-- 5. Score оттока (По умолчанию: Убывание) -->
<th class="py-3 px-4 cursor-pointer hover:text-text-primary transition-colors whitespace-nowrap" onclick="sortTable('score')">
<div class="flex items-center gap-1 text-primary font-semibold">
<span>Score оттока</span>
<span class="sort-icon material-symbols-outlined text-xs text-primary" data-col="score" data-icon="arrow_downward">arrow_downward</span>
</div>
</th>
<!-- 6. Уровень -->
<th class="py-3 px-4 whitespace-nowrap">Уровень</th>
<!-- 7. Главная причина -->
<th class="py-3 px-4 min-w-[280px]">Главная причина</th>
<!-- 8. Ожидаемая потеря -->
<th class="py-3 px-4 cursor-pointer hover:text-text-primary transition-colors text-right whitespace-nowrap" onclick="sortTable('loss')">
<div class="flex items-center justify-end gap-1">
<span>Ожидаемая потеря</span>
<span class="sort-icon material-symbols-outlined text-xs" data-col="loss" data-icon="unfold_more">unfold_more</span>
</div>
</th>
<!-- 9. Действия -->
<th class="py-3 px-4 text-center whitespace-nowrap">Действия</th>
</tr>
</thead>
<!-- Table Body -->
<tbody class="divide-y divide-surface-card-alt text-body-md font-body-md" id="tableBody">
<!-- Rendered via JS for seamless sort/filter interaction -->
</tbody>
</table>
</div>
<!-- TABLE PAGINATION FOOTER -->
<div class="p-4 bg-surface-card-alt/40 border-t border-surface-card-alt flex flex-col sm:flex-row sm:items-center justify-between gap-4">
<div class="flex items-center gap-4 text-label-md font-label-md text-text-muted">
<span>Показывать:</span>
<div class="flex items-center gap-1 bg-white rounded-full p-0.5 border border-outline-variant/30">
<button class="px-2.5 py-1 rounded-full text-xs font-semibold bg-text-primary text-white">25</button>
<button class="px-2.5 py-1 rounded-full text-xs text-text-muted hover:text-text-primary">50</button>
<button class="px-2.5 py-1 rounded-full text-xs text-text-muted hover:text-text-primary">100</button>
</div>
<span>Показано 1–25 из 300 клиентов</span>
</div>
<!-- Pagination Controls -->
<div class="flex items-center gap-1.5 self-center">
<button class="flex items-center gap-1 px-3 py-1.5 rounded-full text-label-md font-label-md bg-white border border-outline-variant/30 text-text-muted hover:text-text-primary hover:bg-surface-card transition-colors disabled:opacity-40" disabled="">
<span class="material-symbols-outlined text-sm" data-icon="chevron_left">chevron_left</span>
<span>Назад</span>
</button>
<button class="w-8 h-8 rounded-full bg-text-primary text-white text-label-md font-label-md font-semibold">1</button>
<button class="w-8 h-8 rounded-full bg-white text-text-muted hover:text-text-primary hover:bg-surface-card text-label-md font-label-md border border-outline-variant/30">2</button>
<button class="w-8 h-8 rounded-full bg-white text-text-muted hover:text-text-primary hover:bg-surface-card text-label-md font-label-md border border-outline-variant/30">3</button>
<span class="px-1 text-text-muted text-xs">...</span>
<button class="w-8 h-8 rounded-full bg-white text-text-muted hover:text-text-primary hover:bg-surface-card text-label-md font-label-md border border-outline-variant/30">12</button>
<button class="flex items-center gap-1 px-3 py-1.5 rounded-full text-label-md font-label-md bg-white border border-outline-variant/30 text-text-primary hover:bg-surface-card transition-colors">
<span>Вперед</span>
<span class="material-symbols-outlined text-sm" data-icon="chevron_right">chevron_right</span>
</button>
</div>
</div>
</div>
</main>
</div>
<!-- PLATFORM FOOTER (Shared Component Alignment) -->
<footer class="w-full bg-surface-canvas border-t border-surface-card-alt mt-auto">
<div class="flex flex-col md:flex-row justify-between items-center w-full px-6 py-6 max-w-7xl mx-auto gap-4">
<div class="text-body-sm font-body-sm text-text-muted">
        © 2025 Aéza Infrastructure Intelligence. All rights reserved.
      </div>
<div class="flex items-center flex-wrap gap-6 text-label-sm font-label-sm">
<a class="text-text-muted hover:text-primary transition-colors duration-200" href="#security">Security Architecture</a>
<a class="text-text-muted hover:text-primary transition-colors duration-200" href="#status">System Status</a>
<a class="text-text-muted hover:text-primary transition-colors duration-200" href="#terms">Terms of Service</a>
<a class="text-text-muted hover:text-primary transition-colors duration-200" href="#privacy">Privacy Policy</a>
</div>
</div>
</footer>
<!-- JAVASCRIPT FOR INTERACTIVITY, REAL TIME SORTING & FILTERING -->
<script>
    // Initial Dataset representing billing reasons and customers
    const initialCustomers = [
      {
        id: "#166",
        numericId: 166,
        email: "maxim.kuznetsov@cloudflow.tech",
        balance: 4.20,
        totalDeposited: 12450.00,
        score: 78.4,
        level: "high",
        levelText: "Высокий",
        reason: "Не хватает €31,40 на продление VPS Pro",
        loss: 1420.00,
        notified: false
      },
      {
        id: "#42",
        numericId: 42,
        email: "devops-core@finplatform.io",
        balance: 1.15,
        totalDeposited: 8900.50,
        score: 71.8,
        level: "high",
        levelText: "Высокий",
        reason: "Услуга Backup 100GB ждёт оплаты, удаление через 2 дня",
        loss: 980.00,
        notified: false
      },
      {
        id: "#241",
        numericId: 241,
        email: "billing@nordicmedia.se",
        balance: 12.00,
        totalDeposited: 6320.00,
        score: 64.3,
        level: "high",
        levelText: "Высокий",
        reason: "Ошибка списания с карты, 2 неудачные попытки",
        loss: 740.00,
        notified: false
      },
      {
        id: "#89",
        numericId: 89,
        email: "alex.vasiliev@gamecluster.ru",
        balance: 2.80,
        totalDeposited: 3450.00,
        score: 58.1,
        level: "medium",
        levelText: "Средний",
        reason: "Автопродление выключено у 3 серверов",
        loss: 410.00,
        notified: false
      },
      {
        id: "#314",
        numericId: 314,
        email: "infra@datavector.ai",
        balance: 48.50,
        totalDeposited: 5600.00,
        score: 47.9,
        level: "medium",
        levelText: "Средний",
        reason: "Баланс исчерпается через 3 дня при текущем расходе",
        loss: 320.00,
        notified: false
      },
      {
        id: "#102",
        numericId: 102,
        email: "tech@streamedge.net",
        balance: 110.00,
        totalDeposited: 2890.00,
        score: 42.5,
        level: "medium",
        levelText: "Средний",
        reason: "Автопродление выключено у 1 сервера",
        loss: 195.00,
        notified: false
      },
      {
        id: "#551",
        numericId: 551,
        email: "support@paylink.kz",
        balance: 890.20,
        totalDeposited: 15300.00,
        score: 21.4,
        level: "low",
        levelText: "Низкий",
        reason: "Баланса достаточно на 68 дней, автопополнение включено",
        loss: 71.49,
        notified: false
      },
      {
        id: "#904",
        numericId: 904,
        email: "sergey@neuralnodes.de",
        balance: 412.50,
        totalDeposited: 7120.00,
        score: 14.8,
        level: "low",
        levelText: "Низкий",
        reason: "Регулярный платёжный профиль, нулевой риск задержки",
        loss: 45.00,
        notified: false
      },
      {
        id: "#1208",
        numericId: 1208,
        email: "admin@globalcdn.eu",
        balance: 1450.00,
        totalDeposited: 31000.00,
        score: 8.2,
        level: "low",
        levelText: "Низкий",
        reason: "Корпоративный контракт, овердрафт активен",
        loss: 0.00,
        notified: false
      },
      // Client without evaluation (mandatory per specs)
      {
        id: "#7132",
        numericId: 7132,
        email: "newuser-449@protonmail.com",
        balance: 0.00,
        totalDeposited: 0.00,
        score: null,
        level: "none",
        levelText: "Нет оценки",
        reason: "Недостаточно данных для оценки",
        loss: 0.00,
        notified: false
      }
    ];

    let currentFilter = 'all';
    let searchQuery = '';
    let sortColumn = 'score';
    let sortDirection = 'desc'; // 'asc', 'desc', 'none'

    function formatCurrency(val) {
      return '€' + val.toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }

    function formatNumber(val) {
      return val.toLocaleString('ru-RU', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
    }

    function renderTable() {
      const tbody = document.getElementById('tableBody');
      
      // 1. Filter
      let filtered = initialCustomers.filter(item => {
        const matchesFilter = (currentFilter === 'all') || (item.level === currentFilter);
        const matchesSearch = item.email.toLowerCase().includes(searchQuery.toLowerCase()) || 
                              item.id.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesFilter && matchesSearch;
      });

      // 2. Sort
      if (sortColumn) {
        filtered.sort((a, b) => {
          let valA = a[sortColumn];
          let valB = b[sortColumn];

          if (sortColumn === 'id') {
            valA = a.numericId;
            valB = b.numericId;
          }

          if (valA === null || valA === undefined) return sortDirection === 'asc' ? 1 : -1;
          if (valB === null || valB === undefined) return sortDirection === 'asc' ? -1 : 1;

          if (typeof valA === 'string') {
            return sortDirection === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
          } else {
            return sortDirection === 'asc' ? valA - valB : valB - valA;
          }
        });
      }

      // Update counter
      document.getElementById('filteredCountLabel').textContent = `Показано 1–${filtered.length} из ${filtered.length}`;

      // Render rows
      tbody.innerHTML = '';
      if (filtered.length === 0) {
        tbody.innerHTML = `
          <tr>
            <td colspan="9" class="py-12 text-center text-text-muted">
              <span class="material-symbols-outlined text-4xl mb-2 text-outline-variant" data-icon="search_off">search_off</span>
              <p class="text-body-md font-medium">Клиенты по заданным критериям не найдены</p>
            </td>
          </tr>
        `;
        return;
      }

      filtered.forEach(client => {
        const tr = document.createElement('tr');
        tr.className = "hover:bg-surface-card transition-colors duration-150 cursor-pointer group";
        tr.onclick = (e) => {
          // If clicked on button or action, don't trigger row navigation
          if (e.target.closest('button') || e.target.closest('a')) return;
          window.location.href = `/customers/${client.id.replace('#', '')}`;
        };

        // Badge styles
        let badgeHtml = '';
        let barColor = 'bg-secondary';
        if (client.level === 'high') {
          badgeHtml = `<span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-label-sm font-label-sm bg-risk-high-surface text-risk-high font-semibold">
            <span class="w-1.5 h-1.5 rounded-full bg-risk-high"></span>Высокий
          </span>`;
          barColor = 'bg-risk-high';
        } else if (client.level === 'medium') {
          badgeHtml = `<span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-label-sm font-label-sm bg-risk-medium-surface text-risk-medium font-semibold">
            <span class="w-1.5 h-1.5 rounded-full bg-risk-medium"></span>Средний
          </span>`;
          barColor = 'bg-risk-medium';
        } else if (client.level === 'low') {
          badgeHtml = `<span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-label-sm font-label-sm bg-risk-low-surface text-risk-low font-semibold">
            <span class="w-1.5 h-1.5 rounded-full bg-risk-low"></span>Низкий
          </span>`;
          barColor = 'bg-risk-low';
        } else {
          badgeHtml = `<span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-label-sm font-label-sm bg-surface-card text-text-muted font-medium border border-outline-variant/30">
            <span class="w-1.5 h-1.5 rounded-full bg-secondary"></span>Нет оценки
          </span>`;
          barColor = 'bg-secondary/40';
        }

        // Score display
        const scoreDisplay = client.score !== null 
          ? `
            <div class="flex items-center gap-2">
              <div class="w-12 h-1.5 bg-surface-card-alt rounded-full overflow-hidden">
                <div class="h-full ${barColor}" style="width: ${Math.min(client.score, 100)}%"></div>
              </div>
              <span class="font-mono font-bold text-text-primary text-body-sm">${formatNumber(client.score)}</span>
            </div>
          `
          : `<span class="font-mono text-text-muted">—</span>`;

        tr.innerHTML = `
          <!-- 1. ID -->
          <td class="py-3 px-4 font-mono text-body-sm font-semibold text-text-primary">
            ${client.id}
          </td>

          <!-- 2. Email -->
          <td class="py-3 px-4 text-text-primary font-medium">
            <div class="flex items-center gap-2">
              <span class="truncate max-w-[210px]">${client.email}</span>
            </div>
          </td>

          <!-- 3. Баланс -->
          <td class="py-3 px-4 text-right font-mono text-body-sm font-semibold text-text-primary">
            ${formatCurrency(client.balance)}
          </td>

          <!-- 4. Пополнено всего -->
          <td class="py-3 px-4 text-right font-mono text-body-sm text-text-muted">
            ${formatCurrency(client.totalDeposited)}
          </td>

          <!-- 5. Score -->
          <td class="py-3 px-4">
            ${scoreDisplay}
          </td>

          <!-- 6. Уровень -->
          <td class="py-3 px-4 whitespace-nowrap">
            ${badgeHtml}
          </td>

          <!-- 7. Причина -->
          <td class="py-3 px-4 text-body-sm text-text-muted max-w-[320px]">
            <span class="truncate block" title="${client.reason}">${client.reason}</span>
          </td>

          <!-- 8. Ожидаемая потеря -->
          <td class="py-3 px-4 text-right font-mono text-body-sm font-semibold ${client.loss > 500 ? 'text-risk-high' : 'text-text-primary'}">
            ${formatCurrency(client.loss)}
          </td>

          <!-- 9. Действия -->
          <td class="py-3 px-4 text-center whitespace-nowrap">
            <div class="inline-flex items-center gap-1.5">
              <button 
                onclick="notifyClient('${client.id}', this, event)"
                class="notify-btn px-2.5 py-1 rounded-full text-label-sm font-label-sm border border-outline-variant/40 hover:bg-surface-card transition-colors ${client.notified ? 'bg-risk-low-surface text-risk-low border-risk-low' : 'text-text-primary'}"
              >
                ${client.notified ? 'Отправлено ✓' : 'Уведомить'}
              </button>
              
              <a 
                href="/customers/${client.id.replace('#', '')}" 
                class="w-7 h-7 rounded-full flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-surface-card-alt transition-colors"
                title="В карточку"
              >
                <span class="material-symbols-outlined text-base" data-icon="arrow_forward">arrow_forward</span>
              </a>
            </div>
          </td>
        `;

        tbody.appendChild(tr);
      });
    }

    function sortTable(column) {
      if (sortColumn === column) {
        if (sortDirection === 'desc') sortDirection = 'asc';
        else if (sortDirection === 'asc') sortDirection = 'desc';
      } else {
        sortColumn = column;
        sortDirection = 'desc';
      }

      // Update header icons
      document.querySelectorAll('.sort-icon').forEach(icon => {
        const col = icon.getAttribute('data-col');
        if (col === sortColumn) {
          icon.textContent = sortDirection === 'desc' ? 'arrow_downward' : 'arrow_upward';
          icon.classList.add('text-primary');
          icon.parentElement.classList.add('text-primary');
        } else {
          icon.textContent = 'unfold_more';
          icon.classList.remove('text-primary');
          icon.parentElement.classList.remove('text-primary');
        }
      });

      renderTable();
    }

    function setRiskFilter(level) {
      currentFilter = level;
      document.querySelectorAll('.risk-chip').forEach(chip => {
        const chipRisk = chip.getAttribute('data-risk');
        if (chipRisk === level) {
          chip.className = "risk-chip active flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-label-md font-label-md transition-all bg-text-primary text-white font-medium shadow-xs";
        } else {
          chip.className = "risk-chip flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-label-md font-label-md transition-all bg-white hover:bg-surface-card-alt text-text-primary border border-outline-variant/30";
        }
      });
      renderTable();
    }

    function handleSearch(val) {
      searchQuery = val;
      const clearBtn = document.getElementById('clearSearchBtn');
      if (val.length > 0) {
        clearBtn.classList.remove('hidden');
      } else {
        clearBtn.classList.add('hidden');
      }
      renderTable();
    }

    function clearSearch() {
      const input = document.getElementById('searchInput');
      input.value = '';
      handleSearch('');
    }

    function notifyClient(id, btn, e) {
      e.stopPropagation();
      const target = initialCustomers.find(c => c.id === id);
      if (target) {
        target.notified = true;
        btn.textContent = 'Отправлено ✓';
        btn.className = "notify-btn px-2.5 py-1 rounded-full text-label-sm font-label-sm bg-risk-low-surface text-risk-low border border-risk-low font-semibold";
      }
    }

    function triggerRecalc() {
      const btn = document.getElementById('recalc-btn');
      const icon = btn.querySelector('.material-symbols-outlined');
      icon.classList.add('animate-spin');
      setTimeout(() => {
        icon.classList.remove('animate-spin');
      }, 1000);
    }

    function exportCSV() {
      const headers = ["ID", "Email", "Balance", "TotalDeposited", "ChurnScore", "RiskLevel", "PrimaryReason", "ExpectedLoss"];
      const rows = initialCustomers.map(c => [
        c.id,
        c.email,
        c.balance,
        c.totalDeposited,
        c.score !== null ? c.score : "",
        c.levelText,
        `"${c.reason}"`,
        c.loss
      ]);
      const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", "aeza_customers_churn_risk.csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }

    // Initialize initial render
    document.addEventListener('DOMContentLoaded', () => {
      renderTable();
    });
  </script>
</body></html>