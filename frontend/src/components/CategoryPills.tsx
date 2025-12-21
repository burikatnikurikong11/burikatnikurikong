import { memo } from 'react'

interface Category {
  id: string
  label: string
  icon: string
  color: string
}

interface CategoryPillsProps {
  selectedCategory: string | null
  onCategorySelect: (categoryId: string | null) => void
  isMobile?: boolean
}

const CATEGORIES: Category[] = [
  { id: 'all', label: 'All', icon: '🌏', color: '#6b7280' },
  { id: 'beaches', label: 'Beaches', icon: '🏖️', color: '#06b6d4' },
  { id: 'nature', label: 'Nature', icon: '🌿', color: '#10b981' },
  { id: 'food', label: 'Food', icon: '🍽️', color: '#f59e0b' },
  { id: 'accommodation', label: 'Hotels', icon: '🏨', color: '#8b5cf6' },
  { id: 'activities', label: 'Activities', icon: '🤿', color: '#ef4444' },
  { id: 'culture', label: 'Culture', icon: '🏛️', color: '#ec4899' },
]

function CategoryPills({ selectedCategory, onCategorySelect, isMobile = false }: CategoryPillsProps) {
  const handleCategoryClick = (categoryId: string) => {
    if (categoryId === 'all') {
      onCategorySelect(null)
    } else if (selectedCategory === categoryId) {
      onCategorySelect(null) // Deselect if clicking the same category
    } else {
      onCategorySelect(categoryId)
    }
  }

  return (
    <div
      className={`fixed z-[100] ${
        isMobile ? 'left-4 right-4 top-4' : 'left-1/2 top-6 -translate-x-1/2'
      }`}
      style={{
        maxWidth: isMobile ? 'calc(100% - 2rem)' : '800px',
      }}
    >
      <div
        className={`
          flex items-center gap-2 p-2 rounded-2xl backdrop-blur-md
          ${isMobile ? 'overflow-x-auto scrollbar-hide' : 'justify-center flex-wrap'}
        `}
        style={{
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
        }}
      >
        {CATEGORIES.map((category) => {
          const isActive =
            (category.id === 'all' && selectedCategory === null) ||
            selectedCategory === category.id

          return (
            <button
              key={category.id}
              onClick={() => handleCategoryClick(category.id)}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-full
                font-medium text-sm transition-all duration-200
                whitespace-nowrap flex-shrink-0
                ${
                  isActive
                    ? 'shadow-md transform scale-105'
                    : 'hover:shadow-md hover:transform hover:scale-105'
                }
              `}
              style={{
                backgroundColor: isActive ? category.color : '#f3f4f6',
                color: isActive ? '#ffffff' : '#4b5563',
              }}
              aria-label={`Filter by ${category.label}`}
              aria-pressed={isActive}
            >
              <span className="text-base">{category.icon}</span>
              <span>{category.label}</span>
            </button>
          )
        })}
      </div>

      {/* Active filter indicator */}
      {selectedCategory && selectedCategory !== 'all' && (
        <div
          className="mt-2 text-center text-xs font-medium px-3 py-1 rounded-full inline-block"
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            color: '#6b7280',
            marginLeft: isMobile ? '0' : 'auto',
            marginRight: isMobile ? '0' : 'auto',
            display: 'block',
            width: 'fit-content',
          }}
        >
          Showing {CATEGORIES.find((c) => c.id === selectedCategory)?.label} only
        </div>
      )}
    </div>
  )
}

export default memo(CategoryPills)