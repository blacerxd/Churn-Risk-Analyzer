import { useEffect, useRef, useState } from 'react'
import type { ChangeEvent, DragEvent } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { PageHeader, Term } from '../components/ui'
import { btnPrimary, btnSecondary, cardClass, headingClass, mutedClass } from '../components/styles'
import { ApiError, apiFetch } from '../lib/api'
import type { SnapshotResult } from '../lib/api'
import { formatDateTime, formatInt } from '../lib/format'
import { isRecord, validateSnapshot } from '../lib/snapshot'
import type { SnapshotCounts } from '../lib/snapshot'

interface ParsedSnapshot {
  payload: unknown
  counts: SnapshotCounts
}

const MAX_LISTED_ERRORS = 50

function collectServerErrors(error: unknown): { messages: string[]; total: number } {
  if (!(error instanceof ApiError)) return { messages: ['Не удалось загрузить данные. Попробуйте позже'], total: 1 }
  const body = isRecord(error.body) ? error.body : null
  const items = body && Array.isArray(body.errors) ? body.errors : []
  const messages = items.flatMap((item) => {
    if (typeof item === 'string') return [item]
    if (isRecord(item) && typeof item.message === 'string') {
      return [typeof item.path === 'string' && item.path ? `${item.path}: ${item.message}` : item.message]
    }
    return []
  })
  if (messages.length === 0) return { messages: [error.message], total: 1 }
  const total = body && typeof body.errors_total === 'number' ? body.errors_total : messages.length
  return { messages, total }
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
  const [errorsTotal, setErrorsTotal] = useState(0)
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
    setErrorsTotal(0)
    try {
      const payload: unknown = JSON.parse(await file.text())
      const validation = validateSnapshot(payload)
      setErrors(validation.errors)
      setErrorsTotal(validation.errors.length)
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
    setErrorsTotal(0)
    try {
      const response = await apiFetch<SnapshotResult>('/source/snapshot', { method: 'PUT', json: snapshot.payload })
      setResult(response)
      setSnapshot(null)
      await queryClient.invalidateQueries()
    } catch (err) {
      const server = collectServerErrors(err)
      setErrors(server.messages)
      setErrorsTotal(server.total)
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
            Найдены ошибки: {formatInt(Math.max(errorsTotal, errors.length))}
          </h2>
          <ul className="mt-3 flex list-disc flex-col gap-1 pl-5 text-sm text-red-600 dark:text-red-400">
            {shownErrors.map((message, index) => (
              <li key={index}>{message}</li>
            ))}
          </ul>
          {Math.max(errorsTotal, errors.length) > shownErrors.length && (
            <p className="mt-3 text-sm text-red-600 dark:text-red-400">И ещё {formatInt(Math.max(errorsTotal, errors.length) - shownErrors.length)}…</p>
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
          <p className="mt-1 text-sm text-neutral-700 dark:text-neutral-300">
            Услуг со сменой статуса: {formatInt(result.status_changes)}. {result.recalculated_at ? `Пересчёт выполнен: ${formatDateTime(result.recalculated_at)}` : `Данные загружены: ${formatDateTime(result.imported_at)}`}
          </p>
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
