import { useState } from 'react'
import type { FormEvent, ReactNode } from 'react'
import { Link, useOutletContext, useSearchParams } from 'react-router-dom'
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { BrandIcon, EmptyState, ErrorState, PageHeader, RiskBadge, Skeleton } from '../components/ui'
import type { BrandIconName } from '../components/ui'
import {
  btnPrimary,
  btnSecondary,
  cardBase,
  cardClass,
  headingClass,
  inputClass,
  labelClass,
  linkClass,
  mutedClass,
  segmentActiveClass,
  segmentClass,
  segmentIdleClass,
  tableHeadClass,
} from '../components/styles'
import { ApiError, apiFetch, queryKeys } from '../lib/api'
import type { AdminUser, Me, Page, Recalculation, RiskLevel, ServiceStatus, StatusEvent } from '../lib/api'
import { SERVICE_STATUS_LABEL, formatDateTime, formatEuro, formatInt, formatScore } from '../lib/format'

type Tab = 'users' | 'recalculations' | 'events'

const TABS: Array<{ key: Tab; title: string; icon: BrandIconName }> = [
  { key: 'users', title: 'Пользователи', icon: 'users' },
  { key: 'recalculations', title: 'Пересчёты', icon: 'chart' },
  { key: 'events', title: 'Журнал статусов', icon: 'hourglass' },
]

const PAGE_SIZE = 25
const actionClass =
  "rounded-md border px-2.5 py-1 font-['Inter'] text-xs font-medium transition-all focus:outline-none focus:ring-2 focus:ring-[#4CC6F1] disabled:opacity-50"
const actionIdle = 'border-neutral-300 bg-white text-neutral-700 hover:border-[#4CC6F1] dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300'
const actionActive = 'border-[#182D48] bg-[#182D48] text-white dark:border-[#4CC6F1] dark:bg-[#4CC6F1]/15 dark:text-[#4CC6F1]'
const LEVELS: RiskLevel[] = ['high', 'medium', 'low', 'none']
const STATUSES: ServiceStatus[] = ['active', 'suspended', 'prolong_wait', 'deleted', 'blocked']
const REASON_LABEL: Record<Recalculation['reason'], string> = {
  snapshot: 'Загрузка снимка',
  settings: 'Изменение настроек',
}

// "{errors: {password: ['...']}}" from the API turns into one readable line
function errorText(error: unknown): string {
  if (!(error instanceof ApiError)) return 'Не удалось выполнить запрос'
  const body = error.body as { errors?: Record<string, unknown> } | null
  const messages = Object.values(body?.errors ?? {}).flat().filter((item): item is string => typeof item === 'string')
  return messages.length ? messages.join(' ') : error.message
}

function Pagination({ data, page, onPage }: { data: Page<unknown>; page: number; onPage: (page: number) => void }) {
  const totalPages = Math.max(1, Math.ceil(data.count / data.page_size))
  if (data.count <= data.page_size) return null
  return (
    <nav className="flex items-center justify-end gap-2 border-t border-neutral-200 p-4 dark:border-neutral-800" aria-label="Пагинация">
      <button type="button" className={btnSecondary} disabled={page <= 1} onClick={() => onPage(page - 1)}>
        Назад
      </button>
      <span className="px-2 text-sm tabular-nums text-neutral-600 dark:text-neutral-400">
        {page} / {totalPages}
      </span>
      <button type="button" className={btnSecondary} disabled={page >= totalPages} onClick={() => onPage(page + 1)}>
        Вперёд
      </button>
    </nav>
  )
}

function Table({ head, children, loading, columns }: { head: ReactNode; children: ReactNode; loading: boolean; columns: number }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[900px]">
        <thead>
          <tr className="border-b border-neutral-200 bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-950">{head}</tr>
        </thead>
        <tbody className="divide-y divide-neutral-200 text-sm dark:divide-neutral-800">
          {loading &&
            Array.from({ length: 6 }, (_, index) => (
              <tr key={index}>
                <td colSpan={columns} className="px-4 py-3">
                  <Skeleton className="h-6 w-full" />
                </td>
              </tr>
            ))}
          {children}
        </tbody>
      </table>
    </div>
  )
}

