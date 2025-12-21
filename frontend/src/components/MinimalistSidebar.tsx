import { memo, useState } from 'react'
import { useLocation } from 'react-router-dom'

interface MinimalistSidebarProps {
  isOpen: boolean
  onClose: () => void
  onToggleItinerary?: () => void
}

function MinimalistSidebar({ isOpen, onClose, onToggleItinerary }: MinimalistSidebarProps) {
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

      {/* Main minimalist sidebar - collapsible/expandable - FLOATING CARD with brand gradient */}
      <div
        className={`fixed z-[1600] transition-all duration-300 ease-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
        style={{
          top: '4px',
          left: '4px',
          height: 'calc(100vh - 8px)',
          width: isSidebarExpanded ? '280px' : '72px',
          background: 'linear-gradient(180deg, var(--forest-green) 0%, var(--ocean-blue) 100%)',
          backdropFilter: 'blur(20px)',
          boxShadow: '0 4px 20px rgba(46, 125, 50, 0.3)',
          borderRadius: '16px',
          overflow: 'hidden',
        }}
      >
        <div className="flex flex-col h-full overflow-hidden">
          {/* HapiHub Logo / Toggle Button - Transparent Background */}
          <div className="px-4 py-4 flex-shrink-0">
            <button
              onClick={toggleSidebar}
              className="w-full h-12 rounded-xl flex items-center justify-center transition-all hover:bg-white/10 relative group"
              style={{ backgroundColor: 'transparent' }}
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
          <nav className="flex flex-col space-y-2 flex-1 px-4 overflow-y-auto overflow-x-hidden">
            {/* Search Button with Tooltip */}
            <div className="relative group">
              <button
                onClick={() => setIsSearchPanelOpen(!isSearchPanelOpen)}
                className={`w-full h-12 rounded-xl flex items-center transition-all hover:bg-white/20 ${
                  isSidebarExpanded ? 'px-4 gap-3' : 'justify-center'
                }`}
                style={{
                  backgroundColor: isSearchPanelOpen ? 'rgba(255, 255, 255, 0.25)' : 'rgba(255, 255, 255, 0.1)',
                  color: 'white',
                }}
              >
                <svg className="w-6 h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                {isSidebarExpanded && <span className="text-base font-medium truncate">Search</span>}
              </button>
              
              {/* Tooltip - only show when sidebar is collapsed */}
              {!isSidebarExpanded && (
                <div
                  className="absolute left-full ml-2 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-lg whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 pointer-events-none"
                  style={{
                    background: 'linear-gradient(135deg, var(--forest-green) 0%, var(--ocean-blue) 100%)',
                    color: 'white',
                    fontSize: '14px',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
                  }}
                >
                  Search
                </div>
              )}
            </div>

            {/* Plan Button with Tooltip - Toggles Itinerary Panel */}
            <div className="relative group">
              <button
                onClick={onToggleItinerary}
                className={`w-full h-12 rounded-xl flex items-center transition-all hover:bg-white/20 ${
                  isSidebarExpanded ? 'px-4 gap-3' : 'justify-center'
                }`}
                style={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  color: 'white' 
                }}
              >
                <svg className="w-6 h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
                {isSidebarExpanded && <span className="text-base font-medium truncate">Plan</span>}
              </button>
              
              {!isSidebarExpanded && (
                <div
                  className="absolute left-full ml-2 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-lg whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 pointer-events-none"
                  style={{
                    background: 'linear-gradient(135deg, var(--forest-green) 0%, var(--ocean-blue) 100%)',
                    color: 'white',
                    fontSize: '14px',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
                  }}
                >
                  Plan
                </div>
              )}
            </div>

            {/* Guides Button with Tooltip */}
            <div className="relative group">
              <button
                className={`w-full h-12 rounded-xl flex items-center transition-all hover:bg-white/20 ${
                  isSidebarExpanded ? 'px-4 gap-3' : 'justify-center'
                }`}
                style={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  color: 'white' 
                }}
              >
                <svg className="w-6 h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                {isSidebarExpanded && <span className="text-base font-medium truncate">Guides</span>}
              </button>
              
              {!isSidebarExpanded && (
                <div
                  className="absolute left-full ml-2 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-lg whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 pointer-events-none"
                  style={{
                    background: 'linear-gradient(135deg, var(--forest-green) 0%, var(--ocean-blue) 100%)',
                    color: 'white',
                    fontSize: '14px',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
                  }}
                >
                  Guides
                </div>
              )}
            </div>
          </nav>

          {/* Close button for mobile */}
          <button
            onClick={onClose}
            className="md:hidden mx-4 mb-4 h-12 rounded-xl flex items-center justify-center transition-all hover:bg-white/20 flex-shrink-0"
            style={{ color: 'white' }}
            aria-label="Close sidebar"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Expandable Search Panel - Brand styled */}
      <div
        className={`fixed z-[1550] transition-all duration-300 ease-out ${
          isSearchPanelOpen ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-0'
        }`}
        style={{
          top: '4px',
          left: isSidebarExpanded ? 'calc(280px + 12px)' : 'calc(72px + 12px)',
          height: 'calc(100vh - 8px)',
          width: '420px',
          maxWidth: 'calc(100vw - 92px)',
          background: 'linear-gradient(180deg, var(--forest-green) 0%, var(--ocean-blue) 100%)',
          backdropFilter: 'blur(20px)',
          boxShadow: '0 4px 20px rgba(46, 125, 50, 0.3)',
          borderRadius: '16px',
          pointerEvents: isSearchPanelOpen ? 'auto' : 'none',
        }}
      >
        <div className="flex flex-col h-full">
          {/* Search Header */}
          <div className="px-6 py-5 border-b" style={{ borderColor: 'rgba(255, 255, 255, 0.2)' }}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">Search</h2>
              <button
                onClick={() => setIsSearchPanelOpen(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:bg-white/20"
                style={{ color: 'white' }}
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
                <svg className="w-5 h-5" style={{ color: 'rgba(255, 255, 255, 0.7)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                  backgroundColor: 'rgba(255, 255, 255, 0.15)',
                  borderColor: 'rgba(255, 255, 255, 0.3)',
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
                <button className="text-xs" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                  Clear
                </button>
              </div>
              <div className="space-y-2">
                <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all hover:bg-white/20 text-left">
                  <svg className="w-5 h-5" style={{ color: 'white' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <div>
                    <p className="text-white font-medium">Puraran</p>
                    <p className="text-xs" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>Puraran, Baras</p>
                  </div>
                </button>
                <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all hover:bg-white/20 text-left">
                  <svg className="w-5 h-5" style={{ color: 'white' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <div>
                    <p className="text-white font-medium">puraran</p>
                    <p className="text-xs" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>Baras</p>
                  </div>
                </button>
              </div>
            </div>

            {/* Find Nearby */}
            <div>
              <h3 className="text-sm font-semibold text-white mb-3">Find Nearby</h3>
              <div className="space-y-2">
                <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all hover:bg-white/20 text-left">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'var(--sunset-gold)' }}>
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <p className="text-white font-medium">Restaurants</p>
                </button>
                <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all hover:bg-white/20 text-left">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#8b5cf6' }}>
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                  </div>
                  <p className="text-white font-medium">Hotels</p>
                </button>
                <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all hover:bg-white/20 text-left">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#10b981' }}>
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <p className="text-white font-medium">Centers</p>
                </button>
                <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all hover:bg-white/20 text-left">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#06b6d4' }}>
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <p className="text-white font-medium">Gas Stations</p>
                </button>
                <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all hover:bg-white/20 text-left">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#f59e0b' }}>
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
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