import React, { Suspense, lazy, useState, useEffect, useRef } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import ToastContainer from './components/ToastContainer'
import ErrorBoundary from './components/ErrorBoundary'
import MinimalistSidebar from './components/MinimalistSidebar'
import MenuButton from './components/MenuButton'
import ItinerarySidebar from './components/ItinerarySidebar'
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

  // Itinerary sidebar state
  const [isItinerarySidebarOpen, setIsItinerarySidebarOpen] = useState(true)
  
  // Chatbot state (now self-contained floating card)
  const [isChatbotOpen, setIsChatbotOpen] = useState(false)
  
  // Minimalist menu sidebar state
  const [isMinimalistSidebarOpen, setIsMinimalistSidebarOpen] = useState(false)

  // Persist itinerary sidebar state to localStorage
  useEffect(() => {
    localStorage.setItem('itinerarySidebarOpen', String(isItinerarySidebarOpen))
  }, [isItinerarySidebarOpen])

  // Keep itinerary sidebar open on desktop by default
  useEffect(() => {
    if (isDiscoverPage && !isMobile) {
      setIsItinerarySidebarOpen(true)
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
    if (placeSelectHandlerRef.current) {
      placeSelectHandlerRef.current(place)
    } else {
      console.log('Place selected but map not ready:', place)
    }
  }

  const toggleItinerarySidebar = () => {
    setIsItinerarySidebarOpen(!isItinerarySidebarOpen)
  }
  
  const toggleChatbot = () => {
    setIsChatbotOpen(!isChatbotOpen)
  }
  
  const toggleMinimalistSidebar = () => {
    setIsMinimalistSidebarOpen(!isMinimalistSidebarOpen)
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
      {/* Minimalist Sidebar - overlays everything */}
      <MinimalistSidebar isOpen={isMinimalistSidebarOpen} onClose={() => setIsMinimalistSidebarOpen(false)} />

      {/* Menu Button (only visible on mobile) */}
      <div className="md:hidden">
        <MenuButton onClick={toggleMinimalistSidebar} isOpen={isMinimalistSidebarOpen} />
      </div>

      <ErrorBoundary>
        {/* Add left margin on desktop to account for always-visible icon bar (72px) */}
        <div 
          className={`h-full ${isMobile ? 'flex flex-col' : 'flex'} ${!isMobile && isDiscoverPage && isItinerarySidebarOpen ? 'p-1 gap-1' : ''}`}
          style={{
            marginLeft: isMobile ? '0' : '72px',
            transition: 'margin-left 0.3s ease-out'
          }}
        >
          {/* Itinerary Sidebar - Only show on Discover page */}
          {isDiscoverPage && (
            <ItinerarySidebar
              isOpen={isItinerarySidebarOpen}
              onToggle={toggleItinerarySidebar}
              isMobile={isMobile}
            />
          )}

          {/* Main Content Area */}
          <div 
            className={`h-full transition-all duration-300 ${!isMobile && isDiscoverPage && isItinerarySidebarOpen ? 'rounded-xl' : ''}`}
            style={{ 
              position: 'relative', 
              overflow: 'hidden',
              minWidth: 0,
              width: isMobile 
                ? '100%' 
                : (isDiscoverPage && isItinerarySidebarOpen ? 'calc(70% - 0.125rem)' : '100%'),
              height: isMobile && isDiscoverPage && isItinerarySidebarOpen ? '50%' : isMobile ? '100%' : '100%',
              flexShrink: 0
            }}
          >
            <Suspense fallback={<div className="p-8 text-center pt-20">Loading...</div>}>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/discover" element={<Discover isSidebarOpen={isItinerarySidebarOpen} isMobile={isMobile} onPlaceSelectFromAI={setPlaceSelectHandler} />} />
              </Routes>
            </Suspense>
          </div>
        </div>
      </ErrorBoundary>

      {/* Floating Chatbot Card - Only show on Discover page */}
      {isDiscoverPage && (
        <Suspense fallback={null}>
          <ChatBubble
            onPlaceSelect={handlePlaceSelect}
            isOpen={isChatbotOpen}
            onToggle={toggleChatbot}
            isMobile={isMobile}
          />
        </Suspense>
      )}

      <ToastContainer />
    </div>
  )
}