import api from '../api/axiosConfig'

interface TagResponse {
  id: string
  name: string
}

export const fetchTags = async (): Promise<string[]> => {
  const response = await api.get<TagResponse[]>('/api/tags')
  return response.data.map((tag) => tag.name)
}
