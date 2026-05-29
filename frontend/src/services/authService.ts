import api from '../api/axiosConfig.ts'

const API_URL = '/api/auth'

export const login = async (email: string, password: string) => {
  const response = await api.post(`${API_URL}/login`, {
    email,
    password,
  })
  return response.data
}

export const register = async (email: string, password: string) => {
  const response = await api.post(`${API_URL}/register`, {
    email,
    password,
  })
  return response.data
}
