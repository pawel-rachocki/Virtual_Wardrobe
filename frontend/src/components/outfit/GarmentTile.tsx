import { useState } from 'react'
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

const CheckMark = () => (
  <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
    <polyline
      points="1,3.5 3.2,6 8,1"
      stroke="white"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

export interface GarmentTileProps {
  garment: Garment
  isSelected: boolean
  onSelect: (garment: Garment) => void
}

const GarmentTile = ({ garment, isSelected, onSelect }: GarmentTileProps) => {
  const [hovered, setHovered] = useState(false)

  const borderColor = isSelected ? '#C8906A' : hovered ? '#C8906A' : '#E8E4DF'
  const borderWidth = isSelected ? '1.5px' : '1px'
  const translateY = isSelected ? '-4px' : hovered ? '-2px' : '0'
  const shadow = isSelected
    ? '0 6px 20px rgba(200, 144, 106, 0.22)'
    : hovered
      ? '0 2px 8px rgba(0,0,0,0.06)'
      : 'none'

  return (
    <div
      onClick={() => onSelect(garment)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        border: `${borderWidth} solid ${borderColor}`,
        backgroundColor: '#FFFFFF',
        minWidth: '100px',
        maxWidth: '100px',
        scrollSnapAlign: 'start',
        flexShrink: 0,
        position: 'relative',
        transform: `translateY(${translateY})`,
        boxShadow: shadow,
        transition: 'border-color 200ms ease, transform 200ms ease, box-shadow 200ms ease',
        cursor: 'pointer',
      }}
      className="rounded-sm"
    >
      {/* Selection badge */}
      <div
        style={{
          position: 'absolute',
          top: '6px',
          right: '6px',
          width: '18px',
          height: '18px',
          backgroundColor: '#C8906A',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10,
          boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
          opacity: isSelected ? 1 : 0,
          transform: isSelected ? 'scale(1)' : 'scale(0.6)',
          transition: 'opacity 180ms ease, transform 180ms ease',
          pointerEvents: 'none',
        }}
      >
        <CheckMark />
      </div>

      {/* Image */}
      <div
        style={{ backgroundColor: '#F5F2EE', aspectRatio: '3/4', position: 'relative' }}
        className="overflow-hidden rounded-t-sm flex items-center justify-center"
      >
        {garment.imageUrl ? (
          <img src={garment.imageUrl} alt={garment.name} className="w-full h-full object-cover" />
        ) : (
          <PlaceholderHanger />
        )}
        {/* Warm selection overlay */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundColor: 'rgba(200, 144, 106, 0.09)',
            opacity: isSelected ? 1 : 0,
            transition: 'opacity 200ms ease',
            pointerEvents: 'none',
          }}
        />
      </div>

      {/* Name */}
      <div className="px-2 py-1.5">
        <p
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            color: isSelected ? '#C8906A' : '#1A1A18',
            transition: 'color 200ms ease',
          }}
          className="text-sm font-light leading-tight truncate"
        >
          {garment.name}
        </p>
      </div>
    </div>
  )
}

export default GarmentTile
