import type { RiskLevel } from '../lib/api'

// В Tailwind побеждает порядок правил в CSS, а не порядок классов в строке: дописанный
// к готовому классу `p-0` не перебьёт `p-6`. Поэтому свойства, которые где-то меняются
// (отступы карточки, ширина поля, цвет заголовка), вынесены из базовых классов.

const inputBase =
  "rounded-lg border bg-white px-3.5 font-['Inter'] text-sm placeholder:text-neutral-400 focus:border-transparent focus:outline-none focus:ring-2 disabled:opacity-50 dark:bg-neutral-900"
const inputNormal = 'border-neutral-300 text-black focus:ring-[#4CC6F1] dark:border-neutral-800 dark:text-white'
const inputInvalid = 'border-red-500 text-red-500 focus:ring-red-500 dark:border-red-500 dark:text-red-400'

export function inputClass({ invalid = false, size = 'w-full py-2' }: { invalid?: boolean; size?: string } = {}): string {
  return `${inputBase} ${size} ${invalid ? inputInvalid : inputNormal}`
}

export const btnPrimary =
  "inline-flex items-center justify-center gap-2 bg-[#4CC6F1] text-black font-['Exo_2'] font-semibold rounded-lg px-4 py-2 hover:brightness-105 active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none transition-all focus:outline-none focus:ring-2 focus:ring-[#4CC6F1] focus:ring-offset-2 dark:focus:ring-offset-black"

export const btnSecondary =
  "inline-flex items-center justify-center gap-2 bg-[#182D48] text-white font-['Exo_2'] font-semibold hover:bg-[#182D48]/90 rounded-lg px-4 py-2 transition-all disabled:opacity-50 disabled:pointer-events-none focus:outline-none focus:ring-2 focus:ring-[#4CC6F1] focus:ring-offset-2 dark:bg-white/10 dark:hover:bg-white/15 dark:focus:ring-offset-black"

// Переключатели-сегменты: фильтр уровней, период графика.
export const segmentClass =
  "rounded-lg border px-3.5 py-1.5 font-['Inter'] text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-[#4CC6F1]"
export const segmentActiveClass = 'border-[#182D48] bg-[#182D48] text-white dark:border-[#4CC6F1] dark:bg-[#4CC6F1]/15 dark:text-[#4CC6F1]'
export const segmentIdleClass =
  'border-neutral-300 bg-white text-neutral-700 hover:border-[#4CC6F1] dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300'

// Карточка без отступов — для таблиц, которые идут от края до края.
export const cardBase = 'rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900'
export const cardClass = `${cardBase} p-6`

// Заголовок без цвета — для состояний со своим цветом (ошибка, «нет оценки»).
export const headingBase = "font-['Exo_2'] font-semibold tracking-tight"
export const headingClass = `${headingBase} text-[#182D48] dark:text-white`

export const labelClass = "font-['Inter'] text-sm font-medium text-neutral-700 dark:text-neutral-300"

export const mutedClass = "font-['Inter'] text-sm text-neutral-500"

export const linkClass =
  "rounded font-['Inter'] font-medium text-[#182D48] underline-offset-4 hover:underline focus:outline-none focus:ring-2 focus:ring-[#4CC6F1] dark:text-[#4CC6F1]"

export const tableHeadClass =
  "px-4 py-3 text-left font-['Inter'] text-xs font-medium uppercase tracking-wider text-neutral-500"

export const LEVEL_BAR_CLASS: Record<RiskLevel, string> = {
  high: 'bg-red-500',
  medium: 'bg-[#E97C35]',
  low: 'bg-emerald-500',
  none: 'bg-neutral-400',
}
