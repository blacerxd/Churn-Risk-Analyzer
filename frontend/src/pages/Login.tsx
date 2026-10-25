import { useState } from 'react'
import type { ChangeEvent, FormEvent } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { AezaLogo, AezaPattern } from '../components/ui'
import { btnPrimary, btnSecondary, cardClass, headingClass, inputClass, labelClass, mutedClass } from '../components/styles'
import { ApiError, apiFetch, queryKeys } from '../lib/api'
import type { AuthConfig } from '../lib/api'

interface LocationState {
  from?: { pathname: string; search?: string }
}

const INVALID_CREDENTIALS = 'Неверный логин или пароль'

export default function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const queryClient = useQueryClient()

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(
    searchParams.get('error') === 'sso' ? 'Не удалось войти через SSO' : null,
  )
  const [loading, setLoading] = useState(false)

  const state = location.state as LocationState | null
  const nextParam = searchParams.get('next')
  const redirectTo =
    nextParam && nextParam.startsWith('/') && !nextParam.startsWith('//')
      ? nextParam
      : state?.from
        ? `${state.from.pathname}${state.from.search ?? ''}`
        : '/'

  const { data: authConfig } = useQuery({
    queryKey: queryKeys.authConfig,
    queryFn: () => apiFetch<AuthConfig>('/auth/config'),
    retry: false,
    staleTime: Infinity,
  })
  const ssoEnabled = Boolean(authConfig?.oidc_enabled || authConfig?.sso_enabled)

  function handleUsername(event: ChangeEvent<HTMLInputElement>) {
    setUsername(event.target.value)
    if (error) setError(null)
  }

  function handlePassword(event: ChangeEvent<HTMLInputElement>) {
    setPassword(event.target.value)
    if (error) setError(null)
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (loading) return
    setLoading(true)
    setError(null)
    try {
      await apiFetch('/auth/login', { method: 'POST', json: { username, password } })
      await queryClient.invalidateQueries()
      navigate(redirectTo, { replace: true })
    } catch (err) {
      if (err instanceof ApiError && (err.status === 400 || err.status === 401)) {
        setError(INVALID_CREDENTIALS)
      } else if (err instanceof ApiError && err.status === 429) {
        setError('Слишком много попыток входа. Подождите минуту')
      } else {
        setError(err instanceof ApiError ? err.message : 'Не удалось выполнить вход. Попробуйте позже')
      }
      setLoading(false)
    }
  }

  const hasError = error !== null

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#F4F4F4] px-4 py-10 font-['Inter'] text-black dark:bg-black dark:text-white">
      <AezaPattern className="pointer-events-none absolute -left-10 top-10 hidden w-72 opacity-60 lg:block" />
      <AezaPattern className="pointer-events-none absolute -right-10 bottom-10 hidden w-72 rotate-180 opacity-60 lg:block" />

      <main className="relative w-full max-w-md">
        <div className="mb-8 flex flex-col items-center gap-3 text-center">
          <AezaLogo className="h-12 w-12" />
          <h1 className={`${headingClass} text-3xl`}>Вход в панель аналитики</h1>
          <p className={mutedClass}>Мониторинг выручки и рисков оттока клиентов</p>
        </div>

        <form onSubmit={handleSubmit} noValidate className={`${cardClass} flex flex-col gap-4`}>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="login-username" className={labelClass}>
              Логин
            </label>
            <input
              id="login-username"
              name="username"
              type="text"
              autoComplete="username"
              autoFocus
              required
              value={username}
              onChange={handleUsername}
              disabled={loading}
              aria-invalid={hasError}
              className={inputClass({ invalid: hasError })}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="login-password" className={labelClass}>
              Пароль
            </label>
            <div className="relative">
              <input
                id="login-password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                required
                value={password}
                onChange={handlePassword}
                disabled={loading}
                aria-invalid={hasError}
                aria-describedby={hasError ? 'login-error' : undefined}
                className={`${inputClass({ invalid: hasError })} pr-20`}
              />
              <button
                type="button"
                onClick={() => setShowPassword((value) => !value)}
                aria-pressed={showPassword}
                className="absolute inset-y-0 right-0 rounded-r-lg px-3.5 text-xs font-medium text-neutral-500 hover:text-[#182D48] focus:outline-none focus:ring-2 focus:ring-[#4CC6F1] dark:hover:text-white"
              >
                {showPassword ? 'Скрыть' : 'Показать'}
              </button>
            </div>
          </div>

          {hasError && (
            <p id="login-error" role="alert" className="text-sm font-medium text-red-500">
              {error}
            </p>
          )}

          <button type="submit" disabled={loading || !username || !password} className={`${btnPrimary} w-full`}>
            {loading ? 'Вход…' : 'Войти'}
          </button>

          {ssoEnabled && (
            <>
              <div className="flex items-center gap-3" aria-hidden="true">
                <span className="h-px flex-1 bg-neutral-200 dark:bg-neutral-800" />
                <span className="text-xs uppercase tracking-wider text-neutral-500">или</span>
                <span className="h-px flex-1 bg-neutral-200 dark:bg-neutral-800" />
              </div>
              <a
                href={`/api/v1/auth/oidc/login?next=${encodeURIComponent(redirectTo)}`}
                className={`${btnSecondary} w-full ${loading ? 'pointer-events-none opacity-50' : ''}`}
              >
                Войти через SSO
              </a>
            </>
          )}
        </form>

        {import.meta.env.VITE_USE_MSW === 'true' && (
          <p className={`${mutedClass} mt-4 text-center text-xs`}>Демо-режим: логин admin, пароль admin</p>
        )}
        <p className={`${mutedClass} mt-6 text-center text-xs`}>© 2026 Aéza</p>
      </main>
    </div>
  )
}
