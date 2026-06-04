import type { Garment } from './garment'

export interface Outfit {
  id: string
  name: string
  createdAt: string
  garments: Garment[]
}

export interface OutfitRequest {
  name: string
  garmentIds: string[]
}
