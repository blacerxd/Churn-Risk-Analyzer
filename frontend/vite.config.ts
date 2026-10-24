import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

const backend = process.env.VITE_BACKEND_URL ?? 'http://localhost:8000'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api/v1/auth/login': {
        target: backend,
        bypass: (req) => (req.method === 'GET' ? '/index.html' : undefined),
      },
      '/api': backend,
      '/metrics': backend,
    },
  },
})
