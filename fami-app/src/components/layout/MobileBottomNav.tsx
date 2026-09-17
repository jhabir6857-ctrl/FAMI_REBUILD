'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Heart, Home, ShoppingBag, Store, User } from 'lucide-react'
import { useCart } from '@/context/CartContext'

export function MobileBottomNav({ isLoggedIn }: { isLoggedIn: boolean }) {
  const pathname = usePathname()
  const { totalItems, setDrawerOpen, isStickyCartVisible } = useCart()

  // Four dedicated tabs: Home / Shop / Wishlist / Cart
  // Account is always reachable from the header's user icon.
  const items = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/shop', label: 'Shop', icon: Store },
    { href: '/wishlist', label: 'Wishlist', icon: Heart },
    { href: '/cart', label: 'Cart', icon: ShoppingBag },
  ]

  return (
    <nav
      aria-label="Primary"
      className={`fixed inset-x-0 bottom-0 z-40 flex border-t border-[var(--color-border-muted)] bg-white pb-[env(safe-area-inset-bottom)] md:hidden transform transition-transform duration-400 ease-out ${isStickyCartVisible ? 'translate-y-full' : 'translate-y-0'}`}
    >
      {items.map(({ href, label, icon: Icon }) => {
        const active = pathname === href || (href !== '/' && pathname.startsWith(href))
        const isCart = href === '/cart'
        
        const content = (
          <>
            <Icon
              size={20}
              color={active ? 'var(--color-rose-gold)' : 'var(--color-ink-plum)'}
              aria-hidden="true"
            />
            {/* Cart badge — show item count dot on the Cart tab */}
            {isCart && totalItems > 0 && (
              <span
                className="absolute right-[calc(50%-14px)] top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-[var(--color-rose-gold)] font-ui text-[9px] font-medium text-white"
                aria-hidden="true"
              >
                {totalItems > 9 ? '9+' : totalItems}
              </span>
            )}
            <span
              className="font-ui text-[10px] font-medium"
              style={{ color: active ? 'var(--color-rose-gold)' : 'var(--color-ink-plum)' }}
            >
              {label}
            </span>
          </>
        )

        if (isCart) {
          return (
            <button
              key={href}
              onClick={() => setDrawerOpen(true)}
              className="touch-target relative flex flex-1 flex-col items-center justify-center gap-0.5 py-2"
            >
              {content}
            </button>
          )
        }

        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? 'page' : undefined}
            className="touch-target relative flex flex-1 flex-col items-center justify-center gap-0.5 py-2"
          >
            {content}
          </Link>
        )
      })}
      {/* Account shortcut — hidden tab only visible when user is logged in, accessible via header on desktop */}
      {isLoggedIn && (
        <Link
          href="/account"
          aria-current={pathname === '/account' ? 'page' : undefined}
          className="touch-target relative flex flex-1 flex-col items-center justify-center gap-0.5 py-2"
        >
          <User
            size={20}
            color={pathname === '/account' ? 'var(--color-rose-gold)' : 'var(--color-ink-plum)'}
            aria-hidden="true"
          />
          <span
            className="font-ui text-[10px] font-medium"
            style={{ color: pathname === '/account' ? 'var(--color-rose-gold)' : 'var(--color-ink-plum)' }}
          >
            Account
          </span>
        </Link>
      )}
    </nav>
  )
}
