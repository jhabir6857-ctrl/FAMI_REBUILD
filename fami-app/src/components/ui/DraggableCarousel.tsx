'use client'

import React, { useRef } from 'react'

import { ChevronLeft, ChevronRight } from 'lucide-react'

export function DraggableCarousel({ children, className = '' }: { children: React.ReactNode, className?: string }) {
  const scrollRef = useRef<HTMLDivElement>(null)

  const scroll = (direction: number) => {
    if (scrollRef.current) {
      const scrollAmount = scrollRef.current.clientWidth * 0.75;
      scrollRef.current.scrollBy({ left: direction * scrollAmount, behavior: 'smooth' })
    }
  }

  return (
    <div className="relative group">
      {/* Desktop Left Arrow */}
      <button
        onClick={() => scroll(-1)}
        className="hidden md:flex absolute left-4 top-[40%] -translate-y-1/2 z-10 w-12 h-12 items-center justify-center rounded-full bg-white/90 shadow-[0_4px_20px_rgba(0,0,0,0.15)] border border-[var(--color-parchment-200)] text-[var(--color-ink-plum)] opacity-0 group-hover:opacity-100 transition-all hover:bg-white hover:scale-105"
        aria-label="Scroll left"
      >
        <ChevronLeft size={24} />
      </button>

      <div
        ref={scrollRef}
        className={`flex overflow-x-auto snap-x snap-mandatory hide-scrollbar ${className}`}
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        {children}
      </div>

      {/* Desktop Right Arrow */}
      <button
        onClick={() => scroll(1)}
        className="hidden md:flex absolute right-4 top-[40%] -translate-y-1/2 z-10 w-12 h-12 items-center justify-center rounded-full bg-white/90 shadow-[0_4px_20px_rgba(0,0,0,0.15)] border border-[var(--color-parchment-200)] text-[var(--color-ink-plum)] opacity-0 group-hover:opacity-100 transition-all hover:bg-white hover:scale-105"
        aria-label="Scroll right"
      >
        <ChevronRight size={24} />
      </button>
    </div>
  )
}
