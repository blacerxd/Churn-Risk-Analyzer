import { HttpResponse, http, sse } from 'msw'
import type { ModelSettingsData, ModelSettingsPatch, RiskLevel, Summary } from '../lib/api'
import { defaultSettings, getCustomer, listCustomers } from './data'

const API = '/api/v1'
const AUTH_KEY = 'msw-authed'
const LATENCY_MS = 300

let settings: ModelSettingsData = structuredClone(defaultSettings)
const clients = new Set<{ send: (payload: { event: string; data: unknown }) => void }>()

function isAuthed(): boolean {
  return sessionStorage.getItem(AUTH_KEY) === '1'
}

function unauthorized() {
  return HttpResponse.json({ detail: 'Требуется вход', code: 'not_authenticated' }, { status: 401 })
}

function pause(ms = LATENCY_MS) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function summary(): Summary {
  const rows = listCustomers(settings)
  const by_level: Record<RiskLevel, number> = { high: 0, medium: 0, low: 0, none: 0 }
  rows.forEach((row) => {
    by_level[row.level] += 1
  })
  const atRisk = rows.filter((row) => row.level === 'high' || row.level === 'medium')
  return {
    calculated_at: new Date().toISOString(),
    customers_total: rows.length,
    by_level,
    services_at_risk: atRisk.length * 2,
    revenue_at_risk_cents: atRisk.reduce((sum, row) => sum + row.expected_loss_cents * 3, 0),
    expected_loss_cents: rows.reduce((sum, row) => sum + row.expected_loss_cents, 0),
    explanation: 'Ожидаемая потеря = сумма (месячная стоимость услуги × вероятность оттока клиента).',
  }
}

function broadcast(reason: 'settings' | 'snapshot') {
  const data = { reason, at: new Date().toISOString(), summary: summary() }
  clients.forEach((client) => client.send({ event: 'recalculated', data: JSON.stringify(data) }))
}

function validateSettings(patch: ModelSettingsPatch) {
  const errors: Record<string, Record<string, string[]>> = {}
  for (const [key, value] of Object.entries(patch.weights ?? {})) {
    if (typeof value !== 'number' || value < 0) (errors.weights ??= {})[key] = ['Вес должен быть не меньше 0']
  }
  if (patch.thresholds && patch.thresholds.medium >= patch.thresholds.high) {
    errors.thresholds = { medium: ['Порог среднего риска должен быть ниже порога высокого'] }
  }
  return errors
}

