import api from '../api/axiosConfig'
import type { Outfit, OutfitRequest } from '../types/outfit'

const BASE = '/api/outfits'

export const getOutfits = async (): Promise<Outfit[]> => {
  const response = await api.get<Outfit[]>(BASE)
  return response.data
}

export const createOutfit = async (req: OutfitRequest): Promise<Outfit> => {
  const response = await api.post<Outfit>(BASE, req)
  return response.data
}

export const deleteOutfit = async (id: string): Promise<void> => {
  await api.delete(`${BASE}/${id}`)
}
