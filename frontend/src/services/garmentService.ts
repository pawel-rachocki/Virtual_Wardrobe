import api from '../api/axiosConfig'
import type {
  Category,
  Garment,
  GarmentCreateRequest,
  GarmentUpdateRequest,
} from '../types/garment'

const BASE = '/api/garments'

export const getAll = async (category?: Category, tag?: string): Promise<Garment[]> => {
  const params: Record<string, string> = {}
  if (category) params.category = category
  if (tag) params.tag = tag

  const response = await api.get<Garment[]>(BASE, { params })
  return response.data
}

export const create = async (data: GarmentCreateRequest): Promise<Garment> => {
  const form = new FormData()

  const metadata = {
    name: data.name,
    brand: data.brand,
    color: data.color,
    season: data.season,
    category: data.category,
    tags: data.tags ?? [],
  }
  form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }))
  form.append('image', data.image)

  const response = await api.post<Garment>(BASE, form)
  return response.data
}

export const update = async (id: string, data: GarmentUpdateRequest): Promise<Garment> => {
  const body = { ...data, tags: data.tags ?? [] }
  const response = await api.put<Garment>(`${BASE}/${id}`, body)
  return response.data
}

export const remove = async (id: string): Promise<void> => {
  await api.delete(`${BASE}/${id}`)
}
