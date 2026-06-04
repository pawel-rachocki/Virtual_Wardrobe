import { useEffect, useState } from 'react'
import MainLayout from '../components/MainLayout'
import BasePhotoUpload from '../components/profile/BasePhotoUpload'

const Profile = () => {
  const [mounted, setMounted] = useState(false)
  const [basePhotoUrl, setBasePhotoUrl] = useState<string | null>(null)
  const [successVisible, setSuccessVisible] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 80)
    return () => clearTimeout(timer)
  }, [])

  const handleUploadSuccess = (url: string) => {
    setBasePhotoUrl(url)
    setSuccessVisible(true)
    setTimeout(() => setSuccessVisible(false), 3000)
  }

  return (
    <MainLayout>
      <main className="max-w-5xl mx-auto px-6 sm:px-10 py-14 sm:py-20">
        {/* Page heading */}
        <div
          className={`mb-14 transition-all duration-700 delay-100 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
        >
          <p style={{ letterSpacing: '0.24em' }} className="text-xs uppercase text-[#C8906A] mb-4">
            Ustawienia
          </p>
          <h2
            style={{ fontFamily: "'Cormorant Garamond', serif" }}
            className="text-5xl sm:text-7xl font-light leading-none"
          >
            Profil
          </h2>
          <div className="mt-6 w-10 h-px bg-[#C8906A]" />
        </div>

        {/* Base photo section */}
        <div
          className={`transition-all duration-700 delay-200 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
        >
          <div style={{ borderBottom: '1px solid #E8E4DF' }} className="pb-3 mb-8">
            <span style={{ letterSpacing: '0.18em' }} className="text-xs uppercase text-[#A09A93]">
              Zdjęcie bazowe
            </span>
          </div>

          <p
            style={{ fontFamily: "'Jost', sans-serif", letterSpacing: '0.04em' }}
            className="text-sm text-[#6B6B67] mb-8 max-w-sm"
          >
            To zdjęcie jest używane jako baza do wirtualnej przymiarzalni.
          </p>

          <BasePhotoUpload
            currentPhotoUrl={basePhotoUrl ?? undefined}
            onSuccess={handleUploadSuccess}
          />

          {/* Success message */}
          <p
            style={{
              fontFamily: "'Jost', sans-serif",
              letterSpacing: '0.08em',
              marginTop: 16,
              opacity: successVisible ? 1 : 0,
              transition: 'opacity 0.4s ease',
            }}
            className="text-xs uppercase text-[#5A8A6A]"
          >
            Zdjęcie zostało zapisane
          </p>
        </div>
      </main>
    </MainLayout>
  )
}

export default Profile
