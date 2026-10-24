import type { RiskLevel } from '../lib/api'

export const inputClass =
  "w-full rounded-lg border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-900 px-3.5 py-2 font-['Inter'] text-sm text-black dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#4CC6F1] focus:border-transparent disabled:opacity-50"

export const inputErrorClass = 'border-red-500 focus:ring-red-500 text-red-500'

export const btnPrimary =
  "inline-flex items-center justify-center gap-2 bg-[#4CC6F1] text-black font-['Exo_2'] font-semibold rounded-lg px-4 py-2 hover:brightness-105 active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none transition-all focus:outline-none focus:ring-2 focus:ring-[#4CC6F1] focus:ring-offset-2"

export const btnSecondary =
  "inline-flex items-center justify-center gap-2 bg-[#182D48] text-white font-['Exo_2'] font-semibold hover:bg-[#182D48]/90 rounded-lg px-4 py-2 transition-all disabled:opacity-50 disabled:pointer-events-none focus:outline-none focus:ring-2 focus:ring-[#4CC6F1] focus:ring-offset-2"

export const cardClass =
  'rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6'

export const headingClass = "font-['Exo_2'] font-semibold tracking-tight text-[#182D48] dark:text-white"

export const labelClass = "font-['Inter'] text-sm font-medium text-neutral-700 dark:text-neutral-300"

export const mutedClass = "font-['Inter'] text-sm text-neutral-500"

export const tableHeadClass =
  "px-4 py-3 text-left font-['Inter'] text-xs font-medium uppercase tracking-wider text-neutral-500"

export const LEVEL_BAR_CLASS: Record<RiskLevel, string> = {
  high: 'bg-red-500',
  medium: 'bg-[#E97C35]',
  low: 'bg-emerald-500',
  none: 'bg-neutral-400',
}
