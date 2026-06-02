import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

const HangerIcon = () => (
  <svg width="64" height="56" viewBox="0 0 64 56" fill="none" xmlns="http://www.w3.org/2000/svg">
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

const Dashboard = () => {
  const navigate = useNavigate()
  const [mounted, setMounted] = useState(false)

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
          <p
            style={{ letterSpacing: '0.24em' }}
            className="text-xs uppercase text-[#C8906A] mb-4"
          >
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
              0 pieces
            </span>
          </div>
        </div>

        {/* Clothing grid area */}
        <div
          className={`transition-all duration-700 delay-200 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
        >
          {/* Section label */}
          <div
            style={{ borderBottom: '1px solid #E8E4DF' }}
            className="flex items-center justify-between pb-3 mb-8"
          >
            <span style={{ letterSpacing: '0.18em' }} className="text-xs uppercase text-[#A09A93]">
              Clothing Items
            </span>
            <span className="text-xs text-[#C8C4BE]">—</span>
          </div>

          {/* Placeholder container */}
          <div style={{ borderColor: '#DDD8D0' }} className="border border-dashed rounded-sm">
            {/* Ghost grid preview hinting at future cards */}
            <div
              style={{ borderBottom: '1px dashed #DDD8D0' }}
              className="grid grid-cols-3 gap-px bg-[#DDD8D0] overflow-hidden rounded-t-sm"
            >
              {([0.15, 0.1, 0.07] as const).map((opacity, i) => (
                <div
                  key={i}
                  style={{ backgroundColor: `rgba(200, 144, 106, ${opacity})` }}
                  className="aspect-[3/4]"
                />
              ))}
            </div>

            {/* Empty state message */}
            <div className="flex flex-col items-center justify-center py-16 px-8 text-center gap-6">
              <div style={{ opacity: 0.55 }}>
                <HangerIcon />
              </div>
              <div className="max-w-sm">
                <p
                  style={{ fontFamily: "'Cormorant Garamond', serif" }}
                  className="text-2xl sm:text-3xl font-light italic mb-3"
                >
                  Your closet awaits
                </p>
                <p style={{ letterSpacing: '0.03em' }} className="text-sm text-[#7A7570] font-light leading-relaxed">
                  Your clothing pieces will appear here. Start building your digital wardrobe.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default Dashboard
