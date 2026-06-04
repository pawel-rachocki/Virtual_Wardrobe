import { useEffect, useState, type ReactNode } from 'react'
import MainLayout from '../components/MainLayout'
import CategoryRow from '../components/outfit/CategoryRow'
import { Category, type Garment } from '../types/garment'
import * as garmentService from '../services/garmentService'

// ── Category icons ────────────────────────────────────────────────────────────

const HeadIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2C8.13 2 5 5.13 5 9v3l-1 2h16l-1-2V9c0-3.87-3.13-7-7-7z" />
    <path d="M9 20c0 1.1.9 2 2 2h2a2 2 0 002-2v-1H9v1z" />
  </svg>
)

const TopIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.38 3.46L16 2a4 4 0 01-8 0L3.62 3.46a2 2 0 00-1.34 2.23l.58 3.57a1 1 0 00.99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 002-2V10h2.15a1 1 0 00.99-.84l.58-3.57a2 2 0 00-1.34-2.23z" />
  </svg>
)

const BottomIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 2h12l1 8-5 2-2 10-2-10-5-2 1-8z" />
  </svg>
)

const ShoesIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 18h16a2 2 0 002-2v-1a2 2 0 00-2-2h-2L9 6H7L4 13H2v5z" />
    <path d="M14 13l1-4" />
  </svg>
)

const AccessoriesIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3" />
    <path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83" />
  </svg>
)

// ── Config ───────────────────────────────────────────────────────────────────

interface CategoryConfig {
  category: Category
  label: string
  shortLabel: string
  icon: ReactNode
}

const CATEGORY_CONFIG: CategoryConfig[] = [
  { category: Category.HEAD,        label: 'Nakrycia głowy', shortLabel: 'Głowa',   icon: <HeadIcon /> },
  { category: Category.TOP,         label: 'Góra',           shortLabel: 'Góra',    icon: <TopIcon /> },
  { category: Category.BOTTOM,      label: 'Dół',            shortLabel: 'Dół',     icon: <BottomIcon /> },
  { category: Category.SHOES,       label: 'Obuwie',         shortLabel: 'Obuwie',  icon: <ShoesIcon /> },
  { category: Category.ACCESSORIES, label: 'Dodatki',        shortLabel: 'Dodatki', icon: <AccessoriesIcon /> },
]

