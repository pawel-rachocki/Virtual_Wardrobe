import api from '../api/axiosConfig'

export const uploadBasePhoto = async (file: File): Promise<{ basePhotoUrl: string }> => {
  const form = new FormData()
  form.append('file', file)

  const response = await api.post<{ basePhotoUrl: string }>('/api/users/base-photo', form)
  return response.data
}
