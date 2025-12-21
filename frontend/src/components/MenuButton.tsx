import { memo } from 'react'

interface MenuButtonProps {
  onClick: () => void
  isOpen: boolean
}

function MenuButton({ onClick, isOpen }: MenuButtonProps) {
  return (
    <button
      onClick={onClick}
      className="fixed top-6 left-6 z-[1700] w-14 h-14 rounded-full flex items-center justify-center transition-all hover:scale-110 shadow-xl"
      style={{
        background: isOpen
          ? 'linear-gradient(135deg, rgba(244, 162, 89, 0.95) 0%, rgba(220, 140, 70, 0.95) 100%)'
          : 'linear-gradient(135deg, var(--forest-green) 0%, var(--ocean-blue) 100%)',
        backdropFilter: 'blur(10px)',
      }}
      aria-label={isOpen ? 'Close menu' : 'Open menu'}
    >
      {/* Animated hamburger icon */}
      <div className="relative w-6 h-6 flex flex-col items-center justify-center">
        <span
          className="absolute h-0.5 w-6 bg-white rounded-full transition-all duration-300"
          style={{
            transform: isOpen ? 'rotate(45deg)' : 'translateY(-6px)',
          }}
        />
        <span
          className="absolute h-0.5 w-6 bg-white rounded-full transition-all duration-300"
          style={{
            opacity: isOpen ? 0 : 1,
          }}
        />
        <span
          className="absolute h-0.5 w-6 bg-white rounded-full transition-all duration-300"
          style={{
            transform: isOpen ? 'rotate(-45deg)' : 'translateY(6px)',
          }}
        />
      </div>
    </button>
  )
}

export default memo(MenuButton)
