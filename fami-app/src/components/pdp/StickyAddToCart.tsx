'use client'

import { useEffect } from 'react'
import Image from 'next/image'
import { AddToCartButton } from './AddToCartButton'
import { formatBDT } from '@/lib/currency'
import { useCart } from '@/context/CartContext'
import type { Product } from '@/types'

export function StickyAddToCart({ product }: { product: Product }) {
  const { isStickyCartVisible, setStickyCartVisible } = useCart()

  useEffect(() => {
    // Observe the main add-to-cart button
    const mainButton = document.getElementById('main-add-to-cart')
    if (!mainButton) return

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0]
        if (!entry) return
        // If main button is out of view, show sticky bar
        setStickyCartVisible(!entry.isIntersecting)
      },
      { threshold: 0 }
    )

    observer.observe(mainButton)
    return () => {
      observer.disconnect()
      setStickyCartVisible(false) // Cleanup on unmount
    }
  }, [setStickyCartVisible])

  return (
    <div 
      className={`fixed inset-x-0 bottom-16 mb-[env(safe-area-inset-bottom)] z-50 transform transition-transform duration-400 ease-out md:hidden ${isStickyCartVisible ? 'translate-y-0' : 'translate-y-[200%]'}`}
    >
      <div className="bg-white/95 backdrop-blur-md border-t border-b border-[#2b1f2e]/10 p-3 flex items-center justify-between gap-4 shadow-[0_-8px_24px_rgba(0,0,0,0.04)]">
        <div className="flex items-center gap-3 overflow-hidden">
          {product.imageUrls[0] && (
            <div className="relative w-10 h-10 rounded-[var(--radius-sm)] overflow-hidden shrink-0 bg-[var(--color-parchment-100)]">
              <Image src={product.imageUrls[0]} alt={product.name} fill className="object-cover" sizes="40px" />
            </div>
          )}
          <div className="flex flex-col truncate">
            <span className="font-editorial text-sm font-medium text-[var(--color-ink-plum)] truncate">{product.name}</span>
            <span className="font-ui text-xs text-[var(--color-ink-plum)]">{formatBDT(product.price)}</span>
          </div>
        </div>
        <div className="shrink-0 w-[120px]">
          <AddToCartButton product={product} />
        </div>
      </div>
    </div>
  )
}
