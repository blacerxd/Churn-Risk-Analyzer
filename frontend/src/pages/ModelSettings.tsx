import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { ErrorState, PageHeader, Skeleton, Term } from '../components/ui'
import { btnPrimary, btnSecondary, cardClass, headingClass, inputClass, inputErrorClass, labelClass, mutedClass } from '../components/styles'
import { ApiError, apiFetch, queryKeys } from '../lib/api'
import type { ModelSettingsData, ModelSettingsPatch, ParamField } from '../lib/api'

type FieldErrors = Record<string, string>
type SaveStatus = 'idle' | 'recalculating' | 'done'

const PARAM_LABEL: Record<string, string> = {
  expiry_horizon_days: 'Горизонт прогноза, дней',
  use_bonus_balance: 'Учитывать бонусный баланс',
  loss_horizon_months: 'Горизонт денежной оценки, месяцев',
}

function toDraft(data: ModelSettingsData): ModelSettingsPatch {
  return { weights: { ...data.weights }, thresholds: { ...data.thresholds }, params: { ...data.params } }
}

function validate(values: ModelSettingsPatch, data: ModelSettingsData): FieldErrors {
  const errors: FieldErrors = {}

  for (const field of data.schema.weights) {
    const value = values.weights[field.key]
    if (typeof value !== 'number' || Number.isNaN(value)) errors[`weights.${field.key}`] = 'Введите число'
    else if (value < 0) errors[`weights.${field.key}`] = 'Вес не может быть отрицательным'
    else if (value < field.min || value > field.max) errors[`weights.${field.key}`] = `Допустимо от ${field.min} до ${field.max}`
  }

  const { medium, high } = values.thresholds
  if (Number.isNaN(medium)) errors['thresholds.medium'] = 'Введите число'
  else if (medium < 0 || medium > 100) errors['thresholds.medium'] = 'Допустимо от 0 до 100'
  if (Number.isNaN(high)) errors['thresholds.high'] = 'Введите число'
  else if (high < 0 || high > 100) errors['thresholds.high'] = 'Допустимо от 0 до 100'
  if (!errors['thresholds.medium'] && !errors['thresholds.high'] && medium >= high) {
    errors['thresholds.medium'] = 'Порог среднего риска должен быть ниже порога высокого'
  }

  for (const [key, value] of Object.entries(values.params)) {
    if (typeof value === 'number') {
      const meta = data.schema.params?.find((param) => param.key === key)
      if (Number.isNaN(value)) errors[`params.${key}`] = 'Введите число'
      else if (value < (meta?.min ?? 0)) errors[`params.${key}`] = `Не меньше ${meta?.min ?? 0}`
      else if (meta?.max !== undefined && value > meta.max) errors[`params.${key}`] = `Не больше ${meta.max}`
    }
  }

  return errors
}

function messageOf(value: unknown): string | null {
  if (typeof value === 'string') return value
  if (Array.isArray(value)) return value.filter((item): item is string => typeof item === 'string').join('. ') || null
  return null
}

function parseServerErrors(body: unknown): { fields: FieldErrors; general: string | null } {
  const fields: FieldErrors = {}
  let general: string | null = null
  if (!body || typeof body !== 'object') return { fields, general }

  for (const [section, value] of Object.entries(body)) {
    if (section === 'weights' || section === 'thresholds' || section === 'params') {
      if (value && typeof value === 'object' && !Array.isArray(value)) {
        for (const [key, message] of Object.entries(value)) {
          const text = messageOf(message)
          if (text) fields[`${section}.${key}`] = text
        }
      } else {
        general = messageOf(value) ?? general
      }
    } else if (section === 'detail' || section === 'non_field_errors') {
      general = messageOf(value) ?? general
    }
  }
  return { fields, general }
}

interface NumberFieldProps {
  id: string
  value: number
  min: number
  max?: number
  step?: number
  error?: string
  onChange: (value: number) => void
  disabled: boolean
}

