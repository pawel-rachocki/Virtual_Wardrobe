import { Category } from '../../types/garment'

interface FilterOption {
  label: string
  value: Category | null
}

const FILTERS: FilterOption[] = [
  { label: 'Wszystkie', value: null },
  { label: 'Głowa', value: Category.HEAD },
  { label: 'Góra', value: Category.TOP },
  { label: 'Dół', value: Category.BOTTOM },
  { label: 'Buty', value: Category.SHOES },
  { label: 'Akcesoria', value: Category.ACCESSORIES },
]

interface CategoryFilterProps {
  active: Category | null
  onChange: (category: Category | null) => void
}

const CategoryFilter = ({ active, onChange }: CategoryFilterProps) => (
  <div className="flex flex-wrap gap-2 mb-8">
    {FILTERS.map(({ label, value }) => {
      const isActive = active === value
      return (
        <button
          key={label}
          onClick={() => onChange(value)}
          style={{
            fontFamily: "'Jost', sans-serif",
            letterSpacing: '0.12em',
            border: `1px solid ${isActive ? '#C8906A' : '#E8E4DF'}`,
            backgroundColor: isActive ? '#C8906A' : 'transparent',
            color: isActive ? '#FAF8F5' : '#6B6B67',
            transition: 'all 0.2s ease',
          }}
          className="text-xs uppercase px-4 py-1.5 rounded-full hover:border-[#C8906A] hover:text-[#1A1A18]"
        >
          {label}
        </button>
      )
    })}
  </div>
)

export default CategoryFilter
