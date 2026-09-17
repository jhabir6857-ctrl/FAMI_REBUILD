'use client'

import { useState, useEffect } from 'react'

export function ChatBubble() {
  const [mounted, setMounted] = useState(false)

  // Delay mounting to ensure hydration mismatch doesn't occur and to add an entry animation
  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 1500)
    return () => clearTimeout(timer)
  }, [])

  if (!mounted) return null

  return (
    <div className="hidden md:flex fixed bottom-6 right-6 z-50 flex-col items-end">
      {/* Direct WhatsApp Action Button */}
      <a
        href="https://wa.me/8801611158514"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat on WhatsApp"
        className="group relative flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg shadow-[#25D366]/30 transition-all duration-500 hover:scale-110 hover:shadow-xl hover:shadow-[#25D366]/40"
      >
        {/* Subtle continuous pulse ring */}
        <div className="absolute inset-0 rounded-full border border-[#25D366] animate-[ping_3s_cubic-bezier(0,0,0.2,1)_infinite] opacity-30" />
        
        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="relative z-10">
          <path d="M3 21l1.65-3.8a9 9 0 1 1 3.4 2.9L3 21"></path>
          <path d="M9 10a.5.5 0 0 0 1 0V9a.5.5 0 0 0-1 0v1a5 5 0 0 0 5 5h1a.5.5 0 0 0 0-1h-1a.5.5 0 0 0 0 1"></path>
        </svg>
      </a>
    </div>
  )
}
