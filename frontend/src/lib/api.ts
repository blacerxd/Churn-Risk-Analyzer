export type RiskLevel = 'high' | 'medium' | 'low' | 'none'

export interface CustomerRow {
  id: number
  email: string
  balance_cents: number
  total_replenished_cents: number
  score: number | null
  level: RiskLevel
  top_reason: string
  expected_loss_cents: number
}

export interface CustomersPage {
  count: number
  page: number
  page_size: number
  results: CustomerRow[]
}

export interface Summary {
  calculated_at: string | null
  customers_total: number
  by_level: Record<RiskLevel, number>
  services_at_risk: number
  revenue_at_risk_cents: number
  expected_loss_cents: number
  explanation: string
}

export interface Factor {
  key: string
  title: string
  value: number
  weight: number
  contribution: number
  explanation: string
}

export type ServiceStatus = 'active' | 'suspended' | 'prolong_wait' | 'deleted' | 'blocked'

export interface CustomerService {
  id: number
  name: string
  status: ServiceStatus
  price_cents: number
  payment_term: string
  autoprolong: boolean
  expires_at: string
  days_to_expiry: number | null
  monthly_equivalent_cents: number
  expected_loss_cents: number
}

export interface CustomerDetailData {
  id: number
  email: string
  balance_cents: number
  bonus_balance_cents: number
  bonus_usable: boolean
  withdraw_balance_cents: number
  total_replenished_cents: number
  score: number | null
  level: RiskLevel
  top_reason: string
  expected_loss_cents: number
  calculated_at: string | null
  factors: Factor[]
  services: CustomerService[]
}

export interface WeightField {
  key: string
  title: string
  description: string
  min: number
  max: number
}

export interface ParamField {
  key: string
  title?: string
  description?: string
  min?: number
  max?: number
}

export interface ModelSettingsData {
  weights: Record<string, number>
  thresholds: { medium: number; high: number }
  params: Record<string, number | boolean>
  schema: {
    weights: WeightField[]
    params?: ParamField[]
  }
}

export type ModelSettingsPatch = Pick<ModelSettingsData, 'weights' | 'thresholds' | 'params'>

export interface SnapshotResult {
  accounts: number
  services: number
  transactions: number
  status_changes: number
  imported_at: string
  recalculated_at: string | null
}

export interface ChurnPoint {
  date: string
  kind: 'fact' | 'forecast'
  deleted_services?: number
  expected_non_renewals?: number
  services_at_risk: number
}

export interface ChurnChartData {
  series: ChurnPoint[]
}

export interface AuthConfig {
  oidc_enabled?: boolean
  sso_enabled?: boolean
}

export interface Me {
  id: number
  username: string
  first_name: string
  last_name: string
  email: string
  is_staff: boolean
  is_superuser: boolean
}

export interface Passkey {
  id: string
  label: string
  created_at: string | null
}

export interface Passkeys {
  sso_enabled: boolean
  sso_account: boolean
  passkeys: Passkey[]
}

export interface UserSession {
  id: number
  device: string
  ip: string | null
  method: 'password' | 'sso'
  created_at: string
  last_seen_at: string
  current: boolean
}

export interface Page<T> {
  count: number
  page: number
  page_size: number
  results: T[]
}

export interface AdminUser {
  id: number
  username: string
  first_name: string
  last_name: string
  email: string
  is_active: boolean
  is_staff: boolean
  is_superuser: boolean
  date_joined: string
  last_login: string | null
}

export interface Recalculation {
  id: number
  reason: 'snapshot' | 'settings'
  calculated_at: string
  duration_seconds: number
  customers_total: number
  by_level: Record<RiskLevel, number>
  score_avg: number | null
  services_at_risk: number
  revenue_at_risk_cents: number
  expected_loss_cents: number
}

export interface StatusEvent {
  id: number
  service_id: number
  customer_id: number
  old_status: ServiceStatus
  new_status: ServiceStatus
  detected_at: string
}

export const queryKeys = {
  me: ['me'] as const,
  summary: ['summary'] as const,
  customers: ['customers'] as const,
  customer: ['customer'] as const,
  settings: ['settings'] as const,
  churnChart: ['churn-chart'] as const,
  authConfig: ['auth-config'] as const,
  adminUsers: ['admin-users'] as const,
  recalculations: ['recalculations'] as const,
  statusEvents: ['status-events'] as const,
  passkeys: ['passkeys'] as const,
  sessions: ['sessions'] as const,
}

const API_ROOT = '/api/v1'

export class ApiError extends Error {
  status: number
  code: string | undefined
  body: unknown

  constructor(status: number, message: string, code?: string, body?: unknown) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
    this.body = body
  }
}

function readCookie(name: string): string | undefined {
  const match = document.cookie.split('; ').find((part) => part.startsWith(`${name}=`))
  return match ? decodeURIComponent(match.slice(name.length + 1)) : undefined
}

async function ensureCsrf(): Promise<string | undefined> {
  const existing = readCookie('csrftoken')
  if (existing) return existing
  await fetch(`${API_ROOT}/auth/csrf`, { credentials: 'include' })
  return readCookie('csrftoken')
}

export async function apiFetch<T>(
  path: string,
  init: Omit<RequestInit, 'body'> & { json?: unknown } = {},
): Promise<T> {
  const { json, headers, ...rest } = init
  const method = (rest.method ?? 'GET').toUpperCase()
  const finalHeaders = new Headers(headers)
  finalHeaders.set('Accept', 'application/json')

  if (json !== undefined) finalHeaders.set('Content-Type', 'application/json')
  if (method !== 'GET' && method !== 'HEAD') {
    const token = await ensureCsrf()
    if (token) finalHeaders.set('X-CSRFToken', token)
  }

  const response = await fetch(`${API_ROOT}${path}`, {
    ...rest,
    method,
    headers: finalHeaders,
    credentials: 'include',
    body: json !== undefined ? JSON.stringify(json) : undefined,
  })

  if (response.status === 204) return undefined as T

  const text = await response.text()
  let body: unknown = null
  if (text) {
    try {
      body = JSON.parse(text)
    } catch {
      body = text
    }
  }

  if (!response.ok) {
    const isLogin = path.startsWith('/auth/login')
    if (response.status === 401 && !isLogin && window.location.pathname !== '/login') {
      const next = window.location.pathname + window.location.search
      window.location.assign(`/login?next=${encodeURIComponent(next)}`)
    }
    const detail =
      body && typeof body === 'object' && 'detail' in body && typeof body.detail === 'string'
        ? body.detail
        : `Ошибка запроса (${response.status})`
    const code =
      body && typeof body === 'object' && 'code' in body && typeof body.code === 'string'
        ? body.code
        : undefined
    throw new ApiError(response.status, detail, code, body)
  }

  return body as T
}
