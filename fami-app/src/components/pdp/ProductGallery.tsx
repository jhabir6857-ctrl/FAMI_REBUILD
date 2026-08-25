'use client'

import { useState } from 'react'
import Image from 'next/image'
import type { Product } from '@/types'

type Slide = { kind: 'image'; url: string } | { kind: 'video'; url: string; poster: string }

export function ProductGallery({ product }: { product: Product }) {
  const slides: Slide[] = [
    ...product.imageUrls.map((url): Slide => ({ kind: 'image', url })),
    // Video is strictly optional — if absent, no slot is added, no broken player.
    ...(product.videoUrl ? [{ kind: 'video', url: product.videoUrl, poster: product.imageUrls[0] ?? '' } as Slide] : []),
  ]
  const [active, setActive] = useState(0)
  const current = slides[active]

  if (slides.length === 0) {
    return <div className="aspect-[4/5] w-full rounded-[var(--radius-sm)] bg-[var(--color-parchment-100)]" />
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[var(--radius-md)] bg-[var(--color-parchment-100)]">
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
          <Image src={current.url} alt={product.name} fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover" priority />
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
