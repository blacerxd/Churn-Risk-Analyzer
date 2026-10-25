import { useEffect, useState } from 'react'
import type { ChangeEvent, KeyboardEvent } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { Icon } from '../components/icons'
import { EmptyState, ErrorState, PageHeader, RiskBadge, ScoreBar, Skeleton } from '../components/ui'
import { btnGhost, btnSecondary, cardBase, inputClass, mutedClass, segmentActiveClass, segmentClass, segmentIdleClass, tableHeadClass } from '../components/styles'
import { ApiError, apiFetch, queryKeys } from '../lib/api'
import type { CustomersPage, RiskLevel } from '../lib/api'
import { LEVEL_LABEL, formatEuro, formatInt } from '../lib/format'

type SortKey = 'id' | 'email' | 'balance' | 'total_replenished' | 'score' | 'level' | 'expected_loss'

const DEFAULT_ORDERING = '-score'
const DEFAULT_PAGE_SIZE = 25
const PAGE_SIZES = [25, 50, 100]
const LEVEL_FILTERS: Array<RiskLevel | ''> = ['', 'high', 'medium', 'low', 'none']

function parsePositive(value: string | null, fallback: number): number {
  const parsed = Number(value)
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback
}

function SortIndicator({ direction }: { direction: 'asc' | 'desc' | null }) {
  return (
    <span aria-hidden="true" className={direction ? 'text-ink' : 'text-muted'}>
      {direction === 'asc' ? '↑' : direction === 'desc' ? '↓' : '↕'}
    </span>
  )
}