function Th({ children, right = false }: { children?: ReactNode; right?: boolean }) {
  return (
    <th scope="col" className={`${tableHeadClass} ${right ? 'text-right' : ''}`}>
      {children}
    </th>
  )
}

function Tag({ tone, children }: { tone: 'navy' | 'cyan' | 'muted' | 'red'; children: ReactNode }) {
  const tones = {
    navy: 'border-[#182D48]/30 bg-[#182D48]/10 text-[#182D48] dark:border-white/20 dark:bg-white/10 dark:text-white',
    cyan: 'border-[#4CC6F1]/40 bg-[#4CC6F1]/15 text-[#0f6f93] dark:text-[#4CC6F1]',
    muted: 'border-neutral-500/30 bg-neutral-500/10 text-neutral-500',
    red: 'border-red-500/30 bg-red-500/10 text-red-600 dark:text-red-400',
  }
  return <span className={`inline-flex whitespace-nowrap rounded-full border px-2.5 py-0.5 text-xs font-semibold ${tones[tone]}`}>{children}</span>
}

function NewUserForm({ onDone }: { onDone: () => void }) {
  const queryClient = useQueryClient()
  const [form, setForm] = useState({ username: '', first_name: '', last_name: '', email: '', password: '' })
  const create = useMutation({
    mutationFn: () => apiFetch<AdminUser>('/admin/users', { method: 'POST', json: form }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.adminUsers })
      onDone()
    },
  })

  function submit(event: FormEvent) {
    event.preventDefault()
    create.mutate()
  }

  const field = (key: keyof typeof form, label: string, type = 'text', autoComplete = 'off') => (
    <label className="flex flex-col gap-1.5">
      <span className={labelClass}>{label}</span>
      <input
        type={type}
        required={key !== 'first_name' && key !== 'last_name'}
        value={form[key]}
        onChange={(event) => setForm({ ...form, [key]: event.target.value })}
        className={inputClass()}
        autoComplete={autoComplete}
      />
    </label>
  )

  return (
    <form onSubmit={submit} className={`${cardClass} flex flex-col gap-4`}>
      <div>
        <h2 className={`${headingClass} text-lg`}>Новый пользователь</h2>
        <p className={`${mutedClass} mt-1`}>
          Первый вход — по логину и паролю. После него можно входить через SSO: по этому email, с ключом доступа.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {field('first_name', 'Имя')}
        {field('last_name', 'Фамилия')}
        {field('email', 'Email', 'email')}
        {field('username', 'Логин')}
        {field('password', 'Пароль', 'password', 'new-password')}
      </div>
      {create.isError && (
        <p role="alert" className="text-sm font-medium text-red-500">
          {errorText(create.error)}
        </p>
      )}
      <div className="flex gap-2">
        <button type="submit" className={btnPrimary} disabled={create.isPending || !form.username || !form.email || !form.password}>
          Создать
        </button>
        <button type="button" className={btnSecondary} onClick={onDone}>
          Отмена
        </button>
      </div>
    </form>
  )
}

