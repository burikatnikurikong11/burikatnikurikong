import { memo } from 'react'
import {
  Globe,
  Waves,
  TreePine,
  UtensilsCrossed,
  Hotel,
  Palmtree,
  Landmark
} from 'lucide-react'

interface Category {
  id: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  color: string
}

interface CategoryPillsProps {
  selectedCategory: string | null
  onCategorySelect: (categoryId: string | null) => void
  isMobile?: boolean
  isSidebarOpen?: boolean
}

const CATEGORIES: Category[] = [
  { id: 'all', label: 'All', icon: Globe, color: '#6b7280' },
  { id: 'beaches', label: 'Beaches', icon: Waves, color: '#06b6d4' },
  { id: 'nature', label: 'Nature', icon: TreePine, color: '#10b981' },
  { id: 'food', label: 'Food', icon: UtensilsCrossed, color: '#f59e0b' },
  { id: 'accommodation', label: 'Hotels', icon: Hotel, color: '#8b5cf6' },
  { id: 'activities', label: 'Activities', icon: Palmtree, color: '#ef4444' },
  { id: 'culture', label: 'Culture', icon: Landmark, color: '#ec4899' },
]

function CategoryPills({ selectedCategory, onCategorySelect, isMobile = false, isSidebarOpen = false }: CategoryPillsProps) {
  const handleCategoryClick = (categoryId: string) => {
    if (categoryId === 'all') {
      onCategorySelect(null)
    } else if (selectedCategory === categoryId) {
      onCategorySelect(null) // Deselect if clicking the same category
    } else {
      onCategorySelect(categoryId)
    }
  }

  // Calculate left offset based on sidebar state (desktop only)
  const getLeftOffset = () => {
    if (isMobile) return '1rem' // 16px from left on mobile
    if (isSidebarOpen) {
      // Center on the map area (70% of screen, accounting for sidebar)
      return 'calc(30% + (70% / 2) - 400px)' // 30% sidebar + half of remaining 70% - half of pills width
    }
    return 'calc(50% - 400px)' // Center on full screen
  }

  return (
    <div
      className="fixed z-[100] top-6"
      style={{
        left: getLeftOffset(),
        maxWidth: isMobile ? 'calc(100vw - 2rem)' : '800px',
      }}
    >
      <div
        className="flex items-center gap-2 overflow-x-auto scrollbar-hide py-1"
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
      >
        {CATEGORIES.map((category) => {
          const isActive =
            (category.id === 'all' && selectedCategory === null) ||
            selectedCategory === category.id

          const Icon = category.icon

          return (
            <button
              key={category.id}
              onClick={() => handleCategoryClick(category.id)}
              className="
                flex items-center gap-2 px-4 py-2.5 rounded-full
                font-medium text-sm transition-all duration-200
                whitespace-nowrap flex-shrink-0
              "
              style={{
                backgroundColor: isActive ? '#ffffff' : 'rgba(255, 255, 255, 0.9)',
                color: isActive ? category.color : '#3f3f46',
                boxShadow: isActive 
                  ? '0 4px 12px rgba(0, 0, 0, 0.15)' 
                  : '0 2px 8px rgba(0, 0, 0, 0.1)',
                border: isActive ? `2px solid ${category.color}` : '2px solid transparent',
              }}
              aria-label={`Filter by ${category.label}`}
              aria-pressed={isActive}
            >
              <Icon 
                className="w-4 h-4" 
                style={{ 
                  color: isActive ? category.color : '#71717a',
                  strokeWidth: isActive ? 2.5 : 2 
                }} 
              />
              <span>{category.label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default memo(CategoryPills)