import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Category, type Garment } from '../../types/garment'
import { useTryOnPolling } from '../../hooks/useTryOnPolling'
import * as tryOnService from '../../services/tryOnService'

const TRYON_PRIORITY = [
  Category.TOP,
  Category.BOTTOM,
  Category.HEAD,
  Category.SHOES,
  Category.ACCESSORIES,
]

interface Props {
  selectedGarments: Partial<Record<Category, Garment>>
  basePhotoUrl?: string | null
}

const TryOnPanel = ({ selectedGarments, basePhotoUrl }: Props) => {
  const [jobId, setJobId] = useState<string | null>(null)
  const [isInitiating, setIsInitiating] = useState(false)
  const [initError, setInitError] = useState<string | null>(null)
  const [resultVisible, setResultVisible] = useState(false)

  const { status, resultUrl, isPolling, error: pollingError } = useTryOnPolling(jobId)

  const activeGarment =
    TRYON_PRIORITY.map((cat) => selectedGarments[cat]).find((g): g is Garment => g !== undefined) ??
    null

  const isProcessing = isPolling || status === 'PENDING' || status === 'PROCESSING'
  const isDone = status === 'DONE'
  const isFailed = status === 'FAILED'
  const hasActiveJob = !!jobId
  const canVisualize = !!activeGarment && !!basePhotoUrl && !isInitiating && !hasActiveJob

  useEffect(() => {
    if (!isDone || !resultUrl) return
    const t = setTimeout(() => setResultVisible(true), 50)
    return () => clearTimeout(t)
  }, [isDone, resultUrl])

  const handleVisualize = async () => {
    if (!canVisualize || !activeGarment) return
    setIsInitiating(true)
    setInitError(null)
    try {
      const job = await tryOnService.initTryOn(activeGarment.id)
      setJobId(job.jobId)
    } catch (err) {
      setInitError(err instanceof Error ? err.message : 'Błąd inicjowania')
    } finally {
      setIsInitiating(false)
    }
  }

  const handleReset = () => {
    setJobId(null)
    setInitError(null)
    setResultVisible(false)
  }

  const statusText = (() => {
    if (isInitiating) return 'Inicjowanie...'
    if (status === 'PENDING') return 'Oczekuje w kolejce...'
    if (status === 'PROCESSING') return 'Generowanie wizualizacji...'
    if (isDone) return 'Wizualizacja gotowa!'
    if (isFailed) return pollingError ?? 'Nie udało się wygenerować.'
    return null
  })()

  return (
    <section
      style={{ background: '#F7F4F1', border: '1px solid #E8E4DF' }}
      className="mb-10 flex"
    >
      {/* Photo column */}
      <div className="w-28 sm:w-40 shrink-0 relative">
        <div
          style={{
            aspectRatio: '3/4',
            background: '#EDEBE6',
            overflow: 'hidden',
            position: 'relative',
          }}
        >
          {/* Placeholder when no base photo */}
          {!basePhotoUrl && (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
              }}
            >
              <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
                <circle cx="18" cy="11" r="6" fill="#C8C4BE" />
                <path
                  d="M5 34c0-7.18 5.82-13 13-13s13 5.82 13 13"
                  stroke="#C8C4BE"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
              <span
                style={{ fontSize: '9px', letterSpacing: '0.16em', color: '#B5B0AA' }}
                className="uppercase"
              >
                Brak zdjęcia
              </span>
            </div>
          )}

          {/* Base photo */}
          {basePhotoUrl && (
            <img
              src={basePhotoUrl}
              alt="Zdjęcie bazowe"
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            />
          )}

          {/* Result image fade-in over base */}
          {isDone && resultUrl && (
            <img
              src={resultUrl}
              alt="Wynik AI Try-On"
              style={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                opacity: resultVisible ? 1 : 0,
                transition: 'opacity 600ms ease',
              }}
            />
          )}

          {/* Processing overlay */}
          {(isInitiating || isProcessing) && (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: 'rgba(26,24,22,0.58)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 10,
              }}
            >
              <div
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: '50%',
                  border: '2px solid rgba(250,248,246,0.25)',
                  borderTopColor: '#FAF8F6',
                }}
                className="animate-spin"
              />
              <span
                style={{ fontSize: '8px', letterSpacing: '0.22em', color: '#FAF8F6', fontWeight: 300 }}
                className="uppercase"
              >
                Generowanie
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Content column */}
      <div className="flex-1 p-4 sm:p-6 flex flex-col justify-between gap-4 min-w-0">
        <div>
          <p
            style={{ letterSpacing: '0.24em', fontSize: '10px' }}
            className="uppercase text-[#C8906A] mb-2 font-light"
          >
            AI Try-On
          </p>
          <h3
            style={{ fontFamily: "'Cormorant Garamond', serif" }}
            className="text-xl sm:text-2xl font-light text-[#1A1A18] leading-tight"
          >
            Przymierzalnia
          </h3>

          <p
            style={{ letterSpacing: '0.03em' }}
            className="text-xs sm:text-sm text-[#9A9590] mt-2 font-light leading-relaxed"
          >
            {!basePhotoUrl
              ? 'Dodaj zdjęcie sylwetki, aby zobaczyć jak wybrane ubrania wyglądają na Tobie.'
              : activeGarment
                ? (
                  <>
                    Wybrane:{' '}
                    <span className="text-[#1A1A18]">{activeGarment.name}</span>
                  </>
                )
                : 'Wybierz ubranie z karuzeli poniżej, aby rozpocząć wizualizację.'}
          </p>
        </div>

        <div className="flex flex-col gap-2">
          {/* Status row */}
          {statusText && (
            <div className="flex items-center gap-2">
              {(isInitiating || isProcessing) && (
                <span
                  style={{
                    width: 5,
                    height: 5,
                    borderRadius: '50%',
                    background: '#C8906A',
                    display: 'inline-block',
                    flexShrink: 0,
                  }}
                  className="animate-pulse"
                />
              )}
              {isDone && (
                <span style={{ color: '#C8906A', fontSize: '12px', lineHeight: 1 }}>✓</span>
              )}
              {isFailed && (
                <span style={{ color: '#B85C4A', fontSize: '12px', lineHeight: 1 }}>✗</span>
              )}
              <span
                style={{ fontSize: '11px', letterSpacing: '0.06em' }}
                className={`font-light ${
                  isFailed ? 'text-[#B85C4A]' : isDone ? 'text-[#7A7570]' : 'text-[#9A9590]'
                }`}
              >
                {statusText}
              </span>
            </div>
          )}

          {/* Init error */}
          {initError && (
            <p style={{ fontSize: '11px', letterSpacing: '0.04em' }} className="text-[#B85C4A] font-light">
              {initError}
            </p>
          )}

          {/* Action button */}
          {!basePhotoUrl ? (
            <Link
              to="/profile"
              style={{ border: '1px solid #C8906A', letterSpacing: '0.14em', display: 'inline-block', textAlign: 'center' }}
              className="text-xs uppercase text-[#C8906A] px-4 py-2 hover:bg-[#C8906A] hover:text-white transition-colors duration-200 self-start"
            >
              Dodaj zdjęcie bazowe
            </Link>
          ) : isDone ? (
            <button
              type="button"
              onClick={handleReset}
              style={{ border: '1px solid #9A9590', letterSpacing: '0.14em' }}
              className="text-xs uppercase text-[#9A9590] px-4 py-2 hover:border-[#C8906A] hover:text-[#C8906A] transition-colors duration-200 self-start"
            >
              Nowa wizualizacja
            </button>
          ) : isFailed ? (
            <button
              type="button"
              onClick={handleReset}
              style={{ border: '1px solid #C8906A', letterSpacing: '0.14em' }}
              className="text-xs uppercase text-[#C8906A] px-4 py-2 hover:bg-[#C8906A] hover:text-white transition-colors duration-200 self-start"
            >
              Spróbuj ponownie
            </button>
          ) : (
            <button
              type="button"
              onClick={handleVisualize}
              disabled={!canVisualize}
              style={{
                border: canVisualize ? '1px solid #C8906A' : '1px solid #DDD8D0',
                letterSpacing: '0.14em',
                cursor: canVisualize ? 'pointer' : 'not-allowed',
              }}
              className={`text-xs uppercase px-4 py-2 self-start transition-colors duration-200 ${
                canVisualize
                  ? 'text-[#C8906A] hover:bg-[#C8906A] hover:text-white'
                  : 'text-[#C8C4BE]'
              }`}
            >
              {isInitiating ? 'Inicjowanie...' : 'Wizualizuj na mnie'}
            </button>
          )}
        </div>
      </div>
    </section>
  )
}

export default TryOnPanel
