import { memo, useState } from 'react'

interface MapControlsProps {
  onResetCamera: () => void
  onToggleMapStyle?: () => void
  onShowCurrentLocation?: () => void
  isSidebarOpen?: boolean
  isMobile?: boolean
}

function MapControls({ 
  onResetCamera, 
  onToggleMapStyle, 
  onShowCurrentLocation,
  isSidebarOpen = false,
  isMobile = false 
}: MapControlsProps) {
  return (
    <div
      className="fixed z-[1000] flex flex-col gap-0 shadow-lg overflow-hidden"
      style={{
        top: '20px',
        right: '20px',
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
        borderRadius: '10px',
      }}
    >
      {/* Map Style Button */}
      <button
        onClick={onToggleMapStyle}
        className="w-9 h-9 flex items-center justify-center transition-all hover:bg-gray-100"
        style={{
          color: 'var(--forest-green)',
        }}
        title="Change map style"
        aria-label="Change map style"
      >
        <svg className="w-4.5 h-4.5" style={{ width: '18px', height: '18px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
        </svg>
      </button>

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