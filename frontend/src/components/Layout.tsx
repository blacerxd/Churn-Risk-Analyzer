import { useState } from 'react'
import { NavLink, Outlet, useNavigate, useOutletContext } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { apiFetch } from '../lib/api'
import { useLiveUpdates } from '../lib/useLiveUpdates'
import type { Me } from '../lib/api'
import { btnSecondary } from './styles'
import { AezaLogo } from './ui'

const NAV_ITEMS = [
  { to: '/', label: 'Обзор', end: true },
  { to: '/customers', label: 'Клиенты', end: false },
  { to: '/settings', label: 'Модель', end: false },
  { to: '/data', label: 'Данные', end: false },
]

const THEME_KEY = 'theme'

function readDark(): boolean {
  try {
    return localStorage.getItem(THEME_KEY) === 'dark'
  } catch {
    return false
  }
}

export default function Layout() {
  const me = useOutletContext<Me>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [dark, setDark] = useState(() => {
    const initial = readDark()
    document.documentElement.classList.toggle('dark', initial)
    return initial
  })
  const [loggingOut, setLoggingOut] = useState(false)
  const live = useLiveUpdates()

  function toggleTheme() {
    const next = !dark
    setDark(next)
    document.documentElement.classList.toggle('dark', next)
    try {
      localStorage.setItem(THEME_KEY, next ? 'dark' : 'light')
    } catch {
      // тема просто не сохранится
    }
  }

  async function handleLogout() {
    setLoggingOut(true)
    try {
      await apiFetch('/auth/logout', { method: 'POST' })
    } finally {
      queryClient.clear()
      navigate('/login', { replace: true })
    }
  }

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <aside className="flex shrink-0 flex-col gap-4 border-b border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900 md:sticky md:top-0 md:h-screen md:w-56 md:border-b-0 md:border-r md:p-6">
        <div className="flex items-center gap-2">
          <AezaLogo className="h-8 w-8" />
          <span className="font-['Exo_2'] text-xl font-bold tracking-tight text-[#182D48] dark:text-white">aéza</span>
        </div>
        <nav aria-label="Основное меню" className="flex gap-1 overflow-x-auto md:flex-col">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `whitespace-nowrap rounded-lg px-3.5 py-2 font-['Exo_2'] text-sm font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-[#4CC6F1] ${
                  isActive
                    ? 'bg-[#182D48] text-white dark:bg-[#4CC6F1]/15 dark:text-[#4CC6F1]'
                    : 'text-neutral-600 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
          <a
            href="/admin/"
            target="_blank"
            rel="noreferrer"
            className="whitespace-nowrap rounded-lg px-3.5 py-2 font-['Exo_2'] text-sm font-semibold text-neutral-600 transition-all hover:bg-neutral-100 focus:outline-none focus:ring-2 focus:ring-[#4CC6F1] dark:text-neutral-300 dark:hover:bg-neutral-800"
          >
            Админка
          </a>
        </nav>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center gap-2 border-b border-neutral-200 bg-white px-4 py-3 dark:border-neutral-800 dark:bg-neutral-900 sm:gap-3 md:px-8">
          <span
            role="status"
            className={`mr-auto flex min-w-0 items-center gap-2 whitespace-nowrap font-['Inter'] text-sm ${live.connected ? 'text-neutral-600 dark:text-neutral-300' : 'text-red-500'}`}
          >
            <span aria-hidden="true" className={`h-2 w-2 shrink-0 rounded-full ${live.connected ? 'bg-emerald-500' : 'bg-red-500'}`} />
            {live.connected && live.updatedAt ? (
              <span>
                <span className="hidden sm:inline">Обновлено в </span>
                {live.updatedAt.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
              </span>
            ) : (
              'Нет связи'
            )}
          </span>
          <span className="hidden truncate font-['Inter'] text-sm text-neutral-600 dark:text-neutral-300 sm:inline">{me.username}</span>
          <button
            type="button"
            onClick={toggleTheme}
            aria-pressed={dark}
            aria-label={dark ? 'Включить светлую тему' : 'Включить тёмную тему'}
            className="whitespace-nowrap rounded-lg border border-neutral-300 px-3 py-2 font-['Inter'] text-sm text-neutral-700 transition-all hover:border-[#4CC6F1] focus:outline-none focus:ring-2 focus:ring-[#4CC6F1] dark:border-neutral-800 dark:text-neutral-300"
          >
            <span aria-hidden="true">{dark ? '☀' : '☾'}</span>
            <span className="ml-2 hidden sm:inline">{dark ? 'Светлая тема' : 'Тёмная тема'}</span>
          </button>
          <button type="button" onClick={() => void handleLogout()} disabled={loggingOut} className={btnSecondary}>
            Выйти
          </button>
        </header>
        <main className="flex-1 p-4 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