export const handlers = [
  http.get(`${API}/auth/csrf`, () => {
    document.cookie = 'csrftoken=msw-token; path=/'
    return new HttpResponse(null, { status: 204 })
  }),
  http.get(`${API}/auth/config`, () => HttpResponse.json({ oidc_enabled: true })),
  http.post(`${API}/auth/login`, async ({ request }) => {
    await pause()
    const body = (await request.json()) as { username?: string; password?: string }
    if (body.username === 'admin' && body.password === 'admin') {
      sessionStorage.setItem(AUTH_KEY, '1')
      return HttpResponse.json({ id: 1, username: 'admin' })
    }
    return HttpResponse.json({ detail: 'Неверный логин или пароль', code: 'invalid_credentials' }, { status: 400 })
  }),
  http.get(`${API}/auth/me`, () => (isAuthed() ? HttpResponse.json({ id: 1, username: 'admin' }) : unauthorized())),
  http.post(`${API}/auth/logout`, () => {
    sessionStorage.removeItem(AUTH_KEY)
    return new HttpResponse(null, { status: 204 })
  }),

  http.get(`${API}/analytics/summary`, async () => {
    if (!isAuthed()) return unauthorized()
    await pause()
    return HttpResponse.json(summary())
  }),

  http.get(`${API}/analytics/churn-chart`, async ({ request }) => {
    if (!isAuthed()) return unauthorized()
    await pause()
    const days = Number(new URL(request.url).searchParams.get('days') ?? 30)
    const total = summary().services_at_risk
    const day = 86_400_000
    const series = [
      ...Array.from({ length: days }, (_, index) => {
        const offset = days - index
        return {
          date: new Date(Date.now() - offset * day).toISOString().slice(0, 10),
          kind: 'fact' as const,
          deleted_services: (index * 7 + 3) % 6,
          services_at_risk: total,
        }
      }),
      ...Array.from({ length: Math.min(days, 14) }, (_, index) => ({
        date: new Date(Date.now() + (index + 1) * day).toISOString().slice(0, 10),
        kind: 'forecast' as const,
        expected_non_renewals: 2 + ((index * 5) % 5),
        services_at_risk: total,
      })),
    ]
    return HttpResponse.json({ series })
  }),

  http.get(`${API}/customers`, async ({ request }) => {
    if (!isAuthed()) return unauthorized()
    await pause()
    const url = new URL(request.url)
    const level = url.searchParams.get('level')
    const search = (url.searchParams.get('search') ?? '').toLowerCase()
    const ordering = url.searchParams.get('ordering') ?? '-score'
    const page = Math.max(1, Number(url.searchParams.get('page') ?? 1))
    const pageSize = Math.max(1, Number(url.searchParams.get('page_size') ?? 25))

    let rows = listCustomers(settings).filter((row) => (!level || row.level === level) && row.email.toLowerCase().includes(search))

    const desc = ordering.startsWith('-')
    const column = ordering.replace(/^-/, '')
    const pick: Record<string, (row: (typeof rows)[number]) => number | string | null> = {
      id: (row) => row.id,
      email: (row) => row.email,
      balance: (row) => row.balance_cents,
      total_replenished: (row) => row.total_replenished_cents,
      score: (row) => row.score,
    }
    const getter = pick[column] ?? pick.score
    rows = [...rows].sort((a, b) => {
      const left = getter(a)
      const right = getter(b)
      if (left === null) return 1
      if (right === null) return -1
      const result = typeof left === 'string' ? left.localeCompare(String(right)) : left - Number(right)
      return desc ? -result : result
    })

    return HttpResponse.json({
      count: rows.length,
      page,
      page_size: pageSize,
      results: rows.slice((page - 1) * pageSize, page * pageSize),
    })
  }),

  http.get(`${API}/customers/:id`, async ({ params }) => {
    if (!isAuthed()) return unauthorized()
    await pause()
    const customer = getCustomer(Number(params.id), settings)
    return customer ? HttpResponse.json(customer) : HttpResponse.json({ detail: 'Клиент не найден', code: 'not_found' }, { status: 404 })
  }),

  http.get(`${API}/model/settings`, async () => {
    if (!isAuthed()) return unauthorized()
    await pause()
    return HttpResponse.json(settings)
  }),
  http.patch(`${API}/model/settings`, async ({ request }) => {
    if (!isAuthed()) return unauthorized()
    await pause()
    const patch = (await request.json()) as ModelSettingsPatch
    const errors = validateSettings(patch)
    if (Object.keys(errors).length > 0) {
      return HttpResponse.json({ detail: 'Проверьте значения', code: 'invalid', ...errors }, { status: 400 })
    }
    settings = {
      ...settings,
      weights: { ...settings.weights, ...patch.weights },
      thresholds: { ...settings.thresholds, ...patch.thresholds },
      params: { ...settings.params, ...patch.params },
    }
    setTimeout(() => broadcast('settings'), 800)
    return HttpResponse.json(settings)
  }),

  http.put(`${API}/source/snapshot`, async ({ request }) => {
    if (!isAuthed()) return unauthorized()
    await pause(900)
    const body = (await request.json()) as { accounts?: unknown[]; services?: unknown[]; transactions?: unknown[] }
    if (!Array.isArray(body.accounts) || !Array.isArray(body.services) || !Array.isArray(body.transactions)) {
      return HttpResponse.json({ detail: 'Некорректный снимок', code: 'invalid', errors: ['Нужны массивы accounts, services и transactions'] }, { status: 400 })
    }
    setTimeout(() => broadcast('snapshot'), 300)
    return HttpResponse.json({
      accounts: body.accounts.length,
      services: body.services.length,
      transactions: body.transactions.length,
      recalculated_at: new Date().toISOString(),
    })
  }),

  sse(`${API}/events`, ({ client }) => {
    const subscriber = { send: (payload: { event: string; data: unknown }) => client.send(payload as Parameters<typeof client.send>[0]) }
    clients.add(subscriber)
  }),
]
