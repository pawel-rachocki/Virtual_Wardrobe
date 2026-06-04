import { useRef, useEffect, useState, useCallback, type ReactNode } from 'react'
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

const GarmentMiniCard = ({ garment }: { garment: Garment }) => (
  <div
    style={{
      border: '1px solid #E8E4DF',
      backgroundColor: '#FFFFFF',
      minWidth: '100px',
      maxWidth: '100px',
      scrollSnapAlign: 'start',
      flexShrink: 0,
      transition: 'border-color 200ms ease, transform 200ms ease',
    }}
    className="rounded-sm cursor-pointer hover:border-[#C8906A] hover:-translate-y-0.5"
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

const SCROLL_STEP = 336 // ~3 cards (100px + 12px gap each)

const CategoryRow = ({ label, icon, garments }: CategoryRowProps) => {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

  const updateScrollState = useCallback(() => {
    const el = scrollRef.current
    if (!el) return
    setCanScrollLeft(el.scrollLeft > 4)
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4)
  }, [])

  useEffect(() => {
    requestAnimationFrame(updateScrollState)
  }, [garments, updateScrollState])

  // Non-passive wheel listener: translate vertical scroll to horizontal
  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    const handler = (e: WheelEvent) => {
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
        e.preventDefault()
        const multiplier = e.deltaMode === 1 ? 20 : e.deltaMode === 2 ? 300 : 1
        el.scrollLeft += e.deltaY * multiplier
      }
    }
    el.addEventListener('wheel', handler, { passive: false })
    return () => el.removeEventListener('wheel', handler)
  }, [])

  const handleScrollBy = useCallback((amount: number) => {
    scrollRef.current?.scrollBy({ left: amount, behavior: 'smooth' })
  }, [])

  const showPrev = isHovered && canScrollLeft
  const showNext = isHovered && canScrollRight

  const arrowBase: React.CSSProperties = {
    position: 'absolute',
    top: '50%',
    transform: 'translateY(-50%)',
    zIndex: 10,
    width: '28px',
    height: '28px',
    border: '1px solid #E8E4DF',
    backgroundColor: '#FFFFFF',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    boxShadow: '0 1px 6px rgba(0,0,0,0.07)',
    transition: 'opacity 180ms ease, border-color 180ms ease',
  }

  return (
    <div>
      {/* Header */}
      <div
        style={{ borderBottom: '1px solid #E8E4DF' }}
        className="flex items-center gap-2.5 pb-3 mb-4"
      >
        <span className="text-[#C8906A]">{icon}</span>
        <span style={{ letterSpacing: '0.18em' }} className="text-xs uppercase text-[#A09A93]">
          {label}
        </span>
        <span style={{ letterSpacing: '0.08em' }} className="text-xs text-[#C8C4BE] ml-auto">
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
        <div
          className="relative"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* Prev arrow */}
          <button
            onClick={() => handleScrollBy(-SCROLL_STEP)}
            aria-label="Poprzednie ubrania"
            style={{ ...arrowBase, left: '-14px', opacity: showPrev ? 1 : 0, pointerEvents: showPrev ? 'auto' : 'none' }}
            className="hover:border-[#C8906A]"
          >
            <svg width="8" height="12" viewBox="0 0 8 12" fill="none" stroke="#A09A93" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="6,1 2,6 6,11" />
            </svg>
          </button>

          {/* Scroll container */}
          <div
            ref={scrollRef}
            onScroll={updateScrollState}
            className="flex gap-3 pb-2 [&::-webkit-scrollbar]:hidden"
            style={{
              overflowX: 'auto',
              scrollSnapType: 'x mandatory',
              scrollbarWidth: 'none',
            }}
          >
            {garments.map((garment) => (
              <GarmentMiniCard key={garment.id} garment={garment} />
            ))}
          </div>

          {/* Next arrow */}
          <button
            onClick={() => handleScrollBy(SCROLL_STEP)}
            aria-label="Następne ubrania"
            style={{ ...arrowBase, right: '-14px', opacity: showNext ? 1 : 0, pointerEvents: showNext ? 'auto' : 'none' }}
            className="hover:border-[#C8906A]"
          >
            <svg width="8" height="12" viewBox="0 0 8 12" fill="none" stroke="#A09A93" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="2,1 6,6 2,11" />
            </svg>
          </button>
        </div>
      )}
    </div>
  )
}

export default CategoryRow
