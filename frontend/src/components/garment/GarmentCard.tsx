import type { Garment } from '../../types/garment'

const PlaceholderHanger = () => (
  <svg width="48" height="42" viewBox="0 0 64 56" fill="none" xmlns="http://www.w3.org/2000/svg">
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

interface GarmentCardProps {
  garment: Garment
  onClick?: () => void
}

const MAX_TAGS = 3

const GarmentCard = ({ garment, onClick }: GarmentCardProps) => {
  const visibleTags = garment.tags.slice(0, MAX_TAGS)
  const overflowCount = garment.tags.length - MAX_TAGS

  return (
    <div
      onClick={onClick}
      style={{
        border: '1px solid #E8E4DF',
        backgroundColor: '#FFFFFF',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'transform 200ms ease, box-shadow 200ms ease',
      }}
      className="rounded-sm hover:-translate-y-1 hover:shadow-md"
    >
      {/* Image */}
      <div
        style={{ backgroundColor: '#F5F2EE', aspectRatio: '4/5' }}
        className="relative overflow-hidden rounded-t-sm"
      >
        {garment.imageUrl ? (
          <img src={garment.imageUrl} alt={garment.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <PlaceholderHanger />
          </div>
        )}

        <span
          style={{
            fontFamily: "'Jost', sans-serif",
            backgroundColor: '#C8906A',
            letterSpacing: '0.14em',
          }}
          className="absolute top-3 left-3 text-white text-[10px] uppercase px-2 py-0.5 rounded-sm"
        >
          {garment.category}
        </span>
      </div>

      {/* Info */}
      <div className="px-4 py-3 flex flex-col gap-1.5">
        <div>
          <h3
            style={{ fontFamily: "'Cormorant Garamond', serif" }}
            className="text-lg font-light leading-tight text-[#1A1A18]"
          >
            {garment.name}
          </h3>
          <p
            style={{ letterSpacing: '0.04em' }}
            className="text-xs text-[#7A7773] font-light mt-0.5"
          >
            {garment.brand}
          </p>
        </div>

        <p style={{ letterSpacing: '0.03em' }} className="text-xs text-[#9A9590]">
          {garment.color}
        </p>

        {garment.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-0.5">
            {visibleTags.map((tag) => (
              <span
                key={tag}
                style={{ border: '1px solid #DDD8D0', letterSpacing: '0.06em' }}
                className="text-[10px] text-[#9A9590] px-2 py-0.5 rounded-sm"
              >
                {tag}
              </span>
            ))}
            {overflowCount > 0 && (
              <span style={{ letterSpacing: '0.06em' }} className="text-[10px] text-[#C8906A]">
                +{overflowCount}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default GarmentCard
