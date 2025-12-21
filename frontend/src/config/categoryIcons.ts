import { PlaceCategory } from '../types/place'

export interface CategoryIconConfig {
  icon: string // Lucide icon name
  color: string
  bgColor: string
  borderColor: string
  emoji: string // Fallback emoji
}

export const categoryIcons: Record<PlaceCategory, CategoryIconConfig> = {
  surfing: {
    icon: 'Waves',
    color: '#0ea5e9', // sky-500
    bgColor: '#e0f2fe', // sky-100
    borderColor: '#0284c7', // sky-600
    emoji: '🏄'
  },
  waterfall: {
    icon: 'Droplets',
    color: '#06b6d4', // cyan-500
    bgColor: '#cffafe', // cyan-100
    borderColor: '#0891b2', // cyan-600
    emoji: '💧'
  },
  beach: {
    icon: 'Palmtree',
    color: '#f59e0b', // amber-500
    bgColor: '#fef3c7', // amber-100
    borderColor: '#d97706', // amber-600
    emoji: '🏖️'
  },
  cultural: {
    icon: 'Landmark',
    color: '#8b5cf6', // violet-500
    bgColor: '#ede9fe', // violet-100
    borderColor: '#7c3aed', // violet-600
    emoji: '🏛️'
  },
  restaurant: {
    icon: 'UtensilsCrossed',
    color: '#ef4444', // red-500
    bgColor: '#fee2e2', // red-100
    borderColor: '#dc2626', // red-600
    emoji: '🍴'
  },
  viewpoint: {
    icon: 'Mountain',
    color: '#10b981', // emerald-500
    bgColor: '#d1fae5', // emerald-100
    borderColor: '#059669', // emerald-600
    emoji: '⛰️'
  },
  cave: {
    icon: 'CircleDot',
    color: '#64748b', // slate-500
    bgColor: '#f1f5f9', // slate-100
    borderColor: '#475569', // slate-600
    emoji: '🕳️'
  },
  general: {
    icon: 'MapPin',
    color: '#6366f1', // indigo-500
    bgColor: '#e0e7ff', // indigo-100
    borderColor: '#4f46e5', // indigo-600
    emoji: '📍'
  }
}

export const getCategoryIcon = (category: PlaceCategory): CategoryIconConfig => {
  return categoryIcons[category] || categoryIcons.general
}
