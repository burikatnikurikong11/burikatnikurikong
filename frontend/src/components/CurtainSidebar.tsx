import { memo } from 'react'

interface CurtainSidebarProps {
  isOpen: boolean
  onClose: () => void
  children: React.ReactNode
}

function CurtainSidebar({ isOpen, onClose, children }: CurtainSidebarProps) {
  return (
    <>
      {/* Backdrop overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-[1500] transition-opacity duration-300"
          onClick={onClose}
          style={{ animation: 'fadeIn 0.3s ease-out' }}
        />
      )}

      {/* Curtain-shaped sidebar */}
      <div
        className={`fixed top-0 left-0 h-full z-[1600] transition-transform duration-500 ease-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{
          width: '400px',
          maxWidth: '90vw',
        }}
      >
        {/* Curtain shape with clip-path */}
        <div
          className="relative h-full overflow-hidden"
          style={{
            clipPath: 'polygon(0 0, 100% 0, 85% 100%, 0 100%)',
            WebkitClipPath: 'polygon(0 0, 100% 0, 85% 100%, 0 100%)',
          }}
        >
          {/* Abaca texture background */}
          <div
            className="absolute inset-0"
            style={{
              backgroundColor: '#C9B595',
              backgroundImage: `
                repeating-linear-gradient(
                  90deg,
                  transparent,
                  transparent 2px,
                  rgba(139, 119, 85, 0.15) 2px,
                  rgba(139, 119, 85, 0.15) 4px
                ),
                repeating-linear-gradient(
                  0deg,
                  transparent,
                  transparent 2px,
                  rgba(139, 119, 85, 0.15) 2px,
                  rgba(139, 119, 85, 0.15) 4px
                ),
                linear-gradient(
                  180deg,
                  rgba(205, 183, 141, 0.3) 0%,
                  rgba(160, 140, 100, 0.3) 100%
                )
              `,
              backgroundBlendMode: 'overlay',
              boxShadow: '4px 0 20px rgba(0, 0, 0, 0.3)',
            }}
          >
            {/* Subtle fiber overlay */}
            <div
              className="absolute inset-0 opacity-40"
              style={{
                backgroundImage: `
                  repeating-linear-gradient(
                    45deg,
                    transparent,
                    transparent 3px,
                    rgba(101, 84, 56, 0.1) 3px,
                    rgba(101, 84, 56, 0.1) 6px
                  ),
                  repeating-linear-gradient(
                    -45deg,
                    transparent,
                    transparent 3px,
                    rgba(101, 84, 56, 0.1) 3px,
                    rgba(101, 84, 56, 0.1) 6px
                  )
                `,
                mixBlendMode: 'multiply',
              }}
            />
          </div>

          {/* Content area with scroll */}
          <div className="relative h-full overflow-y-auto">
            {/* Header with close button */}
            <div
              className="sticky top-0 z-10 px-6 py-4 flex items-center justify-between"
              style={{
                background: 'linear-gradient(180deg, rgba(0,0,0,0.2) 0%, transparent 100%)',
              }}
            >
              <h2 className="text-2xl font-bold" style={{ color: 'var(--forest-green)' }}>
                Menu
              </h2>
              <button
                onClick={onClose}
                className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-110"
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  color: 'var(--forest-green)',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                }}
                aria-label="Close sidebar"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Content */}
            <div className="px-6 pb-8">{children}</div>
          </div>

          {/* Decorative curtain edge - thinner at bottom */}
          <div
            className="absolute top-0 right-0 h-full pointer-events-none"
            style={{
              width: '2px',
              background: 'linear-gradient(180deg, rgba(101, 84, 56, 0.6) 0%, rgba(101, 84, 56, 0.2) 100%)',
            }}
          />

          {/* Decorative curtain folds */}
          <div
            className="absolute top-0 left-0 w-full h-20 pointer-events-none opacity-30"
            style={{
              background:
                'repeating-linear-gradient(90deg, transparent, transparent 40px, rgba(0,0,0,0.1) 40px, rgba(0,0,0,0.1) 50px)',
            }}
          />
        </div>
      </div>
    </>
  )
}

export default memo(CurtainSidebar)
