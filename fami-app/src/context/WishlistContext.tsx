'use client'
import React, { createContext, useContext, useState, useCallback } from 'react'

interface WishlistContextValue { wishlistIds: Set<number>; toggleWishlist: (productId: number) => Promise<void>; isWishlisted: (productId: number) => boolean; totalWishlist: number; }
const WishlistContext = createContext<WishlistContextValue | null>(null)

export function WishlistProvider({ children, initialIds = [] }: { children: React.ReactNode; initialIds?: number[] }) {
  const [wishlistIds, setWishlistIds] = useState<Set<number>>(new Set(initialIds))

  const toggleWishlist = useCallback(async (productId: number) => {
    const isIn = wishlistIds.has(productId)
    setWishlistIds(prev => { const next = new Set(prev); if (isIn) next.delete(productId); else next.add(productId); return next })
    try {
      await fetch('/api/wishlist', { method: isIn ? 'DELETE' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ productId }) })
    } catch {
      setWishlistIds(prev => { const next = new Set(prev); if (isIn) next.add(productId); else next.delete(productId); return next })
    }
  }, [wishlistIds])

  const isWishlisted = useCallback((productId: number) => wishlistIds.has(productId), [wishlistIds])
  const totalWishlist = wishlistIds.size
  return <WishlistContext.Provider value={{ wishlistIds, toggleWishlist, isWishlisted, totalWishlist }}>{children}</WishlistContext.Provider>
}

export function useWishlist() {
  const ctx = useContext(WishlistContext)
  if (!ctx) throw new Error('useWishlist must be used inside WishlistProvider')
  return ctx
}
