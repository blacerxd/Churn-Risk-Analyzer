import type { CSSProperties } from 'react'
import type { RiskLevel } from '../lib/api'
import type { IconName } from './icons'

// Классы собраны из токенов @theme (см. index.css): bg-surface, text-muted, border-line, bg-accent и т.д.
// Цвета в строках классов не повторяются. Тему переключает класс .dark на <html>.
//
// В Tailwind побеждает порядок правил в CSS, а не порядок классов в строке: дописанный
// к готовому классу `p-0` не перебьёт `p-6`. Поэтому свойства, которые где-то меняются
// (отступы карточки, ширина поля, цвет заголовка), вынесены из базовых классов.

// Высота и отступы тоже меняются по месту (select в пагинации, поиск со значком, пароль с кнопкой),
// поэтому приходят параметрами, а не дописываются к готовой строке.
const inputBase =
  'rounded-field bg-surface font-sans text-base text-ink transition-colors placeholder:text-muted hover:border-accent disabled:opacity-50'
const inputNormal = 'border border-line'
const inputInvalid = 'border-2 border-warn'

export function inputClass({
  invalid = false,
  size = 'w-full min-h-11',
  pad,
}: { invalid?: boolean; size?: string; pad?: string } = {}): string {
  // Рамка ошибки на пиксель толще — отступ на пиксель меньше, чтобы текст не прыгал.
  return `${inputBase} ${size} ${pad ?? (invalid ? 'px-[15px]' : 'px-4')} ${invalid ? inputInvalid : inputNormal}`
}

const btnShape =
  'inline-flex min-h-11 items-center justify-center gap-2 whitespace-nowrap rounded-full border font-display text-[15px] font-bold leading-5 transition duration-200 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-45'

const btnBase = `${btnShape} px-[22px]`

// Голубая заливка и чёрная подпись (≈ 10,7 : 1). На сайте подпись белая, но белое на голубом даёт ≈ 2 : 1.
export const btnPrimary = `${btnBase} border-transparent bg-accent text-on-accent hover:brightness-105`
export const btnSecondary = `${btnBase} border-transparent bg-navy text-white hover:bg-[#21406a]`
export const btnGhost = `${btnBase} border-line bg-transparent text-ink hover:border-accent`
// Квадратная кнопка со значком (меню на мобильном): без горизонтальных отступов.
export const btnGhostIcon = `${btnShape} w-11 border-line bg-transparent text-ink hover:border-accent`

// Переключатели-сегменты: фильтр уровней, период графика.
export const segmentClass =
  'inline-flex min-h-11 items-center justify-center gap-1.5 rounded-full border px-4 font-sans text-sm font-semibold transition duration-200'
export const segmentActiveClass = 'border-accent bg-accent text-on-accent'
export const segmentIdleClass = 'border-line bg-surface text-ink hover:border-accent'

// Карточка без отступов — для таблиц, которые идут от края до края.
export const cardBase = 'rounded-card border border-line bg-surface'
export const cardClass = `${cardBase} p-6 md:p-8`

// Выноска (розовый акцент): пояснение формулы.
export const calloutClass = 'rounded-panel bg-highlight p-5 text-highlight-ink md:px-6'

// Шрифт заголовков без регистра — для email и сумм, где капс искажает текст.
export const displayBase = 'font-display tracking-tight'
// Заголовок без цвета и веса — для состояний со своим цветом и для крупных чисел (там font-black).
export const headingBase = `${displayBase} uppercase`
export const headingClass = `${headingBase} font-extrabold text-ink`

export const labelClass = 'font-sans text-sm font-semibold text-ink'

// Без размера — для подписей крупнее или мельче обычной.
export const mutedBase = 'font-sans text-muted'
export const mutedClass = `${mutedBase} text-sm`

// Без подчёркивания — для ссылок-кнопок со значком.
export const linkBase = 'rounded font-sans font-semibold text-link transition-colors'
export const linkClass = `${linkBase} underline underline-offset-4 hover:no-underline`

export const tableHeadClass = 'px-4 py-3 text-left font-sans text-xs font-semibold uppercase tracking-[0.06em] text-muted whitespace-nowrap'

export const tableCellClass = 'px-4 py-3 align-middle text-sm'

// Полоса score и распределения уровней. Уровень различим не только цветом: рядом всегда подпись и значок.
export const LEVEL_BAR_CLASS: Record<RiskLevel, string> = {
  high: 'bg-warn',
  medium: 'bg-warn/55',
  low: 'bg-accent',
  none: 'bg-muted/50',
}

/** Заливка дорожки ползунка (переменная читается в index.css). */
export function rangeStyle(value: number, min: number, max: number): CSSProperties {
  const span = max - min
  const percent = span > 0 && !Number.isNaN(value) ? Math.min(100, Math.max(0, ((value - min) / span) * 100)) : 0
  return { '--range-fill': `${percent}%` } as CSSProperties
}

export const LEVEL_ICON: Record<RiskLevel, IconName> = { high: 'flag', medium: 'half', low: 'shield', none: 'dash' }
