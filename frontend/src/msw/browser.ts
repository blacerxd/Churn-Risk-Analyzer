import { setupWorker } from 'msw/browser'
import { handlers } from './handlers'

// All mocked endpoints are implemented on the backend now, keep the list for new ones.
const MISSING_ON_BACKEND: RegExp[] = []

const active =
  import.meta.env.VITE_USE_MSW === 'missing'
    ? handlers.filter((handler) => {
        const path = (handler as unknown as { info: { path: unknown } }).info.path
        return typeof path === 'string' && MISSING_ON_BACKEND.some((pattern) => pattern.test(path))
      })
    : handlers

export const worker = setupWorker(...active)
