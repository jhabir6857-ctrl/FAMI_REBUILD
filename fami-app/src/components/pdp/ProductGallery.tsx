'use client'

import { useState } from 'react'
import Image from 'next/image'
import type { Product } from '@/types'

type Slide = { kind: 'image'; url: string } | { kind: 'video'; url: string; poster: string }

export function ProductGallery({ product }: { product: Product }) {
  const rawSlides: Slide[] = [
    ...product.imageUrls.map((url): Slide => ({ kind: 'image', url })),
    // Video is strictly optional
    ...(product.videoUrl ? [{ kind: 'video', url: product.videoUrl, poster: product.imageUrls[0] ?? '' } as Slide] : []),
  ]

  // Provide a high-quality fallback image if the DB is missing image URLs
  const slides = rawSlides.length > 0 ? rawSlides : [
    { kind: 'image', url: '/hero.jpg' } as Slide
  ]
  const [active, setActive] = useState(0)
  const current = slides[active]

  // Magnifier state
  const [isZoomed, setIsZoomed] = useState(false)
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 })

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    // Only apply magnifier on devices with hover capability (desktop)
    if (typeof window !== 'undefined' && window.matchMedia('(hover: none)').matches) return

    const { left, top, width, height } = e.currentTarget.getBoundingClientRect()
    const x = ((e.clientX - left) / width) * 100
    const y = ((e.clientY - top) / height) * 100
    setMousePos({ x, y })
  }

  if (slides.length === 0) {
    return <div className="aspect-[4/5] w-full rounded-[var(--radius-sm)] bg-[var(--color-parchment-100)]" />
  }

  return (
    <div className="flex flex-col gap-3">
      <div 
        className="relative aspect-[4/5] w-full overflow-hidden rounded-[var(--radius-sm)] bg-[var(--color-parchment-100)] group cursor-crosshair"
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsZoomed(true)}
        onMouseLeave={() => {
          setIsZoomed(false)
          // Reset after transition ends to avoid jumping
          setTimeout(() => setMousePos({ x: 50, y: 50 }), 400)
        }}
      >
        {current?.kind === 'video' ? (
          <video
            src={current.url}
            poster={current.poster}
            autoPlay
            muted
            loop
            playsInline
            className="h-full w-full object-cover"
          />
        ) : current ? (
          <Image 
            src={current.url} 
            alt={product.name} 
            fill 
            sizes="(max-width: 768px) 100vw, 50vw" 
            className="object-cover transition-transform duration-400 ease-out" 
            style={{
              transformOrigin: `${mousePos.x}% ${mousePos.y}%`,
              transform: isZoomed ? 'scale(2.5)' : 'scale(1)'
            }}
            priority 
          />
        ) : null}
      </div>

      {slides.length > 1 && (
        <div className="flex gap-2 overflow-x-auto">
          {slides.map((slide, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              aria-label={`View ${slide.kind === 'video' ? 'product video' : `image ${i + 1}`}`}
              aria-current={i === active}
              className={`relative h-16 w-14 flex-shrink-0 overflow-hidden rounded-[var(--radius-sm)] border transition-micro ${
                i === active ? 'border-[var(--color-rose-gold)]' : 'border-[var(--color-border)]'
              }`}
            >
              <Image
                src={slide.kind === 'video' ? slide.poster : slide.url}
                alt=""
                fill
                sizes="56px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
