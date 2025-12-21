import { memo } from 'react'

interface MapControlsProps {
  onResetCamera: () => void
  onShowCurrentLocation?: () => void
  isSidebarOpen?: boolean
  isMobile?: boolean
}

function MapControls({ 
  onResetCamera, 
  onShowCurrentLocation,
  isSidebarOpen = false,
  isMobile = false 
}: MapControlsProps) {
  return (
    <div
      className="fixed z-[1000] flex flex-col gap-0 shadow-lg overflow-hidden"
      style={{
        bottom: '20px',
        right: '20px',
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
        borderRadius: '10px',
      }}
    >
      {/* Current Location Button */}
      <button
        onClick={onShowCurrentLocation}
        className="w-9 h-9 flex items-center justify-center transition-all hover:bg-gray-100"
        style={{
          color: 'var(--forest-green)',
        }}
        title="Show current location"
        aria-label="Show current location"
      >
        <svg className="w-4.5 h-4.5" style={{ width: '18px', height: '18px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      </button>

      {/* Reset Camera Button */}
      <button
        onClick={onResetCamera}
        className="w-9 h-9 flex items-center justify-center transition-all hover:bg-gray-100"
        style={{
          color: 'var(--forest-green)',
        }}
        title="Reset camera view"
        aria-label="Reset camera view"
      >
        <svg className="w-4.5 h-4.5" style={{ width: '18px', height: '18px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      </button>
    </div>
  )
}

export default memo(MapControls)