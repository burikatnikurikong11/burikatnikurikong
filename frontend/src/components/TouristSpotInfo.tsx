import { useEffect, useState, memo } from 'react'
import type maplibregl from 'maplibre-gl'
import { Model3DConfig } from '../types/model'
import { calculateCardPosition } from '../utils/cardPositioning'

interface TouristSpotInfoProps {
  spot: Model3DConfig | null
  map: maplibregl.Map | null
  onClose: () => void
}

const CARD_WIDTH = 320
const CARD_HEIGHT = 280

function TouristSpotInfo({ spot, map, onClose }: TouristSpotInfoProps) {
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null)
  const [scale, setScale] = useState(1)
  const [cardPosition, setCardPosition] = useState({ transform: 'translate(-50%, calc(-100% - 60px)) scale(1)', transformOrigin: 'center bottom' })

  useEffect(() => {
    if (!spot || !map) {
      setPosition(null)
      return
    }

    const updatePosition = () => {
      const point = map.project(spot.coordinates)
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
  }, [spot, map])

  if (!spot || !position) return null

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
      <div className="bg-white rounded-lg shadow-xl p-6 w-80 max-w-full pointer-events-auto">
        <div className="flex items-start justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-800" id="spot-info-title">{spot.name || spot.id}</h2>
          <button
            onClick={onClose}
            onKeyDown={(e) => {
              if (e.key === 'Escape') onClose()
            }}
            className="ml-4 p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-600 text-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Close tourist spot information"
            aria-controls="spot-info-title"
          >
            ×
          </button>
        </div>

        <div className="space-y-3">
          <div>
            <h3 className="text-sm font-semibold text-gray-500 uppercase mb-1">Location</h3>
            <p className="text-gray-700">
              {spot.coordinates[1].toFixed(6)}, {spot.coordinates[0].toFixed(6)}
            </p>
          </div>

          {spot.altitude !== undefined && spot.altitude > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase mb-1">Altitude</h3>
              <p className="text-gray-700">{spot.altitude}m</p>
            </div>
          )}
        </div>

        <div className="mt-6 pt-4 border-t border-gray-200">
          <button
            onClick={onClose}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                onClose()
              }
            }}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            aria-label="Close tourist spot information"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

export default memo(TouristSpotInfo)

