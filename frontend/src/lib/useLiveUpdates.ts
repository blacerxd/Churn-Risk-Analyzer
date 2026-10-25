import { useEffect, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { queryKeys } from './api'

const EVENTS_URL = '/api/v1/events'
const RECONNECT_DELAY_MS = 3000

export interface LiveStatus {
  connected: boolean
  updatedAt: Date | null
}

export function useLiveUpdates(): LiveStatus {
  const queryClient = useQueryClient()
  const [status, setStatus] = useState<LiveStatus>({ connected: false, updatedAt: null })

  useEffect(() => {
    let source: EventSource | null = null
    let timer: number | undefined
    let stopped = false

    const connect = () => {
      source = new EventSource(EVENTS_URL)

      source.onopen = () => setStatus((previous) => ({ connected: true, updatedAt: previous.updatedAt ?? new Date() }))

      source.addEventListener('recalculated', () => {
        void queryClient.invalidateQueries({ queryKey: queryKeys.summary })
        void queryClient.invalidateQueries({ queryKey: queryKeys.customers })
        void queryClient.invalidateQueries({ queryKey: queryKeys.customer })
        void queryClient.invalidateQueries({ queryKey: queryKeys.settings })
        void queryClient.invalidateQueries({ queryKey: queryKeys.churnChart })
        void queryClient.invalidateQueries({ queryKey: queryKeys.recalculations })
        void queryClient.invalidateQueries({ queryKey: queryKeys.statusEvents })
        setStatus({ connected: true, updatedAt: new Date() })
      })

      source.onerror = () => {
        setStatus((previous) => ({ ...previous, connected: false }))
        if (source && source.readyState === EventSource.CLOSED && !stopped) {
          source.close()
          timer = window.setTimeout(connect, RECONNECT_DELAY_MS)
        }
      }
    }

    connect()

    return () => {
      stopped = true
      window.clearTimeout(timer)
      source?.close()
    }
  }, [queryClient])

  return status
}
