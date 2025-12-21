import React from 'react'

interface ItineraryButtonProps {
  onClick: () => void
  count?: number
}

export default function ItineraryButton({ onClick, count = 0 }: ItineraryButtonProps) {
  return (
    <button
      onClick={onClick}
      className="fixed top-[-10px] left-4 z-[1000] group"
      aria-label="Open itinerary planner"
      title="Create Itinerary"
    >
      {/* Bookmark Ribbon */}
      <div
        className="relative transition-all duration-300 ease-out group-hover:scale-105"
        style={{
          width: '80px',
          paddingTop: '12px',
          paddingBottom: '16px',
        }}
      >
        {/* Main Ribbon Body */}
        <div
          className="relative"
          style={{
            background: 'linear-gradient(135deg, #F4A259 0%, #D98745 100%)',
            clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 16px), 50% 100%, 0 calc(100% - 16px))',
            padding: '16px 12px 28px 12px',
          }}
        >
          {/* Icon */}
          <div className="flex flex-col items-center text-white">
            <svg
              className="w-8 h-8 mb-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
              />
            </svg>
            
            {/* Text */}
            <span
              className="text-xs font-bold text-center leading-tight"
              style={{
                textShadow: '0 1px 2px rgba(0, 0, 0, 0.5)',
                fontFamily: '"Inter", sans-serif',
                letterSpacing: '0.5px'
              }}
            >
              CREATE
              <br />
              TRIP
            </span>
          </div>

          {/* Shine effect on hover */}
          <div
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
            style={{
              background: 'linear-gradient(135deg, transparent 0%, rgba(255, 255, 255, 0.3) 50%, transparent 100%)',
              clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 16px), 50% 100%, 0 calc(100% - 16px))',
            }}
          />
        </div>

        {/* Badge for item count */}
        {count > 0 && (
          <div
            className="absolute -top-2 -right-2 flex items-center justify-center"
            style={{
              width: '24px',
              height: '24px',
              background: 'linear-gradient(135deg, #4A7C59 0%, #3A5F44 100%)',
              borderRadius: '50%',
              border: '2px solid white',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
            }}
          >
            <span
              className="text-white text-xs font-bold"
              style={{ textShadow: '0 1px 2px rgba(0, 0, 0, 0.5)' }}
            >
              {count > 9 ? '9+' : count}
            </span>
          </div>
        )}

        {/* Decorative elements */}
        <div
          className="absolute top-0 left-0 right-0 h-1 opacity-50"
          style={{
            background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.5), transparent)',
          }}
        />
      </div>

      {/* Tooltip on hover - now appears on the right side */}
      <div
        className="absolute left-full ml-3 top-1/2 -translate-y-1/2 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none"
        style={{
          background: 'rgba(0, 0, 0, 0.85)',
          color: 'white',
          padding: '8px 12px',
          borderRadius: '8px',
          fontSize: '14px',
          fontWeight: '600',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
        }}
      >
        Create Itinerary
        {/* Tooltip arrow pointing left */}
        <div
          className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-full"
          style={{
            width: 0,
            height: 0,
            borderTop: '6px solid transparent',
            borderBottom: '6px solid transparent',
            borderRight: '6px solid rgba(0, 0, 0, 0.85)',
          }}
        />
      </div>
    </button>
  )
}
