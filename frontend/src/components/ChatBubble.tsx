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
      
      if (response.places && response.places.length > 0 && onPlaceSelect) {
        setTimeout(() => {
          for (const place of response.places) {
            onPlaceSelect(place)
            break
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

  // Mobile: bottom sheet
  if (isMobile) {
    return (
      <>
        {/* Overlay backdrop */}
        {isOpen && (
          <div
            className="fixed inset-0 bg-black/30 z-[9997] transition-opacity duration-300"
            onClick={onToggle}
          />
        )}

        {/* Mobile Bottom Sheet */}
        <div
          className={`fixed left-0 right-0 z-[9998] transition-all duration-300 ease-in-out ${
            isOpen ? 'translate-y-0' : 'translate-y-full'
          }`}
          style={{
            bottom: 0,
            height: '70%',
            maxHeight: '600px',
            backgroundColor: '#ffffff',
            borderTopLeftRadius: '1.5rem',
            borderTopRightRadius: '1.5rem',
            boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.15)'
          }}
        >
          {/* Drag Handle */}
          <div className="w-full flex justify-center py-3 cursor-pointer" onClick={onToggle}>
            <div className="w-12 h-1.5 rounded-full bg-gray-300"></div>
          </div>
          
          {/* Chat Content */}
          <div className="h-full flex flex-col" style={{ height: 'calc(100% - 30px)' }}>
            {/* Header */}
            <div className="px-5 py-4 flex items-center justify-between flex-shrink-0 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center shadow-lg">
                  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-bold text-base text-gray-900">HapiHub AI</h3>
                  <p className="text-xs text-gray-500">Travel Assistant</p>
                </div>
              </div>
              <button
                onClick={onToggle}
                className="p-2 rounded-lg transition-colors text-gray-600 hover:bg-gray-100"
                aria-label="Close chat"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-3 shadow-sm ${
                      message.role === 'user' 
                        ? 'bg-gradient-to-br from-orange-500 to-orange-600 text-white' 
                        : 'bg-white text-gray-900 border border-gray-200'
                    }`}
                  >
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                    
                    {message.places && message.places.length > 0 && (
                      <div className="mt-3 pt-3 space-y-2 border-t border-gray-200">
                        <p className="text-xs font-semibold uppercase tracking-wide mb-2 text-gray-600">
                          📍 Related Places
                        </p>
                        {message.places.map((place, idx) => (
                          <button
                            key={idx}
                            onClick={() => handlePlaceClick(place)}
                            className="w-full text-left p-3 rounded-xl transition-all flex items-center gap-3 bg-gray-50 border-2 border-gray-200 hover:bg-white hover:border-orange-400 hover:shadow-md"
                          >
                            <span className="text-xl">{getPlaceIcon(place.type)}</span>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold truncate text-gray-900">{place.name}</p>
                              <p className="text-xs capitalize text-gray-500">{place.type}</p>
                            </div>
                            <svg className="w-5 h-5 text-orange-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                          </button>
                        ))}
                      </div>
                    )}
                    
                    <p className={`text-xs mt-2 ${message.role === 'user' ? 'text-white/70' : 'text-gray-500'}`}>
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex justify-start">
                  <div className="rounded-2xl px-4 py-3 shadow-sm bg-white border border-gray-200">
                    <div className="flex items-center gap-3">
                      <div className="flex gap-1">
                        <span className="w-2 h-2 rounded-full bg-orange-500 animate-bounce" style={{ animationDelay: '0ms' }}></span>
                        <span className="w-2 h-2 rounded-full bg-orange-400 animate-bounce" style={{ animationDelay: '150ms' }}></span>
                        <span className="w-2 h-2 rounded-full bg-orange-600 animate-bounce" style={{ animationDelay: '300ms' }}></span>
                      </div>
                      <span className="text-sm font-medium text-gray-600">Thinking...</span>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSubmit} className="p-4 bg-white border-t border-gray-100 flex-shrink-0">
              <div className="flex items-center gap-3 rounded-2xl px-4 py-3 bg-gray-50 border-2 border-gray-200 focus-within:border-orange-400 transition-colors">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask about Catanduanes..."
                  className="flex-1 bg-transparent outline-none text-sm placeholder:text-gray-400 text-gray-900"
                  disabled={isLoading}
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className={`p-2 rounded-xl transition-all ${
                    input.trim() && !isLoading
                      ? 'bg-gradient-to-br from-orange-500 to-orange-600 text-white hover:scale-105'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Floating Button */}
        {!isOpen && (
          <button
            onClick={onToggle}
            className="fixed bottom-6 right-6 z-[9999] w-14 h-14 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 transform hover:scale-110 bg-gradient-to-br from-orange-500 to-orange-600"
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

  // Desktop: Floating Card in Lower Right Corner
  return (
    <>
      {/* Floating Chat Card */}
      <div
        className={`fixed z-[9998] transition-all duration-300 ease-in-out ${
          isOpen ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0 pointer-events-none'
        }`}
        style={{
          bottom: '5.5rem',
          right: '1.5rem',
          width: '380px',
          maxWidth: 'calc(100vw - 3rem)',
          height: '600px',
          maxHeight: 'calc(100vh - 10rem)',
          backgroundColor: '#ffffff',
          borderRadius: '1rem',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)',
          overflow: 'hidden'
        }}
      >
        {/* Header */}
        <div className="px-5 py-4 flex items-center justify-between border-b border-gray-100 bg-gradient-to-r from-orange-50 to-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center shadow-lg">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <div>
              <h3 className="font-bold text-base text-gray-900">HapiHub AI</h3>
              <p className="text-xs text-gray-500">Travel Assistant</p>
            </div>
          </div>
          <button
            onClick={onToggle}
            className="p-2 rounded-lg transition-colors text-gray-600 hover:bg-gray-100"
            aria-label="Close chat"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50" style={{ height: 'calc(100% - 140px)' }}>
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 shadow-sm ${
                  message.role === 'user' 
                    ? 'bg-gradient-to-br from-orange-500 to-orange-600 text-white' 
                    : 'bg-white text-gray-900 border border-gray-200'
                }`}
              >
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                
                {message.places && message.places.length > 0 && (
                  <div className="mt-3 pt-3 space-y-2 border-t border-gray-200">
                    <p className="text-xs font-semibold uppercase tracking-wide mb-2 text-gray-600">
                      📍 Related Places
                    </p>
                    {message.places.map((place, idx) => (
                      <button
                        key={idx}
                        onClick={() => handlePlaceClick(place)}
                        className="w-full text-left p-3 rounded-xl transition-all flex items-center gap-3 bg-gray-50 border-2 border-gray-200 hover:bg-white hover:border-orange-400 hover:shadow-md"
                      >
                        <span className="text-xl">{getPlaceIcon(place.type)}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold truncate text-gray-900">{place.name}</p>
                          <p className="text-xs capitalize text-gray-500">{place.type}</p>
                        </div>
                        <svg className="w-5 h-5 text-orange-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </button>
                    ))}
                  </div>
                )}
                
                <p className={`text-xs mt-2 ${message.role === 'user' ? 'text-white/70' : 'text-gray-500'}`}>
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="rounded-2xl px-4 py-3 shadow-sm bg-white border border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 rounded-full bg-orange-500 animate-bounce" style={{ animationDelay: '0ms' }}></span>
                    <span className="w-2 h-2 rounded-full bg-orange-400 animate-bounce" style={{ animationDelay: '150ms' }}></span>
                    <span className="w-2 h-2 rounded-full bg-orange-600 animate-bounce" style={{ animationDelay: '300ms' }}></span>
                  </div>
                  <span className="text-sm font-medium text-gray-600">Thinking...</span>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form onSubmit={handleSubmit} className="p-4 bg-white border-t border-gray-100">
          <div className="flex items-center gap-3 rounded-2xl px-4 py-3 bg-gray-50 border-2 border-gray-200 focus-within:border-orange-400 transition-colors">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about Catanduanes..."
              className="flex-1 bg-transparent outline-none text-sm placeholder:text-gray-400 text-gray-900"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className={`p-2 rounded-xl transition-all ${
                input.trim() && !isLoading
                  ? 'bg-gradient-to-br from-orange-500 to-orange-600 text-white hover:scale-105'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>
        </form>
      </div>

      {/* Floating Button */}
      {!isOpen && (
        <button
          onClick={onToggle}
          className="fixed bottom-6 right-6 z-[9999] w-14 h-14 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 transform hover:scale-110 bg-gradient-to-br from-orange-500 to-orange-600"
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

export default memo(ChatBubble)