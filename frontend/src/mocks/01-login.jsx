<!DOCTYPE html><html lang="ru" style=""><head>
<meta charset="utf-8">
<meta content="width=device-width, initial-scale=1.0" name="viewport">
<title>Aeza Analytics Cloud - Вход в панель аналитики</title>
<!-- Load Tailwind CSS v3 with forms and container-queries plugins -->
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<script>
    tailwind.config = {
      theme: {
        extend: {
          colors: {
            brand: {
              orange: '#f97316',
              'orange-hover': '#ea580c',
              'orange-light': '#fff7ed',
              gray: {
                bg: '#f8fafc',
                input: '#f3f4f6',
                border: '#e5e7eb',
                subtle: '#9ca3af',
                muted: '#6b7280',
                dark: '#111827',
                sso: '#18181b',
                'sso-hover': '#27272a'
              }
            }
          },
          fontFamily: {
            sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
          },
          boxShadow: {
            'card': '0 20px 45px -15px rgba(0, 0, 0, 0.05), 0 0 1px 1px rgba(0, 0, 0, 0.04)',
            'btn-orange': '0 8px 20px -4px rgba(249, 115, 22, 0.38)',
          }
        }
      }
    }
  </script>
<style data-purpose="typography">
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      -webkit-font-smoothing: antialiased;
    }
  </style>
<style data-purpose="background-glow">
    /* Concentric soft ambient radial rings behind the card matching the reference */
    .ambient-circles {
      background: radial-gradient(circle at 50% 48%, rgba(254, 215, 170, 0.28) 0%, rgba(254, 237, 213, 0.16) 24%, rgba(255, 247, 237, 0.1) 48%, transparent 68%);
    }
    .concentric-ring-1 {
      position: absolute;
      width: 580px;
      height: 580px;
      border-radius: 50%;
      border: 1px solid rgba(251, 146, 60, 0.12);
      pointer-events: none;
    }
    .concentric-ring-2 {
      position: absolute;
      width: 760px;
      height: 760px;
      border-radius: 50%;
      border: 1px solid rgba(251, 146, 60, 0.07);
      pointer-events: none;
    }
  </style>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&amp;display=swap" data-snapdom="injected-import"></head>
<body class="min-h-screen bg-[#fafafb] text-[#111827] flex flex-col justify-between relative overflow-x-hidden selection:bg-orange-500 selection:text-white">
<!-- BEGIN: TopHeader -->
<header class="w-full px-6 py-4 flex items-center justify-between border-b border-gray-100 bg-white/70 backdrop-blur-sm z-20" style="background: rgba(255, 255, 255, 0.65); backdrop-filter: blur(12px); border-bottom: 1px solid rgba(226, 232, 240, 0.5);">
<!-- Left Logo & Product Info -->
<div class="flex items-center space-x-3">
<!-- Aeza Brand Square Logo Icon -->
<div class="w-8 h-8 rounded-lg bg-black text-white flex items-center justify-center font-bold text-sm tracking-tight shadow-sm select-none">
        é
      </div>
<div class="flex items-center space-x-2 text-[14px]">
<span class="font-bold text-gray-900 tracking-tight">A<span class="text-[#0891b2]">é</span>za</span>
<span class="text-gray-300 font-light text-xs">/</span>
<span class="text-gray-500 font-normal">Analytics Cloud</span>
</div>
</div>
<!-- Right WebSocket Status Pill -->
<div class="flex items-center space-x-3"><button type="button" class="flex items-center space-x-1.5 px-3 py-1 rounded-full border border-gray-200/70 bg-white hover:bg-gray-50 text-xs font-medium text-gray-700 transition cursor-pointer shadow-sm"><svg class="w-3.5 h-3.5 text-gray-500" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle><path stroke-linecap="round" stroke-linejoin="round" d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg><span class="">RU</span><svg class="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7"></path></svg></button></div>
</header>
<!-- END: TopHeader -->
<!-- BEGIN: MainContent -->
<main class="flex-1 flex flex-col items-center justify-center relative px-4 py-8 z-10">
<!-- Ambient glowing geometric circular background -->
<div class="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden -z-10"><div class="relative w-full max-w-4xl h-[650px] flex items-center justify-center pointer-events-none filter blur-[100px] sm:blur-[130px] opacity-60"><div class="gemini-aura-1 absolute w-[420px] h-[360px] rounded-full bg-gradient-to-tr from-[#0891b2] via-[#22d3ee] to-[#38bdf8] opacity-75"></div><div class="gemini-aura-2 absolute w-[380px] h-[400px] rounded-full bg-gradient-to-bl from-[#0ea5e9] via-[#67e8f9] to-[#a5f3fc] opacity-65 -top-12 -left-10"></div><div class="gemini-aura-3 absolute w-[340px] h-[320px] rounded-full bg-gradient-to-r from-[#38bdf8] to-[#06b6d4] opacity-55 -bottom-8 -right-8"></div></div></div>
<!-- Center Bento Login Card -->
<section class="w-full max-w-[440px] rounded-3xl p-8 sm:p-9 shadow-card border relative bg-white border-gray-100">
<!-- Top Small Brand Badge 'é' -->
<div class="flex justify-center mb-5">
<div class="w-12 h-12 rounded-2xl bg-[#e0f4f7] border border-[#b2e7ef] flex items-center justify-center shadow-inner"><span class="text-[#0891b2] font-bold text-xl select-none">é</span></div>
</div>
<!-- Header Typography -->
<div class="text-center mb-7">
<h1 class="text-[22px] font-bold text-gray-900 tracking-tight leading-tight">
          Вход в панель аналитики
        </h1>
