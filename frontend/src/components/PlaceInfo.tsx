import { useEffect, useState, memo } from 'react'
import { X } from 'lucide-react'
import type maplibregl from 'maplibre-gl'
import type { Place } from '../types/place'
import { calculateCardPosition } from '../utils/cardPositioning'

interface PlaceInfoProps {
  place: Place | null
  map: maplibregl.Map | null
  onClose: () => void
}

const CARD_WIDTH = 320
const CARD_HEIGHT = 240

function PlaceInfo({ place, map, onClose }: PlaceInfoProps) {
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null)
  const [scale, setScale] = useState(1)
  const [cardPosition, setCardPosition] = useState({ transform: 'translate(-50%, calc(-100% - 50px)) scale(1)', transformOrigin: 'center bottom' })

  useEffect(() => {
    if (!place || !map) {
      setPosition(null)
      return
    }

    const updatePosition = () => {
      const point = map.project(place.coordinates)
      setPosition({ x: point.x, y: point.y })

      const zoom = map.getZoom()
      const minScale = 0.8
      const maxScale = 1.0
      const baseZoom = 15
      const zoomFactor = 0.05

      let calculatedScale = 1 - ((zoom - baseZoom) * zoomFactor)
      calculatedScale = Math.max(minScale, Math.min(maxScale, calculatedScale))
      setScale(calculatedScale)

      const container = map.getContainer()
      const viewportDimensions = {
        width: container.clientWidth,
        height: container.clientHeight
      }

      const newCardPosition = calculateCardPosition(
        { x: point.x, y: point.y },
        { width: CARD_WIDTH, height: CARD_HEIGHT },
        viewportDimensions,
        calculatedScale
      )
      setCardPosition(newCardPosition)
    }

    updatePosition()
    map.on('move', updatePosition)
    map.on('zoom', updatePosition)

    return () => {
      map.off('move', updatePosition)
      map.off('zoom', updatePosition)
    }
  }, [place, map])

  if (!place || !position) return null

  return (
    <div
      className="absolute z-[1000] pointer-events-none"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        transform: cardPosition.transform,
        transformOrigin: cardPosition.transformOrigin,
        maxWidth: '20rem'
      }}
    >
      <div className="bg-white rounded-xl shadow-xl w-80 max-w-full pointer-events-auto overflow-hidden">
        <div className="w-full h-40 overflow-hidden bg-gray-200">
          {place.image ? (
            <img
              src={place.image}
              alt={place.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.style.display = 'none'
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
              <div className="text-gray-400">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                  <circle cx="8.5" cy="8.5" r="1.5"/>
                  <polyline points="21 15 16 10 5 21"/>
                </svg>
              </div>
            </div>
          )}
        </div>

        <div className="p-4">
          <div className="flex justify-between items-start mb-2">
            <div className="flex-1">
              <h2 className="text-lg font-bold text-gray-900 mb-0.5 leading-tight">{place.name}</h2>
              <p className="text-xs text-gray-500 capitalize">{place.type}</p>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation()
                onClose()
              }}
              className="ml-2 p-1.5 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
              aria-label="Close place information"
            >
              <X size={16} className="text-gray-500" />
            </button>
          </div>

          <p className="text-sm text-gray-600 mb-2 line-clamp-2">{place.description}</p>

          <p className="text-xs text-gray-500">
            Tourist attraction in {place.municipality}, Catanduanes
          </p>
        </div>
      </div>
    </div>
  )
}

export default memo(PlaceInfo)
