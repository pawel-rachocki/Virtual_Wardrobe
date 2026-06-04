import api from '../api/axiosConfig'

export interface UserProfile {
  id: string
  email: string
  basePhotoUrl?: string
}

export const getCurrentUser = async (): Promise<UserProfile> => {
  const response = await api.get<UserProfile>('/api/users/me')
  return response.data
}

export const uploadBasePhoto = async (file: File): Promise<{ basePhotoUrl: string }> => {
  const form = new FormData()
  form.append('file', file)

  const response = await api.post<{ basePhotoUrl: string }>('/api/users/base-photo', form)
  return response.data
}
