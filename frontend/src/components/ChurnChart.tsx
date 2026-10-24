import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { ApiError, apiFetch, queryKeys } from '../lib/api'
import type { ChurnChartData } from '../lib/api'
import { cardClass, headingClass, mutedClass } from './styles'
import { EmptyState, ErrorState, Skeleton } from './ui'

const RANGES = [14, 30, 90] as const
type Range = (typeof RANGES)[number]

const FACT_COLOR = '#4CC6F1'
const FORECAST_COLOR = '#182D48'

interface Row {
  date: string
  fact?: number
  forecast?: number
}

function formatDay(iso: string): string {
  return new Date(iso).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' })
}

export default function ChurnChart() {
  const [days, setDays] = useState<Range>(30)
  const { data, isPending, isError, error, refetch } = useQuery({
    queryKey: [...queryKeys.churnChart, days],
    queryFn: () => apiFetch<ChurnChartData>(`/analytics/churn-chart?days=${days}`),
  })

  const rows: Row[] = (data?.series ?? []).map((point) =>
    point.kind === 'fact'
      ? { date: point.date, fact: point.deleted_services ?? 0 }
      : { date: point.date, forecast: point.expected_non_renewals ?? 0 },
  )
  const hasFacts = rows.some((row) => row.fact !== undefined)

  return (
    <section className={cardClass} aria-labelledby="churn-title">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 id="churn-title" className={`${headingClass} text-lg`}>
            Отток: факт и прогноз
          </h2>
          <p className={`${mutedClass} mt-1`}>Удалённые услуги и ожидаемые непродления по дням</p>
        </div>
        <div className="flex gap-2" role="group" aria-label="Период графика">
          {RANGES.map((range) => (
            <button
              key={range}
              type="button"
              aria-pressed={days === range}
              onClick={() => setDays(range)}
              className={`rounded-lg border px-3.5 py-1.5 font-['Inter'] text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-[#4CC6F1] ${
                days === range
                  ? 'border-[#182D48] bg-[#182D48] text-white'
                  : 'border-neutral-300 bg-white text-neutral-700 hover:border-[#4CC6F1] dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300'
              }`}
            >
              {range} дн.
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4">
        {isPending && <Skeleton className="h-64 w-full" />}
        {isError && <ErrorState message={error instanceof ApiError ? error.message : 'Попробуйте обновить страницу'} onRetry={() => void refetch()} />}
        {data && rows.length === 0 && (
          <EmptyState title="Данных для графика пока нет" hint="Факты накапливаются с момента запуска системы: график заполнится по мере появления данных." />
        )}
        {data && rows.length > 0 && (
          <>
            <div className="h-64 w-full font-['Inter'] text-xs" role="img" aria-label="График оттока: факт и прогноз">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={rows} margin={{ top: 8, right: 16, bottom: 0, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#a3a3a3" strokeOpacity={0.3} />
                  <XAxis dataKey="date" tickFormatter={formatDay} stroke="#737373" />
                  <YAxis allowDecimals={false} stroke="#737373" width={32} />
                  <Tooltip
                    labelFormatter={(label) => new Date(String(label)).toLocaleDateString('ru-RU')}
                    contentStyle={{ borderRadius: 12, fontFamily: 'Inter, sans-serif', fontSize: 12 }}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="fact" name="Факт: удалено услуг" stroke={FACT_COLOR} strokeWidth={2.5} dot={false} connectNulls />
                  <Line
                    type="monotone"
                    dataKey="forecast"
                    name="Прогноз: непродления"
                    stroke={FORECAST_COLOR}
                    strokeWidth={2.5}
                    strokeDasharray="6 4"
                    dot={false}
                    connectNulls
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            {!hasFacts && <p className={`${mutedClass} mt-2 text-xs`}>Фактов пока нет: они копятся с момента запуска системы, показан только прогноз.</p>}
          </>
        )}
      </div>
    </section>
  )
}
