import { memo } from 'react'
import { useLocation } from 'react-router-dom'

interface MinimalistSidebarProps {
  isOpen: boolean
  onClose: () => void
  onToggleItinerary?: () => void
}

function MinimalistSidebar({ isOpen, onClose, onToggleItinerary }: MinimalistSidebarProps) {
  const location = useLocation()

  // Hide sidebar on home page
  const isHomePage = location.pathname === '/'
  if (isHomePage) {
    return null
  }

  return (
    <>
      {/* Backdrop overlay - only on mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-[1500] transition-opacity duration-300 md:hidden"
          onClick={onClose}
          style={{ animation: 'fadeIn 0.3s ease-out' }}
        />
      )}

      {/* Main minimalist sidebar - FLOATING CARD with brand gradient */}
      <div
        className={`fixed z-[1600] transition-all duration-300 ease-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
        style={{
          top: '4px',
          left: '4px',
          height: 'calc(100vh - 8px)',
          width: '72px',
          background: 'linear-gradient(180deg, var(--forest-green) 0%, var(--ocean-blue) 100%)',
          backdropFilter: 'blur(20px)',
          boxShadow: '0 4px 20px rgba(46, 125, 50, 0.3)',
          borderRadius: '16px',
          overflow: 'hidden',
        }}
      >
        <div className="flex flex-col h-full">
          {/* HapiHub Logo Button - Top */}
          <div className="px-4 py-4 flex-shrink-0">
            <button
              className="w-full h-12 rounded-xl flex items-center justify-center transition-all hover:bg-white/10"
              style={{ backgroundColor: 'transparent' }}
              title="HapiHub"
            >
              <img src="/icons/chatbot.svg" alt="HapiHub" className="w-8 h-8" />
            </button>
          </div>

          {/* Spacer to center the itinerary button */}
          <div className="flex-1" />

          {/* Plan/Itinerary Button - Centered */}
          <div className="px-4 flex-shrink-0">
            <div className="relative group">
              <button
                onClick={onToggleItinerary}
                className="w-full h-12 rounded-xl flex items-center justify-center transition-all hover:bg-white/20"
                style={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  color: 'white' 
                }}
                title="Plan Your Trip"
              >
                <svg className="w-6 h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
              </button>
              
              {/* Tooltip */}
              <div
                className="absolute left-full ml-2 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-lg whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 pointer-events-none"
                style={{
                  background: 'linear-gradient(135deg, var(--forest-green) 0%, var(--ocean-blue) 100%)',
                  color: 'white',
                  fontSize: '14px',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
                }}
              >
                Plan Your Trip
              </div>
            </div>
          </div>

          {/* Spacer to center the itinerary button */}
          <div className="flex-1" />

          {/* Close button for mobile - Bottom */}
          <div className="px-4 pb-4 flex-shrink-0">
            <button
              onClick={onClose}
              className="md:hidden w-full h-12 rounded-xl flex items-center justify-center transition-all hover:bg-white/20"
              style={{ color: 'white' }}
              aria-label="Close sidebar"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

export default memo(MinimalistSidebar)