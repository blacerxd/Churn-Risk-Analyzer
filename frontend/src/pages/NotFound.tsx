import { Link } from 'react-router-dom'
import { cardClass, btnPrimary } from '../components/styles'
import { EmptyState } from '../components/ui'

export default function NotFound() {
  return (
    <div className={cardClass}>
      <EmptyState
        title="Страница не найдена"
        hint="Такого адреса нет. Проверьте ссылку или вернитесь на главную."
        action={
          <Link to="/" className={btnPrimary}>
            На главную
          </Link>
        }
      />
    </div>
  )
}