export default function Customers() {
  const [searchParams, setSearchParams] = useSearchParams()
  const location = useLocation()
  const navigate = useNavigate()

  const level = (searchParams.get('level') ?? '') as RiskLevel | ''
  const search = searchParams.get('search') ?? ''
  const ordering = searchParams.get('ordering') ?? DEFAULT_ORDERING
  const page = parsePositive(searchParams.get('page'), 1)
  const pageSize = PAGE_SIZES.includes(Number(searchParams.get('page_size')))
    ? Number(searchParams.get('page_size'))
    : DEFAULT_PAGE_SIZE

  const [searchInput, setSearchInput] = useState(search)

  function updateParams(patch: Record<string, string | null>, replace = false) {
    setSearchParams(
      (previous) => {
        const next = new URLSearchParams(previous)
        for (const [key, value] of Object.entries(patch)) {
          if (value === null || value === '') next.delete(key)
          else next.set(key, value)
        }
        return next
      },
      { replace },
    )
  }

  useEffect(() => {
    if (searchInput === search) return undefined
    const timer = window.setTimeout(() => {
      updateParams({ search: searchInput.trim() || null, page: null }, true)
    }, 300)
    return () => window.clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchInput, search])

  const query = new URLSearchParams()
  if (level) query.set('level', level)
  if (search) query.set('search', search)
  query.set('ordering', ordering)
  query.set('page', String(page))
  query.set('page_size', String(pageSize))

  const { data, isPending, isError, error, refetch, isFetching, isPlaceholderData } = useQuery({
    queryKey: [...queryKeys.customers, query.toString()],
    queryFn: () => apiFetch<CustomersPage>(`/customers?${query.toString()}`),
    placeholderData: keepPreviousData,
  })

  const sortColumn = ordering.replace(/^-/, '')
  const sortDirection: 'asc' | 'desc' = ordering.startsWith('-') ? 'desc' : 'asc'

  function toggleSort(column: SortKey) {
    const nextOrdering = sortColumn === column && sortDirection === 'desc' ? column : `-${column}`
    updateParams({ ordering: nextOrdering === DEFAULT_ORDERING ? null : nextOrdering, page: null })
  }

  function openCustomer(id: number) {
    navigate(`/customers/${id}`, { state: { listSearch: location.search } })
  }

  function handleRowKeyDown(event: KeyboardEvent<HTMLTableRowElement>, id: number) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      openCustomer(id)
    }
  }

  function handlePageSize(event: ChangeEvent<HTMLSelectElement>) {
    updateParams({ page_size: event.target.value === String(DEFAULT_PAGE_SIZE) ? null : event.target.value, page: null })
  }

  const totalPages = data ? Math.max(1, Math.ceil(data.count / data.page_size)) : 1
  const from = data && data.count > 0 ? (data.page - 1) * data.page_size + 1 : 0
  const to = data ? Math.min(data.page * data.page_size, data.count) : 0

  // Порядок совпадает с ячейками строки. Без sort — колонка не сортируется.
  // Причина — отдельной колонкой только на широком экране, иначе второй строкой под email:
  // так «Ожидаемая потеря» видна без горизонтальной прокрутки.
  const columns: Array<{ title: string; sort?: SortKey; align?: 'right'; className?: string }> = [
    { title: 'ID', sort: 'id' },
    { title: 'Email', sort: 'email' },
    { title: 'Баланс', sort: 'balance', align: 'right' },
    { title: 'Пополнения', sort: 'total_replenished', align: 'right' },
    { title: 'Score', sort: 'score' },
    { title: 'Уровень', sort: 'level' },
    { title: 'Главная причина', className: 'hidden 2xl:table-cell' },
    { title: 'Ожидаемая потеря', sort: 'expected_loss', align: 'right' },
  ]

  return (
    <div className="flex flex-col gap-6 font-sans">
      <PageHeader title="Клиенты" subtitle="Список клиентов с оценкой риска оттока" />

      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative w-full lg:max-w-sm">
          <label htmlFor="customers-search" className="sr-only">
            Поиск по email
          </label>
          <Icon name="search" className="pointer-events-none absolute left-3.5 top-3 h-5 w-5 text-muted" />
          <input
            id="customers-search"
            type="search"
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            placeholder="Поиск по email"
            className={inputClass({ pad: 'pl-11 pr-4' })}
          />
        </div>

        {/* Уже 1280 px таблица не помещается, вместо неё карточки — сортировка выбирается списком */}
        <label className="flex items-center gap-2 whitespace-nowrap text-sm text-muted xl:hidden">
          Сортировка
          <select
            value={ordering}
            onChange={(event) => updateParams({ ordering: event.target.value === DEFAULT_ORDERING ? null : event.target.value, page: null })}
            className={inputClass({ size: 'w-full min-h-11' })}
          >
            {columns.flatMap((column) =>
              column.sort
                ? [
                    <option key={`-${column.sort}`} value={`-${column.sort}`}>{`${column.title} ↓`}</option>,
                    <option key={column.sort} value={column.sort}>{`${column.title} ↑`}</option>,
                  ]
                : [],
            )}
          </select>
        </label>

        <div className="flex flex-wrap gap-2" role="group" aria-label="Фильтр по уровню риска">
          {LEVEL_FILTERS.map((item) => {
            const active = level === item
            return (
              <button
                key={item || 'all'}
                type="button"
                aria-pressed={active}
                onClick={() => updateParams({ level: item || null, page: null })}
                className={`${segmentClass} ${active ? segmentActiveClass : segmentIdleClass}`}
              >
                {item ? LEVEL_LABEL[item] : 'Все'}
              </button>
            )
          })}
        </div>
      </div>

      {isError && <ErrorState message={error instanceof ApiError ? error.message : 'Попробуйте обновить страницу'} onRetry={() => void refetch()} />}

      {!isError && (
        // Пока новый ответ не пришёл, показан прошлый список — приглушаем его, чтобы не выглядел результатом нового фильтра.
        <section className={`${cardBase} overflow-hidden transition-opacity ${isPlaceholderData ? 'opacity-50' : ''}`} aria-busy={isFetching}>
          <div className="hidden overflow-x-auto xl:block">
            <table className="w-full min-w-[880px] border-collapse">
              <thead>
                <tr className="bg-surface-2">
                  {columns.map((column) => {
                    const headClass = `${tableHeadClass} border-b border-line ${column.align === 'right' ? 'text-right' : ''} ${column.className ?? ''}`
                    if (!column.sort) {
                      return (
                        <th key={column.title} scope="col" className={headClass}>
                          {column.title}
                        </th>
                      )
                    }
                    const sortKey = column.sort
                    const active = sortColumn === sortKey
                    const direction = active ? sortDirection : null
                    return (
                      <th
                        key={column.title}
                        scope="col"
                        aria-sort={direction === 'asc' ? 'ascending' : direction === 'desc' ? 'descending' : 'none'}
                        className={headClass}
                      >
                        <button
                          type="button"
                          onClick={() => toggleSort(sortKey)}
                          className={`inline-flex min-h-8 items-center gap-1 rounded uppercase tracking-[0.06em] hover:text-ink ${column.align === 'right' ? 'text-right' : 'text-left'} ${active ? 'text-ink' : ''}`}
                        >
                          {/* Длинный заголовок переносится, а не раздвигает таблицу за край карточки */}
                          <span className="whitespace-normal">{column.title}</span>
                          <SortIndicator direction={direction} />
                        </button>
                      </th>
                    )
                  })}
                </tr>
              </thead>
              <tbody className="divide-y divide-line text-sm">
                {isPending &&
                  Array.from({ length: 8 }, (_, index) => (
                    <tr key={index}>
                      <td colSpan={columns.length} className="px-4 py-3">
                        <Skeleton className="h-8 w-full" />
                      </td>
                    </tr>
                  ))}

                {data?.results.map((customer) => (
                  <tr
                    key={customer.id}
                    tabIndex={0}
                    onClick={() => openCustomer(customer.id)}
                    onKeyDown={(event) => handleRowKeyDown(event, customer.id)}
                    className="h-16 cursor-pointer transition-colors hover:bg-hover focus-visible:bg-hover focus-visible:outline-offset-[-2px]"
                  >
                    <td className="px-4 py-3 font-semibold tabular-nums">{customer.id}</td>
                    <td className="max-w-[260px] px-4 py-3">
                      <span className="block truncate font-semibold" title={customer.email}>
                        {customer.email}
                      </span>
                      <span className="mt-0.5 block text-xs text-muted 2xl:hidden">{customer.top_reason}</span>
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums">{formatEuro(customer.balance_cents)}</td>
                    <td className="px-4 py-3 text-right tabular-nums text-muted">{formatEuro(customer.total_replenished_cents)}</td>
                    <td className="px-4 py-3">
                      <ScoreBar customer={customer} barClass="w-12 flex-none 2xl:w-20" />
                    </td>
                    <td className="px-4 py-3">
                      <RiskBadge level={customer.level} />
                    </td>
                    <td className="hidden max-w-[320px] px-4 py-3 text-muted 2xl:table-cell">{customer.top_reason}</td>
                    <td className="px-4 py-3 text-right font-semibold tabular-nums">{formatEuro(customer.expected_loss_cents)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Уже 1280 px таблица превращается в карточки */}
          <ul className="flex flex-col gap-3 p-4 xl:hidden">
            {isPending &&
              Array.from({ length: 5 }, (_, index) => (
                <li key={index}>
                  <Skeleton className="h-28 w-full" />
                </li>
              ))}
            {data?.results.map((customer) => (
              <li key={customer.id}>
                <button
                  type="button"
                  onClick={() => openCustomer(customer.id)}
                  className="flex min-h-11 w-full flex-col gap-2.5 rounded-panel border border-line bg-surface-2 p-4 text-left"
                >
                  <span className="flex items-center justify-between gap-2">
                    <strong className="break-all font-sans text-sm">{customer.email}</strong>
                    <RiskBadge level={customer.level} />
                  </span>
                  <ScoreBar customer={customer} showLoss />
                  <span className={mutedClass}>{customer.top_reason}</span>
                </button>
              </li>
            ))}
          </ul>

          {data && data.results.length === 0 && (
            <EmptyState
              title="Клиенты не найдены"
              hint="Измените поисковый запрос или сбросьте фильтр по уровню риска."
              visual={
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-black text-accent">
                  <Icon name="search" className="h-6 w-6" />
                </span>
              }
              action={
                <button
                  type="button"
                  className={btnSecondary}
                  onClick={() => {
                    setSearchInput('')
                    setSearchParams({})
                  }}
                >
                  Сбросить фильтры
                </button>
              }
            />
          )}

          {data && data.count > 0 && (
            <div className="flex flex-col gap-3 border-t border-line p-4 sm:flex-row sm:items-center sm:justify-between md:px-6">
              <div className="flex flex-wrap items-center gap-3 text-sm text-muted">
                <span>
                  Показано {formatInt(from)}–{formatInt(to)} из {formatInt(data.count)}
                </span>
                <label className="flex items-center gap-2 whitespace-nowrap">
                  На странице
                  <select value={pageSize} onChange={handlePageSize} className={inputClass({ size: 'w-auto min-h-10 py-0' })}>
                    {PAGE_SIZES.map((size) => (
                      <option key={size} value={size}>
                        {size}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <nav className="flex items-center gap-2" aria-label="Пагинация">
                <button type="button" className={btnGhost} disabled={page <= 1} onClick={() => updateParams({ page: page - 1 === 1 ? null : String(page - 1) })}>
                  Назад
                </button>
                <span className="px-2 text-sm tabular-nums text-muted">
                  {page} / {totalPages}
                </span>
                <button type="button" className={btnGhost} disabled={page >= totalPages} onClick={() => updateParams({ page: String(page + 1) })}>
                  Вперёд
                </button>
              </nav>
            </div>
          )}
        </section>
      )}
    </div>
  )
}
