import type { ReactNode } from 'react'
import type { Garment } from '../../types/garment'

const PlaceholderHanger = () => (
  <svg width="32" height="28" viewBox="0 0 64 56" fill="none">
    <path
      d="M6 48 Q16 30 32 20 Q48 30 58 48"
      stroke="#C8C4BE"
      strokeWidth="1.5"
      strokeLinecap="round"
      fill="none"
    />
    <line x1="6" y1="48" x2="58" y2="48" stroke="#C8C4BE" strokeWidth="1.5" strokeLinecap="round" />
    <path
      d="M32 20 Q32 10 40 10 Q48 10 42 20"
      stroke="#C8C4BE"
      strokeWidth="1.5"
      strokeLinecap="round"
      fill="none"
    />
  </svg>
)

interface GarmentMiniCardProps {
  garment: Garment
}

const GarmentMiniCard = ({ garment }: GarmentMiniCardProps) => (
  <div
    style={{
      border: '1px solid #E8E4DF',
      backgroundColor: '#FFFFFF',
      minWidth: '100px',
      maxWidth: '100px',
      transition: 'border-color 200ms ease, transform 200ms ease',
    }}
    className="flex-shrink-0 rounded-sm cursor-pointer hover:border-[#C8906A] hover:-translate-y-0.5"
  >
    <div
      style={{ backgroundColor: '#F5F2EE', aspectRatio: '3/4' }}
      className="overflow-hidden rounded-t-sm flex items-center justify-center"
    >
      {garment.imageUrl ? (
        <img src={garment.imageUrl} alt={garment.name} className="w-full h-full object-cover" />
      ) : (
        <PlaceholderHanger />
      )}
    </div>
    <div className="px-2 py-1.5">
      <p
        style={{ fontFamily: "'Cormorant Garamond', serif" }}
        className="text-sm font-light leading-tight text-[#1A1A18] truncate"
      >
        {garment.name}
      </p>
    </div>
  </div>
)

interface CategoryRowProps {
  label: string
  icon: ReactNode
  garments: Garment[]
}

const CategoryRow = ({ label, icon, garments }: CategoryRowProps) => (
  <div>
    {/* Header */}
    <div
      style={{ borderBottom: '1px solid #E8E4DF' }}
      className="flex items-center gap-2.5 pb-3 mb-4"
    >
      <span className="text-[#C8906A]">{icon}</span>
      <span
        style={{ letterSpacing: '0.18em' }}
        className="text-xs uppercase text-[#A09A93]"
      >
        {label}
      </span>
      <span
        style={{ letterSpacing: '0.08em' }}
        className="text-xs text-[#C8C4BE] ml-auto"
      >
        {garments.length > 0 ? `${garments.length}` : ''}
      </span>
    </div>

    {/* Content */}
    {garments.length === 0 ? (
      <div className="py-6 flex items-center justify-center">
        <p
          style={{ fontFamily: "'Cormorant Garamond', serif", letterSpacing: '0.04em' }}
          className="text-base italic font-light text-[#A09A93]"
        >
          Brak ubrań w tej kategorii
        </p>
      </div>
    ) : (
      <div className="flex gap-3 overflow-x-auto pb-2" style={{ scrollbarWidth: 'thin', scrollbarColor: '#E8E4DF transparent' }}>
        {garments.map((garment) => (
          <GarmentMiniCard key={garment.id} garment={garment} />
        ))}
      </div>
    )}
  </div>
)

export default CategoryRow
