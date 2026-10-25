export interface SnapshotCounts {
  accounts: number
  services: number
  transactions: number
}

type UnknownRecord = Record<string, unknown>

const SERVICE_STATUSES = ['active', 'suspended', 'prolong_wait', 'deleted', 'blocked']
const PAYMENT_TERMS = ['hour', 'week', 'month', 'quarter_year', 'half_year', 'year']
const TRANSACTION_STATUSES = ['performed', 'not_performed']
const TRANSACTION_TYPES = ['prolong', 'order']
const BONUS_STATES = ['locked', 'unlocked']

export function isRecord(value: unknown): value is UnknownRecord {
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

export function validateSnapshot(raw: unknown): { errors: string[]; counts: SnapshotCounts | null } {
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
