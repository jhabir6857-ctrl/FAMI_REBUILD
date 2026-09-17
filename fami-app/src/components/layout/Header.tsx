'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Menu, Search, ShoppingBag, User, X } from 'lucide-react'
import { useCart } from '@/context/CartContext'
import type { Category } from '@/types'

export function Header({ categories, isLoggedIn }: { categories: Category[]; isLoggedIn: boolean }) {
  const { totalItems, setDrawerOpen: setCartDrawerOpen } = useCart()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    let scrollTimeout: NodeJS.Timeout

    const handleScroll = () => {
      // Always show at the very top
      if (window.scrollY < 50) {
        setIsVisible(true)
        return
      }

      // Hide while actively scrolling
      setIsVisible(false)

      // Clear the previous timeout
      clearTimeout(scrollTimeout)

      // Set a new timeout to show the header when scrolling stops
      scrollTimeout = setTimeout(() => {
        setIsVisible(true)
      }, 300) // 300ms after scroll stops
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', handleScroll)
      clearTimeout(scrollTimeout)
    }
  }, [])

  return (
    <>
      <div className="h-16 w-full" aria-hidden="true" />
      <header className={`fixed top-0 left-0 w-full z-40 border-b border-[#2b1f2e]/5 bg-[var(--color-parchment)]/80 backdrop-blur-md transition-transform duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] ${isVisible ? 'translate-y-0' : '-translate-y-full'}`}>
        <div className="container-fami flex h-16 items-center justify-between gap-4">
        <button
          onClick={() => setDrawerOpen(true)}
          aria-label="Open menu"
          className="touch-target -ml-2 flex items-center justify-center md:hidden"
        >
          <Menu size={22} aria-hidden="true" />
        </button>

        <Link href="/" className="flex items-center gap-2" aria-label="FaMi — home">
          <Image
            src="/logo.jpg"
            alt="FaMi"
            width={40}
            height={40}
            className="object-contain"
            priority
          />
          <span className="font-display text-xl font-medium text-[var(--color-ink-plum)] hidden sm:block">FaMi</span>
        </Link>

        {/* Desktop nav — luxury styling with animated underline */}
        <nav aria-label="Main" className="hidden items-center gap-8 md:flex">
          {categories.slice(0, 6).map(cat => (
            <Link
              key={cat.id}
              href={`/shop/${cat.slug}`}
              className="group relative font-ui text-[13px] font-medium uppercase tracking-widest text-[var(--color-ink-plum)] transition-colors hover:text-[var(--color-rose-gold)]"
            >
              {cat.name}
              <span className="absolute -bottom-1.5 left-0 h-[1px] w-0 bg-[var(--color-rose-gold)] transition-all duration-300 ease-out group-hover:w-full" />
            </Link>
          ))}
          <Link 
            href="/blog" 
            className="group relative font-ui text-[13px] font-medium uppercase tracking-widest text-[var(--color-ink-plum)] transition-colors hover:text-[var(--color-rose-gold)]"
          >
            Journal
            <span className="absolute -bottom-1.5 left-0 h-[1px] w-0 bg-[var(--color-rose-gold)] transition-all duration-300 ease-out group-hover:w-full" />
          </Link>
        </nav>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setSearchOpen(s => !s)}
            aria-label="Search"
            aria-expanded={searchOpen}
            className="touch-target flex items-center justify-center"
          >
            <Search size={20} aria-hidden="true" />
          </button>
          <Link href={isLoggedIn ? '/account' : '/login'} aria-label="Account" className="touch-target hidden items-center justify-center md:flex">
            <User size={20} aria-hidden="true" />
          </Link>
          <button onClick={() => setCartDrawerOpen(true)} aria-label={`Cart, ${totalItems} item${totalItems === 1 ? '' : 's'}`} className="touch-target relative flex items-center justify-center">
            <ShoppingBag size={20} aria-hidden="true" />
            {totalItems > 0 && (
              <span className="absolute right-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-[var(--color-rose-gold)] font-ui text-[10px] font-medium text-white">
                {totalItems > 9 ? '9+' : totalItems}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Inline search — expands below header, capped at 5 suggestions upstream via /api/search */}
      {searchOpen && (
        <div className="border-t border-[var(--color-border-muted)] bg-white">
          <div className="container-fami py-3">
            <label htmlFor="site-search" className="sr-only">
              Search products
            </label>
            <div className="flex items-center gap-2">
              <input
                id="site-search"
                type="search"
                autoFocus
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search products"
                className="h-11 flex-1 rounded-[var(--radius-sm)] border border-[var(--color-border)] px-4 font-ui text-sm outline-none focus:border-[var(--color-rose-gold)]"
              />
              <Link
                href={`/shop?q=${encodeURIComponent(query)}`}
                className="font-ui text-sm font-medium text-[var(--color-rose-gold)]"
                onClick={() => setSearchOpen(false)}
              >
                See all results
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Mobile drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <button aria-label="Close menu" className="absolute inset-0 bg-[var(--color-ink-plum)]/40 animate-fade-in" onClick={() => setDrawerOpen(false)} />
          <div className="absolute inset-y-0 left-0 flex w-72 flex-col gap-1 bg-white p-6 animate-slide-in-left">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Image src="/logo.jpg" alt="FaMi" width={32} height={32} className="object-contain" />
                <span className="font-display text-xl text-[var(--color-ink-plum)]">FaMi</span>
              </div>
              <button onClick={() => setDrawerOpen(false)} aria-label="Close menu" className="touch-target flex items-center justify-center">
                <X size={20} aria-hidden="true" />
              </button>
            </div>
            <div className="flex flex-col gap-1 mt-4">
              {categories.map(cat => (
                <Link
                  key={cat.id}
                  href={`/shop/${cat.slug}`}
                  onClick={() => setDrawerOpen(false)}
                  className="font-ui py-3 text-sm font-medium uppercase tracking-widest text-[var(--color-ink-plum)] transition-colors hover:text-[var(--color-rose-gold)]"
                >
                  {cat.name}
                </Link>
              ))}
              <hr className="divider-gold my-4" />
              <Link href="/blog" onClick={() => setDrawerOpen(false)} className="font-ui py-3 text-sm font-medium uppercase tracking-widest text-[var(--color-ink-plum)] transition-colors hover:text-[var(--color-rose-gold)]">
                Journal
              </Link>
              <Link href={isLoggedIn ? '/account' : '/login'} onClick={() => setDrawerOpen(false)} className="font-ui py-3 text-sm font-medium uppercase tracking-widest text-[var(--color-ink-plum)] transition-colors hover:text-[var(--color-rose-gold)]">
                {isLoggedIn ? 'My Account' : 'Sign In'}
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
    </>
  )
}
