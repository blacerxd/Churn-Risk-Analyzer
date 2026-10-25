import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { applyTheme, readDark } from './lib/theme'

// before the first render, so no page flashes light in the dark theme
applyTheme(readDark())

async function enableMocking() {
  const mode = import.meta.env.VITE_USE_MSW
  if (mode !== 'true' && mode !== 'missing') return
  const { worker } = await import('./msw/browser')
  await worker.start({ onUnhandledFrame: 'bypass' })
}

void enableMocking().then(() => {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
})
