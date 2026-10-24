import type { CustomerDetailData, CustomerRow, CustomerService, Factor, ModelSettingsData, RiskLevel, ServiceStatus } from '../lib/api'

const FEATURES = [
  {
    key: 'expiring_no_autoprolong',
    title: 'Скоро истекает без автопродления',
    description: 'Услуга заканчивается в ближайшие дни, а автопродление выключено',
    weight: 70,
  },
  {
    key: 'insufficient_funds',
    title: 'Не хватает средств на продление',
    description: 'Доступных средств недостаточно для ближайших продлений',
    weight: 50,
  },
  {
    key: 'prolong_wait',
    title: 'Услуга ждёт оплаты (prolong_wait)',
    description: 'Услуга в статусе prolong_wait: срок закончился, продление не оплачено',
    weight: 80,
  },
  {
    key: 'low_payment_success',
    title: 'Много неоплаченных заказов',
    description: 'Высокая доля транзакций, которые клиент создал, но не оплатил',
    weight: 20,
  },
]

export const defaultSettings: ModelSettingsData = {
  weights: Object.fromEntries(FEATURES.map((feature) => [feature.key, feature.weight])),
  thresholds: { medium: 35, high: 65 },
  params: { expiry_horizon_days: 7, use_bonus_balance: true, loss_horizon_months: 1 },
  schema: {
    weights: FEATURES.map((feature) => ({
      key: feature.key,
      title: feature.title,
      description: feature.description,
      min: 0,
      max: 100,
    })),
    params: [
      { key: 'expiry_horizon_days', title: 'Горизонт прогноза, дней', min: 1, max: 365 },
      { key: 'use_bonus_balance', title: 'Учитывать бонусный баланс' },
      { key: 'loss_horizon_months', title: 'Горизонт денежной оценки, месяцев', min: 1, max: 12 },
    ],
  },
}

function rng(seed: number) {
  let state = seed
  return () => {
    state = (state * 1664525 + 1013904223) % 4294967296
    return state / 4294967296
  }
}

interface Seed {
  id: number
  email: string
  balance: number
  bonus: number
  withdraw: number
  replenished: number
  bonusUsable: boolean
  services: CustomerService[]
  values: Record<string, number>
  scored: boolean
}

const DOMAINS = ['nordic-media.fi', 'krakow-fintech.pl', 'berlin-gaming.de', 'amsterdam-cdn.nl', 'stockholm-vps.se', 'example.com']
const NAMES = ['infra', 'admin', 'billing', 'devops', 'tech', 'support', 'sergey', 'alex', 'maria', 'ivan']
const TERMS = ['month', 'month', 'quarter_year', 'year', 'week']

function buildSeeds(): Seed[] {
  const random = rng(42)
  return Array.from({ length: 60 }, (_, index) => {
    const id = index + 1
    const scored = id % 12 !== 0
    const serviceCount = scored ? 1 + Math.floor(random() * 3) : 0
    const services: CustomerService[] = Array.from({ length: serviceCount }, (_, serviceIndex) => {
      const status: ServiceStatus = random() < 0.2 ? 'prolong_wait' : random() < 0.1 ? 'suspended' : 'active'
      const price = Math.round((500 + random() * 9500) / 10) * 10 * 10
      const days = Math.floor(random() * 25) - (status === 'prolong_wait' ? 3 : 0)
      return {
        id: id * 10 + serviceIndex,
        name: `VPS-${id}-${serviceIndex + 1}`,
        status,
        price_cents: price,
        payment_term: TERMS[Math.floor(random() * TERMS.length)],
        autoprolong: random() < 0.5,
        expires_at: new Date(Date.now() + days * 86_400_000).toISOString(),
        days_to_expiry: days,
        monthly_equivalent_cents: price,
        expected_loss_cents: 0,
      }
    })
    const values: Record<string, number> = {
      expiring_no_autoprolong: random() < 0.5 ? random() : 0,
      insufficient_funds: random() < 0.5 ? random() : 0,
      prolong_wait: services.some((service) => service.status === 'prolong_wait') ? 0.6 + random() * 0.4 : 0,
      low_payment_success: random() < 0.3 ? random() : 0,
    }
    return {
      id,
      email: `${NAMES[id % NAMES.length]}${id}@${DOMAINS[id % DOMAINS.length]}`,
      balance: Math.round(random() * 40000),
      bonus: Math.round(random() * 2000),
      withdraw: Math.round(random() * 5000),
      replenished: Math.round(random() * 500000),
      bonusUsable: random() < 0.6,
      services,
      values,
      scored,
    }
  })
}

