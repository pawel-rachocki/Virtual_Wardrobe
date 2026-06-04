import { useRef, useState } from 'react'
import * as userService from '../../services/userService'

interface Props {
  currentPhotoUrl?: string
  onSuccess: (url: string) => void
}

const ALLOWED_TYPES = ['image/jpeg', 'image/png']

const BasePhotoUpload = ({ currentPhotoUrl, onSuccess }: Props) => {
  const inputRef = useRef<HTMLInputElement>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hovered, setHovered] = useState(false)

  const displayUrl = previewUrl ?? currentPhotoUrl ?? null

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setError(null)

    if (!ALLOWED_TYPES.includes(file.type)) {
      setError('Dozwolone formaty: JPG i PNG.')
      setSelectedFile(null)
      setPreviewUrl(null)
      return
    }

    setSelectedFile(file)
    setPreviewUrl(URL.createObjectURL(file))
  }

  const handleUpload = async () => {
    if (!selectedFile) return

    setUploading(true)
    setError(null)

    try {
      const result = await userService.uploadBasePhoto(selectedFile)
      setSelectedFile(null)
      setPreviewUrl(null)
      onSuccess(result.basePhotoUrl)
    } catch {
      setError('Nie udało się zapisać zdjęcia. Spróbuj ponownie.')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="flex flex-col items-start gap-4">
      {/* Hidden file input */}
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Photo area */}
      <div
        role="button"
        tabIndex={0}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          width: 280,
          height: 350,
          border: '1px solid #E8E4DF',
          position: 'relative',
          overflow: 'hidden',
          cursor: 'pointer',
          flexShrink: 0,
        }}
        className="bg-[#F4F1ED]"
      >
        {displayUrl ? (
          <img
            src={displayUrl}
            alt="Zdjęcie bazowe"
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full gap-3 px-6 text-center">
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#C8906A"
              strokeWidth="1.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            <span
              style={{ fontFamily: "'Jost', sans-serif", letterSpacing: '0.08em' }}
              className="text-xs text-[#6B6B67] uppercase leading-relaxed"
            >
              Kliknij, aby dodać zdjęcie sylwetki
            </span>
          </div>
        )}

        {/* Hover overlay */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundColor: 'rgba(26,26,24,0.45)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: hovered ? 1 : 0,
            transition: 'opacity 0.25s ease',
          }}
        >
          <span
            style={{ fontFamily: "'Jost', sans-serif", letterSpacing: '0.14em' }}
            className="text-xs uppercase text-[#FAF8F5]"
          >
            Zmień zdjęcie
          </span>
        </div>
      </div>

      {/* Error */}
      {error && (
        <p
          style={{ fontFamily: "'Jost', sans-serif", letterSpacing: '0.04em' }}
          className="text-xs text-[#B85C3A]"
        >
          {error}
        </p>
      )}

      {/* Save button — only when file selected */}
      {selectedFile && (
        <button
          onClick={handleUpload}
          disabled={uploading}
          style={{ width: 280 }}
          className="relative flex items-center justify-center gap-2 py-3 border border-[#1A1A18] hover:bg-[#1A1A18] hover:text-[#FAF8F5] transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {uploading ? (
            <span
              style={{
                width: 14,
                height: 14,
                border: '1.5px solid currentColor',
                borderTopColor: 'transparent',
                borderRadius: '50%',
                display: 'inline-block',
                animation: 'spin 0.7s linear infinite',
              }}
            />
          ) : null}
          <span
            style={{ fontFamily: "'Jost', sans-serif", letterSpacing: '0.14em' }}
            className="text-xs uppercase"
          >
            {uploading ? 'Zapisywanie…' : 'Zapisz zdjęcie'}
          </span>
        </button>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}

export default BasePhotoUpload
