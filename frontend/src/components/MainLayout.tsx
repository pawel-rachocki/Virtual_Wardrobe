import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'

const NAV_LINKS = [
  { label: 'Twoja Garderoba', to: '/dashboard' },
  { label: 'Kreator Outfitu', to: '/outfit-creator' },
  { label: 'Profil', to: '/profile' },
]

interface Props {
  children: React.ReactNode
}

const MainLayout = ({ children }: Props) => {
  const [mounted, setMounted] = useState(false)
  const location = useLocation()
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

  const handleLogout = () => {
    localStorage.removeItem('token')
    navigate('/login')
  }

  return (
    <div
      style={{ fontFamily: "'Jost', sans-serif", backgroundColor: '#FAF8F5' }}
      className="min-h-screen text-[#1A1A18]"
    >
      <header
        style={{ borderBottom: '1px solid #E8E4DF' }}
        className={`sticky top-0 z-10 bg-[#FAF8F5]/95 backdrop-blur-sm transition-opacity duration-500 ${mounted ? 'opacity-100' : 'opacity-0'}`}
      >
        <div className="max-w-5xl mx-auto px-6 sm:px-10 py-5 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <span className="block w-6 h-px bg-[#C8906A]" />
            <h1
              style={{ fontFamily: "'Cormorant Garamond', serif", letterSpacing: '0.16em' }}
              className="text-xl sm:text-2xl font-light uppercase"
            >
              Virtual Wardrobe
            </h1>
          </div>

          {/* Navigation + Logout */}
          <div className="flex items-center gap-8">
            <nav className="flex items-center gap-6">
              {NAV_LINKS.map(({ label, to }) => {
                const isActive = location.pathname === to
                return (
                  <Link key={to} to={to} className="relative group py-1">
                    <span
                      style={{ fontFamily: "'Jost', sans-serif", letterSpacing: '0.14em' }}
                      className={`text-xs uppercase transition-colors duration-200 ${
                        isActive ? 'text-[#1A1A18]' : 'text-[#6B6B67] group-hover:text-[#1A1A18]'
                      }`}
                    >
                      {label}
                    </span>
                    <span
                      className={`absolute bottom-0 left-0 h-px bg-[#1A1A18] transition-all duration-300 ease-out ${
                        isActive ? 'w-full' : 'w-0 group-hover:w-full'
                      }`}
                    />
                  </Link>
                )
              })}
            </nav>

            <button onClick={handleLogout} className="relative group py-1">
              <span
                style={{ fontFamily: "'Jost', sans-serif", letterSpacing: '0.14em' }}
                className="text-xs uppercase text-[#6B6B67] group-hover:text-[#1A1A18] transition-colors duration-200"
              >
                Wyloguj
              </span>
              <span className="absolute bottom-0 left-0 h-px w-0 bg-[#1A1A18] group-hover:w-full transition-all duration-300 ease-out" />
            </button>
          </div>
        </div>
      </header>

      {children}
    </div>
  )
}

export default MainLayout