function UserRow({ user, me }: { user: AdminUser; me: Me }) {
  const queryClient = useQueryClient()
  const [settingPassword, setSettingPassword] = useState(false)
  const [password, setPassword] = useState('')
  const update = useMutation({
    mutationFn: (patch: Partial<AdminUser> & { password?: string }) =>
      apiFetch<AdminUser>(`/admin/users/${user.id}`, { method: 'PATCH', json: patch }),
    onSuccess: () => {
      setSettingPassword(false)
      setPassword('')
      void queryClient.invalidateQueries({ queryKey: queryKeys.adminUsers })
    },
  })

  const isSelf = user.id === me.id
  // The same rules the API enforces, so the buttons only offer what will work
  const canEdit = !user.is_superuser || me.is_superuser
  const role = user.is_superuser ? <Tag tone="navy">Суперпользователь</Tag> : user.is_staff ? <Tag tone="cyan">Администратор</Tag> : <Tag tone="muted">Пользователь</Tag>

  return (
    <>
      <tr>
        <td className="px-4 py-3">
          <div className="font-semibold">
            {user.username}
            {isSelf && <span className={`${mutedClass} ml-2 text-xs font-normal`}>(вы)</span>}
          </div>
          {(user.first_name || user.last_name) && (
            <div className={`${mutedClass} text-xs`}>{[user.first_name, user.last_name].filter(Boolean).join(' ')}</div>
          )}
        </td>
        <td className="max-w-[200px] truncate px-4 py-3 text-neutral-600 dark:text-neutral-400" title={user.email}>
          {user.email || '—'}
        </td>
        <td className="px-4 py-3">
          <div className="flex flex-wrap gap-1.5">
            {role}
            {!user.is_active && <Tag tone="red">Заблокирован</Tag>}
          </div>
        </td>
        <td className="whitespace-nowrap px-4 py-3 tabular-nums text-neutral-600 dark:text-neutral-400">
          {user.last_login ? formatDateTime(user.last_login) : 'не входил: первый вход по паролю'}
        </td>
        <td className="px-4 py-3">
          {canEdit && (
            <div className="flex justify-end gap-2 whitespace-nowrap">
              {!isSelf && (
                <button type="button" className={`${actionClass} ${actionIdle}`} disabled={update.isPending} onClick={() => update.mutate({ is_active: !user.is_active })}>
                  {user.is_active ? 'Заблокировать' : 'Разблокировать'}
                </button>
              )}
              {!isSelf && me.is_superuser && !user.is_superuser && (
                <button type="button" className={`${actionClass} ${actionIdle}`} disabled={update.isPending} onClick={() => update.mutate({ is_staff: !user.is_staff })}>
                  {user.is_staff ? 'Снять админа' : 'Выдать админа'}
                </button>
              )}
              <button
                type="button"
                className={`${actionClass} ${settingPassword ? actionActive : actionIdle}`}
                aria-expanded={settingPassword}
                onClick={() => setSettingPassword(!settingPassword)}
              >
                Пароль
              </button>
            </div>
          )}
        </td>
      </tr>
      {(settingPassword || update.isError) && (
        <tr>
          <td colSpan={5} className="bg-neutral-50 px-4 py-3 dark:bg-neutral-950">
            {settingPassword && (
              <form
                className="flex flex-wrap items-center gap-2"
                onSubmit={(event) => {
                  event.preventDefault()
                  update.mutate({ password })
                }}
              >
                <label htmlFor={`password-${user.id}`} className={labelClass}>
                  Новый пароль для {user.username}
                </label>
                <input
                  id={`password-${user.id}`}
                  type="password"
                  autoComplete="new-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className={inputClass({ size: 'w-64 py-1.5' })}
                />
                <button type="submit" className={btnPrimary} disabled={!password || update.isPending}>
                  Сохранить
                </button>
              </form>
            )}
            {update.isError && (
              <p role="alert" className="mt-2 text-sm font-medium text-red-500">
                {errorText(update.error)}
              </p>
            )}
          </td>
        </tr>
      )}
    </>
  )
}

