import { memo, useEffect } from 'react'
import { MUNICIPALITY_NAMES } from '../config/municipalities'
import type { Model3DConfig } from '../types/model'

interface MunicipalityInfoModalProps {
  geocode: string | null
  touristSpots: Model3DConfig[]
  onClose: () => void
  onSpotClick: (spotId: string) => void
}

// Municipality data (can be moved to a separate config file later)
const MUNICIPALITY_DATA: Record<string, {
  population?: number
  barangays?: number
  description: string
}> = {
  '052001000': { // Bagamanoc
    population: 10000,
    barangays: 26,
    description: 'The gateway to Catanduanes, known for its pristine beaches and friendly locals.'
  },
  '052002000': { // Baras
    population: 13000,
    barangays: 30,
    description: 'Home to the famous Maribina Falls and lush forest landscapes.'
  },
  '052003000': { // Bato
    population: 21000,
    barangays: 33,
    description: 'A coastal municipality known for its fishing industry and scenic shores.'
  },
  '052004000': { // Caramoran
    population: 30000,
    barangays: 52,
    description: 'The largest municipality by land area, featuring diverse landscapes and attractions.'
  },
  '052005000': { // Gigmoto
    population: 10000,
    barangays: 9,
    description: 'A remote and peaceful municipality with stunning natural beauty.'
  },
  '052006000': { // Pandan
    population: 20000,
    barangays: 26,
    description: 'Known for its agricultural lands and warm community spirit.'
  },
  '052007000': { // Panganiban (Payo)
    population: 11000,
    barangays: 26,
    description: 'A historic town with Spanish colonial influences and beautiful churches.'
  },
  '052008000': { // San Andres
    population: 35000,
    barangays: 52,
    description: 'Famous for surfing spots like Puraran Beach and pristine coastlines.'
  },
  '052009000': { // San Miguel
    population: 16000,
    barangays: 24,
    description: 'A tranquil municipality with scenic rural landscapes.'
  },
  '052010000': { // Viga
    population: 24000,
    barangays: 33,
    description: 'Home to the Catanduanes State University and vibrant local culture.'
  },
  '052011000': { // Virac (Capital)
    population: 76000,
    barangays: 67,
    description: 'The capital and commercial center of Catanduanes, with modern amenities and rich history.'
  }
}

function MunicipalityInfoModal({ geocode, touristSpots, onClose, onSpotClick }: MunicipalityInfoModalProps) {
  // Close modal on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [onClose])

  if (!geocode) return null

  const municipalityName = MUNICIPALITY_NAMES[geocode] || 'Unknown Municipality'
  const municipalityInfo = MUNICIPALITY_DATA[geocode] || {
    description: 'A beautiful municipality in Catanduanes.'
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-[2000] animate-fadeIn"
        onClick={onClose}
        style={{ animation: 'fadeIn 0.2s ease-out' }}
      />

      {/* Modal */}
      <div
        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[2001] w-full max-w-2xl max-h-[90vh] overflow-hidden rounded-2xl shadow-2xl animate-bounceIn"
        style={{
          backgroundColor: 'white',
          animation: 'bounceIn 0.4s ease-out'
        }}
      >
        {/* Header with gradient */}
        <div
          className="px-6 py-5 relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, var(--forest-green) 0%, var(--ocean-blue) 100%)'
          }}
        >
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center text-white text-2xl font-bold shadow-lg"
                style={{ backgroundColor: 'var(--sunset-gold)' }}
              >
                📍
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">{municipalityName}</h2>
                <p className="text-white/80 text-sm font-medium">Municipality of Catanduanes</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-110"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                color: 'white'
              }}
              aria-label="Close modal"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-100px)] px-6 py-5 space-y-5">
          {/* Quick Facts */}
          {(municipalityInfo.population || municipalityInfo.barangays) && (
            <div
              className="rounded-xl p-4 border-2"
              style={{
                backgroundColor: 'rgba(244, 162, 89, 0.1)',
                borderColor: 'var(--sunset-gold)'
              }}
            >
              <h3 className="text-lg font-bold mb-3" style={{ color: 'var(--forest-green)' }}>
                📊 Quick Facts
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {municipalityInfo.population && (
                  <div>
                    <p className="text-gray-600 text-sm font-medium">Population</p>
                    <p className="text-2xl font-bold" style={{ color: 'var(--ocean-blue)' }}>
                      {municipalityInfo.population.toLocaleString()}
                    </p>
                  </div>
                )}
                {municipalityInfo.barangays && (
                  <div>
                    <p className="text-gray-600 text-sm font-medium">Barangays</p>
                    <p className="text-2xl font-bold" style={{ color: 'var(--ocean-blue)' }}>
                      {municipalityInfo.barangays}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* About */}
          <div>
            <h3 className="text-lg font-bold mb-2" style={{ color: 'var(--forest-green)' }}>
              📝 About
            </h3>
            <p className="text-gray-700 leading-relaxed">
              {municipalityInfo.description}
            </p>
          </div>

          {/* Top Attractions */}
          {touristSpots.length > 0 && (
            <div>
              <h3 className="text-lg font-bold mb-3" style={{ color: 'var(--forest-green)' }}>
                🎯 Top Attractions ({touristSpots.length})
              </h3>
              <div className="space-y-2">
                {touristSpots.map((spot) => (
                  <button
                    key={spot.id}
                    onClick={() => {
                      onSpotClick(spot.id)
                      onClose()
                    }}
                    className="w-full text-left px-4 py-3 rounded-lg border-2 transition-all hover:shadow-md"
                    style={{
                      backgroundColor: 'white',
                      borderColor: 'rgba(244, 162, 89, 0.3)'
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold shadow-sm flex-shrink-0"
                        style={{ backgroundColor: 'var(--sunset-gold)' }}
                      >
                        🏖️
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-800 truncate">
                          {spot.name || spot.id}
                        </p>
                        <p className="text-sm text-gray-600">
                          Click to explore on map
                        </p>
                      </div>
                      <svg
                        className="w-5 h-5 flex-shrink-0"
                        style={{ color: 'var(--ocean-blue)' }}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Explore Button */}
          <button
            onClick={onClose}
            className="w-full px-6 py-4 rounded-xl font-bold text-lg transition-all hover:shadow-lg flex items-center justify-center gap-2"
            style={{
              background: 'linear-gradient(135deg, var(--forest-green) 0%, var(--ocean-blue) 100%)',
              color: 'white'
            }}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
            Explore on Map
          </button>
        </div>
      </div>
    </>
  )
}

export default memo(MunicipalityInfoModal)
