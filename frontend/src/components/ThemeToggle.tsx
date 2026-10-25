import { useTheme } from '../lib/theme'
import { Icon } from './icons'

// Two segments, sun and moon: the active one is filled with the accent color
export default function ThemeToggle() {
  const [dark, setTheme] = useTheme()
  return (
    <div role="group" aria-label="Тема оформления" className="inline-flex gap-1 rounded-full border border-line bg-surface p-1">
      {([
        { value: false, icon: 'sun', label: 'Светлая тема' },
        { value: true, icon: 'moon', label: 'Тёмная тема' },
      ] as const).map((option) => (
        <button
          key={option.label}
          type="button"
          onClick={() => setTheme(option.value)}
          aria-pressed={dark === option.value}
          aria-label={option.label}
          title={option.label}
          className={`inline-flex h-9 w-9 items-center justify-center rounded-full transition-colors duration-200 ${
            dark === option.value ? 'bg-accent text-on-accent' : 'text-ink hover:bg-hover'
          }`}
        >
          <Icon name={option.icon} />
        </button>
      ))}
    </div>
  )
}
