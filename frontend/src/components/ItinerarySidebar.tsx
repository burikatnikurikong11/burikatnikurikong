import { memo } from 'react'
import { ChevronRight, ChevronLeft } from 'lucide-react'

interface ItinerarySidebarProps {
  isOpen: boolean
  onToggle: () => void
  isMobile: boolean
  isExpanded?: boolean
  onToggleExpanded?: () => void
}

function ItinerarySidebar({ isOpen, onToggle, isMobile, isExpanded = false, onToggleExpanded }: ItinerarySidebarProps) {
  return (
    <>
      {/* Desktop: Left sidebar with collapse button, Mobile: Bottom sheet */}
      <div
        className={`
          ${isMobile ? 'fixed bottom-0 left-0 right-0' : 'relative h-full'}
          ${isMobile && !isOpen ? 'translate-y-full' : ''}
          transition-all duration-300 ease-out
          bg-white
          ${isMobile ? 'rounded-t-3xl' : 'rounded-2xl'}
          overflow-hidden
        `}
        style={{
          width: isMobile ? '100%' : isOpen ? (isExpanded ? 'calc(60% - 8px)' : 'calc(30% - 8px)') : '0',
          height: isMobile ? '50%' : '100%',
          zIndex: isMobile ? 1000 : 'auto',
          flexShrink: 0,
          minWidth: !isMobile && isOpen ? (isExpanded ? '600px' : '350px') : '0',
          maxWidth: !isMobile && isOpen ? (isExpanded ? '900px' : '450px') : '0',
          boxShadow: isMobile ? '0 -4px 20px rgba(0, 0, 0, 0.08)' : '0 2px 8px rgba(0, 0, 0, 0.08)',
        }}
      >
        {/* Collapse/Expand Button - Desktop Only, positioned on right edge */}
        {!isMobile && (
          <button
            onClick={onToggle}
            className="absolute top-1/2 -right-10 transform -translate-y-1/2 z-10
                       w-10 h-24 rounded-r-xl flex items-center justify-center
                       transition-all duration-300 hover:w-12 group
                       shadow-lg"
            style={{
              background: 'linear-gradient(135deg, var(--forest-green) 0%, var(--ocean-blue) 100%)',
            }}
            aria-label={isOpen ? 'Collapse itinerary' : 'Expand itinerary'}
          >
            <svg
              className={`w-6 h-6 text-white transition-transform duration-300 ${
                isOpen ? 'rotate-180' : 'rotate-0'
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        )}

        {/* Expand/Compress Button - Desktop Only, positioned below collapse button */}
        {!isMobile && isOpen && onToggleExpanded && (
          <button
            onClick={onToggleExpanded}
            className="absolute top-1/2 -right-10 transform translate-y-16 z-10
                       w-10 h-20 rounded-r-xl flex items-center justify-center
                       transition-all duration-300 hover:w-12 group
                       shadow-lg"
            style={{
              background: 'linear-gradient(135deg, #f59e0b 0%, #f97316 100%)',
            }}
            aria-label={isExpanded ? 'Compress panel' : 'Expand panel'}
          >
            {isExpanded ? (
              <ChevronLeft className="w-6 h-6 text-white" strokeWidth={2.5} />
            ) : (
              <ChevronRight className="w-6 h-6 text-white" strokeWidth={2.5} />
            )}
          </button>
        )}

        {/* Header */}
        <div
          className="px-6 py-4 border-b flex items-center justify-between"
          style={{
            background: 'linear-gradient(135deg, var(--forest-green) 0%, var(--ocean-blue) 100%)',
            borderColor: 'rgba(255, 255, 255, 0.1)',
          }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }}
            >
              <span className="text-2xl">🗺️</span>
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">My Itinerary</h2>
              <p className="text-xs text-white/80">Plan your Catanduanes adventure</p>
            </div>
          </div>

          {/* Toggle button for mobile */}
          {isMobile && (
            <button
              onClick={onToggle}
              className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:bg-white/20"
              style={{ color: 'white' }}
              aria-label={isOpen ? 'Close itinerary' : 'Open itinerary'}
            >
              <svg
                className="w-6 h-6 transition-transform duration-300"
                style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          )}
        </div>

        {/* Content */}
        <div className="h-[calc(100%-80px)] overflow-y-auto">
          {/* Empty State */}
          <div className="flex flex-col items-center justify-center h-full p-8 text-center">
            <div
              className="w-24 h-24 rounded-full flex items-center justify-center mb-6"
              style={{ backgroundColor: 'var(--sunset-gold)', opacity: 0.2 }}
            >
              <span className="text-5xl">📝</span>
            </div>
            <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--forest-green)' }}>
              No Itinerary Yet
            </h3>
            <p className="text-gray-600 mb-6 max-w-sm">
              Start planning your Catanduanes adventure by adding places to your itinerary.
            </p>
            <button
              className="px-6 py-3 rounded-xl font-semibold text-white transition-all hover:shadow-lg"
              style={{
                background: 'linear-gradient(135deg, var(--forest-green) 0%, var(--ocean-blue) 100%)',
              }}
            >
              + Add First Destination
            </button>

            {/* Quick Tips */}
            <div className="mt-12 w-full max-w-md">
              <h4 className="text-sm font-semibold mb-4" style={{ color: 'var(--forest-green)' }}>
                Quick Tips
              </h4>
              <div className="space-y-3 text-left">
                <div className="flex items-start gap-3 p-3 rounded-lg" style={{ backgroundColor: 'rgba(46, 125, 50, 0.05)' }}>
                  <span className="text-xl flex-shrink-0">📍</span>
                  <div>
                    <p className="text-sm font-medium" style={{ color: 'var(--forest-green)' }}>
                      Click on map markers
                    </p>
                    <p className="text-xs text-gray-600">Tap any attraction to view details and add to itinerary</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-lg" style={{ backgroundColor: 'rgba(3, 155, 229, 0.05)' }}>
                  <span className="text-xl flex-shrink-0">🔍</span>
                  <div>
                    <p className="text-sm font-medium" style={{ color: 'var(--ocean-blue)' }}>
                      Use the search
                    </p>
                    <p className="text-xs text-gray-600">Find specific places, restaurants, or activities</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-lg" style={{ backgroundColor: 'rgba(244, 162, 89, 0.05)' }}>
                  <span className="text-xl flex-shrink-0">🤖</span>
                  <div>
                    <p className="text-sm font-medium" style={{ color: 'var(--sunset-gold)' }}>
                      Ask HapiHub AI
                    </p>
                    <p className="text-xs text-gray-600">Get personalized recommendations from our AI assistant</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default memo(ItinerarySidebar)