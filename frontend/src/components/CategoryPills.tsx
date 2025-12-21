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
  isItineraryExpanded?: boolean
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

function CategoryPills({ 
  selectedCategory, 
  onCategorySelect, 
  isMobile = false, 
  isSidebarOpen = false,
  isItineraryExpanded = false 
}: CategoryPillsProps) {
  const handleCategoryClick = (categoryId: string) => {
    if (categoryId === 'all') {
      onCategorySelect(null)
    } else if (selectedCategory === categoryId) {
      onCategorySelect(null) // Deselect if clicking the same category
    } else {
      onCategorySelect(categoryId)
    }
  }

  // Calculate left offset to center on map view only (not full viewport)
  const getLeftOffset = () => {
    if (isMobile) return '1rem' // 16px from left on mobile
    
    const sidebarAndMargins = 80 // 72px sidebar + 8px (4px left + 4px right gaps)
    const rightMargin = 8 // 4px margin on right side + 4px for calculations
    const pillsHalfWidth = 400 // Half of pills container width (800px / 2)
    
    if (isSidebarOpen) {
      if (isItineraryExpanded) {
        // Itinerary takes 60%, map takes 40%
        // Container width = 100vw - 80px - 8px
        // Left edge of map = 80px + 60% of container + 4px gap
        // Center of map = left edge + (40% of container / 2)
        return `calc(${sidebarAndMargins}px + 60% + (40% / 2) - ${pillsHalfWidth}px)`
      }
      // Itinerary takes 30%, map takes 70%
      // Container width = 100vw - 80px - 8px
      // Left edge of map = 80px + 30% of container + 4px gap
      // Center of map = left edge + (70% of container / 2)
      return `calc(${sidebarAndMargins}px + 30% + (70% / 2) - ${pillsHalfWidth}px)`
    }
    
    // No itinerary open, center on full map width
    // Container starts at 80px, ends at 100vw - 8px
    // Available width = 100vw - 80px - 8px = 100vw - 88px
    // Center = start (80px) + (available width / 2) - half pills width
    return `calc(${sidebarAndMargins}px + ((100vw - ${sidebarAndMargins}px - ${rightMargin}px) / 2) - ${pillsHalfWidth}px)`
  }

  return (
    <div
      className={`fixed z-[100] top-6 transition-all duration-300 ${
        isItineraryExpanded ? 'opacity-0 pointer-events-none' : 'opacity-100 pointer-events-auto'
      }`}
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
                flex items-center gap-1.5 px-3 py-1.5 rounded-full
                font-medium text-xs transition-all duration-200
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
                className="w-3.5 h-3.5" 
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