import api from '../api/axiosConfig'
import type { TryOnJob, TryOnStatusResponse } from '../types/tryOn'

const BASE = '/api/try-on'

export const initTryOn = async (garmentId: string): Promise<TryOnJob> => {
  try {
    const response = await api.post<TryOnJob>(BASE, { garmentId })
    return response.data
  } catch {
    throw new Error('Nie udało się zainicjować Try-On. Spróbuj ponownie.')
  }
}

export const getStatus = async (jobId: string): Promise<TryOnStatusResponse> => {
  try {
    const response = await api.get<TryOnStatusResponse>(`${BASE}/${jobId}/status`)
    return response.data
  } catch {
    throw new Error('Nie udało się pobrać statusu Try-On. Spróbuj ponownie.')
  }
}
