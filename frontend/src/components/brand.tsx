import logo from '../assets/brand/logo.svg'
import logoWhite from '../assets/brand/logo-white.svg'
import business from '../assets/brand/mascot/business.webp'
import focus from '../assets/brand/mascot/focus.webp'
import servers from '../assets/brand/mascot/servers.webp'
import patternLines from '../assets/brand/pattern-lines.svg'
import patternLinesWhite from '../assets/brand/pattern-lines-white.svg'
import sign from '../assets/brand/sign.svg'
import signWhite from '../assets/brand/sign-white.svg'

// Graphics from the Aéza guidebook 2026 (src/assets/brand). The logo and the mascot are
// used as files only: the guidebook forbids redrawing, recoloring or typing them.

/** Full mark a·é·z·a, or the compact «é» key for narrow places. Black keys in the light theme, white in the dark one. */
export function Logo({ compact = false, tone = 'auto', className = '' }: { compact?: boolean; tone?: 'auto' | 'inverse'; className?: string }) {
  const [light, dark] = compact ? [sign, signWhite] : [logo, logoWhite]
  const size = compact ? 'h-11 w-11' : 'h-9 w-auto'
  if (tone === 'inverse') return <img src={dark} alt="Aéza" className={`${size} ${className}`} />
  return (
    <>
      <img src={light} alt="Aéza" className={`${size} dark:hidden ${className}`} />
      <img src={dark} alt="Aéza" className={`${size} hidden dark:block ${className}`} />
    </>
  )
}

export type MascotOutfit = 'suit' | 'headphones' | 'servers'

const MASCOT: Record<MascotOutfit, string> = { suit: business, headphones: focus, servers }

/** Only on sign-in, empty states, 404 and a successful upload. No more than one figure per screen. */
export function Mascot({ outfit = 'suit', className = 'h-44 w-48' }: { outfit?: MascotOutfit; className?: string }) {
  return <img src={MASCOT[outfit]} alt="" aria-hidden="true" className={`select-none object-contain ${className}`} />
}

/**
 * Pattern: three parallel lines and an accent line turning with a smooth corner. Only as a frame or an edge.
 * The accent line is black on light backgrounds and white on dark ones; inverse keeps it white.
 */
export function BrandPattern({ className = '', inverse = false }: { className?: string; inverse?: boolean }) {
  if (inverse) return <img src={patternLinesWhite} alt="" aria-hidden="true" className={className} />
  return (
    <span aria-hidden="true" className={className}>
      <img src={patternLines} alt="" className="w-full dark:hidden" />
      <img src={patternLinesWhite} alt="" className="hidden w-full dark:block" />
    </span>
  )
}

/**
 * Sidebar edge: three straight accent lines and one turning in the text color (black in the light
 * theme, white in the dark one). Drawn inline so the line weight matches the menu at any width.
 */
export function SidebarPattern({ className = '', strokeWidth = 8 }: { className?: string; strokeWidth?: number }) {
  return (
    <svg viewBox="0 0 240 160" fill="none" strokeLinecap="round" strokeWidth={strokeWidth} aria-hidden="true" className={className}>
      <path d="M0 20H240" stroke="#4CC6F1" />
      <path d="M0 52H240" stroke="#4CC6F1" />
      <path d="M0 84H240" stroke="#4CC6F1" />
      <path d="M0 116H150Q172 116 172 138V160" stroke="currentColor" />
    </svg>
  )
}
