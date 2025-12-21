import { memo } from 'react'

interface ChatBubbleButtonProps {
  onClick: () => void
  isSidebarOpen?: boolean
}

function ChatBubbleButton({ onClick, isSidebarOpen = false }: ChatBubbleButtonProps) {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-6 right-6 z-[9999] w-16 h-16 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 transform hover:scale-110"
      style={{
        backgroundColor: 'transparent',
        border: 'none',
      }}
      aria-label="Open Pathfinder AI chat"
    >
      <img src="/icons/chatbot.svg" alt="Chat" className="w-16 h-16" />
    </button>
  )
}

export default memo(ChatBubbleButton)
