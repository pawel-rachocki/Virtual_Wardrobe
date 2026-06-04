import { useState } from 'react'
import { Category, type Garment } from '../../types/garment'
import type { CategoryConfig } from '../../constants/outfitCategories'

const generateFallbackName = () => {
  const days = ['Niedzielny', 'Poniedziałkowy', 'Wtorkowy', 'Środowy', 'Czwartkowy', 'Piątkowy', 'Sobotni']
  return `${days[new Date().getDay()]} outfit`
}

const MiniHanger = () => (
  <svg width="14" height="12" viewBox="0 0 64 56" fill="none">
    <path d="M6 48 Q16 30 32 20 Q48 30 58 48" stroke="#C8C4BE" strokeWidth="2" strokeLinecap="round" fill="none" />
    <line x1="6" y1="48" x2="58" y2="48" stroke="#C8C4BE" strokeWidth="2" strokeLinecap="round" />
    <path d="M32 20 Q32 10 40 10 Q48 10 42 20" stroke="#C8C4BE" strokeWidth="2" strokeLinecap="round" fill="none" />
  </svg>
)

const XIcon = () => (
  <svg width="7" height="7" viewBox="0 0 7 7" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round">
    <line x1="1" y1="1" x2="6" y2="6" />
    <line x1="6" y1="1" x2="1" y2="6" />
  </svg>
)

interface OutfitPreviewPanelProps {
  selectedGarments: Partial<Record<Category, Garment>>
  config: CategoryConfig[]
  onDeselect: (category: Category) => void
  onSave: (name: string) => Promise<boolean>
  isSaving: boolean
  variant?: 'sidebar' | 'bar'
}

// ── Sidebar ───────────────────────────────────────────────────────────────────

