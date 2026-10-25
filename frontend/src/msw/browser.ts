import { setupWorker } from 'msw/browser'
import { handlers } from './handlers'

const MISSING_ON_BACKEND = /\/(analytics|customers|model)(\/|$)|\/auth\/config$/

const active =
  import.meta.env.VITE_USE_MSW === 'missing'
    ? handlers.filter((handler) => {
        const path = (handler as unknown as { info: { path: unknown } }).info.path
        return typeof path === 'string' && MISSING_ON_BACKEND.test(path)
      })
    : handlers

export const worker = setupWorker(...active)
