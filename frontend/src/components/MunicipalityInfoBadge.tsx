import { memo } from 'react'
import { MUNICIPALITY_NAMES } from '../config/municipalities'

interface MunicipalityInfoBadgeProps {
  geocode: string | null
  touristSpotCount: number
  onViewInfo: () => void
  onClose: () => void
}

function MunicipalityInfoBadge({ geocode, touristSpotCount, onViewInfo, onClose }: MunicipalityInfoBadgeProps) {
  if (!geocode) return null

  const municipalityName = MUNICIPALITY_NAMES[geocode] || 'Unknown Municipality'

  return (
    <div
      className="fixed top-6 right-6 z-[1000] pointer-events-auto animate-fadeIn"
      style={{
        animation: 'fadeIn 0.3s ease-out'
      }}
    >
      <div
        className="rounded-xl shadow-2xl border-2 overflow-hidden"
        style={{
          backgroundColor: 'white',
          borderColor: 'var(--sunset-gold)',
          minWidth: '280px'
        }}
      >
        {/* Header with gradient */}
        <div
          className="px-4 py-3"
          style={{
            background: 'linear-gradient(135deg, var(--forest-green) 0%, var(--ocean-blue) 100%)'
          }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-md"
                style={{ backgroundColor: 'var(--sunset-gold)' }}
              >
                📍
              </div>
              <div>
                <h3 className="text-white font-bold text-base leading-tight">
                  {municipalityName}
                </h3>
                <p className="text-white/80 text-xs font-medium">
                  {touristSpotCount} {touristSpotCount === 1 ? 'Tourist Spot' : 'Tourist Spots'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="ml-2 w-7 h-7 rounded-full flex items-center justify-center transition-all hover:scale-110"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                color: 'white'
              }}
              aria-label="Close municipality info"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="px-4 py-3 space-y-2">
          <p className="text-gray-600 text-sm">
            Explore the tourist attractions in this municipality
          </p>
          
          <button
            onClick={onViewInfo}
            className="w-full px-4 py-2 rounded-lg font-semibold text-sm transition-all hover:shadow-md flex items-center justify-center gap-2"
            style={{
              backgroundColor: 'var(--sunset-gold)',
              color: 'white'
            }}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            View Municipality Info
          </button>
        </div>
      </div>
    </div>
  )
}

export default memo(MunicipalityInfoBadge)
