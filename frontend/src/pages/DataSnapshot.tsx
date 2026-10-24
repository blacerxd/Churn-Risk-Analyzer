import { useEffect, useRef, useState } from 'react'
import type { ChangeEvent, DragEvent } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { PageHeader, Term } from '../components/ui'
import { btnPrimary, btnSecondary, cardClass, headingClass, mutedClass } from '../components/styles'
import { ApiError, apiFetch } from '../lib/api'
import type { SnapshotResult } from '../lib/api'
import { formatDateTime, formatInt } from '../lib/format'

interface SnapshotCounts {
  accounts: number
  services: number
  transactions: number
}

interface ParsedSnapshot {
  payload: unknown
  counts: SnapshotCounts
}

type UnknownRecord = Record<string, unknown>

const MAX_LISTED_ERRORS = 50

const SERVICE_STATUSES = ['active', 'suspended', 'prolong_wait', 'deleted', 'blocked']
const PAYMENT_TERMS = ['hour', 'week', 'month', 'quarter_year', 'half_year', 'year']
const TRANSACTION_STATUSES = ['performed', 'not_performed']
const TRANSACTION_TYPES = ['prolong', 'order']
const BONUS_STATES = ['locked', 'unlocked']

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isMoney(value: unknown): boolean {
  return typeof value === 'number' && Number.isInteger(value) && value >= 0
}

function timestamp(value: unknown): number | null {
  if (typeof value !== 'string') return null
  const parsed = Date.parse(value)
  return Number.isNaN(parsed) ? null : parsed
}

function validateSnapshot(raw: unknown): { errors: string[]; counts: SnapshotCounts | null } {
  const errors: string[] = []
  if (!isRecord(raw)) return { errors: ['Корень файла должен быть объектом с полями accounts, services и transactions'], counts: null }

  const sections = ['accounts', 'services', 'transactions'] as const
  for (const section of sections) {
    if (!Array.isArray(raw[section])) errors.push(`Поле «${section}» должно быть массивом`)
  }
  if (errors.length > 0) return { errors, counts: null }

  const accounts = (raw.accounts as unknown[]).filter(isRecord)
  const services = (raw.services as unknown[]).filter(isRecord)
  const transactions = (raw.transactions as unknown[]).filter(isRecord)
  const counts: SnapshotCounts = {
    accounts: (raw.accounts as unknown[]).length,
    services: (raw.services as unknown[]).length,
    transactions: (raw.transactions as unknown[]).length,
  }

  if (accounts.length !== counts.accounts) errors.push('accounts: все элементы должны быть объектами')
  if (services.length !== counts.services) errors.push('services: все элементы должны быть объектами')
  if (transactions.length !== counts.transactions) errors.push('transactions: все элементы должны быть объектами')

  const accountIds = new Set<unknown>()
  const emails = new Set<unknown>()
  accounts.forEach((account, index) => {
    const at = `accounts[${index}]`
    if (accountIds.has(account.id)) errors.push(`${at}: повторяющийся id ${String(account.id)}`)
    accountIds.add(account.id)
    if (typeof account.email !== 'string' || account.email === '') errors.push(`${at}: не указан email`)
    else if (emails.has(account.email)) errors.push(`${at}: email ${account.email} уже встречался`)
    emails.add(account.email)
    for (const field of ['balance', 'withdrawBalance', 'totalReplenished', 'bonusBalance']) {
      if (!isMoney(account[field])) errors.push(`${at}: поле ${field} должно быть целым числом не меньше 0`)
    }
    if (!BONUS_STATES.includes(String(account.bonusState))) errors.push(`${at}: bonusState должен быть locked или unlocked`)
  })

  const serviceIds = new Set<unknown>()
  services.forEach((service, index) => {
    const at = `services[${index}]`
    if (serviceIds.has(service.id)) errors.push(`${at}: повторяющийся id ${String(service.id)}`)
    serviceIds.add(service.id)
    if (typeof service.name !== 'string' || !/^[A-Za-z0-9-]+$/.test(service.name)) errors.push(`${at}: name может содержать только латинские буквы, цифры и дефис`)
    if (!accountIds.has(service.ownerId)) errors.push(`${at}: ownerId ${String(service.ownerId)} не найден среди accounts`)
    if (!SERVICE_STATUSES.includes(String(service.status))) errors.push(`${at}: недопустимый status ${String(service.status)}`)
    if (!PAYMENT_TERMS.includes(String(service.paymentTerm))) errors.push(`${at}: недопустимый paymentTerm ${String(service.paymentTerm)}`)
    if (typeof service.autoProlong !== 'boolean') errors.push(`${at}: autoProlong должен быть true или false`)
    if (!isMoney(service.price)) errors.push(`${at}: price должен быть целым числом не меньше 0`)
    const created = timestamp(service.createdAt)
    const expires = timestamp(service.expiresAt)
    if (created === null || expires === null) errors.push(`${at}: createdAt и expiresAt должны быть датами ISO 8601`)
    else if (expires < created) errors.push(`${at}: expiresAt раньше createdAt`)
  })

  transactions.forEach((transaction, index) => {
    const at = `transactions[${index}]`
    if (!serviceIds.has(transaction.serviceId)) errors.push(`${at}: serviceId ${String(transaction.serviceId)} не найден среди services`)
    if (!TRANSACTION_STATUSES.includes(String(transaction.status))) errors.push(`${at}: недопустимый status ${String(transaction.status)}`)
    if (!TRANSACTION_TYPES.includes(String(transaction.type))) errors.push(`${at}: недопустимый type ${String(transaction.type)}`)
    if (typeof transaction.amount !== 'number' || !Number.isInteger(transaction.amount) || transaction.amount < 0 || transaction.amount > 1000) {
      errors.push(`${at}: amount должен быть целым числом от 0 до 1000`)
    }
    const created = timestamp(transaction.createdAt)
    if (created === null) errors.push(`${at}: createdAt должен быть датой ISO 8601`)
    if (transaction.status === 'performed') {
      const performed = timestamp(transaction.performedAt)
      if (performed === null) errors.push(`${at}: для performed нужен performedAt`)
      else if (created !== null && performed < created) errors.push(`${at}: performedAt раньше createdAt`)
    } else if (transaction.status === 'not_performed' && transaction.performedAt !== null) {
      errors.push(`${at}: для not_performed performedAt должен быть null`)
    }
  })

  return { errors, counts }
}

