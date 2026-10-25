import { Link, useLocation } from 'react-router-dom'
import { BrandPattern, Mascot } from '../components/brand'
import { Icon } from '../components/icons'
import { btnGhost, btnPrimary, cardBase, headingClass, mutedClass } from '../components/styles'

// fades out before the 404 keys so the lines never run behind them
const PATTERN_FADE = 'radial-gradient(ellipse 100% 100% at top left, #000 35%, transparent 70%)'

// "404" typed on the same keys as the Aéza logo: black keys in the light theme, white in the dark one
function Key({ children, delay }: { children: string; delay: string }) {
  return (
    <span
      style={{ animationDelay: delay }}
      className="inline-flex h-24 w-20 animate-[key-press_2.4s_ease-in-out_infinite] items-center justify-center rounded-[22px] bg-black font-display text-6xl font-black text-white shadow-[0_6px_0_0_var(--color-accent)] transition-transform duration-150 hover:translate-y-1.5 hover:shadow-[0_0_0_0_var(--color-accent)] dark:bg-white dark:text-black sm:h-32 sm:w-28 sm:text-8xl"
    >
      {children}
    </span>
  )
}

export default function NotFound() {
  const { pathname } = useLocation()

  return (
    <section className={`${cardBase} relative overflow-hidden`} aria-labelledby="not-found-title">
      <div aria-hidden="true" className="pointer-events-none absolute left-0 top-0 hidden w-[300px] md:block" style={{ maskImage: PATTERN_FADE, WebkitMaskImage: PATTERN_FADE }}>
        <BrandPattern className="w-full" />
      </div>

      <div className="relative flex flex-col items-center gap-8 px-6 py-12 md:flex-row md:justify-center md:gap-12 md:px-12 md:py-16">
        <div className="flex flex-col items-center gap-6 text-center md:items-start md:text-left">
          <div className="flex gap-3" role="img" aria-label="Ошибка 404">
            <Key delay="0s">4</Key>
            <Key delay="0.3s">0</Key>
            <Key delay="0.6s">4</Key>
          </div>

          <div className="flex max-w-md flex-col gap-2">
            <h1 id="not-found-title" className={`${headingClass} text-3xl`}>
              Страница не найдена
            </h1>
            <p className="font-sans text-base text-ink">
              Аэза-тян проверила все серверы, но такой страницы нет ни на одном из них.
            </p>
            <p className={mutedClass}>
              Адрес <code className="rounded-md bg-hover px-1.5 py-0.5 font-mono text-xs text-ink">{pathname}</code> не существует или
              был перемещён.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-3 md:justify-start">
            <Link to="/" className={btnPrimary}>
              <Icon name="chart" />
              На главную
            </Link>
            <Link to="/customers" className={btnGhost}>
              <Icon name="people" />
              К клиентам
            </Link>
          </div>
        </div>

        <Mascot outfit="servers" className="h-64 w-auto shrink-0 md:h-80" />
      </div>
    </section>
  )
}
