import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import type { Garment } from '../types/garment'
import * as garmentService from '../services/garmentService'
import GarmentGrid from '../components/garment/GarmentGrid'

const Dashboard = () => {
  const navigate = useNavigate()
  const [mounted, setMounted] = useState(false)
  const [garments, setGarments] = useState<Garment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

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

  useEffect(() => {
    garmentService
      .getAll()
      .then((data) => {
        setGarments(data)
        setError(null)
        setLoading(false)
      })
      .catch(() => {
        setError('Nie udało się załadować garderoby. Sprawdź połączenie i spróbuj ponownie.')
        setLoading(false)
      })
  }, [refreshKey])

  const handleRetry = () => {
    setLoading(true)
    setError(null)
    setRefreshKey((k) => k + 1)
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    navigate('/login')
  }

  return (
    <div
      style={{ fontFamily: "'Jost', sans-serif", backgroundColor: '#FAF8F5' }}
      className="min-h-screen text-[#1A1A18]"
    >
      {/* ── Header ── */}
      <header
        style={{ borderBottom: '1px solid #E8E4DF' }}
        className={`sticky top-0 z-10 bg-[#FAF8F5]/95 backdrop-blur-sm transition-opacity duration-500 ${mounted ? 'opacity-100' : 'opacity-0'}`}
      >
        <div className="max-w-5xl mx-auto px-6 sm:px-10 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="block w-6 h-px bg-[#C8906A]" />
            <h1
              style={{ fontFamily: "'Cormorant Garamond', serif", letterSpacing: '0.16em' }}
              className="text-xl sm:text-2xl font-light uppercase"
            >
              Virtual Wardrobe
            </h1>
          </div>

          <button onClick={handleLogout} className="relative group py-1">
            <span
              style={{ fontFamily: "'Jost', sans-serif", letterSpacing: '0.14em' }}
              className="text-xs uppercase text-[#6B6B67] group-hover:text-[#1A1A18] transition-colors duration-200"
            >
              Logout
            </span>
            <span className="absolute bottom-0 left-0 h-px w-0 bg-[#1A1A18] group-hover:w-full transition-all duration-300 ease-out" />
          </button>
        </div>
      </header>

      {/* ── Main ── */}
      <main className="max-w-5xl mx-auto px-6 sm:px-10 py-14 sm:py-20">
        {/* Page heading */}
        <div
          className={`mb-14 transition-all duration-700 delay-100 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
        >
          <p style={{ letterSpacing: '0.24em' }} className="text-xs uppercase text-[#C8906A] mb-4">
            My Collection
          </p>
          <h2
            style={{ fontFamily: "'Cormorant Garamond', serif" }}
            className="text-5xl sm:text-7xl font-light leading-none"
          >
            Your Wardrobe
          </h2>
          <div className="mt-6 flex items-center gap-4">
            <div className="w-10 h-px bg-[#C8906A]" />
            <span style={{ letterSpacing: '0.08em' }} className="text-sm text-[#9A9590] font-light">
              {garments.length} {garments.length === 1 ? 'piece' : 'pieces'}
            </span>
          </div>
        </div>

        {/* Clothing grid area */}
        <div
          className={`transition-all duration-700 delay-200 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
        >
          <div
            style={{ borderBottom: '1px solid #E8E4DF' }}
            className="flex items-center justify-between pb-3 mb-8"
          >
            <span style={{ letterSpacing: '0.18em' }} className="text-xs uppercase text-[#A09A93]">
              Clothing Items
            </span>
            <span className="text-xs text-[#C8C4BE]">—</span>
          </div>

          <GarmentGrid
            garments={garments}
            loading={loading}
            error={error}
            onRetry={handleRetry}
          />
        </div>
      </main>
    </div>
  )
}

export default Dashboard
