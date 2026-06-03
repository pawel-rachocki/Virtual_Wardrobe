import type { Garment } from '../../types/garment'
import GarmentCard from './GarmentCard'

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

const Spinner = () => (
  <div className="flex justify-center items-center py-24">
    <div
      style={{ borderColor: '#DDD8D0', borderTopColor: '#C8906A' }}
      className="w-8 h-8 rounded-full border-2 animate-spin"
    />
  </div>
)

interface GarmentGridProps {
  garments: Garment[]
  loading: boolean
  error: string | null
  onRetry: () => void
  onEdit?: (garment: Garment) => void
}

const GarmentGrid = ({ garments, loading, error, onRetry, onEdit }: GarmentGridProps) => {
  if (loading) return <Spinner />

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
        <p style={{ letterSpacing: '0.03em' }} className="text-sm text-[#7A7570]">
          {error}
        </p>
        <button
          onClick={onRetry}
          style={{ border: '1px solid #C8906A', letterSpacing: '0.14em' }}
          className="text-xs uppercase text-[#C8906A] px-5 py-2 hover:bg-[#C8906A] hover:text-white transition-colors duration-200"
        >
          Spróbuj ponownie
        </button>
      </div>
    )
  }

  if (garments.length === 0) {
    return (
      <div style={{ borderColor: '#DDD8D0' }} className="border border-dashed rounded-sm">
        <div className="flex flex-col items-center justify-center py-16 px-8 text-center gap-6">
          <div style={{ opacity: 0.55 }}>
            <HangerIcon />
          </div>
          <div className="max-w-sm">
            <p
              style={{ fontFamily: "'Cormorant Garamond', serif" }}
              className="text-2xl sm:text-3xl font-light italic mb-3"
            >
              Twoja szafa czeka
            </p>
            <p
              style={{ letterSpacing: '0.03em' }}
              className="text-sm text-[#7A7570] font-light leading-relaxed"
            >
              Dodaj pierwsze ubranie i zacznij budować swoją cyfrową garderobę.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '24px' }}
      className="grid"
    >
      {garments.map((garment) => (
        <GarmentCard
          key={garment.id}
          garment={garment}
          onEdit={onEdit ? () => onEdit(garment) : undefined}
        />
      ))}
    </div>
  )
}

export default GarmentGrid