function UsersTab({ me }: { me: Me }) {
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [creating, setCreating] = useState(false)
  const query = new URLSearchParams({ page: String(page), page_size: String(PAGE_SIZE) })
  if (search.trim()) query.set('search', search.trim())
  const { data, isPending, isError, error, refetch } = useQuery({
    queryKey: [...queryKeys.adminUsers, query.toString()],
    queryFn: () => apiFetch<Page<AdminUser>>(`/admin/users?${query.toString()}`),
    placeholderData: keepPreviousData,
  })

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <label className="w-full sm:max-w-sm">
          <span className="sr-only">Поиск по логину или email</span>
          <input
            type="search"
            value={search}
            onChange={(event) => {
              setSearch(event.target.value)
              setPage(1)
            }}
            placeholder="Поиск по логину или email"
            className={inputClass()}
          />
        </label>
        {!creating && (
          <button type="button" className={btnPrimary} onClick={() => setCreating(true)}>
            Добавить пользователя
          </button>
        )}
      </div>

      {creating && <NewUserForm onDone={() => setCreating(false)} />}

      {isError && <ErrorState message={errorText(error)} onRetry={() => void refetch()} />}
      {!isError && (
        <section className={cardBase}>
          <Table
            loading={isPending}
            columns={5}
            head={
              <>
                <Th>Пользователь</Th>
                <Th>Email</Th>
                <Th>Роль</Th>
                <Th>Последний вход</Th>
                <Th right>Действия</Th>
              </>
            }
          >
            {data?.results.map((user) => <UserRow key={user.id} user={user} me={me} />)}
          </Table>
          {data && data.results.length === 0 && <EmptyState title="Никого не нашли" hint="Измените поисковый запрос." />}
          {data && <Pagination data={data} page={page} onPage={setPage} />}
        </section>
      )}
    </div>
  )
}

function RecalculationsTab() {
  const [page, setPage] = useState(1)
  const { data, isPending, isError, error, refetch } = useQuery({
    queryKey: [...queryKeys.recalculations, page],
    queryFn: () => apiFetch<Page<Recalculation>>(`/admin/recalculations?page=${page}&page_size=${PAGE_SIZE}`),
    placeholderData: keepPreviousData,
  })

  if (isError) return <ErrorState message={errorText(error)} onRetry={() => void refetch()} />
  return (
    <section className={cardBase}>
      <Table
        loading={isPending}
        columns={7}
        head={
          <>
            <Th>Время</Th>
            <Th>Причина</Th>
            <Th>Клиенты по уровням</Th>
            <Th right>Средний score</Th>
            <Th right>Услуг под риском</Th>
            <Th right>Ожидаемая потеря</Th>
            <Th right>Длительность</Th>
          </>
        }
      >
        {data?.results.map((item) => (
          <tr key={item.id}>
            <td className="whitespace-nowrap px-4 py-3 tabular-nums">{formatDateTime(item.calculated_at)}</td>
            <td className="px-4 py-3">
              <Tag tone={item.reason === 'settings' ? 'navy' : 'cyan'}>{REASON_LABEL[item.reason]}</Tag>
            </td>
            <td className="px-4 py-3">
              <div className="flex flex-wrap items-center gap-1.5">
                {LEVELS.map((level) => (
                  <span key={level} className="inline-flex items-center gap-1">
                    <RiskBadge level={level} />
                    <span className="tabular-nums">{formatInt(item.by_level[level])}</span>
                  </span>
                ))}
              </div>
            </td>
            <td className="px-4 py-3 text-right tabular-nums">{formatScore(item.score_avg)}</td>
            <td className="px-4 py-3 text-right tabular-nums">{formatInt(item.services_at_risk)}</td>
            <td className="px-4 py-3 text-right font-semibold tabular-nums">{formatEuro(item.expected_loss_cents)}</td>
            <td className="px-4 py-3 text-right tabular-nums text-neutral-600 dark:text-neutral-400">{Math.round(item.duration_seconds * 1000)} мс</td>
          </tr>
        ))}
      </Table>
      {data && data.results.length === 0 && <EmptyState title="Пересчётов ещё не было" hint="Они появятся после загрузки данных или изменения настроек модели." />}
      {data && <Pagination data={data} page={page} onPage={setPage} />}
    </section>
  )
}

