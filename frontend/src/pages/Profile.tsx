import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { useOutletContext, useSearchParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Icon, IconTile } from '../components/icons'
import { ErrorState, PageHeader, Skeleton, Toast } from '../components/ui'
import { btnGhost, btnPrimary, cardClass, headingClass, inputClass, labelClass, mutedClass } from '../components/styles'
import { ApiError, apiFetch, queryKeys } from '../lib/api'
import type { Me, Passkeys, UserSession } from '../lib/api'
import { formatDateTime } from '../lib/format'

function errorText(error: unknown): string {
  if (!(error instanceof ApiError)) return 'Не удалось выполнить запрос'
  const body = error.body as { errors?: Record<string, unknown> } | null
  const messages = Object.values(body?.errors ?? {}).flat().filter((item): item is string => typeof item === 'string')
  return messages.length ? messages.join(' ') : error.message
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className={mutedClass}>{label}</span>
      <span className="font-sans text-base font-semibold text-ink">{value || '—'}</span>
    </div>
  )
}

function PasskeySection() {
  const queryClient = useQueryClient()
  const [password, setPassword] = useState('')
  const { data, isPending, isError, error, refetch } = useQuery({
    queryKey: queryKeys.passkeys,
    queryFn: () => apiFetch<Passkeys>('/auth/passkeys'),
  })

  // Keycloak takes over: confirm who you are, create the passkey, come back to this page
  const setup = useMutation({
    mutationFn: () => apiFetch<{ url: string }>('/auth/passkeys/setup', { method: 'POST', json: password ? { password } : {} }),
    onSuccess: ({ url }) => window.location.assign(url),
  })

  const remove = useMutation({
    mutationFn: (id: string) => apiFetch(`/auth/passkeys/${id}`, { method: 'DELETE' }),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: queryKeys.passkeys }),
  })

  function submit(event: FormEvent) {
    event.preventDefault()
    setup.mutate()
  }

  if (isPending) return <Skeleton className="h-48 w-full !rounded-card" />
  if (isError) return <ErrorState message={errorText(error)} onRetry={() => void refetch()} />

  return (
    <section className={`${cardClass} flex flex-col gap-5`} aria-labelledby="passkeys-title">
      <div className="flex items-start gap-4">
        <IconTile name="shield" />
        <div>
          <h2 id="passkeys-title" className={`${headingClass} text-lg`}>
            Вход по ключу доступа
          </h2>
          <p className={`${mutedClass} mt-1 max-w-2xl`}>
            Ключ доступа (passkey) заменяет пароль: вход через «Войти через SSO» подтверждается отпечатком пальца,
            лицом, PIN-кодом устройства, телефоном или ключом безопасности. Ключ хранится только на вашем устройстве.
          </p>
        </div>
      </div>

      {!data.sso_enabled && <p className="font-sans text-sm text-ink">Вход через SSO на этом сервере выключен.</p>}

      {data.sso_enabled && (
        <>
          {data.passkeys.length > 0 ? (
            <ul className="flex flex-col divide-y divide-line rounded-panel border border-line">
              {data.passkeys.map((key) => (
                <li key={key.id} className="flex flex-wrap items-center gap-3 px-4 py-3">
                  <Icon name="check" className="h-5 w-5 text-accent" />
                  <div className="mr-auto">
                    <div className="font-sans text-sm font-semibold text-ink">{key.label || 'Ключ доступа'}</div>
                    {key.created_at && <div className={`${mutedClass} text-xs`}>Добавлен {formatDateTime(key.created_at)}</div>}
                  </div>
                  <button
                    type="button"
                    className={btnGhost}
                    disabled={remove.isPending}
                    onClick={() => {
                      if (window.confirm(`Удалить ключ «${key.label || 'Ключ доступа'}»? Войти с ним больше не получится.`)) remove.mutate(key.id)
                    }}
                  >
                    <Icon name="close" />
                    Удалить
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="font-sans text-sm text-ink">Ключей пока нет.</p>
          )}

          <form onSubmit={submit} className="flex flex-col gap-3">
            {!data.sso_account && (
              <label className="flex max-w-sm flex-col gap-1.5">
                <span className={labelClass}>Пароль от панели</span>
                <input
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className={inputClass()}
                />
                <span className={`${mutedClass} text-xs`}>Нужен один раз, чтобы включить для вас вход через SSO.</span>
              </label>
            )}
            {(setup.isError || remove.isError) && (
              <p role="alert" className="font-sans text-sm font-semibold text-warn">
                {errorText(setup.error ?? remove.error)}
              </p>
            )}
            <div>
              <button type="submit" className={btnPrimary} disabled={setup.isPending || (!data.sso_account && !password)}>
                <Icon name="shield" />
                {data.passkeys.length > 0 ? 'Добавить ещё ключ' : 'Добавить ключ доступа'}
              </button>
            </div>
          </form>
        </>
      )}
    </section>
  )
}

function SessionsSection() {
  const queryClient = useQueryClient()
  const { data, isPending, isError, error, refetch } = useQuery({
    queryKey: queryKeys.sessions,
    queryFn: () => apiFetch<UserSession[]>('/auth/sessions'),
  })
  const refresh = () => void queryClient.invalidateQueries({ queryKey: queryKeys.sessions })

  const end = useMutation({
    mutationFn: (id: number) => apiFetch(`/auth/sessions/${id}`, { method: 'DELETE' }),
    onSuccess: refresh,
  })
  const endOthers = useMutation({
    mutationFn: () => apiFetch<{ ended: number }>('/auth/sessions/end-others', { method: 'POST' }),
    onSuccess: refresh,
  })

  if (isPending) return <Skeleton className="h-40 w-full !rounded-card" />
  if (isError) return <ErrorState message={errorText(error)} onRetry={() => void refetch()} />

  const others = data.filter((session) => !session.current).length

  return (
    <section className={`${cardClass} flex flex-col gap-5`} aria-labelledby="sessions-title">
      <div className="flex flex-wrap items-start gap-4">
        <IconTile name="stack" />
        <div className="mr-auto">
          <h2 id="sessions-title" className={`${headingClass} text-lg`}>
            Активные сессии
          </h2>
          <p className={`${mutedClass} mt-1 max-w-2xl`}>
            Устройства, на которых выполнен вход в панель. Если какое-то вам незнакомо, завершите его сессию и смените пароль.
          </p>
        </div>
        {others > 0 && (
          <button
            type="button"
            className={btnGhost}
            disabled={endOthers.isPending}
            onClick={() => {
              if (window.confirm('Выйти на всех других устройствах? Вход через SSO там тоже придётся пройти заново.')) endOthers.mutate()
            }}
          >
            <Icon name="logout" />
            Завершить все другие
          </button>
        )}
      </div>

      <ul className="flex flex-col divide-y divide-line rounded-panel border border-line">
        {data.map((session) => (
          <li key={session.id} className="flex flex-wrap items-center gap-3 px-4 py-3">
            <div className="mr-auto">
              <div className="flex flex-wrap items-center gap-2 font-sans text-sm font-semibold text-ink">
                {session.device}
                {session.current && <span className="rounded-key bg-accent/15 px-2 py-0.5 text-xs font-semibold text-accent">Это устройство</span>}
              </div>
              <div className={`${mutedClass} text-xs`}>
                {[
                  session.ip,
                  session.method === 'sso' ? 'вход через SSO' : 'вход по паролю',
                  `вошли ${formatDateTime(session.created_at)}`,
                  !session.current && `активность ${formatDateTime(session.last_seen_at)}`,
                ]
                  .filter(Boolean)
                  .join(' · ')}
              </div>
            </div>
            {!session.current && (
              <button type="button" className={btnGhost} disabled={end.isPending} onClick={() => end.mutate(session.id)}>
                <Icon name="close" />
                Завершить
              </button>
            )}
          </li>
        ))}
      </ul>

      {(end.isError || endOthers.isError) && (
        <p role="alert" className="font-sans text-sm font-semibold text-warn">
          {errorText(end.error ?? endOthers.error)}
        </p>
      )}
    </section>
  )
}

export default function Profile() {
  const me = useOutletContext<Me>()
  const [searchParams, setSearchParams] = useSearchParams()
  const result = searchParams.get('passkey')

  // the notice after returning from Keycloak disappears by itself
  useEffect(() => {
    if (!result) return undefined
    const timer = window.setTimeout(() => setSearchParams({}, { replace: true }), 6000)
    return () => window.clearTimeout(timer)
  }, [result, setSearchParams])

  const role = me.is_superuser ? 'Суперпользователь' : me.is_staff ? 'Администратор' : 'Аналитик'

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Профиль" subtitle="Ваша учётная запись и способы входа" />

      <section className={`${cardClass} grid gap-5 sm:grid-cols-2 lg:grid-cols-4`} aria-label="Учётная запись">
        <Info label="Логин" value={me.username} />
        <Info label="Имя" value={[me.first_name, me.last_name].filter(Boolean).join(' ')} />
        <Info label="Email" value={me.email} />
        <Info label="Роль" value={role} />
      </section>

      <PasskeySection />

      <SessionsSection />

      {result === 'added' && <Toast>Ключ доступа добавлен: теперь можно входить через SSO</Toast>}
      {result === 'cancelled' && <Toast>Ключ не добавлен. Можно попробовать ещё раз или с другого устройства</Toast>}
    </div>
  )
}
