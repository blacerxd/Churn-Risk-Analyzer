import type { ReactNode } from 'react'
import type { RiskLevel } from '../lib/api'
import { LEVEL_LABEL } from '../lib/format'
import { btnSecondary, cardClass, headingBase, headingClass, mutedClass } from './styles'

const BADGE_CLASS: Record<RiskLevel, string> = {
  high: 'bg-red-500/15 text-red-600 dark:text-red-400 border border-red-500/30',
  medium: 'bg-[#E97C35]/15 text-[#E97C35] border border-[#E97C35]/30',
  low: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30',
  none: 'bg-neutral-500/15 text-neutral-500 border border-neutral-500/30',
}

export function RiskBadge({ level }: { level: RiskLevel }) {
  return (
    <span
      title={level === 'none' ? 'Недостаточно данных для оценки риска' : undefined}
      className={`inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-0.5 font-['Inter'] text-xs font-semibold ${BADGE_CLASS[level]}`}
    >
      {LEVEL_LABEL[level]}
    </span>
  )
}

export function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={`animate-pulse rounded-lg bg-neutral-200 dark:bg-neutral-800 ${className}`}
    />
  )
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div role="alert" className={`${cardClass} flex flex-col items-start gap-4`}>
      <div>
        <p className={`${headingBase} text-lg text-red-600 dark:text-red-400`}>Не удалось загрузить данные</p>
        <p className={`${mutedClass} mt-1`}>{message}</p>
      </div>
      {onRetry && (
        <button type="button" onClick={onRetry} className={btnSecondary}>
          Повторить
        </button>
      )}
    </div>
  )
}

export function EmptyState({ title, hint, action }: { title: string; hint?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-2 px-6 py-12 text-center">
      <p className={`${headingClass} text-lg`}>{title}</p>
      {hint && <p className={`${mutedClass} max-w-md`}>{hint}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  )
}

export function PageHeader({ title, subtitle, actions }: { title: string; subtitle?: string; actions?: ReactNode }) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <h1 className={`${headingClass} text-2xl`}>{title}</h1>
        {subtitle && <p className={`${mutedClass} mt-1`}>{subtitle}</p>}
      </div>
      {actions}
    </div>
  )
}

export function Term({ hint, children }: { hint: string; children: ReactNode }) {
  return (
    <span className="group relative inline-flex cursor-help items-center border-b border-dotted border-neutral-400">
      {children}
      <span
        role="tooltip"
        className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-2 hidden w-64 -translate-x-1/2 rounded-lg bg-[#182D48] px-3 py-2 text-left font-['Inter'] text-xs font-normal normal-case tracking-normal text-white group-hover:block group-focus-within:block"
      >
        {hint}
      </span>
    </span>
  )
}

export function AezaLogo({ className = 'h-8 w-8' }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={`${className} text-black dark:text-white`} fill="currentColor" aria-label="aéza">
      <rect x="2" y="2" width="12" height="12" rx="3.5" />
      <rect x="18" y="2" width="12" height="12" rx="3.5" />
      <rect x="2" y="18" width="12" height="12" rx="3.5" />
      <rect x="18" y="18" width="12" height="12" rx="3.5" />
    </svg>
  )
}

export function AezaPattern({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 240 160" fill="none" strokeLinecap="round" strokeWidth="6" aria-hidden="true" className={className}>
      <path d="M0 20H240" stroke="#4CC6F1" />
      <path d="M0 52H240" stroke="#4CC6F1" />
      <path d="M0 84H240" stroke="#4CC6F1" />
      <path d="M0 116H150Q172 116 172 138V160" stroke="#182D48" className="dark:stroke-white" />
    </svg>
  )
}
