'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Trash2, Plus, Minus } from 'lucide-react'
import { useCart } from '@/context/CartContext'
import { Button } from '@/components/ui/Button'
import { formatBDT } from '@/lib/currency'

export function CartClient() {
  const { items, removeItem, updateQuantity, totalItems, totalPrice } = useCart()
  const shipping = totalPrice >= 5000 ? 0 : 120
  const total = totalPrice + shipping

  if (items.length === 0) {
    return (
      <main className="container-fami py-20 text-center">
        <h1 className="font-display text-3xl font-medium text-[var(--color-ink-plum)] mb-4">Your cart</h1>
        <p className="font-ui text-base text-[var(--color-text-muted)] mb-8">Your cart is empty — add something beautiful.</p>
        <Link href="/shop">
          <Button variant="primary" size="md">Shop the collection</Button>
        </Link>
      </main>
    )
  }

  return (
    <main className="container-fami py-8 md:py-12 pb-24 md:pb-12">
      <h1 className="font-display text-3xl md:text-4xl font-medium text-[var(--color-ink-plum)] mb-8">
        Your cart <span className="text-[var(--color-text-muted)] text-xl font-ui font-normal">({totalItems})</span>
      </h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Line items */}
        <div className="lg:col-span-2 flex flex-col divide-y divide-[var(--color-border-muted)]">
          {items.map(item => (
            <div key={item.productId} className="flex gap-4 py-5">
              <Link href={`/products/${item.slug}`} className="flex-shrink-0">
                <div className="relative w-20 h-24 md:w-24 md:h-28 rounded-[var(--radius-sm)] overflow-hidden bg-[var(--color-parchment-100)]">
                  {item.imageUrl && (
                    <Image src={item.imageUrl} alt={item.name} fill className="object-cover" />
                  )}
                </div>
              </Link>
              <div className="flex-1 flex flex-col gap-2">
                <Link href={`/products/${item.slug}`} className="font-editorial text-base text-[var(--color-ink-plum)] hover:text-[var(--color-rose-gold)] transition-micro">
                  {item.name}
                </Link>
                <p className="font-ui text-sm font-medium text-[var(--color-ink-plum)]">{formatBDT(item.price)}</p>
                <div className="flex items-center gap-2 mt-auto">
                  <button
                    onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                    aria-label={`Decrease quantity of ${item.name}`}
                    className="touch-target w-8 h-8 flex items-center justify-center border border-[var(--color-border)] rounded-[var(--radius-sm)] hover:border-[var(--color-ink-plum)] transition-micro"
                  >
                    <Minus size={14} aria-hidden="true" />
                  </button>
                  <span className="font-ui text-sm w-6 text-center" aria-label={`Quantity: ${item.quantity}`}>{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                    aria-label={`Increase quantity of ${item.name}`}
                    disabled={item.quantity >= item.stock}
                    className="touch-target w-8 h-8 flex items-center justify-center border border-[var(--color-border)] rounded-[var(--radius-sm)] hover:border-[var(--color-ink-plum)] transition-micro disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <Plus size={14} aria-hidden="true" />
                  </button>
                  <button
                    onClick={() => removeItem(item.productId)}
                    aria-label={`Remove ${item.name} from cart`}
                    className="ml-auto touch-target text-[var(--color-text-muted)] hover:text-[var(--color-terracotta)] transition-micro"
                  >
                    <Trash2 size={16} aria-hidden="true" />
                  </button>
                </div>
              </div>
              <p className="font-ui text-sm font-medium text-[var(--color-ink-plum)] hidden md:block">
                {formatBDT(item.price * item.quantity)}
              </p>
            </div>
          ))}
        </div>

        {/* Order summary — sticky on desktop */}
        <div className="lg:sticky lg:top-24 h-fit">
          <div className="border border-[var(--color-border-muted)] rounded-[var(--radius-md)] p-6 flex flex-col gap-4">
            <h2 className="font-display text-xl font-medium text-[var(--color-ink-plum)]">Order summary</h2>
            <div className="flex flex-col gap-2 text-sm font-ui">
              <div className="flex justify-between">
                <span className="text-[var(--color-text-muted)]">Subtotal</span>
                <span className="text-[var(--color-ink-plum)]">{formatBDT(totalPrice)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--color-text-muted)]">Shipping</span>
                <span className="text-[var(--color-ink-plum)]">{shipping === 0 ? 'Free' : formatBDT(shipping)}</span>
              </div>
              {shipping > 0 && (
                <p className="text-xs text-[var(--color-text-muted)]">Free shipping on orders over {formatBDT(5000)}</p>
              )}
              <div className="h-px bg-[var(--color-border-muted)] my-1" />
              <div className="flex justify-between font-medium">
                <span className="text-[var(--color-ink-plum)]">Total</span>
                <span className="text-[var(--color-ink-plum)]">{formatBDT(total)}</span>
              </div>
            </div>
            <Link href="/checkout">
              <Button variant="primary" size="lg" className="w-full">Proceed to checkout</Button>
            </Link>
            <Link href="/shop" className="text-center font-ui text-sm text-[var(--color-text-muted)] hover:text-[var(--color-ink-plum)] transition-micro">
              Continue shopping
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}
