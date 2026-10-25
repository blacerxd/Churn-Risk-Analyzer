import type { RiskLevel, ServiceStatus } from './api'

const euro = new Intl.NumberFormat('ru-RU', {
  style: 'currency',
  currency: 'EUR',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

const oneDecimal = new Intl.NumberFormat('ru-RU', {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
})

const integer = new Intl.NumberFormat('ru-RU')

export const UNITS_PER_EURO = 100

export function formatEuro(units: number): string {
  return euro.format(units / UNITS_PER_EURO)
}

export function formatScore(score: number | null): string {
  return score === null ? '—' : oneDecimal.format(score)
}

export function formatDecimal(value: number): string {
  return oneDecimal.format(value)
}

export function formatInt(value: number): string {
  return integer.format(value)
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('ru-RU')
}

export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}

export const LEVEL_LABEL: Record<RiskLevel, string> = {
  high: 'Высокий',
  medium: 'Средний',
  low: 'Низкий',
  none: 'Нет оценки',
}

export const SERVICE_STATUS_LABEL: Record<ServiceStatus, string> = {
  active: 'Активна',
  suspended: 'Приостановлена',
  prolong_wait: 'Ожидает продления',
  deleted: 'Удалена',
  blocked: 'Заблокирована',
}

export const PAYMENT_TERM_LABEL: Record<string, string> = {
  hour: 'Час',
  week: 'Неделя',
  month: 'Месяц',
  quarter_year: 'Квартал',
  half_year: 'Полгода',
  year: 'Год',
}

export function pluralize(n: number, one: string, few: string, many: string): string {
  const mod10 = n % 10
  const mod100 = n % 100
  if (mod10 === 1 && mod100 !== 11) return one
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return few
  return many
}
