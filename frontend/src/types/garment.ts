export enum Category {
  HEAD = 'HEAD',
  TOP = 'TOP',
  BOTTOM = 'BOTTOM',
  SHOES = 'SHOES',
  ACCESSORIES = 'ACCESSORIES',
}

export type Tag = string

export interface Garment {
  id: string
  name: string
  brand: string
  color: string
  season: string
  category: Category
  imageUrl: string
  tags: Tag[]
}

export interface GarmentCreateRequest {
  name: string
  brand: string
  color: string
  season: string
  category: Category
  tags?: Tag[]
  image: File
}

export interface GarmentUpdateRequest {
  name: string
  brand: string
  color: string
  season: string
  category: Category
  tags?: Tag[]
}
