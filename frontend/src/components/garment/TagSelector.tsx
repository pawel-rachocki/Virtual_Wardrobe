import { useState, useEffect, KeyboardEvent } from 'react'
import { fetchTags } from '../../services/tagService'

interface TagSelectorProps {
  value: string[]
  onChange: (tags: string[]) => void
  maxTags?: number
}

const TagSelector = ({ value, onChange, maxTags = 3 }: TagSelectorProps) => {
  const [availableTags, setAvailableTags] = useState<string[]>([])
  const [inputValue, setInputValue] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTags()
      .then(setAvailableTags)
      .finally(() => setLoading(false))
  }, [])

  const isAtLimit = value.length >= maxTags

  const addTag = (tag: string) => {
    const normalized = tag.trim().toLowerCase()
    if (!normalized || isAtLimit || value.includes(normalized)) return
    onChange([...value, normalized])
  }

  const removeTag = (tag: string) => {
    onChange(value.filter((t) => t !== tag))
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== 'Enter') return
    e.preventDefault()
    addTag(inputValue)
    setInputValue('')
  }

  const unselectedTags = availableTags.filter((t) => !value.includes(t))

  return (
    <div style={{ fontFamily: "'Jost', sans-serif" }}>
      {value.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {value.map((tag) => (
            <span
              key={tag}
              style={{ backgroundColor: '#C8906A', color: '#FAF8F5', letterSpacing: '0.08em' }}
              className="flex items-center gap-1.5 text-xs uppercase px-3 py-1.5 rounded-full"
            >
              {tag}
              <button
                type="button"
                onClick={() => removeTag(tag)}
                className="hover:opacity-70 transition-opacity leading-none"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}

      {isAtLimit ? (
        <p
          style={{ color: '#C8906A', letterSpacing: '0.06em' }}
          className="text-xs uppercase mb-3"
        >
          Maksymalnie {maxTags} tagi
        </p>
      ) : (
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Własny tag (Enter)"
          style={{
            fontFamily: "'Jost', sans-serif",
            letterSpacing: '0.06em',
            borderBottom: '1px solid #E8E4DF',
            color: '#1A1A18',
          }}
          className="w-full bg-transparent outline-none text-sm pb-1.5 mb-4 placeholder-[#B0ADA8]"
        />
      )}

      {loading ? (
        <p style={{ color: '#B0ADA8', letterSpacing: '0.06em' }} className="text-xs uppercase">
          Ładowanie tagów...
        </p>
      ) : (
        unselectedTags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {unselectedTags.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => addTag(tag)}
                disabled={isAtLimit}
                style={{
                  fontFamily: "'Jost', sans-serif",
                  letterSpacing: '0.08em',
                  border: '1px solid #E8E4DF',
                  color: '#6B6B67',
                  transition: 'all 0.2s ease',
                }}
                className="text-xs uppercase px-3 py-1.5 rounded-full hover:border-[#C8906A] hover:text-[#1A1A18] disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {tag}
              </button>
            ))}
          </div>
        )
      )}
    </div>
  )
}

export default TagSelector