<p class="text-xs text-gray-500 mt-1.5 font-normal">
          Мониторинг выручки и рисков оттока хостинга
        </p>
</div>
<!-- Auth Form -->
<form action="#" class="space-y-4" method="POST" onsubmit="event.preventDefault();">
<!-- Login / Email Input Field -->
<div>
<div class="flex justify-between items-center mb-1.5">
<label class="text-xs font-semibold text-gray-800" for="login-email">Логин или Email</label>
<a class="text-[11px] font-medium text-gray-400 hover:text-gray-600 transition-colors" href="#">SSO / LDAP</a>
</div>
<div class="relative">
<input class="w-full bg-[#f3f4f6]/80 hover:bg-[#f3f4f6] focus:bg-white text-gray-900 text-[13px] px-3.5 py-2.5 rounded-xl border border-transparent focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all outline-none pr-10 font-normal" id="login-email" placeholder="Логин или Email" type="text" value="admin@aeza.net">
<div class="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-gray-400">
<!-- At-sign Icon -->
<svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24">
<path d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" stroke-linecap="round" stroke-linejoin="round"></path>
</svg>
</div>
</div>
</div>
<!-- Password Input Field -->
<div>
<div class="flex justify-between items-center mb-1.5">
<label class="text-xs font-semibold text-gray-800" for="login-password">Пароль</label>
<a class="text-[11px] font-medium text-gray-500 hover:text-gray-700 transition-colors" href="#">Забыли пароль?</a>
</div>
<div class="relative">
<input class="w-full bg-[#f3f4f6]/80 hover:bg-[#f3f4f6] focus:bg-white text-gray-900 text-[13px] px-3.5 py-2.5 rounded-xl border border-transparent focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all outline-none pr-10 font-normal" id="login-password" placeholder="Пароль" type="text" value="SecureCloudKey2026!">
<button aria-label="Переключить видимость пароля" class="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none transition-colors" type="button">
<!-- Eye Icon -->
<svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24">
<path d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" stroke-linecap="round" stroke-linejoin="round"></path>
<path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" stroke-linecap="round" stroke-linejoin="round"></path>
</svg>
</button>
</div>
</div>
<!-- Primary Action Submit Button -->
<div class="pt-2">
<button class="w-full bg-gradient-to-r from-[#0891b2] to-[#15b8cf] hover:opacity-95 active:scale-[0.99] text-white text-[13px] font-semibold py-3 px-4 rounded-xl shadow-[0_8px_20px_-4px_rgba(17,168,191,0.38)] flex items-center justify-center space-x-1.5 transition-all duration-150 cursor-pointer" type="submit"><span class="">Войти в систему</span><span class="text-sm font-bold ml-1">→</span></button>
</div>
<!-- Divider with Text -->
<div class="relative py-2.5 flex items-center justify-center">
<div class="w-full border-t border-gray-100"></div>
<span class="absolute bg-white px-3 text-[11px] uppercase tracking-wider text-gray-400 font-medium select-none">или</span>
</div>
<!-- Corporate OIDC (SSO) Button -->
<div>
<button class="w-full bg-[#18181b] hover:bg-[#27272a] active:scale-[0.99] text-white text-[13px] font-medium py-3 px-4 rounded-xl flex items-center justify-center space-x-2.5 transition-all duration-150 shadow-sm cursor-pointer" type="button">
<!-- Shield Icon -->
<svg class="w-4 h-4 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 10a2 2 0 0 0-2 2c0 1.02-.1 2.51-.26 4"></path><path d="M14 13.12c0 2.38 0 6.38-1 8.88"></path><path d="M17.29 21.02c.12-.6.43-2.3.5-3.02"></path><path d="M2 12a10 10 0 0 1 18-6"></path><path d="M2 16h.01"></path><path d="M21.8 16c.2-2 .131-5.354 0-6"></path><path d="M5 19.5C5.5 18 6 15 6 12a6 6 0 0 1 .34-2"></path><path d="M8.65 22c.21-.66.45-1.32.57-2"></path><path d="M9 6.8a6 6 0 0 1 9 5.2v2"></path></svg>
<span class="tracking-tight text-white font-medium">Войти через корпоративный OIDC (SSO)</span>
</button>
</div>
<!-- In-card Security Info Footer -->

</form>
</section>
<!-- Sub-card Connection Status Info -->
<div class="mt-6 flex items-center space-x-1.5 text-xs text-gray-500 font-normal">
<!-- Lock Icon -->
<svg class="w-3.5 h-3.5 text-gray-400 inline-block -mt-0.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
<path d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" stroke-linecap="round" stroke-linejoin="round"></path>
</svg>
<span class="">Защищенный шлюз компании</span>


</div>
</main>
<!-- END: MainContent -->
<!-- BEGIN: BottomFooter -->
<footer class="w-full px-6 py-4 border-t border-gray-100 bg-white/70 backdrop-blur-sm z-20 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-gray-500">
<!-- Left Legal & Navigation Links -->
<div class="flex flex-wrap items-center gap-x-5 gap-y-1">
<span class="font-bold text-gray-900 select-none">© 2026 Aeza Cloud Inc.</span>
<a class="hover:text-gray-900 transition-colors" href="#">Политика безопасности</a>
<a class="hover:text-gray-900 transition-colors" href="#">Регламент инцидентов</a>
<a class="hover:text-gray-900 transition-colors" href="#">Справка API</a>
</div>
<!-- Right Infrastructure Status -->
<div class="flex items-center space-x-2">
<span class="w-2 h-2 rounded-full bg-[#22c55e]"></span>
<span class="text-gray-600 font-medium">Все системы работают штатно</span>
</div>
</footer>
<!-- END: BottomFooter -->














</body></html>