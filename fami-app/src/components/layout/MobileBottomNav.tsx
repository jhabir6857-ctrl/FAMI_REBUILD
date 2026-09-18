'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Heart, Home, ShoppingBag, Store, User } from 'lucide-react'
import { useCart } from '@/context/CartContext'

export function MobileBottomNav({ isLoggedIn }: { isLoggedIn: boolean }) {
  const pathname = usePathname()
  const { totalItems, setDrawerOpen, isStickyCartVisible } = useCart()
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    let scrollTimeout: NodeJS.Timeout

    const handleScroll = () => {
      if (window.scrollY < 50) {
        setIsVisible(true)
        return
      }
      setIsVisible(false)
      clearTimeout(scrollTimeout)
      scrollTimeout = setTimeout(() => setIsVisible(true), 300)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', handleScroll)
      clearTimeout(scrollTimeout)
    }
  }, [])

  const items = [
    { href: '/', label: 'Home', icon: Home, isExternal: false },
    { href: '/shop', label: 'Shop', icon: Store, isExternal: false },
    { href: 'https://wa.me/8801611158514', label: 'WhatsApp', icon: () => (
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 21l1.65-3.8a9 9 0 1 1 3.4 2.9L3 21"></path>
        <path d="M9 10a.5.5 0 0 0 1 0V9a.5.5 0 0 0-1 0v1a5 5 0 0 0 5 5h1a.5.5 0 0 0 0-1h-1a.5.5 0 0 0 0 1"></path>
      </svg>
    ), isExternal: true },
    { href: '/wishlist', label: 'Wishlist', icon: Heart, isExternal: false },
    { href: '/cart', label: 'Cart', icon: ShoppingBag, isExternal: false },
  ]

  const translateY = isStickyCartVisible ? 'translate-y-full' : (isVisible ? 'translate-y-0' : 'translate-y-[150%]')

  return (
    <nav
      aria-label="Primary"
      className={`fixed inset-x-0 bottom-0 z-40 flex border-t border-[var(--color-border-muted)] glass-panel pb-[env(safe-area-inset-bottom)] md:hidden transform transition-transform duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] ${translateY}`}
    >
      {items.map(({ href, label, icon: Icon, isExternal }) => {
        const active = pathname === href || (href !== '/' && !isExternal && pathname.startsWith(href))
        const isCart = href === '/cart'
        
        const content = (
          <>
            <Icon
              size={20}
              color={active ? 'var(--color-rose-gold)' : (isExternal ? '#25D366' : 'var(--color-ink-plum)')}
              aria-hidden="true"
            />
            {isCart && totalItems > 0 && (
              <span className="absolute right-[calc(50%-14px)] top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-[var(--color-rose-gold)] font-ui text-[9px] font-medium text-white">
                {totalItems > 9 ? '9+' : totalItems}
              </span>
            )}
            <span
              className="font-ui text-[10px] font-medium"
              style={{ color: active ? 'var(--color-rose-gold)' : (isExternal ? '#25D366' : 'var(--color-ink-plum)') }}
            >
              {label}
            </span>
          </>
        )

        if (isCart) {
          return (
            <button key={href} onClick={() => setDrawerOpen(true)} className="touch-target relative flex flex-1 flex-col items-center justify-center gap-0.5 py-2">
              {content}
            </button>
          )
        }

        if (isExternal) {
          return (
            <a key={href} href={href} target="_blank" rel="noopener noreferrer" className="touch-target relative flex flex-1 flex-col items-center justify-center gap-0.5 py-2 hover:bg-zinc-50">
              {content}
            </a>
          )
        }

        return (
          <Link key={href} href={href} aria-current={active ? 'page' : undefined} className="touch-target relative flex flex-1 flex-col items-center justify-center gap-0.5 py-2">
            {content}
          </Link>
        )
      })}
    </nav>
  )
}
