import type { ReactNode } from 'react'

// Набор иконок по листу иконок из брендбука: залитые, со скруглениями, сетка 24 px, цвет currentColor.
// Недостающие значки (stack, search, upload, logout, sun, moon и др.) нарисованы по той же конструкции.

export type IconName =
  | 'chart'
  | 'people'
  | 'edit'
  | 'stack'
  | 'shield'
  | 'flag'
  | 'hourglass'
  | 'card'
  | 'bag'
  | 'search'
  | 'upload'
  | 'logout'
  | 'sun'
  | 'moon'
  | 'menu'
  | 'close'
  | 'arrow'
  | 'back'
  | 'check'
  | 'alert'
  | 'half'
  | 'dash'
  | 'file'

const outline = { fill: 'none' } as const

const GLYPHS: Record<IconName, ReactNode> = {
  chart: (
    <>
      <rect x="3.5" y="12" width="4.5" height="8.5" rx="1.8" />
      <rect x="9.75" y="4" width="4.5" height="16.5" rx="1.8" />
      <rect x="16" y="8.5" width="4.5" height="12" rx="1.8" />
    </>
  ),
  people: (
    <>
      <circle cx="9" cy="8" r="3.6" />
      <path d="M2.5 19.5c0-3.4 2.9-5.7 6.5-5.7s6.5 2.3 6.5 5.7z" />
      <circle cx="17" cy="9" r="2.7" />
      <path d="M17 14.2c2.6 0 4.5 1.7 4.5 4.3v1h-4.2c0-2-.6-3.7-1.8-4.8.4-.3.9-.5 1.5-.5z" />
    </>
  ),
  edit: (
    <>
      <path d="M4 16.5 15.2 5.3a2.3 2.3 0 0 1 3.2 0l.3.3a2.3 2.3 0 0 1 0 3.2L7.5 20 3.5 20.8z" />
      <rect x="11" y="20" width="9.5" height="2" rx="1" />
    </>
  ),
  stack: (
    <>
      <rect x="3.5" y="3.5" width="17" height="4.8" rx="2.4" />
      <rect x="3.5" y="9.6" width="17" height="4.8" rx="2.4" />
      <rect x="3.5" y="15.7" width="17" height="4.8" rx="2.4" />
    </>
  ),
  shield: <path fillRule="evenodd" d="M12 2.5l8 3v6.2c0 5-3.3 8.6-8 10-4.7-1.4-8-5-8-10V5.5zM8.2 12.2l2.6 2.6 5-5.2-1.3-1.3-3.7 3.9-1.3-1.3z" />,
  flag: (
    <>
      <rect x="4.5" y="3" width="2.4" height="18" rx="1.2" />
      <path d="M8.5 4.5h10.2l-2.3 4 2.3 4H8.5z" />
    </>
  ),
  hourglass: <path d="M7 3h10v3.5c0 1.6-1 2.8-2.3 3.5 1.3.7 2.3 1.9 2.3 3.5V21H7v-4.5c0-1.6 1-2.8 2.3-3.5C8 12.3 7 11.1 7 9.5z" />,
  card: <path fillRule="evenodd" d="M5.5 4.5h13A3.5 3.5 0 0 1 22 8v8a3.5 3.5 0 0 1-3.5 3.5h-13A3.5 3.5 0 0 1 2 16V8a3.5 3.5 0 0 1 3.5-3.5zM2 9h20v2.6H2zM5.5 14.5h5v1.8h-5z" />,
  bag: (
    <>
      <path d="M5.2 8h13.6l1 12.4a1.6 1.6 0 0 1-1.6 1.7H5.8a1.6 1.6 0 0 1-1.6-1.7z" />
      <path d="M8.7 9.5V7.2a3.3 3.3 0 0 1 6.6 0v2.3" style={{ ...outline, strokeWidth: 2 }} />
    </>
  ),
  search: (
    <>
      <circle cx="10.5" cy="10.5" r="6" style={{ ...outline, strokeWidth: 2.4 }} />
      <path d="M15.2 15.2 20 20" style={{ ...outline, strokeWidth: 2.6, strokeLinecap: 'round' }} />
    </>
  ),
  upload: (
    <>
      <path d="M12 3l5 5.2h-3.3V14h-3.4V8.2H7z" />
      <rect x="3.5" y="15.5" width="17" height="5" rx="2.5" />
    </>
  ),
  logout: (
    <>
      <path d="M10 3h7a3 3 0 0 1 3 3v12a3 3 0 0 1-3 3h-7v-2.4h7a.6.6 0 0 0 .6-.6V6a.6.6 0 0 0-.6-.6h-7z" />
      <path d="M3 12l4.6-4.6v3.2h6v2.8h-6v3.2z" />
    </>
  ),
  sun: (
    <>
      <circle cx="12" cy="12" r="4.2" />
      {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
        <rect key={angle} x="11" y="2" width="2" height="3.4" rx="1" transform={`rotate(${angle} 12 12)`} />
      ))}
    </>
  ),
  moon: <path d="M20.5 14.6A8.6 8.6 0 1 1 9.4 3.5a7.2 7.2 0 0 0 11.1 11.1z" />,
  menu: (
    <>
      <rect x="3.5" y="5" width="17" height="2.6" rx="1.3" />
      <rect x="3.5" y="10.7" width="17" height="2.6" rx="1.3" />
      <rect x="3.5" y="16.4" width="17" height="2.6" rx="1.3" />
    </>
  ),
  close: <path d="M6.2 4.4 12 10.2l5.8-5.8 1.8 1.8L13.8 12l5.8 5.8-1.8 1.8-5.8-5.8-5.8 5.8-1.8-1.8L10.2 12 4.4 6.2z" />,
  arrow: <path d="M4 10.7h10.2L10.6 7.1 12.4 5.3 19.1 12l-6.7 6.7-1.8-1.8 3.6-3.6H4z" />,
  back: <path d="M20 10.7H9.8l3.6-3.6-1.8-1.8L4.9 12l6.7 6.7 1.8-1.8-3.6-3.6H20z" />,
  check: <path fillRule="evenodd" d="M12 2.5a9.5 9.5 0 1 0 0 19 9.5 9.5 0 0 0 0-19zM7.3 12.2l1.7-1.7 2.2 2.2 4.5-4.6 1.7 1.7-6.2 6.3z" />,
  alert: <path fillRule="evenodd" d="M12 2.5a9.5 9.5 0 1 0 0 19 9.5 9.5 0 0 0 0-19zM10.8 6.5h2.4l-.4 7h-1.6zM12 15.3a1.4 1.4 0 1 1 0 2.8 1.4 1.4 0 0 1 0-2.8z" />,
  half: <path fillRule="evenodd" d="M12 2.5a9.5 9.5 0 1 0 0 19 9.5 9.5 0 0 0 0-19zM12 5.5a6.5 6.5 0 0 1 0 13z" />,
  dash: <circle cx="12" cy="12" r="8.5" style={{ ...outline, strokeWidth: 2.4, strokeDasharray: '4 3.4' }} />,
  file: <path fillRule="evenodd" d="M7 2.5h6.6L19.5 8.4V17a4.5 4.5 0 0 1-4.5 4.5H7A3.5 3.5 0 0 1 3.5 18V6A3.5 3.5 0 0 1 7 2.5zM13 3.5v5h5z" />,
}

interface IconProps {
  name: IconName
  className?: string
  /** Если значок несёт смысл сам по себе, передайте подпись; иначе он скрыт от скринридеров. */
  label?: string
}

export function Icon({ name, className = 'h-5 w-5', label }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      stroke="currentColor"
      strokeWidth={1}
      strokeLinejoin="round"
      className={`shrink-0 ${className}`}
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      focusable="false"
    >
      {GLYPHS[name]}
    </svg>
  )
}

const TILE_SIZE = { sm: 'h-8 w-8 rounded-[10px]', md: 'h-10 w-10 rounded-key', lg: 'h-12 w-12 rounded-2xl' } as const

/** Голубой знак на чёрной плитке со скруглением (стиль листа иконок). */
export function IconTile({ name, size = 'md', className = '' }: { name: IconName; size?: keyof typeof TILE_SIZE; className?: string }) {
  return (
    <span className={`inline-flex shrink-0 items-center justify-center border border-line bg-black text-accent ${TILE_SIZE[size]} ${className}`}>
      <Icon name={name} className={size === 'sm' ? 'h-4 w-4' : size === 'lg' ? 'h-6 w-6' : 'h-5 w-5'} />
    </span>
  )
}
