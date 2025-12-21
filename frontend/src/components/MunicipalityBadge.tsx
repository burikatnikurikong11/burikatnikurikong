import { X, MapPin, Info } from 'lucide-react'
import { useState } from 'react'
import { MUNICIPALITY_NAMES } from '../config/municipalities'

interface MunicipalityBadgeProps {
  municipalityGeocode: string
  touristSpotsCount: number
  onClose: () => void
  onViewInfo: () => void
}

export default function MunicipalityBadge({
  municipalityGeocode,
  touristSpotsCount,
  onClose,
  onViewInfo
}: MunicipalityBadgeProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const municipalityName = MUNICIPALITY_NAMES[municipalityGeocode] || 'Unknown'

  return (
    <div
      className="fixed top-6 right-6 z-[1000] transition-all duration-300"
      style={{
        animation: 'fadeIn 0.3s ease-out'
      }}
    >
      <div
        className="backdrop-blur-md rounded-xl shadow-2xl border overflow-hidden"
        style={{
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          borderColor: 'rgba(234, 179, 8, 0.3)',
          minWidth: '280px'
        }}
      >
        {/* Header */}
        <div
          className="px-4 py-3 flex items-center justify-between"
          style={{
            background: 'linear-gradient(135deg, #FCD34D 0%, #F59E0B 100%)'
          }}
        >
          <div className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.3)'
              }}
            >
              <MapPin size={16} className="text-white" />
            </div>
            <div>
              <h3 className="font-bold text-white text-sm leading-tight">
                {municipalityName}
              </h3>
              <p className="text-xs text-white/90">
                {touristSpotsCount} Tourist {touristSpotsCount === 1 ? 'Spot' : 'Spots'}
              </p>
            </div>
          </div>
          
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full flex items-center justify-center transition-all hover:bg-white/30"
            aria-label="Close municipality view"
          >
            <X size={16} className="text-white" />
          </button>
        </div>

        {/* Content */}
        <div className="px-4 py-3">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full flex items-center justify-between py-2 px-3 rounded-lg transition-all"
            style={{
              backgroundColor: 'rgba(251, 191, 36, 0.1)',
              border: '1px solid rgba(234, 179, 8, 0.2)'
            }}
          >
            <div className="flex items-center gap-2">
              <Info size={14} style={{ color: '#D97706' }} />
              <span className="text-sm font-medium" style={{ color: '#92400E' }}>
                Quick Info
              </span>
            </div>
            <svg
              className="w-4 h-4 transition-transform"
              style={{
                transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                color: '#D97706'
              }}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {/* Expanded Info */}
          {isExpanded && (
            <div
              className="mt-3 p-3 rounded-lg text-sm space-y-2"
              style={{
                backgroundColor: 'rgba(254, 243, 199, 0.5)',
                animation: 'fadeIn 0.2s ease-out'
              }}
            >
              <p className="text-gray-700 leading-relaxed">
                Click on any marker to explore tourist spots in {municipalityName}.
              </p>
              <div className="pt-2">
                <button
                  onClick={onViewInfo}
                  className="text-sm font-semibold px-4 py-2 rounded-lg transition-all hover:shadow-md"
                  style={{
                    background: 'linear-gradient(135deg, #FCD34D 0%, #F59E0B 100%)',
                    color: 'white'
                  }}
                >
                  View Municipality Details
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
