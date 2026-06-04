import { useEffect, useState } from 'react'
import type { Outfit } from '../../types/outfit'
import * as outfitService from '../../services/outfitService'
import DeleteOutfitDialog from './DeleteOutfitDialog'

const MiniHanger = () => (
  <svg width="12" height="10" viewBox="0 0 64 56" fill="none">
    <path d="M6 48 Q16 30 32 20 Q48 30 58 48" stroke="#C8C4BE" strokeWidth="2" strokeLinecap="round" fill="none" />
    <line x1="6" y1="48" x2="58" y2="48" stroke="#C8C4BE" strokeWidth="2" strokeLinecap="round" />
    <path d="M32 20 Q32 10 40 10 Q48 10 42 20" stroke="#C8C4BE" strokeWidth="2" strokeLinecap="round" fill="none" />
  </svg>
)

const TrashIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
    <path d="M10 11v6M14 11v6" />
    <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" />
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

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('pl-PL', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

const SavedOutfitsList = () => {
  const [outfits, setOutfits] = useState<Outfit[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [outfitToDelete, setOutfitToDelete] = useState<Outfit | null>(null)
  const [fetchKey, setFetchKey] = useState(0)

  useEffect(() => {
    outfitService
      .getOutfits()
      .then((data) => {
        setOutfits(data)
        setLoading(false)
      })
      .catch(() => {
        setError('Nie udało się załadować outfitów. Sprawdź połączenie i spróbuj ponownie.')
        setLoading(false)
      })
  }, [fetchKey])

  const handleDeleteSuccess = (id: string) => {
    setOutfits((prev) => prev.filter((o) => o.id !== id))
    setOutfitToDelete(null)
  }

  if (loading) return <Spinner />

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
        <p style={{ letterSpacing: '0.03em' }} className="text-sm text-[#7A7570]">
          {error}
        </p>
        <button
          onClick={() => { setError(null); setLoading(true); setFetchKey((k) => k + 1) }}
          style={{ border: '1px solid #C8906A', letterSpacing: '0.14em' }}
          className="text-xs uppercase text-[#C8906A] px-5 py-2 hover:bg-[#C8906A] hover:text-white transition-colors duration-200"
        >
          Spróbuj ponownie
        </button>
      </div>
    )
  }

  if (outfits.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3 text-center">
        <div style={{ color: '#D4CFC9' }}>
          <svg width="36" height="30" viewBox="0 0 64 56" fill="none">
            <path d="M6 48 Q16 30 32 20 Q48 30 58 48" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" />
            <line x1="6" y1="48" x2="58" y2="48" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <path d="M32 20 Q32 10 40 10 Q48 10 42 20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" />
          </svg>
        </div>
        <p
          style={{ fontFamily: "'Cormorant Garamond', serif" }}
          className="text-2xl font-light text-[#1A1A18]"
        >
          Nie masz jeszcze żadnych outfitów
        </p>
        <p style={{ letterSpacing: '0.05em' }} className="text-xs text-[#9A9590]">
          Przejdź do Kreatora i stwórz swój pierwszy zestaw
        </p>
      </div>
    )
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {outfits.map((outfit) => (
          <OutfitCard
            key={outfit.id}
            outfit={outfit}
            onDeleteClick={() => setOutfitToDelete(outfit)}
          />
        ))}
      </div>

      {outfitToDelete && (
        <DeleteOutfitDialog
          outfit={outfitToDelete}
          onClose={() => setOutfitToDelete(null)}
          onSuccess={() => handleDeleteSuccess(outfitToDelete.id)}
        />
      )}
    </>
  )
}

interface CardProps {
  outfit: Outfit
  onDeleteClick: () => void
}

const OutfitCard = ({ outfit, onDeleteClick }: CardProps) => {
  const garments = outfit.garments.slice(0, 5)

  return (
    <div
      style={{
        backgroundColor: '#FFFFFF',
        border: '1px solid #E8E4DF',
        boxShadow: '0 2px 12px rgba(26,26,24,0.04)',
      }}
      className="group flex flex-col"
    >
      {/* Miniaturki */}
      <div
        style={{
          padding: '16px 16px 14px',
          borderBottom: '1px solid #F0EDE8',
          display: 'flex',
          gap: '6px',
          alignItems: 'flex-end',
        }}
      >
        {garments.map((garment) => (
          <div
            key={garment.id}
            style={{
              width: '40px',
              height: '52px',
              border: '1px solid #E8E4DF',
              backgroundColor: '#FAFAF9',
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            {garment.imageUrl ? (
              <img src={garment.imageUrl} alt={garment.name} className="w-full h-full object-cover" />
            ) : (
              <MiniHanger />
            )}
          </div>
        ))}
        {/* Puste sloty jeśli mniej niż 5 ubrań */}
        {Array.from({ length: Math.max(0, 5 - garments.length) }).map((_, i) => (
          <div
            key={`empty-${i}`}
            style={{
              width: '40px',
              height: '52px',
              border: '1px dashed #E8E4DF',
              backgroundColor: '#FAFAF9',
              flexShrink: 0,
            }}
          />
        ))}
      </div>

      {/* Info + akcje */}
      <div
        style={{ padding: '12px 16px 14px' }}
        className="flex items-start justify-between gap-3"
      >
        <div style={{ minWidth: 0 }}>
          <p
            style={{ fontFamily: "'Cormorant Garamond', serif" }}
            className="text-lg font-light leading-snug text-[#1A1A18] truncate"
          >
            {outfit.name}
          </p>
          <p style={{ letterSpacing: '0.05em', marginTop: '3px' }} className="text-xs text-[#9A9590]">
            {formatDate(outfit.createdAt)}
          </p>
        </div>

        <button
          type="button"
          onClick={onDeleteClick}
          aria-label={`Usuń outfit ${outfit.name}`}
          style={{ color: '#C8C4BE', flexShrink: 0, padding: '3px' }}
          className="hover:text-[#C87070] transition-colors duration-150 opacity-0 group-hover:opacity-100"
        >
          <TrashIcon />
        </button>
      </div>
    </div>
  )
}

export default SavedOutfitsList
