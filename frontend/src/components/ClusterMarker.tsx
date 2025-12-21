import React, { useState } from 'react'
import { 
  Waves, 
  Droplets, 
  Palmtree, 
  Landmark, 
  UtensilsCrossed, 
  Mountain, 
  CircleDot, 
  MapPin 
} from 'lucide-react'
import { PlaceCategory } from '../types/place'
import { getCategoryIcon } from '../config/categoryIcons'

interface ClusterMarkerProps {
  pointCount: number
  dominantCategory?: PlaceCategory
  onClick?: () => void
}

const iconComponents: Record<string, React.ComponentType<any>> = {
  'Waves': Waves,
  'Droplets': Droplets,
  'Palmtree': Palmtree,
  'Landmark': Landmark,
  'UtensilsCrossed': UtensilsCrossed,
  'Mountain': Mountain,
  'CircleDot': CircleDot,
  'MapPin': MapPin
}

export const ClusterMarker: React.FC<ClusterMarkerProps> = ({
  pointCount,
  dominantCategory = 'general',
  onClick
}) => {
  const [isHovered, setIsHovered] = useState(false)
  
  const iconConfig = getCategoryIcon(dominantCategory)
  const IconComponent = iconComponents[iconConfig.icon] || MapPin

  // Calculate size based on point count
  const getSize = () => {
    if (pointCount < 10) return { width: 56, height: 56, fontSize: '1rem' }
    if (pointCount < 50) return { width: 64, height: 64, fontSize: '1.125rem' }
    if (pointCount < 100) return { width: 80, height: 80, fontSize: '1.25rem' }
    return { width: 96, height: 96, fontSize: '1.5rem' }
  }

  const size = getSize()

  return (
    <div
      className="relative cursor-pointer transition-all duration-300 ease-out"
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        transform: isHovered ? 'scale(1.1)' : 'scale(1)',
        zIndex: isHovered ? 50 : 10
      }}
    >
      {/* Pulse effect on hover */}
      {isHovered && (
        <div
          className="absolute inset-0 rounded-full opacity-50"
          style={{
            backgroundColor: iconConfig.color,
            animation: 'ping 1s cubic-bezier(0, 0, 0.2, 1) infinite'
          }}
        />
      )}

      {/* Outer ring */}
      <div
        className="rounded-full flex items-center justify-center shadow-lg transition-all duration-200"
        style={{
          width: size.width,
          height: size.height,
          backgroundColor: iconConfig.bgColor,
          borderWidth: '3px',
          borderStyle: 'solid',
          borderColor: iconConfig.borderColor,
          boxShadow: isHovered 
            ? '0 20px 25px -5px rgba(0, 0, 0, 0.3)' 
            : '0 10px 15px -3px rgba(0, 0, 0, 0.2)'
        }}
      >
        {/* Inner circle with count */}
        <div
          className="w-full h-full rounded-full flex flex-col items-center justify-center"
          style={{
            background: `linear-gradient(135deg, ${iconConfig.bgColor} 0%, ${iconConfig.color}20 100%)`
          }}
        >
          <IconComponent
            size={isHovered ? 20 : 18}
            color={iconConfig.color}
            strokeWidth={2.5}
            style={{ marginBottom: '2px' }}
          />
          <span
            className="font-bold leading-none"
            style={{ 
              color: iconConfig.color,
              fontSize: size.fontSize
            }}
          >
            {pointCount}
          </span>
        </div>
      </div>

      {/* Hover tooltip */}
      {isHovered && (
        <div
          className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 
                     px-3 py-1.5 bg-gray-900 text-white text-sm font-medium 
                     rounded-lg shadow-xl whitespace-nowrap z-50"
          style={{
            animation: 'fadeIn 0.2s ease-out'
          }}
        >
          {pointCount} places
          <div
            className="absolute bottom-full left-1/2 transform -translate-x-1/2 w-0 h-0"
            style={{
              borderLeft: '4px solid transparent',
              borderRight: '4px solid transparent',
              borderBottom: '4px solid #111827'
            }}
          />
        </div>
      )}
    </div>
  )
}
