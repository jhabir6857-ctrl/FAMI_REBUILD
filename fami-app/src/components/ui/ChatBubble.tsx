'use client'

import { useState, useEffect } from 'react'
import { MessageCircle, X } from 'lucide-react'

export function ChatBubble() {
  const [isOpen, setIsOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  // Delay mounting to ensure hydration mismatch doesn't occur and to add an entry animation
  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 1500)
    return () => clearTimeout(timer)
  }, [])

  if (!mounted) return null

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* Chat Window */}
      <div 
        className={`mb-4 w-[calc(100vw-3rem)] sm:w-80 overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-[var(--color-border)] transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] origin-bottom-right ${isOpen ? 'scale-100 opacity-100 translate-y-0' : 'scale-90 opacity-0 translate-y-8 pointer-events-none'}`}
      >
        <div className="bg-[var(--color-ink-plum)] p-4 text-white flex items-center justify-between">
          <div>
            <h3 className="font-display font-medium tracking-wide">FaMi Concierge</h3>
            <p className="text-xs text-[var(--color-rose-gold-light)] font-ui">Typically replies in minutes</p>
          </div>
          <button 
            onClick={() => setIsOpen(false)}
            className="text-white/80 hover:text-white transition-colors"
            aria-label="Close chat"
          >
            <X size={20} />
          </button>
        </div>
        <div className="h-64 bg-[var(--color-parchment)] p-4 overflow-y-auto">
          <div className="flex flex-col gap-3">
            <div className="bg-white p-3 rounded-2xl rounded-tl-sm shadow-sm self-start max-w-[85%] border border-[var(--color-border-muted)]">
              <p className="font-ui text-sm text-[var(--color-ink-plum)]">
                Hello! Welcome to FaMi. How can we help you find your perfect piece today?
              </p>
            </div>
          </div>
        </div>
        <div className="p-4 bg-white border-t border-[var(--color-border-muted)]">
          <a
            href="https://wa.me/8801611158514"
            target="_blank"
            rel="noopener noreferrer"
            className="flex w-full items-center justify-center gap-2 rounded-full bg-[#25D366] py-3 px-4 font-ui text-sm font-medium text-white shadow-md transition-transform hover:scale-[1.02]"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 21l1.65-3.8a9 9 0 1 1 3.4 2.9L3 21"></path>
              <path d="M9 10a.5.5 0 0 0 1 0V9a.5.5 0 0 0-1 0v1a5 5 0 0 0 5 5h1a.5.5 0 0 0 0-1h-1a.5.5 0 0 0 0 1"></path>
            </svg>
            Chat on WhatsApp
          </a>
        </div>
      </div>

      {/* Floating Action Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle chat"
        className="group relative flex h-14 w-14 items-center justify-center rounded-full bg-[var(--color-ink-plum)] text-white shadow-lg shadow-[var(--color-ink-plum)]/30 transition-all duration-500 hover:scale-105 hover:shadow-xl hover:shadow-[var(--color-ink-plum)]/40 hover:bg-[#3a2c3e]"
      >
        {/* Subtle continuous pulse ring */}
        <div className="absolute inset-0 rounded-full border border-[var(--color-ink-plum)] animate-[ping_3s_cubic-bezier(0,0,0.2,1)_infinite] opacity-20" />
        
        <div className={`transition-all duration-500 ${isOpen ? 'rotate-90 scale-0 opacity-0 absolute' : 'rotate-0 scale-100 opacity-100'}`}>
          <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 21l1.65-3.8a9 9 0 1 1 3.4 2.9L3 21"></path>
            <path d="M9 10a.5.5 0 0 0 1 0V9a.5.5 0 0 0-1 0v1a5 5 0 0 0 5 5h1a.5.5 0 0 0 0-1h-1a.5.5 0 0 0 0 1"></path>
          </svg>
        </div>
        
        <div className={`transition-all duration-500 ${isOpen ? 'rotate-0 scale-100 opacity-100' : '-rotate-90 scale-0 opacity-0 absolute'}`}>
          <X size={24} strokeWidth={1.5} />
        </div>
      </button>
    </div>
  )
}
