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

  // Itinerary sidebar state - Hidden by default on first load
  const [isItinerarySidebarOpen, setIsItinerarySidebarOpen] = useState(false)
  const [isItineraryExpanded, setIsItineraryExpanded] = useState(false)
  
  // Chatbot state (now self-contained floating card)
  const [isChatbotOpen, setIsChatbotOpen] = useState(false)
  
  // Minimalist menu sidebar state
  const [isMinimalistSidebarOpen, setIsMinimalistSidebarOpen] = useState(false)

  // Persist itinerary sidebar state to localStorage
  useEffect(() => {
    localStorage.setItem('itinerarySidebarOpen', String(isItinerarySidebarOpen))
  }, [isItinerarySidebarOpen])

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
  
  const toggleItineraryExpanded = () => {
    setIsItineraryExpanded(!isItineraryExpanded)
  }
  
  const toggleChatbot = () => {
    setIsChatbotOpen(!isChatbotOpen)
  }
  
  const toggleMinimalistSidebar = () => {
    setIsMinimalistSidebarOpen(!isMinimalistSidebarOpen)
  }

  // Calculate sidebar width based on expanded state
  const sidebarWidth = isItineraryExpanded ? '60%' : '30%'
  const mapWidth = isItineraryExpanded ? '40%' : '70%'

  return (
    <div
      className="h-screen w-screen overflow-hidden"
      style={{
        overflow: 'hidden',
        margin: 0,
        padding: 0,
        backgroundColor: '#f5f7fa', // Light gray background like package tracking UI
      }}
    >
      {/* Minimalist Sidebar - overlays everything on mobile and desktop (z-index 1600) */}
      <MinimalistSidebar isOpen={isMinimalistSidebarOpen} onClose={() => setIsMinimalistSidebarOpen(false)} />

      {/* Menu Button (only visible on mobile) */}
      <div className="md:hidden">
        <MenuButton onClick={toggleMinimalistSidebar} isOpen={isMinimalistSidebarOpen} />
      </div>

      <ErrorBoundary>
        {/* Container with padding and gap for separated panels - NO marginLeft */}
        <div 
          className={`${isMobile ? 'flex flex-col' : 'flex'}`}
          style={{
            padding: isMobile ? '0' : '16px',
            gap: isMobile ? '0' : '16px',
            height: isMobile ? '100vh' : 'calc(100vh - 32px)', // Full height minus padding
            transition: 'all 0.3s ease-out',
            overflow: 'hidden'
          }}
        >
          {/* Itinerary Sidebar - Left Panel (starts from left edge, sidebar overlays on top) */}
          {isDiscoverPage && (
            <ItinerarySidebar
              isOpen={isItinerarySidebarOpen}
              onToggle={toggleItinerarySidebar}
              isMobile={isMobile}
              isExpanded={isItineraryExpanded}
              onToggleExpanded={toggleItineraryExpanded}
            />
          )}

          {/* Main Content Area - Map View (Right Panel) */}
          <div 
            className="transition-all duration-300"
            style={{ 
              position: 'relative', 
              overflow: 'hidden',
              minWidth: 0,
              width: isMobile 
                ? '100%' 
                : (isDiscoverPage && isItinerarySidebarOpen ? `calc(${mapWidth} - 8px)` : '100%'),
              height: isMobile && isDiscoverPage && isItinerarySidebarOpen ? '50%' : '100%',
              flexShrink: 0,
              borderRadius: isMobile ? '0' : '16px',
              backgroundColor: 'white',
              boxShadow: isMobile ? 'none' : '0 2px 8px rgba(0, 0, 0, 0.08)',
            }}
          >
            <Suspense fallback={<div className="p-8 text-center pt-20">Loading...</div>}>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route 
                  path="/discover" 
                  element={
                    <Discover 
                      isSidebarOpen={isItinerarySidebarOpen} 
                      isMobile={isMobile} 
                      onPlaceSelectFromAI={setPlaceSelectHandler}
                      isItineraryExpanded={isItineraryExpanded}
                    />
                  } 
                />
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