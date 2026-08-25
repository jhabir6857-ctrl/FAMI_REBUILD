'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Heart } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { formatBDT, discountPercent } from '@/lib/currency'
import type { Product } from '@/types'

export function ProductCard({ product }: { product: Product }) {
  const router = useRouter()
  const [wishlisted, setWishlisted] = useState(false)
  const [pending, setPending] = useState(false)

  const hasDiscount = Boolean(product.compareAtPrice && product.compareAtPrice > product.price)
  const discount = hasDiscount ? discountPercent(product.compareAtPrice!, product.price) : 0

  async function toggleWishlist(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    if (pending) return
    setPending(true)
    try {
      const res = await fetch('/api/wishlist', {
        method: wishlisted ? 'DELETE' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: product.id }),
      })
      if (res.status === 401) {
        router.push(`/login?callbackUrl=${encodeURIComponent(window.location.pathname)}`)
        return
      }
      if (res.ok) setWishlisted(w => !w)
    } finally {
      setPending(false)
    }
  }

  return (
    <Link href={`/products/${product.slug}`} className="group flex flex-col gap-2">
      <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[var(--radius-sm)] bg-[var(--color-parchment-100)]">
        {product.imageUrls[0] && (
          <Image
            src={product.imageUrls[0]}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        )}

        {/* Wishlist heart — always visible on mobile (no hover state on touch) */}
        <button
          onClick={e => void toggleWishlist(e)}
          aria-label={wishlisted ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`}
          aria-pressed={wishlisted}
          className="touch-target absolute right-2 top-2 flex items-center justify-center rounded-full bg-white/90 text-[var(--color-ink-plum)] backdrop-blur-sm transition-micro press-active hover:bg-white"
        >
          <Heart size={18} fill={wishlisted ? 'var(--color-rose-gold)' : 'none'} color={wishlisted ? 'var(--color-rose-gold)' : 'currentColor'} aria-hidden="true" />
        </button>

        <div className="absolute left-2 top-2 flex flex-col gap-1">
          {product.isNew && <Badge variant="new">New</Badge>}
          {hasDiscount && <Badge variant="sale">-{discount}%</Badge>}
          {product.stock === 0 && <Badge variant="out-of-stock">Out of stock</Badge>}
        </div>
      </div>

      <div className="flex flex-col gap-0.5">
        <p className="font-ui text-xs uppercase tracking-wide text-[var(--color-text-muted)]">{product.categoryName}</p>
        <h3 className="font-editorial text-base font-medium leading-snug text-[var(--color-ink-plum)] group-hover:text-[var(--color-rose-gold)] transition-micro">
          {product.name}
        </h3>
        <div className="flex items-baseline gap-2">
          <span className="font-ui text-sm font-medium text-[var(--color-ink-plum)]">{formatBDT(product.price)}</span>
          {hasDiscount && (
            <span className="font-ui text-xs text-[var(--color-text-muted)] line-through">{formatBDT(product.compareAtPrice!)}</span>
          )}
        </div>
      </div>
    </Link>
  )
}
