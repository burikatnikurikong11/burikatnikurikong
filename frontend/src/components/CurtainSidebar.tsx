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

      {/* Curtain-shaped sidebar with BINURONG flowing waves */}
      <div
        className={`fixed top-0 left-0 h-full z-[1600] transition-transform duration-500 ease-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{
          width: '400px',
          maxWidth: '90vw',
        }}
      >
        {/* Flowing wave shape with multiple curves - matching BINURONG */}
        <div
          className="relative h-full overflow-hidden"
          style={{
            clipPath: `path('M 0 0 L 400 0 C 380 100, 390 200, 370 300 C 360 350, 365 400, 355 450 C 345 500, 350 550, 340 600 C 330 650, 335 700, 325 750 C 315 800, 320 850, 310 900 C 300 950, 305 1000, 295 1050 C 285 1100, 290 1150, 280 1200 C 270 1300, 275 1400, 265 1500 C 255 1600, 0 1600, 0 1600 Z')`,
            WebkitClipPath: `path('M 0 0 L 400 0 C 380 100, 390 200, 370 300 C 360 350, 365 400, 355 450 C 345 500, 350 550, 340 600 C 330 650, 335 700, 325 750 C 315 800, 320 850, 310 900 C 300 950, 305 1000, 295 1050 C 285 1100, 290 1150, 280 1200 C 270 1300, 275 1400, 265 1500 C 255 1600, 0 1600, 0 1600 Z')`,
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

          {/* Decorative flowing edge shadows - multiple waves */}
          <div
            className="absolute inset-y-0 right-0 w-12 pointer-events-none"
            style={{
              background: `
                radial-gradient(ellipse at 50% 20%, rgba(101, 84, 56, 0.3) 0%, transparent 70%),
                radial-gradient(ellipse at 50% 40%, rgba(101, 84, 56, 0.25) 0%, transparent 70%),
                radial-gradient(ellipse at 50% 60%, rgba(101, 84, 56, 0.2) 0%, transparent 70%),
                radial-gradient(ellipse at 50% 80%, rgba(101, 84, 56, 0.15) 0%, transparent 70%),
                linear-gradient(180deg, rgba(101, 84, 56, 0.4) 0%, rgba(101, 84, 56, 0.1) 100%)
              `,
            }}
          />

          {/* Decorative curtain folds at top */}
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
