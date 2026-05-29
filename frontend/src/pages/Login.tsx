import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { login } from '../services/authService'
import { isAxiosError } from 'axios'

export const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage('')

    try {
      const response = await login(email, password)
      const token = response.token || response.accessToken

      if (token) {
        localStorage.setItem('token', token)
        navigate('/dashboard')
      } else {
        setErrorMessage('Brak tokena w odpowiedzi serwera.')
      }
    } catch (error) {
      if (isAxiosError<{ message: string }>(error)) {
        setErrorMessage(error.response?.data?.message ?? 'Wystąpił błąd logowania.')
      } else {
        setErrorMessage('Wystąpił błąd logowania.')
      }
    }
  }

  return (
    <div>
      <h2>Logowanie</h2>
      {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}

      <form onSubmit={handleSubmit}>
        <div>
          <label>Email:</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div>
          <label>Hasło:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit">Zaloguj się</button>
      </form>
    </div>
  )
}
export default Login
