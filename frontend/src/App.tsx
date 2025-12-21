import React, { Suspense, lazy, useState, useEffect, useRef } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import ToastContainer from './components/ToastContainer'
import ErrorBoundary from './components/ErrorBoundary'
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
      {/* Navigation component removed */}

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