const EMPTY_BY_CATEGORY: Record<Category, Garment[]> = {
  [Category.HEAD]:        [],
  [Category.TOP]:         [],
  [Category.BOTTOM]:      [],
  [Category.SHOES]:       [],
  [Category.ACCESSORIES]: [],
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const Spinner = () => (
  <div className="flex justify-center items-center py-24">
    <div
      style={{ borderColor: '#DDD8D0', borderTopColor: '#C8906A' }}
      className="w-8 h-8 rounded-full border-2 animate-spin"
    />
  </div>
)

const PlaceholderHanger = () => (
  <svg width="24" height="21" viewBox="0 0 64 56" fill="none">
    <path d="M6 48 Q16 30 32 20 Q48 30 58 48" stroke="#C8C4BE" strokeWidth="1.5" strokeLinecap="round" fill="none" />
    <line x1="6" y1="48" x2="58" y2="48" stroke="#C8C4BE" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M32 20 Q32 10 40 10 Q48 10 42 20" stroke="#C8C4BE" strokeWidth="1.5" strokeLinecap="round" fill="none" />
  </svg>
)

// ── Outfit preview panel ──────────────────────────────────────────────────────

interface OutfitPreviewPanelProps {
  selectedGarments: Partial<Record<Category, Garment>>
  config: CategoryConfig[]
  mounted: boolean
}

const OutfitPreviewPanel = ({ selectedGarments, config, mounted }: OutfitPreviewPanelProps) => {
  const selectedCount = Object.keys(selectedGarments).length

  return (
    <div
      className={`mt-16 transition-all duration-700 delay-300 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
    >
      {/* Divider */}
      <div style={{ borderTop: '1px solid #E8E4DF' }} className="mb-10" />

      {/* Section header */}
      <div className="flex items-end justify-between mb-8">
        <div>
          <p style={{ letterSpacing: '0.24em' }} className="text-xs uppercase text-[#C8906A] mb-3">
            Podgląd
          </p>
          <h3
            style={{ fontFamily: "'Cormorant Garamond', serif" }}
            className="text-4xl font-light leading-none"
          >
            Twój outfit
          </h3>
        </div>
        <span
          style={{ letterSpacing: '0.08em' }}
          className="text-sm text-[#9A9590] font-light pb-1"
        >
          {selectedCount === 0 ? 'Wybierz ubrania powyżej' : `${selectedCount} z 5 elementów`}
        </span>
      </div>

      {/* Slots */}
      <div className="flex gap-4">
        {config.map(({ category, shortLabel, icon }) => {
          const garment = selectedGarments[category]
          const isOccupied = !!garment

          return (
            <div key={category} className="flex flex-col items-center gap-2.5" style={{ flex: '1 1 0', minWidth: 0 }}>
              {/* Card slot */}
              <div
                style={{
                  width: '100%',
                  aspectRatio: '3/4',
                  border: isOccupied ? '1.5px solid #C8906A' : '1px dashed #DDD8D0',
                  backgroundColor: isOccupied ? '#FFFFFF' : '#FAFAF9',
                  borderRadius: '2px',
                  overflow: 'hidden',
                  position: 'relative',
                  transition: 'border-color 300ms ease, box-shadow 300ms ease',
                  boxShadow: isOccupied ? '0 4px 20px rgba(200, 144, 106, 0.14)' : 'none',
                }}
                className="flex items-center justify-center"
              >
                {isOccupied ? (
                  <>
                    {garment.imageUrl ? (
                      <img
                        src={garment.imageUrl}
                        alt={garment.name}
                        className="w-full h-full object-cover"
                        style={{ transition: 'opacity 300ms ease' }}
                      />
                    ) : (
                      <div className="flex items-center justify-center w-full h-full" style={{ backgroundColor: '#F5F2EE' }}>
                        <PlaceholderHanger />
                      </div>
                    )}
                    {/* Warm tint overlay */}
                    <div
                      style={{
                        position: 'absolute',
                        inset: 0,
                        backgroundColor: 'rgba(200, 144, 106, 0.05)',
                        pointerEvents: 'none',
                      }}
                    />
                  </>
                ) : (
                  <span style={{ color: '#D4CFC9', opacity: 0.7 }}>{icon}</span>
                )}
              </div>

              {/* Label */}
              <div className="flex items-center gap-1.5 w-full justify-center">
                <span style={{ color: isOccupied ? '#C8906A' : '#C8C4BE', transition: 'color 300ms ease' }}>
                  {icon}
                </span>
                <span
                  style={{
                    letterSpacing: '0.12em',
                    color: isOccupied ? '#7A7570' : '#C8C4BE',
                    transition: 'color 300ms ease',
                  }}
                  className="text-xs uppercase truncate"
                >
                  {shortLabel}
                </span>
              </div>

              {/* Garment name */}
              <div style={{ minHeight: '18px' }} className="w-full text-center">
                {isOccupied && (
                  <p
                    style={{ fontFamily: "'Cormorant Garamond', serif" }}
                    className="text-sm font-light text-[#1A1A18] truncate"
                    title={garment.name}
                  >
                    {garment.name}
                  </p>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

const OutfitCreatorPage = () => {
  const [mounted, setMounted] = useState(false)
  const [garmentsByCategory, setGarmentsByCategory] = useState<Record<Category, Garment[]>>(EMPTY_BY_CATEGORY)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)
  const [selectedGarments, setSelectedGarments] = useState<Partial<Record<Category, Garment>>>({})

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

  return (
    <MainLayout>
      <main className="max-w-5xl mx-auto px-6 sm:px-10 py-14 sm:py-20">
        {/* Page heading */}
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

        {/* Category rows */}
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
            <>
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

              <OutfitPreviewPanel
                selectedGarments={selectedGarments}
                config={CATEGORY_CONFIG}
                mounted={mounted}
              />
            </>
          )}
        </div>
      </main>
    </MainLayout>
  )
}

export default OutfitCreatorPage
