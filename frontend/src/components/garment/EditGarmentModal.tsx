import { useState, useEffect } from 'react'
import type { Garment } from '../../types/garment'
import { Category } from '../../types/garment'
import * as garmentService from '../../services/garmentService'
import TagSelector from './TagSelector'

const CATEGORY_LABELS: Record<Category, string> = {
  [Category.HEAD]: 'Głowa',
  [Category.TOP]: 'Góra',
  [Category.BOTTOM]: 'Dół',
  [Category.SHOES]: 'Buty',
  [Category.ACCESSORIES]: 'Akcesoria',
}

interface Props {
  garment: Garment
  onClose: () => void
  onSuccess: () => void
}

interface FormState {
  name: string
  brand: string
  color: string
  season: string
  category: Category | ''
  tags: string[]
}

const EditGarmentModal = ({ garment, onClose, onSuccess }: Props) => {
  const [form, setForm] = useState<FormState>({
    name: garment.name ?? '',
    brand: garment.brand ?? '',
    color: garment.color ?? '',
    season: garment.season ?? '',
    category: garment.category,
    tags: garment.tags ?? [],
  })
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({})
  const [apiError, setApiError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [])

  const setField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }))
    setErrors((prev) => ({ ...prev, [key]: undefined }))
  }

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof FormState, string>> = {}
    if (!form.name.trim()) newErrors.name = 'Nazwa jest wymagana'
    if (!form.category) newErrors.category = 'Kategoria jest wymagana'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!validate()) return
    setApiError(null)
    setSubmitting(true)
    try {
      await garmentService.update(garment.id, {
        name: form.name.trim(),
        brand: form.brand.trim(),
        color: form.color.trim(),
        season: form.season.trim(),
        category: form.category as Category,
        tags: form.tags,
      })
      onSuccess()
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Wystąpił błąd. Spróbuj ponownie.'
      setApiError(msg)
    } finally {
      setSubmitting(false)
    }
  }

  const handleOverlayClick = () => {
    if (!submitting) onClose()
  }

  return (
    <div
      onClick={handleOverlayClick}
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
          maxWidth: 480,
          maxHeight: '90vh',
        }}
        className="rounded-sm flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div
          style={{ borderBottom: '1px solid #E8E4DF' }}
          className="flex items-center justify-between px-7 py-5 shrink-0"
        >
          <h2
            style={{ fontFamily: "'Cormorant Garamond', serif", letterSpacing: '0.14em' }}
            className="text-xl font-light uppercase text-[#1A1A18]"
          >
            Edytuj ubranie
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

        {/* Scrollable body */}
        <div className="overflow-y-auto flex-1 px-7 py-6 flex flex-col gap-6">
          {/* Current image preview (read-only) */}
          {garment.imageUrl && (
            <div>
              <label
                style={{ letterSpacing: '0.12em', color: '#6B6B67' }}
                className="block text-xs uppercase mb-3"
              >
                Zdjęcie
              </label>
              <img
                src={garment.imageUrl}
                alt={garment.name}
                style={{ border: '1px solid #E8E4DF', aspectRatio: '4/3' }}
                className="w-full object-cover rounded-sm"
              />
            </div>
          )}

          {/* Nazwa */}
          <div>
            <label
              style={{ letterSpacing: '0.12em', color: errors.name ? '#C0392B' : '#6B6B67' }}
              className="block text-xs uppercase mb-1.5"
            >
              Nazwa *
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setField('name', e.target.value)}
              style={{
                borderBottom: `1px solid ${errors.name ? '#C0392B' : '#E8E4DF'}`,
                color: '#1A1A18',
              }}
              className="w-full bg-transparent outline-none text-sm pb-1.5 placeholder-[#B0ADA8]"
              placeholder="np. Biała koszula"
            />
            {errors.name && (
              <p style={{ color: '#C0392B', letterSpacing: '0.06em' }} className="text-xs mt-1">
                {errors.name}
              </p>
            )}
          </div>

          {/* Marka */}
          <div>
            <label
              style={{ letterSpacing: '0.12em', color: '#6B6B67' }}
              className="block text-xs uppercase mb-1.5"
            >
              Marka
            </label>
            <input
              type="text"
              value={form.brand}
              onChange={(e) => setField('brand', e.target.value)}
              style={{ borderBottom: '1px solid #E8E4DF', color: '#1A1A18' }}
              className="w-full bg-transparent outline-none text-sm pb-1.5 placeholder-[#B0ADA8]"
              placeholder="np. Zara"
            />
          </div>

          {/* Kolor + Sezon */}
          <div className="grid grid-cols-2 gap-5">
            <div>
              <label
                style={{ letterSpacing: '0.12em', color: '#6B6B67' }}
                className="block text-xs uppercase mb-1.5"
              >
                Kolor
              </label>
              <input
                type="text"
                value={form.color}
                onChange={(e) => setField('color', e.target.value)}
                style={{ borderBottom: '1px solid #E8E4DF', color: '#1A1A18' }}
                className="w-full bg-transparent outline-none text-sm pb-1.5 placeholder-[#B0ADA8]"
                placeholder="np. Biały"
              />
            </div>

            <div>
              <label
                style={{ letterSpacing: '0.12em', color: '#6B6B67' }}
                className="block text-xs uppercase mb-1.5"
              >
                Sezon
              </label>
              <input
                type="text"
                value={form.season}
                onChange={(e) => setField('season', e.target.value)}
                style={{ borderBottom: '1px solid #E8E4DF', color: '#1A1A18' }}
                className="w-full bg-transparent outline-none text-sm pb-1.5 placeholder-[#B0ADA8]"
                placeholder="np. Lato"
              />
            </div>
          </div>

          {/* Kategoria */}
          <div>
            <label
              style={{ letterSpacing: '0.12em', color: errors.category ? '#C0392B' : '#6B6B67' }}
              className="block text-xs uppercase mb-1.5"
            >
              Kategoria *
            </label>
            <select
              value={form.category}
              onChange={(e) => setField('category', e.target.value as Category | '')}
              style={{
                fontFamily: "'Jost', sans-serif",
                letterSpacing: '0.06em',
                borderBottom: `1px solid ${errors.category ? '#C0392B' : '#E8E4DF'}`,
                color: form.category ? '#1A1A18' : '#B0ADA8',
              }}
              className="w-full bg-transparent outline-none text-sm pb-1.5 appearance-none cursor-pointer"
            >
              <option value="" disabled>
                Wybierz kategorię
              </option>
              {Object.values(Category).map((cat) => (
                <option key={cat} value={cat} style={{ color: '#1A1A18' }}>
                  {CATEGORY_LABELS[cat]}
                </option>
              ))}
            </select>
            {errors.category && (
              <p style={{ color: '#C0392B', letterSpacing: '0.06em' }} className="text-xs mt-1">
                {errors.category}
              </p>
            )}
          </div>

          {/* Tagi */}
          <div>
            <label
              style={{ letterSpacing: '0.12em', color: '#6B6B67' }}
              className="block text-xs uppercase mb-3"
            >
              Tagi (maks. 3)
            </label>
            <TagSelector
              value={form.tags}
              onChange={(tags) => setField('tags', tags)}
              maxTags={3}
            />
          </div>

          {/* API error */}
          {apiError && (
            <div
              style={{ border: '1px solid #E8C4BF', backgroundColor: '#FDF4F3' }}
              className="rounded-sm px-4 py-3"
            >
              <p style={{ letterSpacing: '0.04em', color: '#C0392B' }} className="text-xs">
                {apiError}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          style={{ borderTop: '1px solid #E8E4DF' }}
          className="flex items-center justify-end gap-3 px-7 py-5 shrink-0"
        >
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            style={{ letterSpacing: '0.12em', color: '#6B6B67' }}
            className="text-xs uppercase hover:text-[#1A1A18] transition-colors disabled:opacity-40"
          >
            Anuluj
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            style={{
              fontFamily: "'Jost', sans-serif",
              letterSpacing: '0.14em',
              backgroundColor: submitting ? '#DDD8D0' : '#1A1A18',
              color: '#FAF8F5',
              transition: 'background-color 0.2s ease',
            }}
            className="text-xs uppercase px-6 py-2.5 rounded-sm disabled:cursor-not-allowed"
          >
            {submitting ? 'Zapisywanie…' : 'Zapisz zmiany'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default EditGarmentModal
