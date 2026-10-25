import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { ApiError, apiFetch, queryKeys } from '../lib/api'
import type { ChurnChartData } from '../lib/api'
import { cardClass, headingClass, mutedBase, mutedClass, segmentActiveClass, segmentClass, segmentIdleClass } from './styles'
import { EmptyState, ErrorState, Skeleton } from './ui'

const RANGES = [14, 30, 90] as const
type Range = (typeof RANGES)[number]

// Токены графика: факт — голубая линия, прогноз — оранжевая пунктирная. Цвета читаются и на светлой, и на тёмной теме.
const FACT_COLOR = '#4CC6F1'
const FORECAST_COLOR = '#E97C35'
const GRID_COLOR = 'var(--color-line)'
const AXIS_TEXT = { fill: 'var(--color-muted)', fontSize: 12, fontFamily: 'Inter, sans-serif' }
const number = new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 2 })

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
          <h2 id="churn-title" className={`${headingClass} text-2xl leading-7`}>
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
              className={`${segmentClass} ${days === range ? segmentActiveClass : segmentIdleClass}`}
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
            <div className="h-64 w-full font-sans text-xs" role="img" aria-label="График оттока: факт и прогноз">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={rows} margin={{ top: 8, right: 16, bottom: 0, left: 0 }}>
                  <CartesianGrid vertical={false} stroke={GRID_COLOR} />
                  <XAxis dataKey="date" tickFormatter={formatDay} tick={AXIS_TEXT} axisLine={false} tickLine={false} minTickGap={16} />
                  <YAxis tick={AXIS_TEXT} axisLine={false} tickLine={false} width={32} />
                  <Tooltip
                    labelFormatter={(label) => new Date(String(label)).toLocaleDateString('ru-RU')}
                    formatter={(value) => number.format(Number(value))}
                    contentStyle={{ borderRadius: 14, border: 'none', background: '#182D48', fontFamily: 'Inter, sans-serif', fontSize: 12 }}
                    labelStyle={{ color: 'rgb(255 255 255 / 0.8)' }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Legend iconType="plainline" wrapperStyle={{ fontSize: 14, fontFamily: 'Inter, sans-serif' }} />
                  <Line type="monotone" dataKey="fact" name="Факт: удалено услуг" stroke={FACT_COLOR} strokeWidth={3} strokeLinecap="round" dot={false} activeDot={{ r: 6, fill: FACT_COLOR, stroke: 'var(--color-surface)', strokeWidth: 3 }} connectNulls />
                  <Line
                    type="monotone"
                    dataKey="forecast"
                    name="Прогноз: непродления"
                    stroke={FORECAST_COLOR}
                    strokeWidth={3}
                    strokeLinecap="round"
                    strokeDasharray="7 7"
                    dot={false}
                    connectNulls
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            {!hasFacts && <p className={`${mutedBase} mt-2 text-xs`}>Фактов пока нет: они копятся с момента запуска системы, показан только прогноз.</p>}
          </>
        )}
      </div>
    </section>
  )
}
