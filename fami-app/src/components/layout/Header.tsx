'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Menu, Search, ShoppingBag, User, X, ChevronDown } from 'lucide-react'
import { useCart } from '@/context/CartContext'
import type { Category } from '@/types'

export function Header({ categories, isLoggedIn }: { categories: Category[]; isLoggedIn: boolean }) {
  const { totalItems, setDrawerOpen: setCartDrawerOpen } = useCart()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [mobileCategoriesOpen, setMobileCategoriesOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [isVisible, setIsVisible] = useState(true)
  const [isAtTop, setIsAtTop] = useState(true)

  useEffect(() => {
    let scrollTimeout: NodeJS.Timeout

    const handleScroll = () => {
      const currentScrollY = window.scrollY
      setIsAtTop(currentScrollY < 10)

      // Always show at the very top
      if (currentScrollY < 50) {
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
      }, 300)
    }

    // Initial check
    handleScroll()

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', handleScroll)
      clearTimeout(scrollTimeout)
    }
  }, [])

  return (
    <>
      <div className="h-16 w-full" aria-hidden="true" />
      <header className={`fixed top-0 left-0 w-full z-40 transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] ${
        isVisible ? 'translate-y-0' : '-translate-y-full'
      } ${
        isAtTop 
          ? 'bg-transparent border-transparent' 
          : 'border-b border-[var(--color-border-muted)]/50 bg-[var(--color-parchment)]/95 backdrop-blur-md shadow-sm'
      }`}>
        <div className="container-fami flex h-16 items-center justify-between gap-4">
        <button
          onClick={() => setDrawerOpen(true)}
          aria-label="Open menu"
          className="touch-target -ml-2 flex items-center justify-center md:hidden"
        >
          <Menu size={22} aria-hidden="true" />
        </button>

        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 md:static md:translate-x-0 md:translate-y-0">
          <Link 
            href="/" 
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="flex items-center gap-2" 
            aria-label="FaMi — home"
          >
            <Image
              src="/logo.jpg"
              alt="FaMi"
              width={40}
              height={40}
              className="object-contain rounded-full"
              priority
            />
            <span className="font-display text-xl font-medium text-[var(--color-ink-plum)] hidden sm:block">FaMi</span>
          </Link>
        </div>

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

    </header>

    {/* Mobile drawer */}
    {drawerOpen && (
      <div className="fixed inset-0 z-50 md:hidden">
        <button aria-label="Close menu" className="absolute inset-0 bg-[var(--color-ink-plum)]/60 backdrop-blur-sm animate-fade-in" onClick={() => setDrawerOpen(false)} />
        <div className="absolute inset-y-0 left-0 flex w-[85vw] max-w-sm flex-col bg-[var(--color-parchment)] animate-slide-in-left shadow-2xl overflow-y-auto border-r border-[var(--color-border-muted)]">
          <div className="p-6 flex items-center justify-between border-b border-[var(--color-border-muted)]/50">
            <Link 
              href="/" 
              onClick={() => {
                setDrawerOpen(false)
                window.scrollTo({ top: 0, behavior: 'smooth' })
              }}
              className="flex items-center gap-3"
            >
              <Image src="/logo.jpg" alt="FaMi" width={36} height={36} className="object-contain rounded-full shadow-sm" />
              <span className="font-display text-2xl text-[var(--color-ink-plum)]">FaMi</span>
            </Link>
            <button onClick={() => setDrawerOpen(false)} aria-label="Close menu" className="touch-target flex items-center justify-center bg-white/50 rounded-full h-8 w-8 text-[var(--color-ink-plum)]">
              <X size={20} aria-hidden="true" />
            </button>
          </div>
          
          <div className="flex flex-col flex-1 p-6 gap-2">
            <button
              onClick={() => setMobileCategoriesOpen(s => !s)}
              className="font-ui flex w-full items-center justify-between py-3 text-left text-base font-medium uppercase tracking-widest text-[var(--color-ink-plum)] transition-colors"
            >
              Categories
              <ChevronDown size={18} className={`transition-transform duration-300 text-[var(--color-rose-gold)] ${mobileCategoriesOpen ? 'rotate-180' : ''}`} />
            </button>
            
            <div className={`flex flex-col overflow-hidden transition-all duration-300 ${mobileCategoriesOpen ? 'max-h-[500px] opacity-100 mb-4' : 'max-h-0 opacity-0'}`}>
              <div className="flex flex-col pl-4 border-l-2 border-[var(--color-rose-gold)]/30 ml-2 mt-2 gap-3">
                <Link
                  href="/shop"
                  onClick={() => setDrawerOpen(false)}
                  className="font-ui text-sm uppercase tracking-wider text-[var(--color-ink-plum)] font-medium transition-colors"
                >
                  All Products
                </Link>
                {categories.map(cat => (
                  <Link
                    key={cat.id}
                    href={`/shop/${cat.slug}`}
                    onClick={() => setDrawerOpen(false)}
                    className="font-ui text-sm uppercase tracking-wider text-[var(--color-text-muted)] transition-colors hover:text-[var(--color-rose-gold)]"
                  >
                    {cat.name}
                  </Link>
                ))}
              </div>
            </div>

            <hr className="border-[var(--color-border-muted)] my-3" />
            
            <Link href="/blog" onClick={() => setDrawerOpen(false)} className="font-ui py-3 text-base font-medium uppercase tracking-widest text-[var(--color-ink-plum)] transition-colors">
              Journal
            </Link>
            <Link href={isLoggedIn ? '/account' : '/login'} onClick={() => setDrawerOpen(false)} className="font-ui py-3 text-base font-medium uppercase tracking-widest text-[var(--color-ink-plum)] transition-colors">
              {isLoggedIn ? 'My Account' : 'Sign In'}
            </Link>

            <div className="mt-auto pt-8 pb-4">
              <p className="font-ui text-xs text-[var(--color-text-muted)] uppercase tracking-widest mb-4">Connect with us</p>
              <div className="flex gap-4">
                <a href="https://www.instagram.com/fami_2024_?stkn=MXQ3YncybW5qeTdrYg==" target="_blank" rel="noopener noreferrer" className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm border border-[var(--color-border-muted)] transition-all hover:border-[var(--color-rose-gold)] hover:text-[var(--color-rose-gold)]" aria-label="Instagram">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"></line></svg>
                </a>
                <a href="https://www.facebook.com/share/1Esn3Y7zuK/" target="_blank" rel="noopener noreferrer" className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm border border-[var(--color-border-muted)] transition-all hover:border-[#1877F2] hover:text-[#1877F2]" aria-label="Facebook">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
                </a>
                <a href="https://wa.me/8801611158514" target="_blank" rel="noopener noreferrer" className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm border border-[var(--color-border-muted)] transition-all hover:border-[#25D366] hover:text-[#25D366]" aria-label="WhatsApp">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21l1.65-3.8a9 9 0 1 1 3.4 2.9L3 21"></path><path d="M9 10a.5.5 0 0 0 1 0V9a.5.5 0 0 0-1 0v1a5 5 0 0 0 5 5h1a.5.5 0 0 0 0-1h-1a.5.5 0 0 0 0 1"></path></svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    )}
    </>
  )
}
