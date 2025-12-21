import React, { useState, useRef, useEffect, memo } from 'react'
import { chatWithAi } from '../lib/api'
import type { ChatMessage, PlaceInfo } from '../types/api'

interface ChatBubbleProps {
  onPlaceSelect?: (place: PlaceInfo) => void
  isOpen: boolean
  onToggle: () => void
  isMobile?: boolean
}

function ChatBubble({ onPlaceSelect, isOpen, onToggle, isMobile = false }: ChatBubbleProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: "Hi! I'm HapiHub, your Catanduanes tourism guide. Ask me about beaches, surfing spots, waterfalls, hotels, or anything about the island! 🌴",
      timestamp: new Date()
    }
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const isInitialMount = useRef(true)

  useEffect(() => {
    // Mark that initial mount is complete
    isInitialMount.current = false
  }, [])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: input.trim(),
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      const response = await chatWithAi(userMessage.content)
      
      const assistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: response.reply,
        places: response.places,
        timestamp: new Date()
      }

      setMessages(prev => [...prev, assistantMessage])
      
      // Automatically trigger place selection if AI returns places
      // This will fly to the model and show the info card
      if (response.places && response.places.length > 0 && onPlaceSelect) {
        // Use a small delay to ensure the message is rendered first
        setTimeout(() => {
          // Select the first place that matches a model
          for (const place of response.places) {
            onPlaceSelect(place)
            break // Only select the first matching place
          }
        }, 500)
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error'
      const isTimeout = errorMsg.toLowerCase().includes('timeout')
      
      const errorMessage: ChatMessage = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: isTimeout 
          ? "I'm still warming up! The AI model is loading for the first time (this can take 1-2 minutes). Please try again in a moment! ⏳"
          : `Sorry, I encountered an error: ${errorMsg}`,
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handlePlaceClick = (place: PlaceInfo) => {
    if (onPlaceSelect) {
      onPlaceSelect(place)
    }
  }

  const getPlaceIcon = (type: string): string => {
    const icons: Record<string, string> = {
      surfing: '🏄',
      swimming: '🏊',
      hiking: '🥾',
      sightseeing: '👀',
      accommodation: '🏨',
      food: '🍽️',
      transport: '✈️'
    }
    return icons[type] || '📍'
  }

  // Mobile: bottom sheet, Desktop: right sidebar
  if (isMobile) {
    return (
      <>
        {/* Mobile Bottom Sheet */}
        <div
          className={`fixed left-0 right-0 z-[9998] ${
            isInitialMount.current ? '' : 'transition-all duration-300 ease-in-out'
          }`}
          style={{
            bottom: isOpen ? '0' : '-100%',
            height: isOpen ? '60%' : '0%',
            backgroundColor: 'var(--forest-green)',
            borderTop: isOpen ? '1px solid rgba(255, 255, 255, 0.2)' : 'none',
            borderTopLeftRadius: isOpen ? '1rem' : '0',
            borderTopRightRadius: isOpen ? '1rem' : '0',
            boxShadow: isOpen ? '0 -4px 12px rgba(0, 0, 0, 0.3)' : 'none',
            overflow: 'hidden'
          }}
        >
          {/* Drag Handle */}
          {isOpen && (
            <div className="w-full flex justify-center py-2 cursor-grab active:cursor-grabbing" onClick={onToggle}>
              <div className="w-12 h-1 rounded-full" style={{ backgroundColor: 'var(--gray)' }}></div>
            </div>
          )}
          
          {/* Sidebar Content */}
          <div className={`h-full flex flex-col ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`} style={{ height: isOpen ? 'calc(100% - 24px)' : '0' }}>
            {/* Header */}
            <div
              className="px-4 py-4 flex items-center justify-between flex-shrink-0"
              style={{
                backgroundColor: 'var(--forest-green)',
                borderBottom: 'none'
              }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: 'var(--sunset-gold)' }}
                >
                  <span className="text-xl">💬</span>
                </div>
                <div>
                  <h3 className="font-bold text-base text-white">HapiHub AI</h3>
                  <p className="text-xs text-white/80">Travel Assistant</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={onToggle}
                  className="p-2 rounded-lg transition-colors text-white hover:bg-white/20"
                  aria-label="Close sidebar"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Messages - reuse the same component structure */}
            <div
              className="flex-1 overflow-y-auto p-4 space-y-4 sidebar-scrollbar"
              style={{ backgroundColor: '#f9fafb' }}
            >
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-3 shadow-sm ${
                      message.role === 'user' ? 'ml-auto' : ''
                    }`}
                    style={
                      message.role === 'user'
                        ? {
                            backgroundColor: 'var(--forest-green)',
                            color: '#ffffff'
                          }
                        : {
                            backgroundColor: '#ffffff',
                            color: '#1f2937',
                            border: '1px solid #e5e7eb'
                          }
                    }
                  >
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                    
                    {/* Places */}
                    {message.places && message.places.length > 0 && (
                      <div className="mt-3 pt-3 space-y-2" style={{ borderTop: '1px solid #e5e7eb' }}>
                        <p className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: 'var(--gray)' }}>
                          📍 Related Places
                        </p>
                        {message.places.map((place, idx) => (
                          <button
                            key={idx}
                            onClick={() => handlePlaceClick(place)}
                            className="w-full text-left p-3 rounded-xl transition-all flex items-center gap-3 group hover:shadow-md"
                            style={{
                              backgroundColor: '#f9fafb',
                              border: '2px solid #e5e7eb'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = '#ffffff'
                              e.currentTarget.style.borderColor = 'var(--ocean-blue)'
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = '#f9fafb'
                              e.currentTarget.style.borderColor = '#e5e7eb'
                            }}
                          >
                            <span className="text-xl">{getPlaceIcon(place.type)}</span>
                            <div className="flex-1 min-w-0">
                              <p
                                className="text-sm font-semibold truncate"
                                style={{ color: '#1f2937' }}
                              >
                                {place.name}
                              </p>
                              <p className="text-xs capitalize" style={{ color: 'var(--gray)' }}>{place.type}</p>
                            </div>
                            <svg
                              className="w-5 h-5 transition-colors flex-shrink-0"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              style={{ color: 'var(--ocean-blue)' }}
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                          </button>
                        ))}
                      </div>
                    )}
                    
                    <p
                      className="text-xs mt-2"
                      style={{
                        color: message.role === 'user' ? 'rgba(255, 255, 255, 0.7)' : 'var(--gray)'
                      }}
                    >
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))}

              {/* Loading indicator */}
              {isLoading && (
                <div className="flex justify-start">
                  <div
                    className="rounded-2xl px-4 py-3 shadow-sm"
                    style={{
                      backgroundColor: '#ffffff',
                      color: '#1f2937',
                      border: '1px solid #e5e7eb'
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex gap-1">
                        <span className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: 'var(--forest-green)', animationDelay: '0ms' }}></span>
                        <span className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: 'var(--sunset-gold)', animationDelay: '150ms' }}></span>
                        <span className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: 'var(--ocean-blue)', animationDelay: '300ms' }}></span>
                      </div>
                      <span className="text-sm font-medium" style={{ color: 'var(--gray)' }}>HapiHub is thinking...</span>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form
              onSubmit={handleSubmit}
              className="p-4 flex-shrink-0"
              style={{
                backgroundColor: 'var(--forest-green)',
                borderTop: 'none'
              }}
            >
              <div
                className="flex items-center gap-3 rounded-2xl px-4 py-3 shadow-sm"
                style={{
                  backgroundColor: '#f9fafb',
                  border: '2px solid #e5e7eb'
                }}
              >
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask about Catanduanes..."
                  className="flex-1 bg-transparent outline-none text-sm placeholder:text-gray-400"
                  style={{
                    color: '#1f2937'
                  }}
                  disabled={isLoading}
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className="p-2 rounded-xl transition-all"
                  style={
                    input.trim() && !isLoading
                      ? {
                          backgroundColor: 'var(--forest-green)',
                          color: '#ffffff'
                        }
                      : {
                          backgroundColor: '#e5e7eb',
                          color: '#9ca3af',
                          cursor: 'not-allowed'
                        }
                  }
                  onMouseEnter={(e) => {
                    if (input.trim() && !isLoading) {
                      e.currentTarget.style.transform = 'scale(1.05)'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (input.trim() && !isLoading) {
                      e.currentTarget.style.transform = 'scale(1)'
                    }
                  }}
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Mobile: Floating button to open bottom sheet */}
        {!isOpen && (
          <button
            onClick={onToggle}
            className="fixed bottom-6 right-6 z-[9999] w-16 h-16 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 transform hover:scale-110"
            style={{
              backgroundColor: 'var(--forest-green)',
              color: '#ffffff'
            }}
            aria-label="Open HapiHub AI chat"
          >
            <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </button>
        )}
      </>
    )
  }

  // Desktop: Right Sidebar
  return (
    <div
      className={`h-full flex-shrink-0 ${
        isInitialMount.current ? '' : 'transition-all duration-300 ease-in-out'
      } ${isOpen ? 'rounded-xl' : ''}`}
      style={{
        width: isOpen ? 'calc(30% - 0.125rem)' : '0%',
        backgroundColor: 'var(--forest-green)',
        borderLeft: isOpen ? '1px solid #e5e7eb' : 'none',
        boxShadow: isOpen ? '-4px 0 12px rgba(0, 0, 0, 0.1)' : 'none',
        overflow: isOpen ? 'hidden' : 'hidden',
        minWidth: isOpen ? '350px' : '0px',
        maxWidth: isOpen ? '450px' : '0px'
      }}
    >
      {/* Sidebar Content */}
      <div className={`h-full flex flex-col ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
        {/* Header */}
        <div
          className="px-4 py-4 flex items-center justify-between"
          style={{
            backgroundColor: 'var(--forest-green)',
            borderBottom: 'none'
          }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{ backgroundColor: 'var(--sunset-gold)' }}
            >
              <span className="text-xl">💬</span>
            </div>
            <div>
              <h3 className="font-bold text-base text-white">HapiHub AI</h3>
              <p className="text-xs text-white/80">Travel Assistant</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onToggle}
              className="p-2 rounded-lg transition-colors text-white hover:bg-white/20"
              aria-label="Close sidebar"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Messages */}
        <div
          className="flex-1 overflow-y-auto p-4 space-y-4 sidebar-scrollbar"
          style={{ backgroundColor: '#f9fafb' }}
        >
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 shadow-sm ${
                  message.role === 'user' ? 'ml-auto' : ''
                }`}
                style={
                  message.role === 'user'
                    ? {
                        backgroundColor: 'var(--forest-green)',
                        color: '#ffffff'
                      }
                    : {
                        backgroundColor: '#ffffff',
                        color: '#1f2937',
                        border: '1px solid #e5e7eb'
                      }
                }
              >
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                
                {/* Places */}
                {message.places && message.places.length > 0 && (
                  <div className="mt-3 pt-3 space-y-2" style={{ borderTop: '1px solid #e5e7eb' }}>
                    <p className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: 'var(--gray)' }}>
                      📍 Related Places
                    </p>
                    {message.places.map((place, idx) => (
                      <button
                        key={idx}
                        onClick={() => handlePlaceClick(place)}
                        className="w-full text-left p-3 rounded-xl transition-all flex items-center gap-3 group hover:shadow-md"
                        style={{
                          backgroundColor: '#f9fafb',
                          border: '2px solid #e5e7eb'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#ffffff'
                          e.currentTarget.style.borderColor = 'var(--ocean-blue)'
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = '#f9fafb'
                          e.currentTarget.style.borderColor = '#e5e7eb'
                        }}
                      >
                        <span className="text-xl">{getPlaceIcon(place.type)}</span>
                        <div className="flex-1 min-w-0">
                          <p
                            className="text-sm font-semibold truncate"
                            style={{ color: '#1f2937' }}
                          >
                            {place.name}
                          </p>
                          <p className="text-xs capitalize" style={{ color: 'var(--gray)' }}>{place.type}</p>
                        </div>
                        <svg
                          className="w-5 h-5 transition-colors flex-shrink-0"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          style={{ color: 'var(--ocean-blue)' }}
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </button>
                    ))}
                  </div>
                )}

                <p
                  className="text-xs mt-2"
                  style={{
                    color: message.role === 'user' ? 'rgba(255, 255, 255, 0.7)' : 'var(--gray)'
                  }}
                >
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          ))}

          {/* Loading indicator */}
          {isLoading && (
            <div className="flex justify-start">
              <div
                className="rounded-2xl px-4 py-3 shadow-sm"
                style={{
                  backgroundColor: '#ffffff',
                  color: '#1f2937',
                  border: '1px solid #e5e7eb'
                }}
              >
                <div className="flex items-center gap-3">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: 'var(--forest-green)', animationDelay: '0ms' }}></span>
                    <span className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: 'var(--sunset-gold)', animationDelay: '150ms' }}></span>
                    <span className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: 'var(--ocean-blue)', animationDelay: '300ms' }}></span>
                  </div>
                  <span className="text-sm font-medium" style={{ color: 'var(--gray)' }}>HapiHub is thinking...</span>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form
          onSubmit={handleSubmit}
          className="p-4"
          style={{
            backgroundColor: 'var(--forest-green)',
            borderTop: 'none'
          }}
        >
          <div
            className="flex items-center gap-3 rounded-2xl px-4 py-3 shadow-sm"
            style={{
              backgroundColor: '#f9fafb',
              border: '2px solid #e5e7eb'
            }}
          >
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about Catanduanes..."
              className="flex-1 bg-transparent outline-none text-sm placeholder:text-gray-400"
              style={{
                color: '#1f2937'
              }}
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="p-2 rounded-xl transition-all"
              style={
                input.trim() && !isLoading
                  ? {
                      backgroundColor: 'var(--forest-green)',
                      color: '#ffffff'
                    }
                  : {
                      backgroundColor: '#e5e7eb',
                      color: '#9ca3af',
                      cursor: 'not-allowed'
                    }
              }
              onMouseEnter={(e) => {
                if (input.trim() && !isLoading) {
                  e.currentTarget.style.transform = 'scale(1.05)'
                }
              }}
              onMouseLeave={(e) => {
                if (input.trim() && !isLoading) {
                  e.currentTarget.style.transform = 'scale(1)'
                }
              }}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default memo(ChatBubble)

