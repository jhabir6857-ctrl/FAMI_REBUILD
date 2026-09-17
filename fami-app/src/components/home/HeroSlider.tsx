'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'

const slides = [
  {
    src: '/hero-slide-1.jpg',
    alt: 'FaMi — luxury leather bags and jewellery',
  },
  {
    src: '/hero-slide-2.jpg',
    alt: 'FaMi — curated minimalist skincare',
  },
  {
    src: '/hero-slide-3.jpg',
    alt: 'FaMi — elegant flowing silk dresses',
  },
]

export function HeroSlider() {
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length)
    }, 6000)
    return () => clearInterval(timer)
  }, [])

  return (
    <section className="relative flex items-center justify-center min-h-[95vh] bg-[var(--color-ink-plum)] overflow-hidden" aria-label="Hero">
      {/* Sliding Background Images */}
      {slides.map((slide, index) => (
        <div
          key={slide.src}
          className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out ${
            index === current ? 'opacity-100 z-0 animate-ken-burns' : 'opacity-0 -z-10'
          }`}
        >
          <Image
            src={slide.src}
            alt={slide.alt}
            fill
            sizes="100vw"
            quality={90}
            className="object-cover object-[center_30%] mix-blend-overlay opacity-90"
            priority={index === 0}
          />
        </div>
      ))}

      {/* Subtle feathered gradient overlay for text legibility */}
      <div
        className="absolute inset-0 pointer-events-none z-10"
        style={{ 
          background: 'linear-gradient(to top, rgba(43, 31, 46, 0.95) 0%, rgba(43, 31, 46, 0.1) 40%, rgba(43, 31, 46, 0.6) 100%)' 
        }}
        aria-hidden="true"
      />
      <div
        className="absolute inset-0 pointer-events-none opacity-40 mix-blend-multiply z-10"
        style={{ background: 'radial-gradient(circle at center, rgba(43, 31, 46, 0) 0%, rgba(43, 31, 46, 1) 100%)' }}
        aria-hidden="true"
      />

      {/* Text Content */}
      <div className="container-fami relative z-20 w-full flex flex-col items-center text-center mt-8">
        <div className="flex flex-col items-center max-w-4xl px-4 py-12 rounded-3xl backdrop-blur-[2px] bg-white/5">
          <p className="hallmark-stamp text-white/90 border-white/40 mb-8 animate-fade-in-up">
            New collection 2026
          </p>
          <h1 className="font-display text-5xl md:text-7xl lg:text-[5rem] font-medium text-white leading-[1.05] mb-6 animate-fade-in-up delay-150 tracking-tight drop-shadow-sm">
            Curated for the<br className="hidden md:block" /> <em className="not-italic text-[var(--color-rose-gold-light)] font-medium">discerning</em> shopper
          </h1>
          <p className="font-ui text-base md:text-lg text-white/90 max-w-lg leading-relaxed mb-10 animate-fade-in-up delay-250 font-light drop-shadow-sm">
            Fashion, jewellery, bags and skincare — each piece chosen for quality that outlasts trends.
          </p>
          <div className="flex flex-wrap justify-center gap-5 animate-fade-in-up delay-350">
            <Link
              href="/shop"
              className="inline-flex items-center justify-center h-14 px-10 bg-white/95 text-[var(--color-ink-plum)] font-ui text-sm font-medium rounded-full hover:bg-white transition-all duration-300 press-active tracking-wide shadow-lg hover:shadow-white/20 hover:scale-105"
            >
              Shop the collection
            </Link>
            <Link
              href="/about"
              className="inline-flex items-center justify-center h-14 px-10 bg-transparent border border-white/40 text-white font-ui text-sm font-medium rounded-full hover:bg-white/10 hover:border-white transition-all duration-300 press-active tracking-wide backdrop-blur-md"
            >
              Our story
            </Link>
          </div>
        </div>
      </div>

      {/* Slide Indicators (Dots) */}
      <div className="absolute bottom-32 md:bottom-24 z-20 flex gap-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrent(index)}
            className={`w-1.5 h-1.5 rounded-full transition-all duration-500 ${
              index === current ? 'w-6 bg-white' : 'bg-white/40 hover:bg-white/60'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-[88px] md:bottom-8 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2 animate-fade-in delay-550 opacity-70">
        <span className="font-ui text-[10px] uppercase tracking-[0.2em] text-white">Scroll</span>
        <div className="w-[1px] h-10 bg-white/20 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1/2 bg-white animate-scroll-indicator" />
        </div>
      </div>
    </section>
  )
}
