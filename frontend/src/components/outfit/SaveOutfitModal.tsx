import { useEffect, useRef, useState } from 'react'

interface SaveOutfitModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (name: string) => Promise<boolean>
  isSaving: boolean
}

const SaveOutfitModal = ({ isOpen, onClose, onSave, isSaving }: SaveOutfitModalProps) => {
  const [name, setName] = useState('')
  const [nameError, setNameError] = useState<string | null>(null)
  const [apiError, setApiError] = useState<string | null>(null)
  const [inputFocused, setInputFocused] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const timer = setTimeout(() => inputRef.current?.focus(), 80)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isSaving) onClose()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, isSaving, onClose])

  if (!isOpen) return null

  const handleSubmit = async () => {
    const trimmed = name.trim()
    if (!trimmed) {
      setNameError('Podaj nazwę outfitu')
      inputRef.current?.focus()
      return
    }
    setNameError(null)
    setApiError(null)
    const ok = await onSave(trimmed)
    if (!ok) {
      setApiError('Nie udało się zapisać outfitu. Spróbuj ponownie.')
    }
  }

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget && !isSaving) onClose()
  }

  const charCount = name.length
  const isNearLimit = charCount >= 45

  const borderColor = nameError ? '#C87070' : inputFocused ? '#C8906A' : '#E8E4DF'

  return (
    <div
      onClick={handleBackdropClick}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(26,24,22,0.52)',
        backdropFilter: 'blur(3px)',
        WebkitBackdropFilter: 'blur(3px)',
        zIndex: 50,
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
      }}
      className="sm:items-center sm:p-6"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: '#FFFFFF',
          width: '100%',
          maxWidth: '460px',
          boxShadow: '0 -12px 56px rgba(26,24,22,0.18), 0 -1px 0 rgba(200,144,106,0.15)',
        }}
        className="sm:shadow-[0_12px_56px_rgba(26,24,22,0.18)] sm:border sm:border-[#E8E4DF]"
      >
        {/* Drag handle — mobile only */}
        <div className="flex justify-center pt-3 sm:hidden">
          <div
            style={{ width: '32px', height: '3px', backgroundColor: '#E0DCD7', borderRadius: '99px' }}
          />
        </div>

        {/* Header */}
        <div style={{ padding: '20px 24px 16px', borderBottom: '1px solid #F0EDE8' }}>
          <div className="flex items-start justify-between gap-4">
            <div>
              <p
                style={{ letterSpacing: '0.22em', fontSize: '10px' }}
                className="uppercase text-[#C8906A] mb-2 font-light"
              >
                Nowy outfit
              </p>
              <h2
                style={{ fontFamily: "'Cormorant Garamond', serif" }}
                className="text-[32px] font-light leading-none text-[#1A1A18]"
              >
                Nazwij swój outfit
              </h2>
            </div>
            <button
              onClick={onClose}
              disabled={isSaving}
              aria-label="Zamknij"
              style={{
                color: '#C8C4BE',
                background: 'none',
                border: 'none',
                fontSize: '24px',
                lineHeight: '1',
                cursor: isSaving ? 'not-allowed' : 'pointer',
                padding: '0 2px',
                marginTop: '-1px',
                flexShrink: 0,
              }}
              className="hover:enabled:text-[#9A9590] transition-colors duration-150"
            >
              ×
            </button>
          </div>
        </div>

        {/* Body */}
        <div style={{ padding: '24px' }}>
          {/* Input */}
          <div style={{ position: 'relative', marginBottom: '4px' }}>
            <input
              ref={inputRef}
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value)
                if (nameError && e.target.value.trim()) setNameError(null)
              }}
              onFocus={() => setInputFocused(true)}
              onBlur={() => setInputFocused(false)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !isSaving) handleSubmit()
              }}
              placeholder="np. Wiosenny casual..."
              maxLength={50}
              disabled={isSaving}
              style={{
                width: '100%',
                padding: '10px 48px 10px 0',
                background: 'transparent',
                border: 'none',
                borderBottom: `1px solid ${borderColor}`,
                outline: 'none',
                fontFamily: "'Cormorant Garamond', serif",
                fontStyle: 'italic',
                fontSize: '22px',
                color: '#1A1A18',
                transition: 'border-color 200ms ease',
              }}
              className="placeholder:text-[#D4CFC9]"
            />
            <span
              style={{
                position: 'absolute',
                right: 0,
                bottom: '13px',
                fontSize: '10px',
                letterSpacing: '0.06em',
                color: isNearLimit ? '#C87070' : '#C8C4BE',
                transition: 'color 200ms ease',
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {charCount} / 50
            </span>
          </div>

          {/* Name validation error */}
          <div style={{ minHeight: '18px', marginBottom: '16px' }}>
            {nameError && (
              <p
                style={{
                  fontSize: '11px',
                  letterSpacing: '0.08em',
                  color: '#C87070',
                  marginTop: '4px',
                }}
              >
                {nameError}
              </p>
            )}
          </div>

          {/* API error */}
          {apiError && (
            <div
              style={{
                padding: '10px 14px',
                backgroundColor: '#FDF6F5',
                border: '1px solid #EDCECE',
                marginBottom: '20px',
              }}
            >
              <p
                style={{
                  fontSize: '11px',
                  letterSpacing: '0.08em',
                  color: '#C87070',
                  lineHeight: 1.6,
                }}
              >
                {apiError}
              </p>
            </div>
          )}

          {/* Actions */}
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={onClose}
              disabled={isSaving}
              style={{
                flexShrink: 0,
                padding: '12px 20px',
                background: 'transparent',
                border: '1px solid #E8E4DF',
                color: '#9A9590',
                letterSpacing: '0.14em',
                fontSize: '10px',
                cursor: isSaving ? 'not-allowed' : 'pointer',
                transition: 'border-color 200ms ease, color 200ms ease',
                whiteSpace: 'nowrap',
              }}
              className="uppercase font-light hover:enabled:border-[#C8C4BE] hover:enabled:text-[#7A7570]"
            >
              Anuluj
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSaving}
              style={{
                flex: 1,
                padding: '12px 16px',
                backgroundColor: isSaving ? '#F0EDE8' : '#1A1A18',
                color: isSaving ? '#C8C4BE' : '#FFFFFF',
                border: 'none',
                letterSpacing: '0.18em',
                fontSize: '10px',
                cursor: isSaving ? 'not-allowed' : 'pointer',
                transition: 'background-color 250ms ease, color 250ms ease',
              }}
              className="uppercase font-light hover:enabled:bg-[#C8906A]"
            >
              {isSaving ? 'Zapisywanie...' : 'Zapisz outfit'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SaveOutfitModal
