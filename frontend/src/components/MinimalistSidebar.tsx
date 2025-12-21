import { memo, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'

interface MinimalistSidebarProps {
  isOpen: boolean
  onClose: () => void
}

function MinimalistSidebar({ isOpen, onClose }: MinimalistSidebarProps) {
  const location = useLocation()
  const [isSearchPanelOpen, setIsSearchPanelOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

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

      {/* Main minimalist sidebar - collapsible icon bar */}
      <div
        className={`fixed top-0 left-0 h-full z-[1600] transition-transform duration-300 ease-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
        style={{
          width: '72px',
          backgroundColor: 'rgba(30, 35, 45, 0.98)',
          backdropFilter: 'blur(20px)',
          boxShadow: '4px 0 24px rgba(0, 0, 0, 0.15)',
        }}
      >
        <div className="flex flex-col h-full items-center py-4">
          {/* HapiHub Logo */}
          <Link
            to="/"
            className="w-12 h-12 rounded-xl flex items-center justify-center mb-6 transition-all hover:bg-white/10"
            style={{ backgroundColor: 'var(--sunset-gold)' }}
            title="HapiHub"
          >
            <span className="text-2xl">🗺️</span>
          </Link>

          {/* Navigation Icons */}
          <nav className="flex flex-col items-center space-y-2 flex-1">
            {/* Search Icon */}
            <button
              onClick={() => setIsSearchPanelOpen(!isSearchPanelOpen)}
              className="w-12 h-12 rounded-xl flex items-center justify-center transition-all hover:bg-white/10"
              style={{
                backgroundColor: isSearchPanelOpen ? 'rgba(255, 255, 255, 0.15)' : 'transparent',
                color: 'white',
              }}
              title="Search"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>

            {/* Guides Icon */}
            <button
              className="w-12 h-12 rounded-xl flex items-center justify-center transition-all hover:bg-white/10"
              style={{ color: 'white' }}
              title="Guides"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </button>

            {/* Directions Icon */}
            <button
              className="w-12 h-12 rounded-xl flex items-center justify-center transition-all hover:bg-white/10"
              style={{ color: 'white' }}
              title="Directions"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
            </button>

            {/* Divider */}
            <div className="w-8 my-2" style={{ height: '1px', backgroundColor: 'rgba(255, 255, 255, 0.2)' }} />

            {/* Recent Locations */}
            <button
              className="w-12 h-12 rounded-xl flex items-center justify-center transition-all hover:bg-white/10"
              style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
              title="Caramoran"
            >
              <span className="text-lg">🏛️</span>
            </button>

            <button
              className="w-12 h-12 rounded-xl flex items-center justify-center transition-all hover:bg-white/10"
              style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
              title="Garchitorena"
            >
              <span className="text-lg">🏛️</span>
            </button>

            <button
              className="w-12 h-12 rounded-xl flex items-center justify-center transition-all hover:bg-white/10"
              style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
              title="Virac Point"
            >
              <span className="text-lg">📍</span>
            </button>
          </nav>

          {/* Close button for mobile */}
          <button
            onClick={onClose}
            className="md:hidden w-12 h-12 rounded-xl flex items-center justify-center transition-all hover:bg-white/10 mt-auto"
            style={{ color: 'rgba(255, 255, 255, 0.7)' }}
            aria-label="Close sidebar"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Expandable Search Panel */}
      <div
        className={`fixed top-0 h-full z-[1550] transition-all duration-300 ease-out ${
          isSearchPanelOpen ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-0'
        }`}
        style={{
          left: '72px',
          width: '420px',
          maxWidth: 'calc(100vw - 72px)',
          backgroundColor: 'rgba(30, 35, 45, 0.98)',
          backdropFilter: 'blur(20px)',
          boxShadow: '4px 0 24px rgba(0, 0, 0, 0.15)',
          pointerEvents: isSearchPanelOpen ? 'auto' : 'none',
        }}
      >
        <div className="flex flex-col h-full">
          {/* Search Header */}
          <div className="px-6 py-5 border-b" style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">Search</h2>
              <button
                onClick={() => setIsSearchPanelOpen(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:bg-white/10"
                style={{ color: 'rgba(255, 255, 255, 0.7)' }}
                aria-label="Close search panel"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Search Input */}
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2">
                <svg className="w-5 h-5" style={{ color: 'rgba(255, 255, 255, 0.5)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search HapiHub"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-12 py-3 rounded-xl border-2 transition-all focus:outline-none"
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  borderColor: 'rgba(255, 255, 255, 0.15)',
                  color: 'white',
                }}
              />
            </div>
          </div>

          {/* Search Content */}
          <div className="flex-1 overflow-y-auto px-6 py-4">
            {/* Recently Searched */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-white">Recently Searched</h3>
                <button className="text-xs" style={{ color: 'rgba(255, 255, 255, 0.5)' }}>
                  Clear
                </button>
              </div>
              <div className="space-y-2">
                <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all hover:bg-white/10 text-left">
                  <svg className="w-5 h-5" style={{ color: 'rgba(255, 255, 255, 0.7)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <div>
                    <p className="text-white font-medium">Puraran</p>
                    <p className="text-xs" style={{ color: 'rgba(255, 255, 255, 0.5)' }}>Puraran, Baras</p>
                  </div>
                </button>
                <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all hover:bg-white/10 text-left">
                  <svg className="w-5 h-5" style={{ color: 'rgba(255, 255, 255, 0.7)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <div>
                    <p className="text-white font-medium">puraran</p>
                    <p className="text-xs" style={{ color: 'rgba(255, 255, 255, 0.5)' }}>Baras</p>
                  </div>
                </button>
              </div>
            </div>

            {/* Find Nearby */}
            <div>
              <h3 className="text-sm font-semibold text-white mb-3">Find Nearby</h3>
              <div className="space-y-2">
                <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all hover:bg-white/10 text-left">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#FF8C00' }}>
                    <span className="text-xl">🍴</span>
                  </div>
                  <p className="text-white font-medium">Restaurants</p>
                </button>
                <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all hover:bg-white/10 text-left">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#9B59B6' }}>
                    <span className="text-xl">🏨</span>
                  </div>
                  <p className="text-white font-medium">Hotels</p>
                </button>
                <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all hover:bg-white/10 text-left">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#F1C40F' }}>
                    <span className="text-xl">🏪</span>
                  </div>
                  <p className="text-white font-medium">Centers</p>
                </button>
                <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all hover:bg-white/10 text-left">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#3498DB' }}>
                    <span className="text-xl">⛽</span>
                  </div>
                  <p className="text-white font-medium">Gas Stations</p>
                </button>
                <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all hover:bg-white/10 text-left">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#E67E22' }}>
                    <span className="text-xl">☕</span>
                  </div>
                  <p className="text-white font-medium">Coffee</p>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default memo(MinimalistSidebar)