const seeds = buildSeeds()

function explanationFor(key: string, seed: Seed): string {
  const service = seed.services[0]
  const name = service?.name ?? 'услуга'
  if (key === 'expiring_no_autoprolong') return `${name} скоро истекает, автопродление выключено`
  if (key === 'insufficient_funds') return `Доступных средств не хватает на ближайшие продления (${name})`
  if (key === 'prolong_wait') return `${name} в статусе prolong_wait, удаление через 5 дней после окончания срока`
  return 'Больше трети заказов клиента не оплачено'
}

function evaluate(seed: Seed, settings: ModelSettingsData) {
  if (!seed.scored) {
    return { score: null, level: 'none' as RiskLevel, factors: [] as Factor[] }
  }
  const raw = FEATURES.map((feature) => {
    const weight = settings.weights[feature.key] ?? 0
    const value = seed.values[feature.key] ?? 0
    const p = Math.min(0.999, (weight / 100) * value)
    return { feature, weight, value, p, burden: -Math.log(1 - p) }
  })
  const risk = 1 - raw.reduce((product, item) => product * (1 - item.p), 1)
  const score = Math.round(risk * 1000) / 10
  const totalBurden = raw.reduce((sum, item) => sum + item.burden, 0)
  const factors: Factor[] = raw
    .filter((item) => item.p > 0)
    .map((item) => ({
      key: item.feature.key,
      title: item.feature.title,
      value: Math.round(item.value * 100) / 100,
      weight: item.weight,
      contribution: totalBurden > 0 ? Math.round((item.burden / totalBurden) * score * 10) / 10 : 0,
      explanation: explanationFor(item.feature.key, seed),
    }))
    .sort((a, b) => b.contribution - a.contribution)
  const level: RiskLevel = score >= settings.thresholds.high ? 'high' : score >= settings.thresholds.medium ? 'medium' : 'low'
  return { score, level, factors }
}

export function listCustomers(settings: ModelSettingsData): CustomerRow[] {
  return seeds.map((seed) => {
    const { score, level, factors } = evaluate(seed, settings)
    const monthly = seed.services.reduce((sum, service) => sum + service.monthly_equivalent_cents, 0)
    return {
      id: seed.id,
      email: seed.email,
      balance_cents: seed.balance,
      total_replenished_cents: seed.replenished,
      score,
      level,
      top_reason: factors[0]?.explanation ?? 'Недостаточно данных для оценки',
      expected_loss_cents: score === null ? 0 : Math.round((monthly * score) / 100),
    }
  })
}

export function getCustomer(id: number, settings: ModelSettingsData): CustomerDetailData | null {
  const seed = seeds.find((item) => item.id === id)
  if (!seed) return null
  const { score, level, factors } = evaluate(seed, settings)
  const services = seed.services.map((service) => ({
    ...service,
    expected_loss_cents: score === null ? 0 : Math.round((service.monthly_equivalent_cents * score) / 100),
  }))
  return {
    id: seed.id,
    email: seed.email,
    balance_cents: seed.balance,
    bonus_balance_cents: seed.bonus,
    bonus_usable: seed.bonusUsable,
    withdraw_balance_cents: seed.withdraw,
    total_replenished_cents: seed.replenished,
    score,
    level,
    expected_loss_cents: services.reduce((sum, service) => sum + service.expected_loss_cents, 0),
    factors,
    services,
  }
}
