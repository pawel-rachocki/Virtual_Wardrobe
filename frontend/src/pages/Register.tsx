import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { register } from '../services/authService'
import { isAxiosError } from 'axios'

export const Register = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage('')

    if (password !== confirmPassword) {
      setErrorMessage('Hasła nie są identyczne.')
      return
    }

    try {
      await register(email, password)
      navigate('/login')
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
      <h2>Rejestracja</h2>
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
        <div>
          <label>Potwierdź hasło:</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit">Zarejestruj się</button>
      </form>
    </div>
  )
}
export default Register
