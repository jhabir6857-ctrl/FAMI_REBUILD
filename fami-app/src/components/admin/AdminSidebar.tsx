'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { SignOutButton } from '@/components/account/SignOutButton'

export function AdminSidebar() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()

  // Close sidebar on route change for mobile
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsOpen(false)
  }, [pathname])

  const navLinks = [
    { href: '/admin', label: 'Dashboard' },
    { href: '/admin/orders', label: 'Orders' },
    { href: '/admin/products', label: 'Products' },
    { href: '/admin/blog', label: 'Blog' },
    { href: '/admin/stores', label: 'Stores' },
  ]

  return (
    <>
      {/* Mobile Toggle Button */}
      <button 
        onClick={() => setIsOpen(true)}
        className="md:hidden absolute top-4 left-4 z-30 p-1 bg-transparent text-black"
        aria-label="Open admin menu"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
      </button>

      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed md:static inset-y-0 left-0 z-50
        flex w-64 flex-shrink-0 flex-col bg-[var(--color-ink-plum)]
        transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        {/* Logo + wordmark */}
        <div className="flex items-center gap-3 border-b border-white/10 px-5 py-5">
          <Image
            src="/logo.jpg"
            alt="FaMi"
            width={36}
            height={36}
            className="rounded-sm object-contain"
          />
          <div>
            <p className="font-display text-base font-medium text-white leading-none">FaMi</p>
            <p className="font-ui text-[10px] text-[var(--color-rose-gold-light)] uppercase tracking-widest mt-0.5">Admin</p>
          </div>
          {/* Close button inside sidebar on mobile */}
          <button 
            className="md:hidden ml-auto text-white/50 hover:text-white"
            onClick={() => setIsOpen(false)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>

        {/* Nav links */}
        <nav className="flex flex-col gap-0.5 px-3 py-4 flex-1" aria-label="Admin navigation">
          {navLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                pathname === href 
                  ? 'bg-white/10 text-white' 
                  : 'text-white/70 hover:bg-white/10 hover:text-white'
              }`}
            >
              {label}
            </Link>
          ))}
        </nav>

        {/* Bottom actions */}
        <div className="flex flex-col gap-2 border-t border-white/10 px-5 py-4">
          <Link
            href="/"
            className="font-ui text-xs text-white/50 hover:text-white/80 transition-micro"
          >
            ← Back to site
          </Link>
          <SignOutButton />
        </div>
      </aside>
    </>
  )
}
