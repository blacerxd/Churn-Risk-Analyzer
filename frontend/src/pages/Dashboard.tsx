import { Link, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import ChurnChart from '../components/ChurnChart'
import { BrandPattern, Mascot } from '../components/brand'
import { Icon, IconTile } from '../components/icons'
import { EmptyState, ErrorState, PageHeader, RiskBadge, ScoreBar, Skeleton } from '../components/ui'
import { LEVEL_BAR_CLASS, LEVEL_ICON, btnPrimary, calloutClass, cardBase, cardClass, headingBase, headingClass, linkClass, mutedClass, tableHeadClass } from '../components/styles'
import { ApiError, apiFetch, queryKeys } from '../lib/api'
import type { CustomersPage, RiskLevel, Summary } from '../lib/api'
import { LEVEL_LABEL, formatDateTime, formatEuro, formatInt } from '../lib/format'

const LEVELS: RiskLevel[] = ['high', 'medium', 'low', 'none']

function errorMessage(error: unknown): string {
  return error instanceof ApiError ? error.message : 'Попробуйте обновить страницу'
}

// Герой: ожидаемая потеря — главная цифра экрана. Тёмно-синяя панель, голубые акценты.
const HERO_PATTERN_FADE = 'radial-gradient(ellipse 100% 100% at top right, #000 60%, transparent 100%)'

function LossHero({ summary }: { summary: Summary }) {
  return (
    <section className="relative flex min-h-60 flex-col gap-3 overflow-hidden rounded-hero bg-navy p-6 text-white md:p-10" aria-labelledby="hero-title">
      {/* Pattern mirrored into the top-right corner; the cut line ends fade out toward the text */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute right-0 top-0 hidden w-[480px] md:block"
        style={{ maskImage: HERO_PATTERN_FADE, WebkitMaskImage: HERO_PATTERN_FADE }}
      >
        <BrandPattern inverse className="w-full -scale-x-100" />
      </div>
      <p id="hero-title" className="relative font-sans text-xs font-semibold uppercase tracking-[0.06em] text-accent">
        Ожидаемая потеря
      </p>
      <p className={`${headingBase} relative text-[52px] font-black leading-[56px] tabular-nums md:text-[88px] md:leading-[88px]`}>{formatEuro(summary.expected_loss_cents)}</p>
      <p className="relative max-w-xl text-white/80">Столько выручки мы можем потерять за горизонт потерь, если клиенты уйдут с вероятностью, равной их score.</p>
      <div className="relative mt-auto pt-3">
        <Link to="/customers" className={btnPrimary}>
          Смотреть клиентов
          <Icon name="arrow" />
        </Link>
      </div>
    </section>
  )
}

function LevelsKpi({ summary }: { summary: Summary }) {
  return (
    <div className="flex flex-col gap-1.5 border-t border-line p-6 first:border-t-0 md:border-l md:border-t-0 md:p-8 md:first:border-l-0">
      <p className={mutedClass}>Клиентов всего</p>
      <p className={`${headingBase} text-[32px] font-black leading-9 tabular-nums md:text-[40px] md:leading-11`}>{formatInt(summary.customers_total)}</p>
      <div className="mt-2 flex h-2 w-full overflow-hidden rounded-full bg-track" aria-hidden="true">
        {LEVELS.map((level) => {
          const share = summary.customers_total > 0 ? (summary.by_level[level] / summary.customers_total) * 100 : 0
          return <div key={level} className={LEVEL_BAR_CLASS[level]} style={{ width: `${share}%` }} />
        })}
      </div>
      <ul className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1">
        {LEVELS.map((level) => (
          <li key={level} className="flex items-center gap-1.5 font-sans text-sm text-ink">
            <Icon name={LEVEL_ICON[level]} className="h-3.5 w-3.5" />
            {LEVEL_LABEL[level]}
            <span className="ml-auto font-semibold tabular-nums">{formatInt(summary.by_level[level])}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

function Kpi({ title, value, hint }: { title: string; value: string; hint: string }) {
  return (
    <div className="flex flex-col gap-1.5 border-t border-line p-6 md:border-l md:border-t-0 md:p-8">
      <p className={mutedClass}>{title}</p>
      <p className={`${headingBase} text-[32px] font-black leading-9 tabular-nums md:text-[40px] md:leading-11`}>{value}</p>
      <p className={`${mutedClass}`}>{hint}</p>
    </div>
  )
}

function MetricsSkeleton() {
  return (
    <div className="flex flex-col gap-6" aria-busy="true">
      <Skeleton className="h-60 w-full !rounded-hero" />
      <Skeleton className="h-48 w-full !rounded-card" />
    </div>
  )
}

function TopCustomers() {
  const navigate = useNavigate()
  const { data, isPending, isError, error, refetch } = useQuery({
    queryKey: [...queryKeys.customers, 'top-risk'],
    queryFn: () => apiFetch<CustomersPage>('/customers?ordering=-score&page=1&page_size=5'),
  })

  return (
    <section className={`${cardBase} overflow-hidden`} aria-labelledby="top-risk-title">
      <div className="flex flex-col gap-1 p-6 pb-5 sm:flex-row sm:items-center sm:justify-between md:px-8 md:pt-7">
        <h2 id="top-risk-title" className={`${headingClass} text-2xl leading-7`}>
          Топ-5 клиентов под риском
        </h2>
        <Link to="/customers" className={`${linkClass} text-sm`}>
          Все клиенты
        </Link>
      </div>

      {isPending && (
        <div className="flex flex-col gap-3 p-6 pt-2" aria-busy="true">
          {Array.from({ length: 5 }, (_, index) => (
            <Skeleton key={index} className="h-12 w-full" />
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
        <>
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full min-w-[860px] border-collapse">
              <thead>
                <tr className="bg-surface-2">
                  <th scope="col" className={`${tableHeadClass} border-y border-line`}>Клиент</th>
                  <th scope="col" className={`${tableHeadClass} border-y border-line`}>Score</th>
                  <th scope="col" className={`${tableHeadClass} border-y border-line`}>Уровень</th>
                  <th scope="col" className={`${tableHeadClass} border-y border-line`}>Главная причина</th>
                  <th scope="col" className={`${tableHeadClass} border-y border-line text-right`}>Ожидаемая потеря</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line font-sans text-sm">
                {data.results.map((customer) => (
                  <tr key={customer.id} className="transition-colors hover:bg-hover">
                    <td className="px-4 py-3">
                      <Link to={`/customers/${customer.id}`} className={linkClass}>
                        {customer.email}
                      </Link>
                      <div className="text-xs text-muted">ID {customer.id}</div>
                    </td>
                    <td className="px-4 py-3">
                      <ScoreBar customer={customer} />
                    </td>
                    <td className="px-4 py-3">
                      <RiskBadge level={customer.level} />
                    </td>
                    <td className="max-w-xs px-4 py-3 text-muted">{customer.top_reason}</td>
                    <td className="px-4 py-3 text-right font-semibold tabular-nums">{formatEuro(customer.expected_loss_cents)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <ul className="flex flex-col gap-3 p-4 md:hidden">
            {data.results.map((customer) => (
              <li key={customer.id}>
                <button
                  type="button"
                  onClick={() => navigate(`/customers/${customer.id}`)}
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
        </>
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
    <div className="flex flex-col gap-8 font-sans">
      <PageHeader
        title="Обзор"
        subtitle={summary?.calculated_at ? `Данные рассчитаны: ${formatDateTime(summary.calculated_at)}` : 'Риск оттока клиентов и денежные потери'}
      />

      {isPending && <MetricsSkeleton />}

      {isError && <ErrorState message={errorMessage(error)} onRetry={() => void refetch()} />}

      {summary && summary.customers_total === 0 && (
        <div className={`${cardClass} relative overflow-hidden`}>
          <BrandPattern className="pointer-events-none absolute -left-10 top-6 hidden w-64 opacity-90 lg:block" />
          <EmptyState
            visual={<Mascot outfit="suit" className="h-44 w-48" />}
            title="Данных пока нет"
            hint="Загрузите снимок данных на странице «Данные» — после этого появятся метрики и список клиентов под риском."
            action={
              <Link to="/data" className={btnPrimary}>
                Перейти к данным
                <Icon name="arrow" />
              </Link>
            }
          />
        </div>
      )}

      {summary && summary.customers_total > 0 && (
        <>
          <LossHero summary={summary} />

          {/* Полоса показателей в духе блока цифр на aeza.net: верх с большим радиусом */}
          <section aria-label="Ключевые показатели" className="grid grid-cols-1 overflow-hidden rounded-t-[32px] rounded-b-card border border-line bg-surface md:grid-cols-3 md:rounded-t-[40px]">
            <LevelsKpi summary={summary} />
            <Kpi title="Услуги под риском" value={formatInt(summary.services_at_risk)} hint="Услуги клиентов со средним и высоким риском" />
            <Kpi title="Выручка под риском" value={formatEuro(summary.revenue_at_risk_cents)} hint="Стоимость этих услуг за горизонт потерь" />
          </section>

          <section className={`${calloutClass} flex items-start gap-4`} aria-labelledby="explanation-title">
            <IconTile name="half" className="mt-0.5" />
            <div>
              <h2 id="explanation-title" className={`${headingBase} text-lg font-bold leading-6`}>
                Как считается сумма
              </h2>
              <div className="mt-1 flex flex-col gap-2 font-sans text-base">
                {summary.explanation.split('\n').map((paragraph, index) => (
                  <p key={index} className={index === 0 ? 'font-semibold' : undefined}>
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>
          </section>

          <ChurnChart />

          <TopCustomers />
        </>
      )}
    </div>
  )
}