const SidebarPanel = ({ selectedGarments, config, onDeselect, onSave, isSaving }: Omit<OutfitPreviewPanelProps, 'variant'>) => {
  const [name, setName] = useState('')
  const [inputFocused, setInputFocused] = useState(false)
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')

  const selectedCount = Object.keys(selectedGarments).length
  const canSave = selectedCount > 0 && !isSaving

  const handleSave = async () => {
    if (!canSave) return
    const outfitName = name.trim() || generateFallbackName()
    const ok = await onSave(outfitName)
    if (ok) {
      setName('')
      setStatus('success')
    } else {
      setStatus('error')
    }
    setTimeout(() => setStatus('idle'), 2500)
  }

  return (
    <div
      style={{
        backgroundColor: '#FFFFFF',
        border: '1px solid #E8E4DF',
        boxShadow: '0 4px 24px rgba(26,26,24,0.05)',
      }}
    >
      {/* Header */}
      <div style={{ padding: '18px 20px 14px', borderBottom: '1px solid #F0EDE8' }}>
        <p style={{ letterSpacing: '0.22em', fontSize: '10px' }} className="uppercase text-[#C8906A] mb-2">
          Podgląd
        </p>
        <div className="flex items-baseline justify-between">
          <h3
            style={{ fontFamily: "'Cormorant Garamond', serif" }}
            className="text-2xl font-light leading-none text-[#1A1A18]"
          >
            Twój outfit
          </h3>
          <span
            style={{ letterSpacing: '0.06em', fontSize: '11px' }}
            className={`font-light transition-colors duration-300 ${selectedCount > 0 ? 'text-[#C8906A]' : 'text-[#C8C4BE]'}`}
          >
            {selectedCount} / 5
          </span>
        </div>
      </div>

      {/* Slots */}
      <div>
        {config.map(({ category, shortLabel, icon }) => {
          const garment = selectedGarments[category]
          const isOccupied = !!garment

          return (
            <div
              key={category}
              style={{
                padding: '10px 20px',
                borderBottom: '1px solid #F7F5F2',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
              }}
            >
              {/* Thumbnail — klikalny gdy zajęty */}
              <div
                className="group relative flex-shrink-0"
                onClick={() => isOccupied && onDeselect(category)}
                style={{
                  width: '38px',
                  aspectRatio: '3/4',
                  border: isOccupied ? '1.5px solid #C8906A' : '1px dashed #DDD8D0',
                  backgroundColor: isOccupied ? '#FFFFFF' : '#FAFAF9',
                  overflow: 'hidden',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'border-color 200ms ease',
                  cursor: isOccupied ? 'pointer' : 'default',
                  flexShrink: 0,
                  position: 'relative',
                }}
              >
                {isOccupied ? (
                  <>
                    {garment.imageUrl ? (
                      <img src={garment.imageUrl} alt={garment.name} className="w-full h-full object-cover" />
                    ) : (
                      <MiniHanger />
                    )}
                    <div
                      style={{
                        position: 'absolute', inset: 0,
                        backgroundColor: 'rgba(200,144,106,0.05)',
                        pointerEvents: 'none',
                      }}
                    />
                    {/* Hover overlay z × */}
                    <div
                      className="opacity-0 group-hover:opacity-100 transition-opacity duration-150"
                      style={{
                        position: 'absolute', inset: 0,
                        backgroundColor: 'rgba(26,26,24,0.5)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <XIcon />
                    </div>
                  </>
                ) : (
                  <span style={{ color: '#D4CFC9', opacity: 0.8 }}>{icon}</span>
                )}
              </div>

              {/* Etykieta + nazwa */}
              <div style={{ flex: '1 1 0', minWidth: 0 }}>
                <p
                  style={{
                    letterSpacing: '0.16em',
                    fontSize: '9px',
                    color: isOccupied ? '#C8906A' : '#C8C4BE',
                    transition: 'color 200ms ease',
                    marginBottom: '2px',
                  }}
                  className="uppercase font-light"
                >
                  {shortLabel}
                </p>
                <p
                  style={{ fontFamily: "'Cormorant Garamond', serif" }}
                  className={`text-sm font-light leading-snug truncate transition-colors duration-200 ${
                    isOccupied ? 'text-[#1A1A18]' : 'text-[#C8C4BE]'
                  }`}
                >
                  {isOccupied ? garment.name : '—'}
                </p>
              </div>
            </div>
          )
        })}
      </div>

      {/* Zapis */}
      <div style={{ padding: '14px 20px 18px' }}>
        {/* Input na nazwę */}
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onFocus={() => setInputFocused(true)}
          onBlur={() => setInputFocused(false)}
          onKeyDown={(e) => e.key === 'Enter' && handleSave()}
          placeholder="Nazwa outfitu..."
          disabled={isSaving}
          style={{
            width: '100%',
            padding: '6px 0',
            marginBottom: '12px',
            background: 'transparent',
            border: 'none',
            borderBottom: `1px solid ${inputFocused ? '#C8906A' : '#E8E4DF'}`,
            outline: 'none',
            fontFamily: "'Cormorant Garamond', serif",
            fontStyle: 'italic',
            fontSize: '14px',
            color: '#1A1A18',
            transition: 'border-color 200ms ease',
          }}
          className="placeholder:text-[#C8C4BE]"
        />

        {/* Przycisk */}
        <button
          onClick={handleSave}
          disabled={!canSave}
          style={{
            width: '100%',
            padding: '11px 16px',
            backgroundColor: canSave ? '#1A1A18' : '#F0EDE8',
            color: canSave ? '#FFFFFF' : '#C8C4BE',
            border: 'none',
            letterSpacing: '0.18em',
            cursor: canSave ? 'pointer' : 'not-allowed',
            transition: 'background-color 250ms ease, color 250ms ease',
            fontSize: '10px',
          }}
          className="uppercase font-light hover:enabled:bg-[#C8906A]"
        >
          {isSaving ? 'Zapisywanie...' : 'Zapisz outfit'}
        </button>

        {/* Feedback */}
        <div style={{ height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '8px' }}>
          {status === 'success' && (
            <p style={{ letterSpacing: '0.12em', color: '#7A9E7E', fontSize: '10px' }} className="uppercase transition-opacity">
              ✓ Zapisano
            </p>
          )}
          {status === 'error' && (
            <p style={{ letterSpacing: '0.10em', color: '#C87070', fontSize: '10px' }} className="uppercase">
              Błąd zapisu
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Bar (mobile) ──────────────────────────────────────────────────────────────

const BarPanel = ({ selectedGarments, config, onDeselect, onSave, isSaving }: Omit<OutfitPreviewPanelProps, 'variant'>) => {
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')

  const selectedCount = Object.keys(selectedGarments).length
  const canSave = selectedCount > 0 && !isSaving

  const handleSave = async () => {
    if (!canSave) return
    const ok = await onSave(generateFallbackName())
    setStatus(ok ? 'success' : 'error')
    setTimeout(() => setStatus('idle'), 2000)
  }

  return (
    <div
      style={{
        backgroundColor: '#FFFFFF',
        borderTop: '1px solid #E8E4DF',
        padding: '10px 16px 12px',
        boxShadow: '0 -4px 20px rgba(26,26,24,0.07)',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
      }}
    >
      {/* Mini sloty */}
      <div style={{ display: 'flex', gap: '5px', flex: 1 }}>
        {config.map(({ category, shortLabel, icon }) => {
          const garment = selectedGarments[category]
          const isOccupied = !!garment

          return (
            <div
              key={category}
              onClick={() => isOccupied && onDeselect(category)}
              title={isOccupied ? `${shortLabel}: ${garment.name} — kliknij aby usunąć` : shortLabel}
              style={{
                width: '36px',
                height: '44px',
                border: isOccupied ? '1.5px solid #C8906A' : '1px dashed #DDD8D0',
                backgroundColor: isOccupied ? '#FFFFFF' : '#FAFAF9',
                overflow: 'hidden',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: isOccupied ? 'pointer' : 'default',
                flexShrink: 0,
                position: 'relative',
              }}
            >
              {isOccupied ? (
                garment.imageUrl ? (
                  <img src={garment.imageUrl} alt={garment.name} className="w-full h-full object-cover" />
                ) : (
                  <MiniHanger />
                )
              ) : (
                <span style={{ color: '#D4CFC9', transform: 'scale(0.75)', display: 'block' }}>{icon}</span>
              )}
            </div>
          )
        })}
      </div>

      {/* Licznik + przycisk */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
        <span
          style={{ letterSpacing: '0.06em', fontSize: '11px', minWidth: '28px', textAlign: 'center' }}
          className={`font-light transition-colors duration-200 ${
            status === 'success' ? 'text-[#7A9E7E]' : status === 'error' ? 'text-[#C87070]' : selectedCount > 0 ? 'text-[#C8906A]' : 'text-[#C8C4BE]'
          }`}
        >
          {status === 'success' ? '✓' : status === 'error' ? '!' : `${selectedCount}/5`}
        </span>
        <button
          onClick={handleSave}
          disabled={!canSave}
          style={{
            padding: '9px 18px',
            backgroundColor: canSave ? '#1A1A18' : '#F0EDE8',
            color: canSave ? '#FFFFFF' : '#C8C4BE',
            border: 'none',
            letterSpacing: '0.16em',
            cursor: canSave ? 'pointer' : 'not-allowed',
            transition: 'background-color 250ms ease',
            fontSize: '10px',
            whiteSpace: 'nowrap',
          }}
          className="uppercase font-light"
        >
          {isSaving ? '...' : 'Zapisz'}
        </button>
      </div>
    </div>
  )
}

// ── Export ────────────────────────────────────────────────────────────────────

const OutfitPreviewPanel = ({ variant = 'sidebar', ...rest }: OutfitPreviewPanelProps) => {
  if (variant === 'bar') return <BarPanel {...rest} />
  return <SidebarPanel {...rest} />
}

export default OutfitPreviewPanel
