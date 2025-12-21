import React, { useEffect, useRef, useState } from 'react'
import * as LucideIcons from 'lucide-react'
import { PlaceCategory } from '../types/place'
import { getCategoryIcon } from '../config/categoryIcons'

interface AnimatedMarkerProps {
  category: PlaceCategory
  name: string
  thumbnail?: string
  onClick?: () => void
  animate?: boolean
}

export const AnimatedMarker: React.FC<AnimatedMarkerProps> = ({
  category,
  name,
  thumbnail,
  onClick,
  animate = true
}) => {
  const [isHovered, setIsHovered] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const markerRef = useRef<HTMLDivElement>(null)
  
  const iconConfig = getCategoryIcon(category)
  const IconComponent = (LucideIcons as any)[iconConfig.icon] || LucideIcons.MapPin

  useEffect(() => {
    // Trigger entrance animation
    const timer = setTimeout(() => setIsVisible(true), 50)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div
      ref={markerRef}
      className={`
        relative cursor-pointer transition-all duration-300 ease-out
        ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}
        ${isHovered ? 'scale-110 z-50' : 'scale-100 z-10'}
        ${animate ? 'animate-bounce-in' : ''}
      `}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Pulse animation ring */}
      {isHovered && (
        <div
          className="absolute inset-0 rounded-full animate-ping opacity-75"
          style={{
            backgroundColor: iconConfig.color,
            transform: 'scale(1.5)'
          }}
        />
      )}

      {/* Main marker container */}
      <div className="relative">
        {thumbnail ? (
          // Photo thumbnail marker
          <div
            className={`
              w-12 h-12 rounded-full border-3 shadow-lg transition-all duration-200
              ${isHovered ? 'shadow-2xl' : 'shadow-lg'}
            `}
            style={{
              borderColor: iconConfig.borderColor,
              backgroundImage: `url(${thumbnail})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          >
            {/* Category badge */}
            <div
              className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center shadow-md"
              style={{ backgroundColor: iconConfig.color }}
            >
              <IconComponent size={12} color="white" strokeWidth={2.5} />
            </div>
          </div>
        ) : (
          // Icon-based marker
          <div
            className={`
              w-11 h-11 rounded-full flex items-center justify-center
              shadow-lg transition-all duration-200
              ${isHovered ? 'shadow-2xl' : 'shadow-lg'}
            `}
            style={{
              backgroundColor: iconConfig.bgColor,
              borderWidth: '2px',
              borderStyle: 'solid',
              borderColor: iconConfig.borderColor
            }}
          >
            <IconComponent
              size={20}
              color={iconConfig.color}
              strokeWidth={2.5}
            />
          </div>
        )}

        {/* Pointer tip */}
        <div
          className="absolute left-1/2 transform -translate-x-1/2 w-0 h-0"
          style={{
            borderLeft: '6px solid transparent',
            borderRight: '6px solid transparent',
            borderTop: `8px solid ${iconConfig.borderColor}`,
            filter: 'drop-shadow(0 2px 3px rgba(0,0,0,0.2))'
          }}
        />
      </div>

      {/* Hover label */}
      {isHovered && (
        <div
          className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 
                     px-3 py-1.5 bg-gray-900 text-white text-sm font-medium 
                     rounded-lg shadow-xl whitespace-nowrap z-50 animate-fade-in"
        >
          {name}
          <div
            className="absolute bottom-full left-1/2 transform -translate-x-1/2 
                       w-0 h-0 border-l-4 border-r-4 border-b-4 
                       border-transparent border-b-gray-900"
          />
        </div>
      )}
    </div>
  )
}
