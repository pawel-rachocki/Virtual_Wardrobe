import { useEffect, useRef, useState } from 'react'
import type { TryOnStatus } from '../types/tryOn'
import * as tryOnService from '../services/tryOnService'

interface PollingState {
  status: TryOnStatus | null
  resultUrl: string | null
  isPolling: boolean
  error: string | null
}

const INITIAL_STATE: PollingState = { status: null, resultUrl: null, isPolling: false, error: null }
const TERMINAL: TryOnStatus[] = ['DONE', 'FAILED']
const POLL_INTERVAL_MS = 3000
const SAFETY_TIMEOUT_MS = 5 * 60 * 1000

export const useTryOnPolling = (jobId: string | null): PollingState => {
  const [state, setState] = useState<PollingState>(INITIAL_STATE)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const safetyRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const stopPolling = () => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    if (safetyRef.current !== null) {
      clearTimeout(safetyRef.current)
      safetyRef.current = null
    }
  }

  useEffect(() => {
    stopPolling()
    setState({ ...INITIAL_STATE, isPolling: !!jobId })

    if (!jobId) return

    const poll = async () => {
      try {
        const res = await tryOnService.getStatus(jobId)
        const isTerminal = TERMINAL.includes(res.status)
        if (isTerminal) stopPolling()
        setState((prev) => ({
          ...prev,
          status: res.status,
          ...(res.resultUrl ? { resultUrl: res.resultUrl } : {}),
          ...(isTerminal ? { isPolling: false } : {}),
        }))
      } catch (err) {
        stopPolling()
        setState((prev) => ({
          ...prev,
          error: err instanceof Error ? err.message : 'Błąd pollingu',
          isPolling: false,
        }))
      }
    }

    poll()
    intervalRef.current = setInterval(poll, POLL_INTERVAL_MS)
    safetyRef.current = setTimeout(() => {
      stopPolling()
      setState((prev) => ({
        ...prev,
        status: 'FAILED',
        error: 'Wizualizacja trwa zbyt długo. Spróbuj ponownie.',
        isPolling: false,
      }))
    }, SAFETY_TIMEOUT_MS)

    return stopPolling
  }, [jobId])

  return state
}
