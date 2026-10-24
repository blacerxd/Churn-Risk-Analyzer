import { useEffect, useState } from 'react'
import type { ChangeEvent, KeyboardEvent } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { EmptyState, ErrorState, PageHeader, RiskBadge, Skeleton } from '../components/ui'
import { btnSecondary, cardClass, inputClass, tableHeadClass } from '../components/styles'
import { ApiError, apiFetch, queryKeys } from '../lib/api'
import type { CustomersPage, RiskLevel } from '../lib/api'
import { LEVEL_LABEL, formatEuro, formatInt, formatScore } from '../lib/format'

type SortKey = 'id' | 'email' | 'balance' | 'total_replenished' | 'score'

const DEFAULT_ORDERING = '-score'
const DEFAULT_PAGE_SIZE = 25
const PAGE_SIZES = [25, 50, 100]
const LEVEL_FILTERS: Array<RiskLevel | ''> = ['', 'high', 'medium', 'low', 'none']

const SORT_KEYS: SortKey[] = ['id', 'email', 'balance', 'total_replenished', 'score']

function parsePositive(value: string | null, fallback: number): number {
  const parsed = Number(value)
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback
}

function SortIndicator({ direction }: { direction: 'asc' | 'desc' | null }) {
  return (
    <span aria-hidden="true" className={direction ? 'text-[#4CC6F1]' : 'text-neutral-400'}>
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

  const { data, isPending, isError, error, refetch, isFetching } = useQuery({
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

  const columns: Array<{ key: SortKey; title: string; align?: 'right' }> = [
    { key: 'id', title: 'ID' },
    { key: 'email', title: 'Email' },
    { key: 'balance', title: 'Баланс', align: 'right' },
    { key: 'total_replenished', title: 'Пополнения', align: 'right' },
    { key: 'score', title: 'Score' },
  ]

  return (
    <div className="flex flex-col gap-6 font-['Inter']">
      <PageHeader title="Клиенты" subtitle="Список клиентов с оценкой риска оттока" />

      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="w-full lg:max-w-sm">
          <label htmlFor="customers-search" className="sr-only">
            Поиск по email
          </label>
          <input
            id="customers-search"
            type="search"
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            placeholder="Поиск по email"
            className={inputClass}
          />
        </div>

        <div className="flex flex-wrap gap-2" role="group" aria-label="Фильтр по уровню риска">
          {LEVEL_FILTERS.map((item) => {
            const active = level === item
            return (
              <button
                key={item || 'all'}
                type="button"
                aria-pressed={active}
                onClick={() => updateParams({ level: item || null, page: null })}
                className={`rounded-lg border px-3.5 py-1.5 text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-[#4CC6F1] ${
                  active
                    ? 'border-[#182D48] bg-[#182D48] text-white'
                    : 'border-neutral-300 bg-white text-neutral-700 hover:border-[#4CC6F1] dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300'
                }`}
              >
                {item ? LEVEL_LABEL[item] : 'Все'}
              </button>
            )
          })}
        </div>
      </div>

      {isError && <ErrorState message={error instanceof ApiError ? error.message : 'Попробуйте обновить страницу'} onRetry={() => void refetch()} />}

      {!isError && (
        <section className={`${cardClass} p-0`} aria-busy={isFetching}>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[960px]">
              <thead>
                <tr className="border-b border-neutral-200 bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-950">
                  {columns.map((column) => {
                    const active = SORT_KEYS.includes(column.key) && sortColumn === column.key
                    const direction = active ? sortDirection : null
                    return (
                      <th
                        key={column.key}
                        scope="col"
                        aria-sort={direction === 'asc' ? 'ascending' : direction === 'desc' ? 'descending' : 'none'}
                        className={`${tableHeadClass} ${column.align === 'right' ? 'text-right' : ''}`}
                      >
                        <button
                          type="button"
                          onClick={() => toggleSort(column.key)}
                          className={`inline-flex items-center gap-1 uppercase tracking-wider hover:text-[#182D48] focus:outline-none focus:ring-2 focus:ring-[#4CC6F1] dark:hover:text-white ${
                            active ? 'text-[#182D48] dark:text-white' : ''
                          }`}
                        >
                          {column.title}
                          <SortIndicator direction={direction} />
                        </button>
                      </th>
                    )
                  })}
                  <th scope="col" className={tableHeadClass}>Уровень</th>
                  <th scope="col" className={tableHeadClass}>Главная причина</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200 text-sm dark:divide-neutral-800">
                {isPending &&
                  Array.from({ length: 8 }, (_, index) => (
                    <tr key={index}>
                      <td colSpan={7} className="px-4 py-3">
                        <Skeleton className="h-6 w-full" />
                      </td>
                    </tr>
                  ))}

                {data?.results.map((customer) => (
                  <tr
                    key={customer.id}
                    tabIndex={0}
                    onClick={() => openCustomer(customer.id)}
                    onKeyDown={(event) => handleRowKeyDown(event, customer.id)}
                    className="cursor-pointer hover:bg-neutral-50 focus:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[#4CC6F1] dark:hover:bg-neutral-950 dark:focus:bg-neutral-950"
                  >
                    <td className="px-4 py-3 font-semibold tabular-nums">{customer.id}</td>
                    <td className="max-w-[240px] truncate px-4 py-3" title={customer.email}>
                      {customer.email}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums">{formatEuro(customer.balance_cents)}</td>
                    <td className="px-4 py-3 text-right tabular-nums text-neutral-600 dark:text-neutral-400">
                      {formatEuro(customer.total_replenished_cents)}
                    </td>
                    <td className="px-4 py-3 font-semibold tabular-nums">{formatScore(customer.score)}</td>
                    <td className="px-4 py-3">
                      <RiskBadge level={customer.level} />
                    </td>
                    <td className="max-w-[320px] px-4 py-3 text-neutral-600 dark:text-neutral-400">{customer.top_reason}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {data && data.results.length === 0 && (
            <EmptyState
              title="Клиенты не найдены"
              hint="Измените поисковый запрос или сбросьте фильтр по уровню риска."
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
            <div className="flex flex-col gap-3 border-t border-neutral-200 p-4 dark:border-neutral-800 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-wrap items-center gap-3 text-sm text-neutral-500">
                <span>
                  Показано {formatInt(from)}–{formatInt(to)} из {formatInt(data.count)}
                </span>
                <label className="flex items-center gap-2">
                  На странице
                  <select value={pageSize} onChange={handlePageSize} className={`${inputClass} w-auto py-1`}>
                    {PAGE_SIZES.map((size) => (
                      <option key={size} value={size}>
                        {size}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <nav className="flex items-center gap-2" aria-label="Пагинация">
                <button type="button" className={btnSecondary} disabled={page <= 1} onClick={() => updateParams({ page: page - 1 === 1 ? null : String(page - 1) })}>
                  Назад
                </button>
                <span className="px-2 text-sm tabular-nums text-neutral-600 dark:text-neutral-400">
                  {page} / {totalPages}
                </span>
                <button type="button" className={btnSecondary} disabled={page >= totalPages} onClick={() => updateParams({ page: String(page + 1) })}>
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
