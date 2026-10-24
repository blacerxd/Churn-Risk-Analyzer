import { Link, useLocation, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { EmptyState, ErrorState, RiskBadge, Skeleton, Term } from '../components/ui'
import { LEVEL_BAR_CLASS, cardClass, headingClass, mutedClass, tableHeadClass } from '../components/styles'
import { ApiError, apiFetch, queryKeys } from '../lib/api'
import type { CustomerDetailData, ServiceStatus } from '../lib/api'
import { PAYMENT_TERM_LABEL, SERVICE_STATUS_LABEL, formatDate, formatDecimal, formatEuro, formatScore, pluralize } from '../lib/format'

interface LocationState {
  listSearch?: string
}

const SCORED_STATUSES: ServiceStatus[] = ['active', 'suspended', 'prolong_wait']

const STATUS_CLASS: Record<ServiceStatus, string> = {
  active: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30',
  suspended: 'bg-[#E97C35]/15 text-[#E97C35] border border-[#E97C35]/30',
  prolong_wait: 'bg-[#E97C35]/15 text-[#E97C35] border border-[#E97C35]/30',
  deleted: 'bg-neutral-500/15 text-neutral-500 border border-neutral-500/30',
  blocked: 'bg-red-500/15 text-red-600 dark:text-red-400 border border-red-500/30',
}

function StatusBadge({ status }: { status: ServiceStatus }) {
  const badge = (
    <span className={`inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_CLASS[status]}`}>
      {SERVICE_STATUS_LABEL[status]}
    </span>
  )
  if (status !== 'prolong_wait') return badge
  return (
    <Term hint="prolong_wait — срок услуги закончился, она ждёт оплаты продления. Через 5 дней после окончания срока услугу удалят.">
      {badge}
    </Term>
  )
}

function DetailSkeleton() {
  return (
    <div className="flex flex-col gap-6" aria-busy="true">
      <Skeleton className="h-40 w-full" />
      <Skeleton className="h-64 w-full" />
      <Skeleton className="h-64 w-full" />
    </div>
  )
}

export default function CustomerDetail() {
  const { id } = useParams<{ id: string }>()
  const location = useLocation()
  const listSearch = (location.state as LocationState | null)?.listSearch ?? ''

  const { data, isPending, isError, error, refetch } = useQuery({
    queryKey: [...queryKeys.customer, id],
    queryFn: () => apiFetch<CustomerDetailData>(`/customers/${id}`),
    enabled: Boolean(id),
  })

  const notFound = error instanceof ApiError && error.status === 404

  const scored = data ? data.services.filter((service) => SCORED_STATUSES.includes(service.status)) : []
  const monthlyAtRisk = scored.reduce((sum, service) => sum + service.monthly_equivalent_cents, 0)
  const probability = data && data.score !== null ? data.score / 100 : null
  const availableCents = data ? data.balance_cents + (data.bonus_usable ? data.bonus_balance_cents : 0) : 0
  const maxContribution = data ? Math.max(1, ...data.factors.map((factor) => factor.contribution)) : 1

  return (
    <div className="flex flex-col gap-6 font-['Inter']">
      <div>
        <Link
          to={`/customers${listSearch}`}
          className="inline-flex items-center gap-2 rounded-lg text-sm font-medium text-[#182D48] hover:underline focus:outline-none focus:ring-2 focus:ring-[#4CC6F1] dark:text-[#4CC6F1]"
        >
          <span aria-hidden="true">←</span>
          Назад к списку
        </Link>
      </div>

      {isPending && !isError && <DetailSkeleton />}

      {isError && (
        <ErrorState
          message={notFound ? 'Клиент с таким идентификатором не найден' : error instanceof ApiError ? error.message : 'Попробуйте обновить страницу'}
          onRetry={notFound ? undefined : () => void refetch()}
        />
      )}

      {data && (
        <>
          <section className={`${cardClass} flex flex-col gap-6 md:flex-row md:items-center md:justify-between`} aria-labelledby="customer-title">
            <div className="min-w-0">
              <p className={mutedClass}>Клиент {data.id}</p>
              <h1 id="customer-title" className={`${headingClass} truncate text-2xl`}>
                {data.email}
              </h1>
              <p className={`${mutedClass} mt-2 max-w-xl`}>
                {data.level === 'none' || data.factors.length === 0
                  ? 'Недостаточно данных для оценки'
                  : data.factors[0].explanation}
              </p>
            </div>
            <div className="flex items-center gap-4">
              {data.score === null ? (
                <div className="text-right">
                  <p className={`${headingClass} text-3xl text-neutral-500 dark:text-neutral-500`}>Нет оценки</p>
                  <p className={`${mutedClass} text-xs`}>У клиента нет услуг, по которым можно оценить риск</p>
                </div>
              ) : (
                <div className="text-right">
                  <p className={`${headingClass} text-6xl tabular-nums`}>{formatScore(data.score)}</p>
                  <p className={`${mutedClass} text-xs`}>score из 100</p>
                </div>
              )}
              <RiskBadge level={data.level} />
            </div>
          </section>

          <section className={cardClass} aria-labelledby="factors-title">
            <h2 id="factors-title" className={`${headingClass} text-lg`}>
              Почему такой риск
            </h2>
            {data.factors.length === 0 ? (
              <EmptyState title="Причин риска нет" hint="Ни один из признаков модели не сработал или данных недостаточно для оценки." />
            ) : (
              <ul className="mt-4 flex flex-col gap-4">
                {data.factors.map((factor) => (
                  <li key={factor.key}>
                    <div className="flex items-baseline justify-between gap-4">
                      <span className="text-sm font-semibold text-black dark:text-white">{factor.title}</span>
                      <span className="text-sm font-semibold tabular-nums">+{formatDecimal(factor.contribution)}</span>
                    </div>
                    <div
                      className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-800"
                      role="progressbar"
                      aria-label={factor.title}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-valuenow={Math.round(factor.contribution)}
                    >
                      <div className={`h-full rounded-full ${LEVEL_BAR_CLASS[data.level]}`} style={{ width: `${(factor.contribution / maxContribution) * 100}%` }} />
                    </div>
                    <p className={`${mutedClass} mt-1.5`}>{factor.explanation}</p>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className={cardClass} aria-labelledby="money-title">
            <h2 id="money-title" className={`${headingClass} text-lg`}>
              Денежная оценка
            </h2>
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <div>
                <p className={mutedClass}>Основной баланс</p>
                <p className={`${headingClass} text-xl`}>{formatEuro(data.balance_cents)}</p>
              </div>
              <div>
                <p className={mutedClass}>Бонусный баланс</p>
                <p className={`${headingClass} text-xl`}>{formatEuro(data.bonus_balance_cents)}</p>
                <p className="text-xs text-neutral-500">{data.bonus_usable ? 'Можно тратить на продления' : 'Заблокирован, на продления не идёт'}</p>
              </div>
              <div>
                <p className={mutedClass}>Реферальный баланс</p>
                <p className={`${headingClass} text-xl`}>{formatEuro(data.withdraw_balance_cents)}</p>
                <p className="text-xs text-neutral-500">Автоматически не списывается</p>
              </div>
              <div>
                <p className={mutedClass}>Всего пополнено</p>
                <p className={`${headingClass} text-xl`}>{formatEuro(data.total_replenished_cents)}</p>
              </div>
            </div>

            <div className="mt-6 rounded-lg border border-[#4CC6F1]/40 bg-[#4CC6F1]/10 p-4 text-sm text-[#182D48] dark:text-white">
              <p className="font-semibold">Ожидаемая потеря = месячная стоимость услуг × вероятность оттока</p>
              {probability === null ? (
                <p className="mt-2">Оценка не выставлена, поэтому ожидаемая потеря равна {formatEuro(data.expected_loss_cents)}.</p>
              ) : (
                <p className="mt-2 tabular-nums">
                  {formatEuro(monthlyAtRisk)} × {probability.toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ≈{' '}
                  <strong>{formatEuro(data.expected_loss_cents)}</strong>
                </p>
              )}
              <p className="mt-2 text-xs text-neutral-600 dark:text-neutral-400">
                В расчёт входят {scored.length} {pluralize(scored.length, 'услуга', 'услуги', 'услуг')} в статусах «Активна», «Приостановлена» и «Ожидает продления». Вероятность оттока равна score / 100.
                Доступно для автопродления: {formatEuro(availableCents)}.
              </p>
            </div>
          </section>

          <section className={`${cardClass} p-0`} aria-labelledby="services-title">
            <h2 id="services-title" className={`${headingClass} p-6 pb-4 text-lg`}>
              Услуги клиента
            </h2>
            {data.services.length === 0 ? (
              <EmptyState title="У клиента нет услуг" />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[900px] border-t border-neutral-200 dark:border-neutral-800">
                  <thead>
                    <tr className="bg-neutral-50 dark:bg-neutral-950">
                      <th scope="col" className={tableHeadClass}>Услуга</th>
                      <th scope="col" className={tableHeadClass}>Статус</th>
                      <th scope="col" className={`${tableHeadClass} text-right`}>Цена</th>
                      <th scope="col" className={tableHeadClass}>Период</th>
                      <th scope="col" className={tableHeadClass}>
                        <Term hint="autoprolong — автоматическое продление: при окончании срока оплата списывается с баланса сама.">Автопродление</Term>
                      </th>
                      <th scope="col" className={`${tableHeadClass} text-right`}>Дней до окончания</th>
                      <th scope="col" className={`${tableHeadClass} text-right`}>Ожидаемая потеря</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-200 text-sm dark:divide-neutral-800">
                    {data.services.map((service) => (
                      <tr key={service.id}>
                        <td className="px-4 py-3 font-semibold">{service.name}</td>
                        <td className="px-4 py-3">
                          <StatusBadge status={service.status} />
                        </td>
                        <td className="px-4 py-3 text-right tabular-nums">{formatEuro(service.price_cents)}</td>
                        <td className="px-4 py-3 text-neutral-600 dark:text-neutral-400">{PAYMENT_TERM_LABEL[service.payment_term] ?? service.payment_term}</td>
                        <td className="px-4 py-3">{service.autoprolong ? 'Включено' : 'Выключено'}</td>
                        <td className="px-4 py-3 text-right tabular-nums" title={`Окончание: ${formatDate(service.expires_at)}`}>
                          {service.days_to_expiry ?? '—'}
                        </td>
                        <td className="px-4 py-3 text-right font-semibold tabular-nums">{formatEuro(service.expected_loss_cents)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </>
      )}
    </div>
  )
}
