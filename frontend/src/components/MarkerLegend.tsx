import { MapPin } from 'lucide-react'
import { useMemo } from 'react'
import type { TouristSpotModel } from '../types/touristSpot'

interface MarkerLegendProps {
  models: TouristSpotModel[]
}

export default function MarkerLegend({ models }: MarkerLegendProps) {
  // Count models by category
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    
    models.forEach(model => {
      const category = model.category || 'Other'
      counts[category] = (counts[category] || 0) + 1
    })
    
    return counts
  }, [models])

  // Map categories to icons and colors
  const categoryInfo: Record<string, { icon: string; color: string }> = {
    'Beach': { icon: '🏖️', color: '#3B82F6' },
    'Mountain': { icon: '🏔️', color: '#10B981' },
    'Cultural': { icon: '🏛️', color: '#F59E0B' },
    'Natural': { icon: '🌿', color: '#14B8A6' },
    'Historical': { icon: '📜', color: '#8B5CF6' },
    'Religious': { icon: '⛪', color: '#EC4899' },
    'Other': { icon: '📍', color: '#6B7280' }
  }

  const categories = Object.entries(categoryCounts)

  if (categories.length === 0) return null

  return (
    <div
      className="fixed bottom-6 left-6 z-[1000] transition-all duration-300"
      style={{
        animation: 'fadeIn 0.4s ease-out 0.2s backwards'
      }}
    >
      <div
        className="backdrop-blur-md rounded-xl shadow-2xl border overflow-hidden"
        style={{
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          borderColor: 'rgba(234, 179, 8, 0.3)',
          minWidth: '200px',
          maxWidth: '280px'
        }}
      >
        {/* Header */}
        <div
          className="px-4 py-2.5"
          style={{
            background: 'linear-gradient(135deg, #FCD34D 0%, #F59E0B 100%)'
          }}
        >
          <div className="flex items-center gap-2">
            <MapPin size={14} className="text-white" />
            <h3 className="font-bold text-white text-xs uppercase tracking-wide">
              Attractions
            </h3>
          </div>
        </div>

        {/* Legend Items */}
        <div className="px-3 py-3 space-y-2">
          {categories.map(([category, count]) => {
            const info = categoryInfo[category] || categoryInfo['Other']
            
            return (
              <div
                key={category}
                className="flex items-center justify-between py-1.5 px-2 rounded-lg transition-all hover:shadow-sm"
                style={{
                  backgroundColor: 'rgba(254, 243, 199, 0.3)'
                }}
              >
                <div className="flex items-center gap-2">
                  <span className="text-lg">{info.icon}</span>
                  <span className="text-sm font-medium text-gray-700">
                    {category}
                  </span>
                </div>
                <div
                  className="px-2 py-0.5 rounded-full text-xs font-bold text-white min-w-[24px] text-center"
                  style={{
                    backgroundColor: info.color
                  }}
                >
                  {count}
                </div>
              </div>
            )
          })}
        </div>

        {/* Footer */}
        <div
          className="px-4 py-2 text-center border-t"
          style={{
            backgroundColor: 'rgba(254, 243, 199, 0.2)',
            borderColor: 'rgba(234, 179, 8, 0.2)'
          }}
        >
          <p className="text-xs font-semibold" style={{ color: '#92400E' }}>
            Total: {models.length} {models.length === 1 ? 'Spot' : 'Spots'}
          </p>
        </div>
      </div>
    </div>
  )
}
