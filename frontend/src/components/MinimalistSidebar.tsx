import { memo, useState } from 'react'
import { useLocation } from 'react-router-dom'

interface MinimalistSidebarProps {
  isOpen: boolean
  onClose: () => void
}

function MinimalistSidebar({ isOpen, onClose }: MinimalistSidebarProps) {
  const location = useLocation()
  const [isSearchPanelOpen, setIsSearchPanelOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false)

  const toggleSidebar = () => {
    setIsSidebarExpanded(!isSidebarExpanded)
    // Close search panel when collapsing sidebar
    if (isSidebarExpanded) {
      setIsSearchPanelOpen(false)
    }
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

      {/* Main minimalist sidebar - collapsible/expandable - FLOATING CARD */}
      <div
        className={`fixed z-[1600] transition-all duration-300 ease-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
        style={{
          top: '16px',
          left: '16px',
          height: 'calc(100vh - 32px)',
          width: isSidebarExpanded ? '280px' : '72px',
          backgroundColor: 'rgba(30, 35, 45, 0.98)',
          backdropFilter: 'blur(20px)',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
          borderRadius: '16px',
        }}
      >
        <div className="flex flex-col h-full">
          {/* HapiHub Logo / Toggle Button */}
          <div className="px-4 py-4">
            <button
              onClick={toggleSidebar}
              className="w-full h-12 rounded-xl flex items-center justify-center transition-all hover:bg-white/10 relative group"
              style={{ backgroundColor: 'var(--sunset-gold)' }}
              title={isSidebarExpanded ? 'Collapse sidebar' : 'Expand sidebar'}
            >
              {isSidebarExpanded ? (
                // Close X icon when expanded
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                // Chatbot logo when collapsed
                <img src="/icons/chatbot.svg" alt="HapiHub" className="w-8 h-8" />
              )}
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex flex-col space-y-2 flex-1 px-4 overflow-y-auto">
            {/* Search Button with Tooltip */}
            <div className="relative group">
              <button
                onClick={() => setIsSearchPanelOpen(!isSearchPanelOpen)}
                className={`w-full h-12 rounded-xl flex items-center transition-all hover:bg-white/10 ${
                  isSidebarExpanded ? 'px-4 gap-3' : 'justify-center'
                }`}
                style={{
                  backgroundColor: isSearchPanelOpen ? 'rgba(255, 255, 255, 0.15)' : 'transparent',
                  color: 'white',
                }}
              >
                <svg className="w-6 h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                {isSidebarExpanded && <span className="text-base font-medium">Search</span>}
              </button>
              
              {/* Tooltip - only show when sidebar is collapsed */}
              {!isSidebarExpanded && (
                <div
                  className="absolute left-full ml-2 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-lg whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 pointer-events-none"
                  style={{
                    backgroundColor: 'rgba(30, 35, 45, 0.98)',
                    color: 'white',
                    fontSize: '14px',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
                  }}
                >
                  Search
                </div>
              )}
            </div>

            {/* Guides Button with Tooltip */}
            <div className="relative group">
              <button
                className={`w-full h-12 rounded-xl flex items-center transition-all hover:bg-white/10 ${
                  isSidebarExpanded ? 'px-4 gap-3' : 'justify-center'
                }`}
                style={{ color: 'white' }}
              >
                <svg className="w-6 h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                {isSidebarExpanded && <span className="text-base font-medium">Guides</span>}
              </button>
              
              {!isSidebarExpanded && (
                <div
                  className="absolute left-full ml-2 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-lg whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 pointer-events-none"
                  style={{
                    backgroundColor: 'rgba(30, 35, 45, 0.98)',
                    color: 'white',
                    fontSize: '14px',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
                  }}
                >
                  Guides
                </div>
              )}
            </div>

            {/* Directions Button with Tooltip */}
            <div className="relative group">
              <button
                className={`w-full h-12 rounded-xl flex items-center transition-all hover:bg-white/10 ${
                  isSidebarExpanded ? 'px-4 gap-3' : 'justify-center'
                }`}
                style={{ color: 'white' }}
              >
                <svg className="w-6 h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
                {isSidebarExpanded && <span className="text-base font-medium">Directions</span>}
              </button>
              
              {!isSidebarExpanded && (
                <div
                  className="absolute left-full ml-2 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-lg whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 pointer-events-none"
                  style={{
                    backgroundColor: 'rgba(30, 35, 45, 0.98)',
                    color: 'white',
                    fontSize: '14px',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
                  }}
                >
                  Directions
                </div>
              )}
            </div>

            {/* Divider */}
            <div className="py-2">
              <div style={{ height: '1px', backgroundColor: 'rgba(255, 255, 255, 0.2)' }} />
            </div>

            {/* Recents Section */}
            {isSidebarExpanded && (
              <div className="pt-2">
                <h3 className="text-xs font-semibold uppercase tracking-wider px-4 py-2" style={{ color: 'rgba(255, 255, 255, 0.5)' }}>
                  Recents
                </h3>
              </div>
            )}

            {/* Recent Locations */}
            <div className="relative group">
              <button
                className={`w-full h-12 rounded-xl flex items-center transition-all hover:bg-white/10 ${
                  isSidebarExpanded ? 'px-4 gap-3' : 'justify-center'
                }`}
                style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
              >
                <span className="text-lg flex-shrink-0">🏛️</span>
                {isSidebarExpanded && <span className="text-sm font-medium text-white">Caramoran</span>}
              </button>
              
              {!isSidebarExpanded && (
                <div
                  className="absolute left-full ml-2 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-lg whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 pointer-events-none"
                  style={{
                    backgroundColor: 'rgba(30, 35, 45, 0.98)',
                    color: 'white',
                    fontSize: '14px',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
                  }}
                >
                  Caramoran
                </div>
              )}
            </div>

            <div className="relative group">
              <button
                className={`w-full h-12 rounded-xl flex items-center transition-all hover:bg-white/10 ${
                  isSidebarExpanded ? 'px-4 gap-3' : 'justify-center'
                }`}
                style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
              >
                <span className="text-lg flex-shrink-0">🏛️</span>
                {isSidebarExpanded && <span className="text-sm font-medium text-white">Garchitorena</span>}
              </button>
              
              {!isSidebarExpanded && (
                <div
                  className="absolute left-full ml-2 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-lg whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 pointer-events-none"
                  style={{
                    backgroundColor: 'rgba(30, 35, 45, 0.98)',
                    color: 'white',
                    fontSize: '14px',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
                  }}
                >
                  Garchitorena
                </div>
              )}
            </div>

            <div className="relative group">
              <button
                className={`w-full h-12 rounded-xl flex items-center transition-all hover:bg-white/10 ${
                  isSidebarExpanded ? 'px-4 gap-3' : 'justify-center'
                }`}
                style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
              >
                <span className="text-lg flex-shrink-0">📍</span>
                {isSidebarExpanded && <span className="text-sm font-medium text-white">Virac Point</span>}
              </button>
              
              {!isSidebarExpanded && (
                <div
                  className="absolute left-full ml-2 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-lg whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 pointer-events-none"
                  style={{
                    backgroundColor: 'rgba(30, 35, 45, 0.98)',
                    color: 'white',
                    fontSize: '14px',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
                  }}
                >
                  Virac Point
                </div>
              )}
            </div>
          </nav>

          {/* Close button for mobile */}
          <button
            onClick={onClose}
            className="md:hidden mx-4 mb-4 h-12 rounded-xl flex items-center justify-center transition-all hover:bg-white/10"
            style={{ color: 'rgba(255, 255, 255, 0.7)' }}
            aria-label="Close sidebar"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Expandable Search Panel - Also floating */}
      <div
        className={`fixed z-[1550] transition-all duration-300 ease-out ${
          isSearchPanelOpen ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-0'
        }`}
        style={{
          top: '16px',
          left: isSidebarExpanded ? 'calc(280px + 32px)' : 'calc(72px + 32px)',
          height: 'calc(100vh - 32px)',
          width: '420px',
          maxWidth: 'calc(100vw - 104px)',
          backgroundColor: 'rgba(30, 35, 45, 0.98)',
          backdropFilter: 'blur(20px)',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
          borderRadius: '16px',
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