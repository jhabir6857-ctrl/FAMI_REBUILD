'use client'

import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react'
import type { CartItem } from '@/types'

const STORAGE_KEY = 'fami-cart-v1'

interface CartContextValue {
  items: CartItem[]
  addItem: (item: Omit<CartItem, 'quantity'>, quantity?: number) => void
  removeItem: (productId: number) => void
  updateQuantity: (productId: number, quantity: number) => void
  clearCart: () => void
  totalItems: number
  totalPrice: number
}

const CartContext = createContext<CartContextValue | null>(null)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const hydrated = useRef(false)

  // Load persisted cart once on mount (client-only — localStorage isn't
  // available during SSR, so this intentionally doesn't run on the server).
  //
  // This *is* a setState-in-effect, which the lint rule below flags on
  // principle — but the alternative (a lazy useState initializer reading
  // localStorage directly) would read different data during the server
  // render (nothing) vs. the client's hydration render (real cart data),
  // which is a React hydration-mismatch bug, worse than one extra render.
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY)
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (raw) setItems(JSON.parse(raw) as CartItem[])
    } catch {
      // Corrupt/unavailable storage shouldn't break the page — start empty.
    } finally {
      hydrated.current = true
    }
  }, [])

  useEffect(() => {
    if (!hydrated.current) return
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
    } catch {
      // Storage can throw in private-browsing/quota-exceeded cases — non-fatal.
    }
  }, [items])

  function addItem(item: Omit<CartItem, 'quantity'>, quantity = 1) {
    setItems(prev => {
      const existing = prev.find(i => i.productId === item.productId)
      if (existing) {
        const nextQty = Math.min(existing.quantity + quantity, item.stock)
        return prev.map(i => (i.productId === item.productId ? { ...i, quantity: nextQty } : i))
      }
      return [...prev, { ...item, quantity: Math.min(quantity, Math.max(item.stock, 1)) }]
    })
  }

  function removeItem(productId: number) {
    setItems(prev => prev.filter(i => i.productId !== productId))
  }

  function updateQuantity(productId: number, quantity: number) {
    if (quantity <= 0) {
      removeItem(productId)
      return
    }
    setItems(prev => prev.map(i => (i.productId === productId ? { ...i, quantity: Math.min(quantity, i.stock) } : i)))
  }

  function clearCart() {
    setItems([])
  }

  const totalItems = useMemo(() => items.reduce((sum, i) => sum + i.quantity, 0), [items])
  const totalPrice = useMemo(() => items.reduce((sum, i) => sum + i.price * i.quantity, 0), [items])

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQuantity, clearCart, totalItems, totalPrice }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within a CartProvider')
  return ctx
}
