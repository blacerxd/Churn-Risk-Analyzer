import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ApiError, apiFetch, queryKeys } from '../lib/api'
import type { Me } from '../lib/api'
import { ErrorState, Skeleton } from './ui'

export default function ProtectedRoute() {
  const location = useLocation()
  const { data, isPending, error, refetch } = useQuery({
    queryKey: queryKeys.me,
    queryFn: () => apiFetch<Me>('/auth/me'),
    retry: false,
    staleTime: 5 * 60 * 1000,
  })

  if (isPending) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6" aria-busy="true">
        <Skeleton className="h-10 w-48" />
      </div>
    )
  }

  if (error instanceof ApiError && (error.status === 401 || error.status === 403)) {
    return <Navigate to="/login" replace state={{ from: { pathname: location.pathname, search: location.search } }} />
  }

  if (error || !data) {
    return (
      <div className="mx-auto max-w-lg p-6">
        <ErrorState message={error instanceof ApiError ? error.message : 'Нет связи с сервером'} onRetry={() => void refetch()} />
      </div>
    )
  }

  return <Outlet context={data} />
}