function EventsTab() {
  const [status, setStatus] = useState<ServiceStatus | ''>('')
  const [page, setPage] = useState(1)
  const query = new URLSearchParams({ page: String(page), page_size: String(PAGE_SIZE) })
  if (status) query.set('new_status', status)
  const { data, isPending, isError, error, refetch } = useQuery({
    queryKey: [...queryKeys.statusEvents, query.toString()],
    queryFn: () => apiFetch<Page<StatusEvent>>(`/admin/status-events?${query.toString()}`),
    placeholderData: keepPreviousData,
  })

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-2" role="group" aria-label="Фильтр по новому статусу">
        {(['', ...STATUSES] as Array<ServiceStatus | ''>).map((item) => (
          <button
            key={item || 'all'}
            type="button"
            aria-pressed={status === item}
            onClick={() => {
              setStatus(item)
              setPage(1)
            }}
            className={`${segmentClass} ${status === item ? segmentActiveClass : segmentIdleClass}`}
          >
            {item ? SERVICE_STATUS_LABEL[item] : 'Все'}
          </button>
        ))}
      </div>
      {isError && <ErrorState message={errorText(error)} onRetry={() => void refetch()} />}
      {!isError && (
        <section className={cardBase}>
          <Table
            loading={isPending}
            columns={4}
            head={
              <>
                <Th>Обнаружено</Th>
                <Th>Услуга</Th>
                <Th>Клиент</Th>
                <Th>Смена статуса</Th>
              </>
            }
          >
            {data?.results.map((event) => (
              <tr key={event.id}>
                <td className="whitespace-nowrap px-4 py-3 tabular-nums">{formatDateTime(event.detected_at)}</td>
                <td className="px-4 py-3 tabular-nums">#{event.service_id}</td>
                <td className="px-4 py-3">
                  <Link to={`/customers/${event.customer_id}`} className={linkClass}>
                    #{event.customer_id}
                  </Link>
                </td>
                <td className="px-4 py-3">
                  <span className="text-neutral-500">{SERVICE_STATUS_LABEL[event.old_status]}</span>
                  <span aria-hidden="true" className="mx-2 text-neutral-400">→</span>
                  <span className="sr-only">на</span>
                  <span className="font-semibold">{SERVICE_STATUS_LABEL[event.new_status]}</span>
                </td>
              </tr>
            ))}
          </Table>
          {data && data.results.length === 0 && (
            <EmptyState title="Смен статусов нет" hint="Журнал копится из разницы между загруженными снимками: после следующей загрузки здесь появятся изменения." />
          )}
          {data && <Pagination data={data} page={page} onPage={setPage} />}
        </section>
      )}
    </div>
  )
}

export default function Administration() {
  const me = useOutletContext<Me>()
  const [searchParams, setSearchParams] = useSearchParams()
  const tab = (TABS.find((item) => item.key === searchParams.get('tab'))?.key ?? 'users') as Tab

  if (!me.is_staff) {
    return (
      <div className={cardClass}>
        <EmptyState title="Раздел только для администраторов" hint="Попросите администратора выдать вам права." />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 font-['Inter']">
      <PageHeader
        title="Администрирование"
        subtitle="Пользователи панели, история пересчётов и журнал статусов услуг"
        actions={
          <a href="/admin/" target="_blank" rel="noreferrer" className={`${linkClass} text-sm`}>
            Django admin для разработчиков
          </a>
        }
      />

      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Разделы администрирования">
        {TABS.map((item) => (
          <button
            key={item.key}
            type="button"
            role="tab"
            aria-selected={tab === item.key}
            onClick={() => setSearchParams(item.key === 'users' ? {} : { tab: item.key })}
            className={`${segmentClass} inline-flex items-center gap-2 ${tab === item.key ? segmentActiveClass : segmentIdleClass}`}
          >
            <BrandIcon name={item.icon} className="h-4 w-4" />
            {item.title}
          </button>
        ))}
      </div>

      <div role="tabpanel">
        {tab === 'users' && <UsersTab me={me} />}
        {tab === 'recalculations' && <RecalculationsTab />}
        {tab === 'events' && <EventsTab />}
      </div>
    </div>
  )
}
