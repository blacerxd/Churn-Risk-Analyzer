import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider } from 'react-router-dom'
import { ApiError } from './lib/api'
import { router } from './routes'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // 4xx повтором не исправить: ошибку сразу показываем. Повторяем только сбои сети и сервера.
      retry: (failureCount, error) => !(error instanceof ApiError && error.status < 500) && failureCount < 1,
      refetchOnWindowFocus: false,
    },
  },
})

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  )
}
