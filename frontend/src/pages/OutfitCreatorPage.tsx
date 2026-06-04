import { useEffect, useState } from 'react'
import MainLayout from '../components/MainLayout'
import CategoryRow from '../components/outfit/CategoryRow'
import OutfitPreviewPanel from '../components/outfit/OutfitPreviewPanel'
import { Category, type Garment } from '../types/garment'
import { CATEGORY_CONFIG } from '../constants/outfitCategories'
import * as garmentService from '../services/garmentService'
import * as outfitService from '../services/outfitService'

const EMPTY_BY_CATEGORY: Record<Category, Garment[]> = {
  [Category.HEAD]:        [],
  [Category.TOP]:         [],
  [Category.BOTTOM]:      [],
  [Category.SHOES]:       [],
  [Category.ACCESSORIES]: [],
}

const Spinner = () => (
  <div className="flex justify-center items-center py-24">
    <div
      style={{ borderColor: '#DDD8D0', borderTopColor: '#C8906A' }}
      className="w-8 h-8 rounded-full border-2 animate-spin"
    />
  </div>
)

const OutfitCreatorPage = () => {
  const [mounted, setMounted] = useState(false)
  const [garmentsByCategory, setGarmentsByCategory] = useState<Record<Category, Garment[]>>(EMPTY_BY_CATEGORY)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)
  const [selectedGarments, setSelectedGarments] = useState<Partial<Record<Category, Garment>>>({})
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 80)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    garmentService
      .getAll()
      .then((data) => {
        const grouped = data.reduce<Record<Category, Garment[]>>(
          (acc, garment) => {
            acc[garment.category].push(garment)
            return acc
          },
          { [Category.HEAD]: [], [Category.TOP]: [], [Category.BOTTOM]: [], [Category.SHOES]: [], [Category.ACCESSORIES]: [] },
        )
        setGarmentsByCategory(grouped)
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

  const handleSelectGarment = (garment: Garment) => {
    setSelectedGarments((prev) => {
      if (prev[garment.category]?.id === garment.id) {
        const next = { ...prev }
        delete next[garment.category]
        return next
      }
      return { ...prev, [garment.category]: garment }
    })
  }

  const handleDeselect = (category: Category) => {
    setSelectedGarments((prev) => {
      const next = { ...prev }
      delete next[category]
      return next
    })
  }

  const handleSave = async (name: string): Promise<boolean> => {
    setIsSaving(true)
    try {
      const garmentIds = Object.values(selectedGarments)
        .filter((g): g is Garment => g !== undefined)
        .map((g) => g.id)
      await outfitService.createOutfit({ name, garmentIds })
      setSelectedGarments({})
      return true
    } catch {
      return false
    } finally {
      setIsSaving(false)
    }
  }

  const panelProps = {
    selectedGarments,
    config: CATEGORY_CONFIG,
    onDeselect: handleDeselect,
    onSave: handleSave,
    isSaving,
  }

  return (
    <MainLayout>
      {/* pb-28 na mobile zostawia miejsce na fixed bottom bar */}
      <main className="max-w-5xl mx-auto px-6 sm:px-10 pt-14 sm:pt-20 pb-28 md:pb-20">
        {/* Nagłówek strony */}
        <div
          className={`mb-14 transition-all duration-700 delay-100 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
        >
          <p style={{ letterSpacing: '0.24em' }} className="text-xs uppercase text-[#C8906A] mb-4">
            Kreator Outfitu
          </p>
          <h2
            style={{ fontFamily: "'Cormorant Garamond', serif" }}
            className="text-5xl sm:text-7xl font-light leading-none"
          >
            Kreator Outfitu
          </h2>
          <div className="mt-6 flex items-center gap-4">
            <div className="w-10 h-px bg-[#C8906A]" />
            <span style={{ letterSpacing: '0.08em' }} className="text-sm text-[#9A9590] font-light">
              Twórz zestawy z Twojej garderoby
            </span>
          </div>
        </div>

        {/* Główny obszar treści */}
        <div
          className={`transition-all duration-700 delay-200 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
        >
          {loading && <Spinner />}

          {!loading && error && (
            <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
              <p style={{ letterSpacing: '0.03em' }} className="text-sm text-[#7A7570]">
                {error}
              </p>
              <button
                onClick={handleRetry}
                style={{ border: '1px solid #C8906A', letterSpacing: '0.14em' }}
                className="text-xs uppercase text-[#C8906A] px-5 py-2 hover:bg-[#C8906A] hover:text-white transition-colors duration-200"
              >
                Spróbuj ponownie
              </button>
            </div>
          )}

          {!loading && !error && (
            <div className="flex gap-8 items-start">
              {/* Rzędy kategorii */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-col gap-8">
                  {CATEGORY_CONFIG.map(({ category, label, icon }) => (
                    <CategoryRow
                      key={category}
                      label={label}
                      icon={icon}
                      garments={garmentsByCategory[category]}
                      selectedGarment={selectedGarments[category]}
                      onSelect={handleSelectGarment}
                    />
                  ))}
                </div>
              </div>

              {/* Sticky sidebar — tylko desktop */}
              <aside className="hidden md:block sticky top-24 self-start w-60 shrink-0">
                <OutfitPreviewPanel {...panelProps} variant="sidebar" />
              </aside>
            </div>
          )}
        </div>
      </main>

      {/* Fixed bottom bar — tylko mobile */}
      {!loading && !error && (
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-20">
          <OutfitPreviewPanel {...panelProps} variant="bar" />
        </div>
      )}
    </MainLayout>
  )
}

export default OutfitCreatorPage
