import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import ChurnChart from '../components/ChurnChart'
import { EmptyState, ErrorState, PageHeader, RiskBadge, Skeleton } from '../components/ui'
import { LEVEL_BAR_CLASS, btnPrimary, cardBase, cardClass, headingClass, linkClass, mutedClass, tableHeadClass } from '../components/styles'
import { ApiError, apiFetch, queryKeys } from '../lib/api'
import type { CustomersPage, RiskLevel, Summary } from '../lib/api'
import { LEVEL_LABEL, formatDateTime, formatEuro, formatInt, formatScore } from '../lib/format'

const LEVELS: RiskLevel[] = ['high', 'medium', 'low', 'none']

function errorMessage(error: unknown): string {
  return error instanceof ApiError ? error.message : 'Попробуйте обновить страницу'
}

function MetricCard({ title, value, hint }: { title: string; value: string; hint: string }) {
  return (
    <div className={cardClass}>
      <p className={mutedClass}>{title}</p>
      <p className={`${headingClass} mt-2 text-3xl`}>{value}</p>
      <p className={`${mutedClass} mt-1 text-xs`}>{hint}</p>
    </div>
  )
}

function MetricsSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-busy="true">
      {Array.from({ length: 4 }, (_, index) => (
        <div key={index} className={`${cardClass} flex flex-col gap-3`}>
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-8 w-2/3" />
          <Skeleton className="h-3 w-full" />
        </div>
      ))}
    </div>
  )
}

function LevelsCard({ summary }: { summary: Summary }) {
  return (
    <div className={cardClass}>
      <p className={mutedClass}>Клиенты по уровням</p>
      <p className={`${headingClass} mt-2 text-3xl`}>{formatInt(summary.customers_total)}</p>
      <div className="mt-3 flex h-2 w-full overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-800" aria-hidden="true">
        {LEVELS.map((level) => {
          const share = summary.customers_total > 0 ? (summary.by_level[level] / summary.customers_total) * 100 : 0
          return <div key={level} className={LEVEL_BAR_CLASS[level]} style={{ width: `${share}%` }} />
        })}
      </div>
      <ul className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1">
        {LEVELS.map((level) => (
          <li key={level} className="flex items-center justify-between gap-2 font-['Inter'] text-xs text-neutral-600 dark:text-neutral-400">
            <span className="flex items-center gap-1.5">
              <span className={`h-2 w-2 rounded-full ${LEVEL_BAR_CLASS[level]}`} />
              {LEVEL_LABEL[level]}
            </span>
            <span className="font-semibold text-black dark:text-white">{formatInt(summary.by_level[level])}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

function TopCustomers() {
  const { data, isPending, isError, error, refetch } = useQuery({
    queryKey: [...queryKeys.customers, 'top-risk'],
    queryFn: () => apiFetch<CustomersPage>('/customers?ordering=-score&page=1&page_size=5'),
  })

  return (
    <section className={cardBase} aria-labelledby="top-risk-title">
      <div className="flex flex-col gap-1 p-6 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 id="top-risk-title" className={`${headingClass} text-lg`}>
          Топ-5 клиентов под риском
        </h2>
        <Link to="/customers" className={`${linkClass} text-sm`}>
          Все клиенты
        </Link>
      </div>

      {isPending && (
        <div className="flex flex-col gap-3 p-6 pt-2" aria-busy="true">
          {Array.from({ length: 5 }, (_, index) => (
            <Skeleton key={index} className="h-10 w-full" />
          ))}
        </div>
      )}

      {isError && (
        <div className="p-6 pt-2">
          <ErrorState message={errorMessage(error)} onRetry={() => void refetch()} />
        </div>
      )}

      {data && data.results.length === 0 && (
        <EmptyState title="Пока нет клиентов под риском" hint="Загрузите данные на странице «Данные», и оценка появится здесь." />
      )}

      {data && data.results.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] border-t border-neutral-200 dark:border-neutral-800">
            <thead>
              <tr className="bg-neutral-50 dark:bg-neutral-950">
                <th scope="col" className={tableHeadClass}>Клиент</th>
                <th scope="col" className={tableHeadClass}>Score</th>
                <th scope="col" className={tableHeadClass}>Уровень</th>
                <th scope="col" className={tableHeadClass}>Главная причина</th>
                <th scope="col" className={`${tableHeadClass} text-right`}>Ожидаемая потеря</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200 font-['Inter'] text-sm dark:divide-neutral-800">
              {data.results.map((customer) => (
                <tr key={customer.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-950">
                  <td className="px-4 py-3">
                    <Link to={`/customers/${customer.id}`} className={linkClass}>
                      {customer.email}
                    </Link>
                    <div className="text-xs text-neutral-500">ID {customer.id}</div>
                  </td>
                  <td className="px-4 py-3 font-semibold tabular-nums">{formatScore(customer.score)}</td>
                  <td className="px-4 py-3">
                    <RiskBadge level={customer.level} />
                  </td>
                  <td className="max-w-xs px-4 py-3 text-neutral-600 dark:text-neutral-400">{customer.top_reason}</td>
                  <td className="px-4 py-3 text-right font-semibold tabular-nums">{formatEuro(customer.expected_loss_cents)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}

export default function Dashboard() {
  const { data: summary, isPending, isError, error, refetch } = useQuery({
    queryKey: queryKeys.summary,
    queryFn: () => apiFetch<Summary>('/analytics/summary'),
  })

  return (
    <div className="flex flex-col gap-6 font-['Inter']">
      <PageHeader
        title="Обзор"
        subtitle={summary?.calculated_at ? `Данные рассчитаны: ${formatDateTime(summary.calculated_at)}` : 'Риск оттока клиентов и денежные потери'}
      />

      {isPending && <MetricsSkeleton />}

      {isError && <ErrorState message={errorMessage(error)} onRetry={() => void refetch()} />}

      {summary && summary.customers_total === 0 && (
        <div className={cardClass}>
          <EmptyState
            title="Данных пока нет"
            hint="Загрузите снимок данных на странице «Данные» — после этого появятся метрики и список клиентов под риском."
            action={
              <Link to="/data" className={btnPrimary}>
                Перейти к данным
              </Link>
            }
          />
        </div>
      )}

      {summary && summary.customers_total > 0 && (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <LevelsCard summary={summary} />
            <MetricCard title="Услуги под риском" value={formatInt(summary.services_at_risk)} hint="Услуги клиентов со средним и высоким риском" />
            <MetricCard title="Выручка под риском" value={formatEuro(summary.revenue_at_risk_cents)} hint="Стоимость этих услуг за горизонт потерь" />
            <MetricCard title="Ожидаемая потеря" value={formatEuro(summary.expected_loss_cents)} hint="Стоимость услуг всех клиентов × вероятность ухода" />
          </div>

          <section className={cardClass} aria-labelledby="explanation-title">
            <h2 id="explanation-title" className={`${headingClass} text-lg`}>
              Как считается сумма
            </h2>
            <p className="mt-2 rounded-lg border border-[#4CC6F1]/40 bg-[#4CC6F1]/10 px-4 py-3 font-['Inter'] text-sm text-[#182D48] dark:text-white">
              {summary.explanation}
            </p>
          </section>

          <ChurnChart />

          <TopCustomers />
        </>
      )}
    </div>
  )
}