function collectServerErrors(error: unknown): string[] {
  if (!(error instanceof ApiError)) return ['Не удалось загрузить данные. Попробуйте позже']
  const messages: string[] = []
  const walk = (value: unknown, path: string) => {
    if (typeof value === 'string') messages.push(path ? `${path}: ${value}` : value)
    else if (Array.isArray(value)) value.forEach((item, index) => walk(item, isRecord(item) || typeof item === 'string' ? path : `${path}[${index}]`))
    else if (isRecord(value)) {
      for (const [key, nested] of Object.entries(value)) {
        if (key === 'code') continue
        walk(nested, path ? `${path}.${key}` : key === 'detail' || key === 'errors' ? '' : key)
      }
    }
  }
  walk(error.body, '')
  return messages.length > 0 ? messages : [error.message]
}

function CountCard({ title, value }: { title: string; value: number }) {
  return (
    <div className={cardClass}>
      <p className={mutedClass}>{title}</p>
      <p className={`${headingClass} mt-2 text-3xl tabular-nums`}>{formatInt(value)}</p>
    </div>
  )
}

export default function DataSnapshot() {
  const queryClient = useQueryClient()
  const inputRef = useRef<HTMLInputElement>(null)
  const confirmRef = useRef<HTMLButtonElement>(null)

  const [fileName, setFileName] = useState<string | null>(null)
  const [snapshot, setSnapshot] = useState<ParsedSnapshot | null>(null)
  const [errors, setErrors] = useState<string[]>([])
  const [dragging, setDragging] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [result, setResult] = useState<SnapshotResult | null>(null)

  useEffect(() => {
    if (!confirmOpen) return undefined
    confirmRef.current?.focus()
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !uploading) setConfirmOpen(false)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [confirmOpen, uploading])

  async function readFile(file: File) {
    setFileName(file.name)
    setSnapshot(null)
    setResult(null)
    setErrors([])
    try {
      const payload: unknown = JSON.parse(await file.text())
      const validation = validateSnapshot(payload)
      setErrors(validation.errors)
      if (validation.errors.length === 0 && validation.counts) setSnapshot({ payload, counts: validation.counts })
    } catch {
      setErrors(['Файл не удалось прочитать как JSON'])
    }
  }

  function handleSelect(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (file) void readFile(file)
    event.target.value = ''
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault()
    setDragging(false)
    const file = event.dataTransfer.files[0]
    if (file) void readFile(file)
  }

  async function handleConfirm() {
    if (!snapshot || uploading) return
    setUploading(true)
    setErrors([])
    try {
      const response = await apiFetch<SnapshotResult>('/source/snapshot', { method: 'PUT', json: snapshot.payload })
      setResult(response)
      setSnapshot(null)
      await queryClient.invalidateQueries()
    } catch (err) {
      setErrors(collectServerErrors(err))
    } finally {
      setUploading(false)
      setConfirmOpen(false)
    }
  }

  const shownErrors = errors.slice(0, MAX_LISTED_ERRORS)

  return (
    <div className="flex flex-col gap-6 font-['Inter']">
      <PageHeader
        title="Данные"
        subtitle="Загрузите JSON-снимок исходной системы: аккаунты, услуги и транзакции. Данные заменяются целиком."
      />

      <div
        onDragOver={(event) => {
          event.preventDefault()
          setDragging(true)
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        className={`flex flex-col items-center gap-4 rounded-xl border-2 border-dashed p-10 text-center transition-colors ${
          dragging ? 'border-[#4CC6F1] bg-[#4CC6F1]/10' : 'border-neutral-300 bg-white dark:border-neutral-800 dark:bg-neutral-900'
        }`}
      >
        <p className={`${headingClass} text-lg`}>Перетащите JSON-файл сюда</p>
        <p className={`${mutedClass} max-w-md`}>
          Формат совпадает с исходной системой: поля <Term hint="accounts — клиенты и их балансы">accounts</Term>,{' '}
          <Term hint="services — услуги клиентов: цена, срок и статус, например prolong_wait (ждёт продления)">services</Term> и{' '}
          <Term hint="transactions — списания и заказы, привязанные к услугам">transactions</Term>.
        </p>
        <input ref={inputRef} type="file" accept="application/json,.json" onChange={handleSelect} className="sr-only" id="snapshot-file" />
        <button type="button" onClick={() => inputRef.current?.click()} className={btnPrimary}>
          Выбрать файл
        </button>
        {fileName && <p className="text-sm text-neutral-600 dark:text-neutral-400">Файл: {fileName}</p>}
      </div>

      {errors.length > 0 && (
        <section role="alert" className="rounded-xl border border-red-500/30 bg-red-500/10 p-6" aria-labelledby="snapshot-errors">
          <h2 id="snapshot-errors" className="font-['Exo_2'] text-lg font-semibold text-red-600 dark:text-red-400">
            Найдены ошибки: {formatInt(errors.length)}
          </h2>
          <ul className="mt-3 flex list-disc flex-col gap-1 pl-5 text-sm text-red-600 dark:text-red-400">
            {shownErrors.map((message, index) => (
              <li key={index}>{message}</li>
            ))}
          </ul>
          {errors.length > shownErrors.length && (
            <p className="mt-3 text-sm text-red-600 dark:text-red-400">И ещё {formatInt(errors.length - shownErrors.length)}…</p>
          )}
        </section>
      )}

      {snapshot && (
        <section className="flex flex-col gap-4" aria-labelledby="preview-title">
          <h2 id="preview-title" className={`${headingClass} text-lg`}>
            Предпросмотр
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <CountCard title="Аккаунты" value={snapshot.counts.accounts} />
            <CountCard title="Услуги" value={snapshot.counts.services} />
            <CountCard title="Транзакции" value={snapshot.counts.transactions} />
          </div>
          <div>
            <button type="button" onClick={() => setConfirmOpen(true)} className={btnPrimary}>
              Загрузить данные
            </button>
          </div>
        </section>
      )}

      {result && (
        <section role="status" className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-6">
          <h2 className="font-['Exo_2'] text-lg font-semibold text-emerald-600 dark:text-emerald-400">Данные загружены, расчёт обновлён</h2>
          <p className="mt-2 text-sm text-neutral-700 dark:text-neutral-300">
            Аккаунтов: {formatInt(result.accounts)}, услуг: {formatInt(result.services)}, транзакций: {formatInt(result.transactions)}.
          </p>
          <p className="mt-1 text-sm text-neutral-700 dark:text-neutral-300">Пересчёт выполнен: {formatDateTime(result.recalculated_at)}</p>
        </section>
      )}

      {confirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div role="dialog" aria-modal="true" aria-labelledby="confirm-title" className={`${cardClass} w-full max-w-md`}>
            <h2 id="confirm-title" className={`${headingClass} text-xl`}>
              Заменить данные?
            </h2>
            <p className={`${mutedClass} mt-2`}>
              Данные будут заменены полностью: текущие аккаунты, услуги и транзакции удалятся, а клиенты будут пересчитаны по новому файлу.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button type="button" onClick={() => setConfirmOpen(false)} disabled={uploading} className={btnSecondary}>
                Отмена
              </button>
              <button ref={confirmRef} type="button" onClick={() => void handleConfirm()} disabled={uploading} className={btnPrimary}>
                {uploading ? 'Загрузка…' : 'Заменить данные'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
