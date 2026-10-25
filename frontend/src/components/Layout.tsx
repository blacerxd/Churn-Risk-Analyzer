import { useState } from 'react'
import { Link, NavLink, Outlet, useNavigate, useOutletContext } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { apiFetch } from '../lib/api'
import { useLiveUpdates } from '../lib/useLiveUpdates'
import type { Me } from '../lib/api'
import ThemeToggle from './ThemeToggle'
import { Logo, SidebarPattern } from './brand'
import { Icon, IconTile } from './icons'
import type { IconName } from './icons'
import { btnGhost, btnGhostIcon } from './styles'

const NAV_ITEMS: Array<{ to: string; label: string; icon: IconName; end: boolean }> = [
  { to: '/', label: 'Обзор', icon: 'chart', end: true },
  { to: '/customers', label: 'Клиенты', icon: 'people', end: false },
  { to: '/settings', label: 'Модель', icon: 'edit', end: false },
  { to: '/data', label: 'Данные', icon: 'stack', end: false },
]

const navItemClass = (active: boolean, height = 'min-h-12') =>
  `flex ${height} items-center gap-3 whitespace-nowrap rounded-2xl py-0 pl-2 pr-3 font-display text-[15px] font-bold transition-colors duration-200 ${
    active ? 'bg-accent text-on-accent' : 'text-ink hover:bg-hover'
  }`

export default function Layout() {
  const me = useOutletContext<Me>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [loggingOut, setLoggingOut] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const live = useLiveUpdates()

  async function handleLogout() {
    setLoggingOut(true)
    try {
      await apiFetch('/auth/logout', { method: 'POST' })
    } finally {
      queryClient.clear()
      navigate('/login', { replace: true })
    }
  }

  const time = live.updatedAt?.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })

  const status = (
    <span
      role="status"
      className={`inline-flex min-h-9 items-center gap-2 whitespace-nowrap rounded-full border px-3.5 font-sans text-sm text-ink ${
        live.connected ? 'border-line' : 'border-2 border-warn'
      }`}
    >
      <Icon name={live.connected ? 'check' : 'alert'} className="h-4 w-4" />
      {live.connected && time ? (
        <span>
          <span className="hidden sm:inline">Обновлено в </span>
          {time}
        </span>
      ) : (
        'Нет связи'
      )}
    </span>
  )

  const themeSwitch = <ThemeToggle />

  const logoutButton = (
    <button type="button" onClick={() => void handleLogout()} disabled={loggingOut} className={btnGhost}>
      <Icon name="logout" />
      Выйти
    </button>
  )

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <aside className="hidden shrink-0 flex-col gap-7 border-r border-line bg-surface p-4 md:sticky md:top-0 md:flex md:h-screen md:w-21 md:items-center lg:w-62 lg:items-stretch lg:p-4">
        <div className="mt-1.5 hidden lg:block lg:px-1.5">
          <Logo />
        </div>
        <div className="mt-1.5 lg:hidden">
          <Logo compact />
        </div>
        <nav aria-label="Основное меню" className="flex flex-col gap-1">
          {NAV_ITEMS.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.end} title={item.label} className={({ isActive }) => navItemClass(isActive)}>
              <IconTile name={item.icon} size="sm" />
              <span className="hidden lg:inline">{item.label}</span>
            </NavLink>
          ))}
          {me.is_staff && (
            <NavLink to="/administration" title="Админка" className={({ isActive }) => navItemClass(isActive)}>
              <IconTile name="shield" size="sm" />
              <span className="hidden lg:inline">Админка</span>
            </NavLink>
          )}
        </nav>
        {/* Паттерн брендбука как нижний край меню; в узкой панели (только значки) ему не хватает места */}
        <SidebarPattern className="mt-auto hidden w-full text-ink opacity-90 lg:block" />
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="hidden items-center gap-3 border-b border-line bg-surface px-8 py-4 md:flex lg:px-10">
          <span className="mr-auto">{status}</span>
          <Link to="/profile" title="Профиль" className="hidden items-center gap-1.5 truncate rounded-full px-2 py-1 font-sans text-sm text-muted transition-colors hover:bg-hover hover:text-ink lg:inline-flex">
            <Icon name="people" className="h-4 w-4" />
            {me.username}
          </Link>
          {themeSwitch}
          {logoutButton}
        </header>

        <div className="border-b border-line bg-surface md:hidden">
          <div className="flex items-center gap-3 px-4 py-3">
            <Logo compact />
            <span className="mr-auto">{status}</span>
            <button
              type="button"
              onClick={() => setMenuOpen((open) => !open)}
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
              aria-label={menuOpen ? 'Закрыть меню' : 'Открыть меню'}
              className={btnGhostIcon}
            >
              <Icon name={menuOpen ? 'close' : 'menu'} />
            </button>
          </div>
          {menuOpen && (
            <div id="mobile-menu" className="flex flex-col gap-2 px-4 pb-5 pt-1">
              <nav aria-label="Основное меню" className="flex flex-col gap-1">
                {NAV_ITEMS.map((item) => (
                  <NavLink key={item.to} to={item.to} end={item.end} onClick={() => setMenuOpen(false)} className={({ isActive }) => navItemClass(isActive, 'min-h-13')}>
                    <IconTile name={item.icon} size="sm" />
                    {item.label}
                  </NavLink>
                ))}
                {me.is_staff && (
                  <NavLink to="/administration" onClick={() => setMenuOpen(false)} className={({ isActive }) => navItemClass(isActive, 'min-h-13')}>
                    <IconTile name="shield" size="sm" />
                    Админка
                  </NavLink>
                )}
              </nav>
              <Link to="/profile" onClick={() => setMenuOpen(false)} className={navItemClass(false, 'min-h-13')}>
                <IconTile name="people" size="sm" />
                Профиль · {me.username}
              </Link>
              <div className="flex items-center justify-between gap-3 pt-2">
                {themeSwitch}
                {logoutButton}
              </div>
            </div>
          )}
        </div>

        <main className="w-full max-w-7xl flex-1 p-4 pb-8 md:p-8 lg:p-10">
          <Outlet context={me} />
        </main>
      </div>
    </div>
  )
}
