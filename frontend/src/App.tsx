import React, { Suspense, lazy, useState, useEffect, useRef } from 'react'
import { Routes, Route, useLocation, Link } from 'react-router-dom'
import ToastContainer from './components/ToastContainer'
import ErrorBoundary from './components/ErrorBoundary'
import CurtainSidebar from './components/CurtainSidebar'
import MenuButton from './components/MenuButton'
import type { PlaceInfo } from './types/api'

// Lazy load route components and heavy components for code splitting
const Home = lazy(() => import('./routes/Home'))
const Discover = lazy(() => import('./routes/Discover'))
const ChatBubble = lazy(() => import('./components/ChatBubble'))

export default function App(){
  const location = useLocation()
  const isDiscoverPage = location.pathname === '/discover'
  
  // Detect mobile screen size
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth < 768 // md breakpoint
    }
    return false
  })

  // Handle window resize for mobile detection
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768)
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Sidebar is closed by default on initial load - ignore localStorage
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  
  // Curtain sidebar state
  const [isCurtainSidebarOpen, setIsCurtainSidebarOpen] = useState(false)

  // Persist sidebar state to localStorage
  useEffect(() => {
    localStorage.setItem('sidebarOpen', String(isSidebarOpen))
  }, [isSidebarOpen])

  // Keep sidebar closed on mobile when Discover page loads
  useEffect(() => {
    // On mobile, keep sidebar closed by default
    if (isDiscoverPage && isMobile && isSidebarOpen) {
      setIsSidebarOpen(false)
    }
  }, [isDiscoverPage, isMobile])

  // Ref to store the place selection handler from Discover component
  const placeSelectHandlerRef = useRef<((place: PlaceInfo) => void) | null>(null)
  
  // Callback to receive the handler from Discover component
  const setPlaceSelectHandler = (handler: (place: PlaceInfo) => void) => {
    placeSelectHandlerRef.current = handler
  }
  
  // Handle place selection from chatbot
  const handlePlaceSelect = (place: PlaceInfo) => {
    // If we have a handler from Discover, use it to trigger model selection and fly-to
    if (placeSelectHandlerRef.current) {
      placeSelectHandlerRef.current(place)
    } else {
      console.log('Place selected but map not ready:', place)
    }
  }

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen)
  }
  
  const toggleCurtainSidebar = () => {
    setIsCurtainSidebarOpen(!isCurtainSidebarOpen)
  }

  return (
    <div
      className="h-screen w-screen overflow-hidden"
      style={{
        overflow: 'hidden',
        margin: 0,
        padding: 0,
        backgroundColor: 'var(--sunset-gold)'
      }}
    >
      {/* Curtain Sidebar with Menu */}
      <CurtainSidebar isOpen={isCurtainSidebarOpen} onClose={() => setIsCurtainSidebarOpen(false)}>
        <div className="space-y-6">
          {/* Navigation Links */}
          <nav className="space-y-3">
            <Link
              to="/"
              onClick={() => setIsCurtainSidebarOpen(false)}
              className="block px-4 py-3 rounded-lg transition-all hover:shadow-md"
              style={{
                backgroundColor: location.pathname === '/' ? 'rgba(255, 255, 255, 0.9)' : 'rgba(255, 255, 255, 0.6)',
                color: 'var(--forest-green)',
                fontWeight: location.pathname === '/' ? '700' : '600',
              }}
            >
              <div className="flex items-center gap-3">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                <span className="text-lg">Home</span>
              </div>
            </Link>
            
            <Link
              to="/discover"
              onClick={() => setIsCurtainSidebarOpen(false)}
              className="block px-4 py-3 rounded-lg transition-all hover:shadow-md"
              style={{
                backgroundColor: location.pathname === '/discover' ? 'rgba(255, 255, 255, 0.9)' : 'rgba(255, 255, 255, 0.6)',
                color: 'var(--forest-green)',
                fontWeight: location.pathname === '/discover' ? '700' : '600',
              }}
            >
              <div className="flex items-center gap-3">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
                <span className="text-lg">Discover</span>
              </div>
            </Link>
          </nav>

          {/* About Section */}
          <div
            className="p-4 rounded-lg"
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.7)',
            }}
          >
            <h3 className="font-bold text-lg mb-2" style={{ color: 'var(--forest-green)' }}>
              About HapiHub
            </h3>
            <p className="text-gray-700 text-sm leading-relaxed">
              Your gateway to exploring the beautiful province of Catanduanes with immersive 3D maps and AI-powered travel assistance.
            </p>
          </div>

          {/* Features */}
          <div className="space-y-2">
            <div
              className="flex items-start gap-3 p-3 rounded-lg"
              style={{ backgroundColor: 'rgba(255, 255, 255, 0.6)' }}
            >
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: 'var(--sunset-gold)' }}
              >
                <span className="text-xl">🗺️</span>
              </div>
              <div>
                <h4 className="font-semibold text-sm" style={{ color: 'var(--forest-green)' }}>
                  3D Interactive Maps
                </h4>
                <p className="text-xs text-gray-600">Explore tourist spots in stunning 3D</p>
              </div>
            </div>
            
            <div
              className="flex items-start gap-3 p-3 rounded-lg"
              style={{ backgroundColor: 'rgba(255, 255, 255, 0.6)' }}
            >
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: 'var(--ocean-blue)' }}
              >
                <span className="text-xl">🤖</span>
              </div>
              <div>
                <h4 className="font-semibold text-sm" style={{ color: 'var(--forest-green)' }}>
                  AI Travel Assistant
                </h4>
                <p className="text-xs text-gray-600">Get personalized recommendations</p>
              </div>
            </div>
            
            <div
              className="flex items-start gap-3 p-3 rounded-lg"
              style={{ backgroundColor: 'rgba(255, 255, 255, 0.6)' }}
            >
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: 'var(--forest-green)' }}
              >
                <span className="text-xl">📍</span>
              </div>
              <div>
                <h4 className="font-semibold text-sm" style={{ color: 'var(--forest-green)' }}>
                  Municipality Explorer
                </h4>
                <p className="text-xs text-gray-600">Browse attractions by location</p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="pt-4 border-t" style={{ borderColor: 'rgba(101, 84, 56, 0.3)' }}>
            <p className="text-xs text-center" style={{ color: 'rgba(101, 84, 56, 0.8)' }}>
              Made with ❤️ for Catanduanes
            </p>
          </div>
        </div>
      </CurtainSidebar>

      {/* Menu Button */}
      <MenuButton onClick={toggleCurtainSidebar} isOpen={isCurtainSidebarOpen} />

      <ErrorBoundary>
        {/* Mobile: flex-col (map on top, sidebar bottom sheet), Desktop: flex-row (sidebar on left, map on right) */}
        {/* Only add padding and gap when sidebar is open on desktop */}
        <div className={`h-full ${isMobile ? 'flex flex-col' : 'flex'} ${!isMobile && isDiscoverPage && isSidebarOpen ? 'p-1 gap-1' : ''}`}>
          {/* Pathfinder AI Sidebar/Bottom Sheet - Only show on Discover page - NOW ON LEFT */}
          {isDiscoverPage && (
            <Suspense fallback={null}>
              <ChatBubble
                onPlaceSelect={handlePlaceSelect}
                isOpen={isSidebarOpen}
                onToggle={toggleSidebar}
                isMobile={isMobile}
              />
            </Suspense>
          )}

          {/* Main Content Area */}
          <div 
            className={`h-full transition-all duration-300 ${!isMobile && isDiscoverPage && isSidebarOpen ? 'rounded-xl' : ''}`}
            style={{ 
              position: 'relative', 
              overflow: 'hidden',
              minWidth: 0,
              width: isMobile 
                ? '100%' 
                : (isDiscoverPage && isSidebarOpen ? 'calc(70% - 0.125rem)' : '100%'),
              height: isMobile && isDiscoverPage && isSidebarOpen ? '50%' : isMobile ? '100%' : '100%',
              flexShrink: 0
            }}
          >
            <Suspense fallback={<div className="p-8 text-center pt-20">Loading...</div>}>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/discover" element={<Discover isSidebarOpen={isSidebarOpen} isMobile={isMobile} onPlaceSelectFromAI={setPlaceSelectHandler} />} />
              </Routes>
            </Suspense>
          </div>

          {/* Toggle Button - Only show on Discover page when sidebar is closed (desktop only) - NOW ON RIGHT */}
          {isDiscoverPage && !isSidebarOpen && !isMobile && (
            <button
              onClick={toggleSidebar}
              className="fixed bottom-6 right-6 z-[9999] w-16 h-16 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 transform hover:scale-110"
              style={{
                backgroundColor: 'transparent',
                border: 'none'
              }}
              aria-label="Open Pathfinder AI chat"
            >
              <img src="/icons/chatbot.svg" alt="Chat" className="w-16 h-16" />
            </button>
          )}
        </div>
      </ErrorBoundary>

      <ToastContainer />
    </div>
  )
}
