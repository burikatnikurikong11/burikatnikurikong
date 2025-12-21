interface ResetCameraButtonProps {
  onClick: () => void
  isSidebarOpen?: boolean
  isMobile?: boolean
}

export default function ResetCameraButton({ onClick, isSidebarOpen = false, isMobile = false }: ResetCameraButtonProps) {
  // Calculate right position based on sidebar state
  // On desktop: move left when sidebar is open (30% width sidebar)
  // On mobile: stay in the same position (sidebar is bottom sheet)
  const getRightPosition = () => {
    if (isMobile) {
      return 'right-4' // Stay at right-4 on mobile
    }
    if (isSidebarOpen) {
      return 'right-[calc(30%+1rem)]' // Move left by sidebar width (30%) + 1rem spacing
    }
    return 'right-4' // Default position
  }

  return (
    <button
      onClick={onClick}
      className={`fixed top-4 z-[1000] w-10 h-10 rounded-lg shadow-lg flex items-center justify-center transition-all duration-300 transform hover:scale-110 hover:shadow-xl bg-white/90 backdrop-blur-sm border border-gray-200 ${getRightPosition()}`}
      aria-label="Reset camera to default view"
      title="Reset camera"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-5 h-5 text-gray-700"
      >
        {/* Home/Reset icon */}
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    </button>
  )
}
