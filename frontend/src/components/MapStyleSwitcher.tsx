import { memo } from 'react'

type MapStyle = 'satellite' | 'standard' | 'transport'

interface MapStyleSwitcherProps {
  currentStyle: MapStyle
  onStyleChange: (style: MapStyle) => void
  isMobile?: boolean
}

function MapStyleSwitcher({ currentStyle, onStyleChange, isMobile = false }: MapStyleSwitcherProps) {
  const styles: { id: MapStyle; label: string; preview: string }[] = [
    { id: 'standard', label: 'Standard', preview: '/map-previews/standard.jpg' },
    { id: 'satellite', label: 'Satellite', preview: '/map-previews/satellite.jpg' },
    { id: 'transport', label: 'Transport', preview: '/map-previews/transport.jpg' },
  ]

  return (
    <div
      className="fixed z-[1000] flex gap-2 p-2 shadow-lg"
      style={{
        top: '20px',
        right: '20px',
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
        borderRadius: '12px',
        maxWidth: isMobile ? 'calc(100vw - 40px)' : 'auto',
      }}
    >
      {styles.map((style) => (
        <button
          key={style.id}
          onClick={() => onStyleChange(style.id)}
          className="flex flex-col items-center gap-1 p-2 rounded-lg transition-all hover:bg-gray-100 relative"
          style={{
            border: currentStyle === style.id ? '2px solid var(--forest-green)' : '2px solid transparent',
            backgroundColor: currentStyle === style.id ? 'rgba(16, 185, 129, 0.1)' : 'transparent',
          }}
          aria-label={`Switch to ${style.label} map style`}
          aria-pressed={currentStyle === style.id}
        >
          {/* Preview Image */}
          <div
            className="w-16 h-12 rounded-md overflow-hidden bg-gray-200"
            style={{
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
            }}
          >
            {/* Placeholder - replace with actual preview images later */}
            <div
              className="w-full h-full flex items-center justify-center text-xs font-semibold"
              style={{
                background:
                  style.id === 'satellite'
                    ? 'linear-gradient(135deg, #1e3a8a 0%, #10b981 100%)'
                    : style.id === 'standard'
                    ? 'linear-gradient(135deg, #f3f4f6 0%, #d1d5db 100%)'
                    : 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
                color: style.id === 'standard' ? '#374151' : '#ffffff',
              }}
            >
              {style.id === 'satellite' && '🛰️'}
              {style.id === 'standard' && '🗺️'}
              {style.id === 'transport' && '🚗'}
            </div>
          </div>

          {/* Label */}
          <span
            className="text-xs font-medium"
            style={{
              color: currentStyle === style.id ? 'var(--forest-green)' : '#6b7280',
            }}
          >
            {style.label}
          </span>

          {/* Active indicator */}
          {currentStyle === style.id && (
            <div
              className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-6 h-1 rounded-full"
              style={{ backgroundColor: 'var(--forest-green)' }}
            />
          )}
        </button>
      ))}
    </div>
  )
}

export default memo(MapStyleSwitcher)