import React, { useEffect, useState } from 'react'

interface MunicipalityTooltipProps {
  municipalityName: string | null
  mouseX: number
  mouseY: number
  isVisible?: boolean
}

export default function MunicipalityTooltip({ municipalityName, mouseX, mouseY, isVisible = true }: MunicipalityTooltipProps) {
  const [position, setPosition] = useState({ x: mouseX, y: mouseY })

  useEffect(() => {
    // Smooth transition for tooltip position
    setPosition({ x: mouseX, y: mouseY })
  }, [mouseX, mouseY])

  // Don't render if not visible or no municipality name
  if (!municipalityName || !isVisible) return null

  // Format municipality name (capitalize first letter of each word)
  const formattedName = municipalityName
    .split('_')
    .map(word => word.charAt(0) + word.slice(1).toLowerCase())
    .join(' ')

  return (
    <div
      className="fixed pointer-events-none z-[10000] transition-all duration-75 ease-out"
      style={{
        left: `${position.x + 12}px`,
        top: `${position.y + 12}px`,
      }}
    >
      <div
        className="px-3 py-1.5 rounded-lg shadow-xl border-2 backdrop-blur-sm"
        style={{
          backgroundColor: 'rgba(30, 30, 30, 0.95)',
          borderColor: 'rgba(255, 215, 0, 0.8)',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
        }}
      >
        {/* Top accent border line */}
        <div
          className="absolute top-0 left-0 right-0 h-[1px]"
          style={{
            background: 'linear-gradient(90deg, transparent, rgba(255, 215, 0, 0.5), transparent)'
          }}
        />
        
        {/* Municipality Name */}
        <div className="flex items-center gap-2">
          {/* Location Icon */}
          <svg
            className="w-3.5 h-3.5 flex-shrink-0"
            fill="none"
            stroke="#FFD700"
            viewBox="0 0 24 24"
            style={{ filter: 'drop-shadow(0 0 2px rgba(255, 215, 0, 0.5))' }}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>

          <span
            className="font-semibold text-sm whitespace-nowrap tracking-wide"
            style={{
              color: '#FFD700',
              textShadow: '0 0 10px rgba(255, 215, 0, 0.5), 0 1px 2px rgba(0, 0, 0, 0.8)',
              fontFamily: '"Cinzel", "Georgia", serif'
            }}
          >
            {formattedName}
          </span>
        </div>

        {/* Bottom accent line */}
        <div
          className="absolute bottom-0 left-0 right-0 h-[1px]"
          style={{
            background: 'linear-gradient(90deg, transparent, rgba(255, 215, 0, 0.3), transparent)'
          }}
        />

        {/* Corner decorations */}
        <div
          className="absolute -top-1 -left-1 w-2 h-2 border-t-2 border-l-2"
          style={{ borderColor: 'rgba(255, 215, 0, 0.6)' }}
        />
        <div
          className="absolute -top-1 -right-1 w-2 h-2 border-t-2 border-r-2"
          style={{ borderColor: 'rgba(255, 215, 0, 0.6)' }}
        />
        <div
          className="absolute -bottom-1 -left-1 w-2 h-2 border-b-2 border-l-2"
          style={{ borderColor: 'rgba(255, 215, 0, 0.6)' }}
        />
        <div
          className="absolute -bottom-1 -right-1 w-2 h-2 border-b-2 border-r-2"
          style={{ borderColor: 'rgba(255, 215, 0, 0.6)' }}
        />
      </div>
    </div>
  )
}
