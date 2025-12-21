import { memo } from 'react'
import { Link, useLocation } from 'react-router-dom'

interface MinimalistSidebarProps {
  isOpen: boolean
  onClose: () => void
}

function MinimalistSidebar({ isOpen, onClose }: MinimalistSidebarProps) {
  const location = useLocation()

  return (
    <>
      {/* Backdrop overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-[1500] transition-opacity duration-300 md:hidden"
          onClick={onClose}
          style={{ animation: 'fadeIn 0.3s ease-out' }}
        />
      )}

      {/* Minimalist sidebar */}
      <div
        className={`fixed top-0 left-0 h-full z-[1600] transition-transform duration-300 ease-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0`}
        style={{
          width: '280px',
          backgroundColor: 'rgba(30, 35, 45, 0.98)',
          backdropFilter: 'blur(20px)',
          boxShadow: '4px 0 24px rgba(0, 0, 0, 0.15)',
        }}
      >
        <div className="flex flex-col h-full">
          {/* Header with HapiHub title */}
          <div className="px-6 py-5 border-b" style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}>
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                <span
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: 'var(--sunset-gold)' }}
                >
                  🗺️
                </span>
                HapiHub
              </h1>
              {/* Close button for mobile */}
              <button
                onClick={onClose}
                className="md:hidden w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:bg-white/10"
                style={{ color: 'rgba(255, 255, 255, 0.7)' }}
                aria-label="Close sidebar"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Navigation Menu */}
          <nav className="flex-1 px-4 py-4 space-y-2 overflow-y-auto">
            {/* Search */}
            <Link
              to="/discover"
              onClick={onClose}
              className="flex items-center gap-4 px-4 py-3 rounded-xl transition-all hover:bg-white/10"
              style={{
                backgroundColor: location.pathname === '/discover' ? 'rgba(255, 255, 255, 0.15)' : 'transparent',
                color: 'white',
              }}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <span className="text-base font-medium">Search</span>
            </Link>

            {/* Itinerary */}
            <button
              className="w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all hover:bg-white/10"
              style={{
                color: 'white',
              }}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                />
              </svg>
              <span className="text-base font-medium">Itinerary</span>
            </button>

            {/* Guides */}
            <button
              className="w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all hover:bg-white/10"
              style={{
                color: 'white',
              }}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                />
              </svg>
              <span className="text-base font-medium">Guides</span>
            </button>

            {/* Divider */}
            <div className="py-2">
              <div style={{ height: '1px', backgroundColor: 'rgba(255, 255, 255, 0.1)' }} />
            </div>

            {/* Recents Section */}
            <div className="pt-2">
              <div className="flex items-center justify-between px-4 py-2">
                <h3 className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'rgba(255, 255, 255, 0.5)' }}>
                  Recents
                </h3>
              </div>

              {/* Recent items */}
              <div className="space-y-1">
                <button
                  className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all hover:bg-white/10"
                  style={{ color: 'white' }}
                >
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: 'rgba(255, 255, 255, 0.15)' }}
                  >
                    🏛️
                  </div>
                  <span className="text-sm font-medium truncate">Caramoran</span>
                </button>

                <button
                  className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all hover:bg-white/10"
                  style={{ color: 'white' }}
                >
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: 'rgba(255, 255, 255, 0.15)' }}
                  >
                    🏛️
                  </div>
                  <span className="text-sm font-medium truncate">Garchitorena</span>
                </button>

                <button
                  className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all hover:bg-white/10"
                  style={{ color: 'white' }}
                >
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: 'rgba(255, 255, 255, 0.15)' }}
                  >
                    📍
                  </div>
                  <span className="text-sm font-medium truncate">Virac Point</span>
                </button>
              </div>
            </div>
          </nav>

          {/* Footer */}
          <div className="px-6 py-4 border-t" style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}>
            <p className="text-xs text-center" style={{ color: 'rgba(255, 255, 255, 0.5)' }}>
              Made with ❤️ for Catanduanes
            </p>
          </div>
        </div>
      </div>
    </>
  )
}

export default memo(MinimalistSidebar)
