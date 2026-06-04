import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { register } from '../services/authService'
import { isAxiosError } from 'axios'

const HangerIcon = () => (
  <svg width="44" height="38" viewBox="0 0 64 56" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M6 48 Q16 30 32 20 Q48 30 58 48"
      stroke="#C8906A"
      strokeWidth="1.5"
      strokeLinecap="round"
      fill="none"
    />
    <line x1="6" y1="48" x2="58" y2="48" stroke="#C8906A" strokeWidth="1.5" strokeLinecap="round" />
    <path
      d="M32 20 Q32 10 40 10 Q48 10 42 20"
      stroke="#C8906A"
      strokeWidth="1.5"
      strokeLinecap="round"
      fill="none"
    />
  </svg>
)

export const Register = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [mounted, setMounted] = useState(false)

  const navigate = useNavigate()

  useEffect(() => {
    const link = document.createElement('link')
    link.href =
      'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&family=Jost:wght@300;400;500&display=swap'
    link.rel = 'stylesheet'
    document.head.appendChild(link)

    const timer = setTimeout(() => setMounted(true), 80)

    return () => {
      clearTimeout(timer)
      if (document.head.contains(link)) document.head.removeChild(link)
    }
  }, [])

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
        setErrorMessage(error.response?.data?.message ?? 'Wystąpił błąd rejestracji.')
      } else {
        setErrorMessage('Wystąpił błąd rejestracji.')
      }
    }
  }

  return (
    <div
      style={{ fontFamily: "'Jost', sans-serif" }}
      className="min-h-screen flex bg-[#FAF8F5] text-[#1A1A18]"
    >
      <style>{`.wv-input:focus { border-bottom-color: #C8906A !important; }`}</style>

      {/* ── Left panel (desktop only) ── */}
      <div
        style={{ backgroundColor: '#1A1A18' }}
        className="hidden lg:flex lg:w-[45%] xl:w-1/2 flex-col justify-between p-12 xl:p-16"
      >
        <div className="flex items-center gap-3">
          <span className="block w-5 h-px bg-[#C8906A]" />
          <span
            style={{ fontFamily: "'Cormorant Garamond', serif", letterSpacing: '0.16em' }}
            className="text-white text-sm uppercase font-light"
          >
            Virtual Wardrobe
          </span>
        </div>

        <div>
          <div className="mb-10">
            <HangerIcon />
          </div>
          <h2
            style={{ fontFamily: "'Cormorant Garamond', serif" }}
            className="text-6xl xl:text-7xl font-light text-white leading-tight mb-6"
          >
            Style starts
            <br />
            <em>with order.</em>
          </h2>
          <p
            style={{ letterSpacing: '0.04em' }}
            className="text-sm text-[#6B6B67] font-light leading-relaxed max-w-xs"
          >
            Create your account and start building a wardrobe that works as hard as you do.
          </p>
        </div>

        <div className="w-10 h-px bg-[#C8906A]" />
      </div>

      {/* ── Right panel — form ── */}
      <div className="flex-1 flex items-center justify-center p-8 sm:p-12">
        <div
          className={`w-full max-w-sm transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
        >
          {/* Mobile brand header */}
          <div className="flex items-center gap-3 mb-12 lg:hidden">
            <span className="block w-5 h-px bg-[#C8906A]" />
            <span
              style={{ fontFamily: "'Cormorant Garamond', serif", letterSpacing: '0.16em' }}
              className="text-xl uppercase font-light"
            >
              Virtual Wardrobe
            </span>
          </div>

          <p style={{ letterSpacing: '0.24em' }} className="text-xs uppercase text-[#C8906A] mb-4">
            Nowe konto
          </p>
          <h1
            style={{ fontFamily: "'Cormorant Garamond', serif" }}
            className="text-4xl sm:text-5xl font-light mb-10"
          >
            Rejestracja
          </h1>

          <form onSubmit={handleSubmit} className="flex flex-col gap-7">
            <div>
              <label
                style={{ letterSpacing: '0.14em' }}
                className="block text-xs uppercase text-[#A09A93] mb-2"
              >
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="twoj@email.com"
                style={{ borderBottom: '1px solid #D4CBBF', transition: 'border-color 0.2s' }}
                className="wv-input w-full bg-transparent py-2 text-sm text-[#1A1A18] placeholder-[#C8C4BE] outline-none"
              />
            </div>

            <div>
              <label
                style={{ letterSpacing: '0.14em' }}
                className="block text-xs uppercase text-[#A09A93] mb-2"
              >
                Hasło
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                style={{ borderBottom: '1px solid #D4CBBF', transition: 'border-color 0.2s' }}
                className="wv-input w-full bg-transparent py-2 text-sm text-[#1A1A18] placeholder-[#C8C4BE] outline-none"
              />
            </div>

            <div>
              <label
                style={{ letterSpacing: '0.14em' }}
                className="block text-xs uppercase text-[#A09A93] mb-2"
              >
                Potwierdź hasło
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                placeholder="••••••••"
                style={{ borderBottom: '1px solid #D4CBBF', transition: 'border-color 0.2s' }}
                className="wv-input w-full bg-transparent py-2 text-sm text-[#1A1A18] placeholder-[#C8C4BE] outline-none"
              />
            </div>

            {errorMessage && (
              <p style={{ letterSpacing: '0.04em' }} className="text-xs text-[#C8906A] -mt-2">
                {errorMessage}
              </p>
            )}

            <button
              type="submit"
              style={{ backgroundColor: '#1A1A18', letterSpacing: '0.18em' }}
              className="mt-2 w-full py-4 text-xs uppercase text-white hover:bg-[#C8906A] transition-colors duration-300"
            >
              Zarejestruj się
            </button>
          </form>

          <p
            style={{ letterSpacing: '0.04em' }}
            className="mt-8 text-xs text-[#A09A93] text-center"
          >
            Masz już konto?{' '}
            <Link
              to="/login"
              className="text-[#1A1A18] hover:text-[#C8906A] transition-colors duration-200 underline underline-offset-2"
            >
              Zaloguj się
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Register
