import { X, MapPin, Users, Building2, Map as MapIcon } from 'lucide-react'
import { MUNICIPALITY_NAMES } from '../config/municipalities'
import type { TouristSpotModel } from '../types/touristSpot'

interface MunicipalityModalProps {
  municipalityGeocode: string
  models: TouristSpotModel[]
  onClose: () => void
  onSpotClick: (modelId: string) => void
}

// Municipality data (you can expand this with real data later)
const MUNICIPALITY_DATA: Record<string, {
  population?: string
  barangays?: number
  description?: string
}> = {
  '052001000': { // Bagamanoc
    population: '11,086',
    barangays: 14,
    description: 'Known for its rich fishing grounds and coastal beauty.'
  },
  '052002000': { // Baras
    population: '15,000',
    barangays: 18,
    description: 'Home to pristine beaches and natural rock formations.'
  },
  '052003000': { // Bato
    population: '21,748',
    barangays: 26,
    description: 'A coastal municipality with stunning cliff formations.'
  },
  '052004000': { // Caramoran
    population: '31,000',
    barangays: 47,
    description: 'Features beautiful beaches and the famous Palumbanes Island.'
  },
  '052005000': { // Gigmoto
    population: '10,000',
    barangays: 9,
    description: 'A secluded paradise with untouched natural beauty.'
  },
  '052006000': { // Pandan
    population: '21,000',
    barangays: 26,
    description: 'Known for its pandan plants and scenic coastal views.'
  },
  '052007000': { // Panganiban (Payo)
    population: '12,000',
    barangays: 15,
    description: 'A northern coastal town with rich maritime history.'
  },
  '052008000': { // San Andres
    population: '35,000',
    barangays: 52,
    description: 'Famous for pristine beaches and vibrant fishing communities.'
  },
  '052009000': { // San Miguel
    population: '18,000',
    barangays: 25,
    description: 'Known for agricultural products and natural springs.'
  },
  '052010000': { // Viga
    population: '25,000',
    barangays: 31,
    description: 'A progressive municipality with diverse attractions.'
  },
  '052011000': { // Virac (Capital)
    population: '76,520',
    barangays: 68,
    description: 'The capital town, featuring the provincial capitol and commercial center.'
  }
}

export default function MunicipalityModal({
  municipalityGeocode,
  models,
  onClose,
  onSpotClick
}: MunicipalityModalProps) {
  const municipalityName = MUNICIPALITY_NAMES[municipalityGeocode] || 'Unknown'
  const data = MUNICIPALITY_DATA[municipalityGeocode] || {}

  return (
    <div
      className="fixed inset-0 z-[2000] flex items-center justify-center p-4"
      style={{
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        backdropFilter: 'blur(4px)',
        animation: 'fadeIn 0.2s ease-out'
      }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden"
        style={{
          animation: 'bounceIn 0.3s ease-out'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="px-6 py-4 flex items-center justify-between"
          style={{
            background: 'linear-gradient(135deg, #FCD34D 0%, #F59E0B 100%)'
          }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.3)'
              }}
            >
              <MapPin size={24} className="text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">
                {municipalityName}
              </h2>
              <p className="text-sm text-white/90">
                Municipality of Catanduanes
              </p>
            </div>
          </div>
          
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:bg-white/30"
            aria-label="Close"
          >
            <X size={20} className="text-white" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto" style={{ maxHeight: 'calc(80vh - 80px)' }}>
          {/* Quick Facts */}
          <div className="px-6 py-5 grid grid-cols-3 gap-4">
            {data.population && (
              <div className="text-center p-4 rounded-xl" style={{ backgroundColor: 'rgba(254, 243, 199, 0.5)' }}>
                <Users size={24} className="mx-auto mb-2" style={{ color: '#D97706' }} />
                <p className="text-2xl font-bold" style={{ color: '#92400E' }}>{data.population}</p>
                <p className="text-xs text-gray-600 mt-1">Population</p>
              </div>
            )}
            {data.barangays && (
              <div className="text-center p-4 rounded-xl" style={{ backgroundColor: 'rgba(254, 243, 199, 0.5)' }}>
                <Building2 size={24} className="mx-auto mb-2" style={{ color: '#D97706' }} />
                <p className="text-2xl font-bold" style={{ color: '#92400E' }}>{data.barangays}</p>
                <p className="text-xs text-gray-600 mt-1">Barangays</p>
              </div>
            )}
            <div className="text-center p-4 rounded-xl" style={{ backgroundColor: 'rgba(254, 243, 199, 0.5)' }}>
              <MapIcon size={24} className="mx-auto mb-2" style={{ color: '#D97706' }} />
              <p className="text-2xl font-bold" style={{ color: '#92400E' }}>{models.length}</p>
              <p className="text-xs text-gray-600 mt-1">Tourist Spots</p>
            </div>
          </div>

          {/* Description */}
          {data.description && (
            <div className="px-6 py-4 border-t" style={{ borderColor: 'rgba(234, 179, 8, 0.2)' }}>
              <h3 className="text-lg font-bold mb-2" style={{ color: '#92400E' }}>About</h3>
              <p className="text-gray-700 leading-relaxed">{data.description}</p>
            </div>
          )}

          {/* Top Attractions */}
          <div className="px-6 py-4 border-t" style={{ borderColor: 'rgba(234, 179, 8, 0.2)' }}>
            <h3 className="text-lg font-bold mb-4" style={{ color: '#92400E' }}>Top Attractions</h3>
            <div className="space-y-3">
              {models.slice(0, 5).map((model) => (
                <button
                  key={model.id}
                  onClick={() => {
                    onSpotClick(model.id)
                    onClose()
                  }}
                  className="w-full text-left p-3 rounded-lg transition-all hover:shadow-md"
                  style={{
                    backgroundColor: 'rgba(254, 243, 199, 0.3)',
                    border: '1px solid rgba(234, 179, 8, 0.2)'
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center text-lg"
                        style={{ backgroundColor: 'rgba(251, 191, 36, 0.3)' }}
                      >
                        {model.category === 'Beach' ? '🏖️' : 
                         model.category === 'Mountain' ? '🏔️' : 
                         model.category === 'Cultural' ? '🏛️' : '📍'}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{model.name || model.id}</p>
                        {model.category && (
                          <p className="text-xs text-gray-600">{model.category}</p>
                        )}
                      </div>
                    </div>
                    <svg
                      className="w-5 h-5"
                      style={{ color: '#D97706' }}
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

          {/* Footer */}
          <div
            className="px-6 py-4 border-t"
            style={{
              backgroundColor: 'rgba(254, 243, 199, 0.2)',
              borderColor: 'rgba(234, 179, 8, 0.2)'
            }}
          >
            <button
              onClick={onClose}
              className="w-full py-3 rounded-lg font-semibold text-white transition-all hover:shadow-lg"
              style={{
                background: 'linear-gradient(135deg, #FCD34D 0%, #F59E0B 100%)'
              }}
            >
              Explore on Map
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
