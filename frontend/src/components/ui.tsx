import type { ReactNode } from 'react'
import type { CustomerRow, RiskLevel } from '../lib/api'
import { LEVEL_LABEL, formatEuro, formatScore } from '../lib/format'
import logo from '../assets/brand/logo.svg'
import logoWhite from '../assets/brand/logo-white.svg'
import patternLines from '../assets/brand/pattern-lines.svg'
import patternLinesWhite from '../assets/brand/pattern-lines-white.svg'
import { Icon } from './icons'
import { LEVEL_BAR_CLASS, LEVEL_ICON, headingBase, headingClass, mutedBase } from './styles'

// Уровень риска: подпись + значок + форма. Цвет дублирует смысл, но не несёт его один.
const BADGE_CLASS: Record<RiskLevel, string> = {
  high: 'bg-warn text-black border-transparent',
  medium: 'bg-warn/18 text-on-tint border-warn',
  low: 'bg-accent/18 text-on-tint border-transparent',
  none: 'border-dashed border-muted text-muted',
}

export function RiskBadge({ level }: { level: RiskLevel }) {
  return (
    <span
      title={level === 'none' ? 'Недостаточно данных для оценки риска' : undefined}
      className={`inline-flex min-h-7 items-center gap-1.5 whitespace-nowrap rounded-full border py-0 pl-2.5 pr-3 font-sans text-[13px] font-semibold ${BADGE_CLASS[level]}`}
    >
      <Icon name={LEVEL_ICON[level]} className="h-3.5 w-3.5" />
      {LEVEL_LABEL[level]}
    </span>
  )
}

export function Skeleton({ className = '' }: { className?: string }) {
  return <div aria-hidden="true" className={`animate-pulse rounded-xl bg-track ${className}`} />
}

// Ошибка: тёмно-синяя панель с оранжевым значком. Красного в бренде нет.
export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div role="alert" className="flex flex-col items-start gap-4 rounded-card bg-navy p-6 text-white md:p-8">
      <div className="flex items-start gap-4">
        <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-key border border-warn bg-black text-warn">
          <Icon name="alert" />
        </span>
        <div>
          <p className={`${headingBase} text-lg font-extrabold`}>Не удалось загрузить данные</p>
          <p className="mt-1 font-sans text-sm text-white/80">{message}</p>
        </div>
      </div>
      {onRetry && (
        <button type="button" onClick={onRetry} className="inline-flex min-h-11 items-center justify-center rounded-full bg-accent px-[22px] font-display text-[15px] font-bold text-on-accent transition hover:brightness-105">
          Повторить
        </button>
      )}
    </div>
  )
}

export function EmptyState({ title, hint, action, visual }: { title: string; hint?: string; action?: ReactNode; visual?: ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-3 px-6 py-12 text-center">
      {visual}
      <p className={`${headingClass} text-xl`}>{title}</p>
      {hint && <p className={`${mutedBase} max-w-md text-base`}>{hint}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  )
}

export function PageHeader({ title, subtitle, actions }: { title: string; subtitle?: string; actions?: ReactNode }) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <h1 className={`${headingBase} text-[28px] font-black leading-8 text-ink md:text-4xl md:leading-10`}>{title}</h1>
        {subtitle && <p className="mt-2 font-sans text-base text-muted">{subtitle}</p>}
      </div>
      {actions}
    </div>
  )
}

export function Term({ hint, children }: { hint: string; children: ReactNode }) {
  return (
    <span tabIndex={0} className="group relative inline-flex cursor-help items-center border-b border-dotted border-muted">
      {children}
      <span
        role="tooltip"
        className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-2 hidden w-64 -translate-x-1/2 rounded-[14px] bg-navy px-3.5 py-2.5 text-left font-sans text-xs font-normal normal-case leading-4 tracking-normal text-white group-hover:block group-focus-within:block group-focus:block"
      >
        {hint}
      </span>
    </span>
  )
}

/** Тост «данные пересчитаны» и подобные. Монтируйте условно, у него есть role="status". */
export function Toast({ children }: { children: ReactNode }) {
  return (
    <div role="status" className="fixed inset-x-4 bottom-4 z-50 flex items-center gap-3 rounded-panel bg-navy py-3 pl-3 pr-5 text-white shadow-[0_8px_24px_rgb(0_0_0/0.25)] sm:inset-x-auto sm:right-6 sm:bottom-6">
      <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px] bg-black text-accent">
        <Icon name="check" className="h-4 w-4" />
      </span>
      <span className="font-sans text-sm font-semibold">{children}</span>
    </div>
  )
}

// Score: число и тонкая полоса.
// barClass задаёт ширину полосы целиком: в плотной таблице клиентов она короче.
export function ScoreBar({
  customer,
  showLoss = false,
  barClass = 'w-20 flex-1 md:w-20 md:flex-none',
}: {
  customer: CustomerRow
  showLoss?: boolean
  barClass?: string
}) {
  return (
    <span className="flex items-center gap-2.5">
      <strong className="min-w-11 font-sans text-sm tabular-nums">{formatScore(customer.score)}</strong>
      <span className={`flex h-1.5 overflow-hidden rounded-full bg-track ${barClass}`} aria-hidden="true">
        <span className={`h-full rounded-full ${LEVEL_BAR_CLASS[customer.level]}`} style={{ width: `${customer.score ?? 0}%` }} />
      </span>
      {showLoss && <strong className="font-sans text-sm tabular-nums">{formatEuro(customer.expected_loss_cents)}</strong>}
    </span>
  )
}

// Brand graphics from the Aéza guidebook 2026, see src/assets/brand
const BRAND_ICONS = import.meta.glob<string>('../assets/brand/icons/*.svg', { eager: true, query: '?url', import: 'default' })

export type BrandIconName =
  | 'shield'
  | 'chart'
  | 'card'
  | 'edit'
  | 'flag'
  | 'support'
  | 'users'
  | 'chat'
  | 'basket'
  | 'hourglass'

// Painted with the text color through a mask, like an icon font
export function BrandIcon({ name, className = 'h-5 w-5' }: { name: BrandIconName; className?: string }) {
  const mask = `url("${BRAND_ICONS[`../assets/brand/icons/${name}.svg`]}") center / contain no-repeat`
  return <span aria-hidden="true" className={`inline-block shrink-0 bg-current ${className}`} style={{ mask, WebkitMask: mask }} />
}

// Black keys on light backgrounds, white keys in the dark theme: the two approved logo colors
export function AezaLogo({ className = 'h-8' }: { className?: string }) {
  return (
    <>
      <img src={logo} alt="aéza" className={`${className} w-auto dark:hidden`} />
      <img src={logoWhite} alt="aéza" className={`${className} hidden w-auto dark:block`} />
    </>
  )
}

export function AezaPattern({ className = '' }: { className?: string }) {
  return (
    <>
      <img src={patternLines} alt="" aria-hidden="true" className={`${className} dark:hidden`} />
      <img src={patternLinesWhite} alt="" aria-hidden="true" className={`${className} hidden dark:block`} />
    </>
  )
}
