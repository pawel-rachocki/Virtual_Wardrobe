import { useState, useEffect } from 'react'
import type { Outfit } from '../../types/outfit'
import * as outfitService from '../../services/outfitService'

interface Props {
  outfit: Outfit
  onClose: () => void
  onSuccess: () => void
}

const DeleteOutfitDialog = ({ outfit, onClose, onSuccess }: Props) => {
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [])

  const handleConfirm = async () => {
    setSubmitting(true)
    setError(null)
    try {
      await outfitService.deleteOutfit(outfit.id)
      onSuccess()
    } catch {
      setError('Nie udało się usunąć outfitu. Spróbuj ponownie.')
      setSubmitting(false)
    }
  }

  return (
    <div
      onClick={() => {
        if (!submitting) onClose()
      }}
      style={{ backgroundColor: 'rgba(0,0,0,0.4)', zIndex: 50 }}
      className="fixed inset-0 flex items-center justify-center p-4 backdrop-blur-sm"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          fontFamily: "'Jost', sans-serif",
          backgroundColor: '#FAF8F5',
          border: '1px solid #E8E4DF',
          width: '100%',
          maxWidth: 420,
        }}
        className="rounded-sm"
      >
        {/* Header */}
        <div
          style={{ borderBottom: '1px solid #E8E4DF' }}
          className="flex items-center justify-between px-7 py-5"
        >
          <h2
            style={{ fontFamily: "'Cormorant Garamond', serif", letterSpacing: '0.14em' }}
            className="text-xl font-light uppercase text-[#1A1A18]"
          >
            Usuń outfit
          </h2>
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            style={{ color: '#9A9590' }}
            className="text-xl leading-none hover:text-[#1A1A18] transition-colors disabled:opacity-40"
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div className="px-7 py-6 flex flex-col gap-6">
          <p style={{ letterSpacing: '0.03em' }} className="text-sm text-[#4A4A47] leading-relaxed">
            Czy na pewno chcesz usunąć{' '}
            <span className="font-medium text-[#1A1A18]">„{outfit.name}"</span>?
            <span
              style={{ letterSpacing: '0.02em' }}
              className="text-xs text-[#9A9590] mt-1.5 block"
            >
              Tej operacji nie można cofnąć.
            </span>
          </p>

          {error && (
            <div
              style={{ border: '1px solid #F5C6C6', backgroundColor: '#FDF2F2' }}
              className="rounded-sm px-4 py-3"
            >
              <p style={{ letterSpacing: '0.02em' }} className="text-xs text-[#C0392B]">
                {error}
              </p>
            </div>
          )}

          <div className="flex gap-3 justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              style={{ border: '1px solid #DDD8D0', letterSpacing: '0.14em' }}
              className="text-xs uppercase text-[#6B6B67] px-5 py-2.5 hover:bg-[#F0EDE8] transition-colors duration-200 disabled:opacity-40"
            >
              Anuluj
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={submitting}
              style={{ letterSpacing: '0.14em' }}
              className="text-xs uppercase text-white bg-[#B91C1C] px-5 py-2.5 hover:bg-[#991B1B] transition-colors duration-200 disabled:opacity-60 flex items-center gap-2"
            >
              {submitting && (
                <span
                  style={{ borderColor: 'rgba(255,255,255,0.3)', borderTopColor: 'white' }}
                  className="w-3 h-3 rounded-full border animate-spin"
                />
              )}
              Usuń
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DeleteOutfitDialog
