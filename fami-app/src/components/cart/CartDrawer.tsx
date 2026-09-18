'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { X, Minus, Plus, Trash2 } from 'lucide-react'
import { EmptyState } from '@/components/ui/EmptyState'
import { useCart } from '@/context/CartContext'
import { formatBDT } from '@/lib/currency'
import { Button } from '@/components/ui/Button'
import { useRouter } from 'next/navigation'

export function CartDrawer() {
  const { isDrawerOpen, setDrawerOpen, items, updateQuantity, removeItem, totalPrice } = useCart()
  const router = useRouter()

  // Prevent background scrolling when drawer is open
  useEffect(() => {
    if (isDrawerOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isDrawerOpen])

  if (!isDrawerOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <button 
        aria-label="Close cart"
        className="absolute inset-0 bg-[var(--color-ink-plum)]/40 backdrop-blur-sm animate-fade-in"
        onClick={() => setDrawerOpen(false)}
      />
      
      {/* Drawer */}
      <div 
        className="relative w-full max-w-md glass-panel h-full shadow-2xl flex flex-col animate-slide-in-right"
        // Use our new slide-in-right that takes 400ms with cubic-bezier
      >
        <div className="flex items-center justify-between p-6 border-b border-[#2b1f2e]/5">
          <h2 className="font-display text-2xl text-[var(--color-ink-plum)]">Your Cart</h2>
          <button 
            onClick={() => setDrawerOpen(false)}
            aria-label="Close cart"
            className="touch-target flex items-center justify-center text-[var(--color-ink-plum)] hover:text-[var(--color-rose-gold)] transition-micro"
          >
            <X size={24} strokeWidth={1.5} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
          {items.length === 0 ? (
            <div className="flex-1 flex items-center justify-center -mt-10">
              <EmptyState 
                type="cart" 
                onActionClick={() => {
                  setDrawerOpen(false)
                  router.push('/shop')
                }} 
              />
            </div>
          ) : (
            items.map(item => (
              <div key={item.productId} className="flex gap-4">
                <Link 
                  href={`/products/${item.slug}`} 
                  onClick={() => setDrawerOpen(false)}
                  className="shrink-0 relative w-24 h-32 rounded-[var(--radius-sm)] overflow-hidden bg-[var(--color-parchment-100)] border border-[#2b1f2e]/5"
                >
                  <Image
                    src={item.imageUrl}
                    alt={item.name}
                    fill
                    sizes="96px"
                    className="object-cover"
                  />
                </Link>
                <div className="flex flex-col flex-1 justify-between py-1">
                  <div>
                    <h3 className="font-editorial text-lg text-[var(--color-ink-plum)] leading-snug line-clamp-2">
                      <Link href={`/products/${item.slug}`} onClick={() => setDrawerOpen(false)}>
                        {item.name}
                      </Link>
                    </h3>
                    <p className="font-ui text-sm font-medium text-[var(--color-ink-plum)] mt-1">
                      {formatBDT(item.price)}
                    </p>
                  </div>
                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center border border-[#2b1f2e]/10 rounded-[var(--radius-sm)] overflow-hidden h-8">
                      <button 
                        onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                        className="w-8 flex items-center justify-center text-[var(--color-ink-plum)] hover:bg-[#2b1f2e]/5 transition-micro"
                        aria-label="Decrease quantity"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="w-8 text-center font-ui text-sm font-medium">{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                        disabled={item.quantity >= item.stock}
                        className="w-8 flex items-center justify-center text-[var(--color-ink-plum)] hover:bg-[#2b1f2e]/5 transition-micro disabled:opacity-50"
                        aria-label="Increase quantity"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                    <button 
                      onClick={() => removeItem(item.productId)}
                      className="text-[var(--color-text-muted)] hover:text-red-500 transition-micro"
                      aria-label="Remove item"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {items.length > 0 && (
          <div className="border-t border-[#2b1f2e]/5 p-6 bg-transparent">
            <div className="flex justify-between items-end mb-6">
              <span className="font-ui text-sm text-[var(--color-text-muted)]">Subtotal</span>
              <span className="font-ui text-xl font-medium text-[var(--color-ink-plum)]">{formatBDT(totalPrice)}</span>
            </div>
            <p className="font-ui text-xs text-[var(--color-text-muted)] mb-4 text-center">
              Shipping & taxes calculated at checkout.
            </p>
            <Button 
              className="w-full h-14 text-base tracking-wider" 
              onClick={() => {
                setDrawerOpen(false)
                router.push('/checkout')
              }}
            >
              Checkout securely
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