function NumberInput({ id, value, min, max, step = 1, error, onChange, disabled }: NumberFieldProps) {
  return (
    <input
      id={id}
      type="number"
      inputMode="decimal"
      min={min}
      max={max}
      step={step}
      value={Number.isNaN(value) ? '' : value}
      disabled={disabled}
      aria-invalid={Boolean(error)}
      aria-describedby={error ? `${id}-error` : undefined}
      onChange={(event) => onChange(event.target.value === '' ? Number.NaN : Number(event.target.value))}
      className={`${inputClass} w-24 text-right tabular-nums ${error ? inputErrorClass : ''}`}
    />
  )
}

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null
  return (
    <p id={`${id}-error`} role="alert" className="text-xs font-medium text-red-500">
      {message}
    </p>
  )
}

function SettingsSkeleton() {
  return (
    <div className="flex flex-col gap-4" aria-busy="true">
      <Skeleton className="h-48 w-full" />
      {Array.from({ length: 4 }, (_, index) => (
        <Skeleton key={index} className="h-20 w-full" />
      ))}
    </div>
  )
}

export default function ModelSettings() {
  const queryClient = useQueryClient()
  const { data, isPending, isError, error, refetch } = useQuery({
    queryKey: queryKeys.settings,
    queryFn: () => apiFetch<ModelSettingsData>('/model/settings'),
  })

  const [draft, setDraft] = useState<ModelSettingsPatch | null>(null)
  const [serverErrors, setServerErrors] = useState<FieldErrors>({})
  const [generalError, setGeneralError] = useState<string | null>(null)
  const [status, setStatus] = useState<SaveStatus>('idle')

  const saved = data ? toDraft(data) : null
  const values = draft ?? saved
  const clientErrors = data && values ? validate(values, data) : {}
  const errors: FieldErrors = { ...serverErrors, ...clientErrors }
  const isDirty = draft !== null && JSON.stringify(draft) !== JSON.stringify(saved)
  const isSaving = status === 'recalculating'
  const canSave = isDirty && Object.keys(clientErrors).length === 0 && !isSaving

  function edit(update: (current: ModelSettingsPatch) => ModelSettingsPatch, errorKey: string) {
    if (!values) return
    setDraft(update(values))
    setStatus('idle')
    setGeneralError(null)
    setServerErrors((previous) => {
      if (!previous[errorKey]) return previous
      const rest = { ...previous }
      delete rest[errorKey]
      return rest
    })
  }

  function setWeight(key: string, value: number) {
    edit((current) => ({ ...current, weights: { ...current.weights, [key]: value } }), `weights.${key}`)
  }

  function setThreshold(key: 'medium' | 'high', value: number) {
    edit((current) => ({ ...current, thresholds: { ...current.thresholds, [key]: value } }), `thresholds.${key}`)
  }

  function setParam(key: string, value: number | boolean) {
    edit((current) => ({ ...current, params: { ...current.params, [key]: value } }), `params.${key}`)
  }

  function handleReset() {
    setDraft(null)
    setServerErrors({})
    setGeneralError(null)
    setStatus('idle')
  }

  async function handleSave() {
    if (!draft || !canSave) return
    setStatus('recalculating')
    setServerErrors({})
    setGeneralError(null)
    try {
      await apiFetch<unknown>('/model/settings', { method: 'PATCH', json: draft })
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.settings }),
        queryClient.invalidateQueries({ queryKey: queryKeys.summary }),
        queryClient.invalidateQueries({ queryKey: queryKeys.customers }),
        queryClient.invalidateQueries({ queryKey: queryKeys.customer }),
      ])
      setDraft(null)
      setStatus('done')
    } catch (err) {
      setStatus('idle')
      if (err instanceof ApiError) {
        const parsed = parseServerErrors(err.body)
        setServerErrors(parsed.fields)
        setGeneralError(parsed.general ?? (Object.keys(parsed.fields).length === 0 ? err.message : 'Проверьте значения в выделенных полях'))
      } else {
        setGeneralError('Не удалось сохранить настройки')
      }
    }
  }

  const mediumValue = values?.thresholds.medium ?? 0
  const highValue = values?.thresholds.high ?? 0
  const zonesValid = !Number.isNaN(mediumValue) && !Number.isNaN(highValue) && mediumValue < highValue

  return (
    <div className="flex flex-col gap-6 pb-24 font-['Inter']">
      <PageHeader title="Модель" subtitle="Веса признаков, пороги уровней риска и параметры расчёта. После сохранения клиенты пересчитываются автоматически." />

      {isPending && <SettingsSkeleton />}
      {isError && <ErrorState message={error instanceof ApiError ? error.message : 'Попробуйте обновить страницу'} onRetry={() => void refetch()} />}

      {data && values && (
        <>
          <section className={cardClass} aria-labelledby="thresholds-title">
            <h2 id="thresholds-title" className={`${headingClass} text-lg`}>
              Пороги уровней риска
            </h2>
            <p className={`${mutedClass} mt-1`}>Клиент получает уровень по своему score: ниже среднего порога — низкий, от среднего до высокого — средний, от высокого — высокий.</p>

            <div className="mt-4 flex h-3 w-full overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-800" aria-hidden="true">
              {zonesValid && (
                <>
                  <div className="bg-emerald-500 transition-all" style={{ width: `${mediumValue}%` }} />
                  <div className="bg-[#E97C35] transition-all" style={{ width: `${highValue - mediumValue}%` }} />
                  <div className="bg-red-500 transition-all" style={{ width: `${100 - highValue}%` }} />
                </>
              )}
            </div>

            <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
              {(['medium', 'high'] as const).map((key) => {
                const id = `threshold-${key}`
                const fieldError = errors[`thresholds.${key}`]
                return (
                  <div key={key} className="flex flex-col gap-2">
                    <div className="flex items-center justify-between gap-3">
                      <label htmlFor={id} className={labelClass}>
                        {key === 'medium' ? 'Порог среднего риска' : 'Порог высокого риска'}
                      </label>
                      <NumberInput id={id} value={values.thresholds[key]} min={0} max={100} error={fieldError} disabled={isSaving} onChange={(value) => setThreshold(key, value)} />
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      step={1}
                      aria-label={key === 'medium' ? 'Порог среднего риска' : 'Порог высокого риска'}
                      value={Number.isNaN(values.thresholds[key]) ? 0 : values.thresholds[key]}
                      disabled={isSaving}
                      onChange={(event) => setThreshold(key, Number(event.target.value))}
                      className="w-full accent-[#4CC6F1] disabled:opacity-50"
                    />
                    <FieldError id={id} message={fieldError} />
                  </div>
                )
              })}
            </div>
          </section>

          <section className={cardClass} aria-labelledby="weights-title">
            <h2 id="weights-title" className={`${headingClass} text-lg`}>
              Веса признаков
            </h2>
            <p className={`${mutedClass} mt-1`}>Вес — вероятность ухода в процентах, если причина проявилась полностью.</p>

            <ul className="mt-4 flex flex-col divide-y divide-neutral-200 dark:divide-neutral-800">
              {data.schema.weights.map((field) => {
                const id = `weight-${field.key}`
                const fieldError = errors[`weights.${field.key}`]
                const value = values.weights[field.key] ?? Number.NaN
                return (
                  <li key={field.key} className="flex flex-col gap-3 py-4 first:pt-0 last:pb-0 md:flex-row md:items-center md:justify-between">
                    <div className="min-w-0 md:max-w-md">
                      <label htmlFor={id} className="font-['Exo_2'] text-sm font-semibold text-[#182D48] dark:text-white">
                        {field.title}
                      </label>
                      <div className="mt-0.5 text-xs text-neutral-500">
                        <Term hint={field.description || field.key}>
                          <code>{field.key}</code>
                        </Term>
                      </div>
                      {field.description && <p className={`${mutedClass} mt-1 text-xs`}>{field.description}</p>}
                    </div>
                    <div className="flex flex-col gap-1.5 md:items-end">
                      <div className="flex items-center gap-3">
                        <input
                          type="range"
                          min={field.min}
                          max={field.max}
                          step={1}
                          aria-label={field.title}
                          value={Number.isNaN(value) ? field.min : value}
                          disabled={isSaving}
                          onChange={(event) => setWeight(field.key, Number(event.target.value))}
                          className="w-40 accent-[#4CC6F1] disabled:opacity-50 sm:w-56"
                        />
                        <NumberInput id={id} value={value} min={field.min} max={field.max} error={fieldError} disabled={isSaving} onChange={(next) => setWeight(field.key, next)} />
                      </div>
                      <FieldError id={id} message={fieldError} />
                    </div>
                  </li>
                )
              })}
            </ul>
          </section>

          {Object.keys(values.params).length > 0 && (
            <section className={cardClass} aria-labelledby="params-title">
              <h2 id="params-title" className={`${headingClass} text-lg`}>
                Параметры расчёта
              </h2>
              <div className="mt-4 grid grid-cols-1 gap-6 md:grid-cols-2">
                {Object.entries(values.params).map(([key, value]) => {
                  const id = `param-${key}`
                  const meta: ParamField | undefined = data.schema.params?.find((param) => param.key === key)
                  const title = meta?.title ?? PARAM_LABEL[key] ?? key
                  const fieldError = errors[`params.${key}`]
                  return (
                    <div key={key} className="flex flex-col gap-1.5">
                      <div className="flex items-center justify-between gap-3">
                        <label htmlFor={id} className={labelClass}>
                          {title}
                        </label>
                        {typeof value === 'boolean' ? (
                          <input
                            id={id}
                            type="checkbox"
                            checked={value}
                            disabled={isSaving}
                            onChange={(event) => setParam(key, event.target.checked)}
                            className="h-5 w-5 rounded accent-[#4CC6F1]"
                          />
                        ) : (
                          <NumberInput id={id} value={value} min={meta?.min ?? 0} max={meta?.max} error={fieldError} disabled={isSaving} onChange={(next) => setParam(key, next)} />
                        )}
                      </div>
                      {meta?.description && <p className="text-xs text-neutral-500">{meta.description}</p>}
                      <FieldError id={id} message={fieldError} />
                    </div>
                  )
                })}
              </div>
            </section>
          )}

          <div className="sticky bottom-0 z-10 -mx-1 rounded-xl border border-neutral-200 bg-white/95 p-4 backdrop-blur dark:border-neutral-800 dark:bg-neutral-900/95">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div aria-live="polite" className="text-sm">
                {status === 'recalculating' && (
                  <span className="flex items-center gap-2 font-medium text-[#182D48] dark:text-white">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#4CC6F1] border-t-transparent" aria-hidden="true" />
                    Пересчёт…
                  </span>
                )}
                {status === 'done' && <span className="font-medium text-emerald-600 dark:text-emerald-400">Готово</span>}
                {status === 'idle' && generalError && <span role="alert" className="font-medium text-red-500">{generalError}</span>}
                {status === 'idle' && !generalError && isDirty && <span className="text-[#E97C35]">Есть несохранённые изменения</span>}
                {status === 'idle' && !generalError && !isDirty && <span className="text-neutral-500">Изменений нет</span>}
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={handleReset} disabled={!isDirty || isSaving} className={btnSecondary}>
                  Сбросить
                </button>
                <button type="button" onClick={() => void handleSave()} disabled={!canSave} className={btnPrimary}>
                  Сохранить
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
