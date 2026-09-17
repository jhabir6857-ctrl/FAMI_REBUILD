'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/Button'

export function Footer() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [newsletterError, setNewsletterError] = useState<string | null>(null)
  const [newsletterLoading, setNewsletterLoading] = useState(false)

  async function handleSubscribe(e: React.FormEvent) {
    e.preventDefault()
    setNewsletterError(null)
    setNewsletterLoading(true)
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await res.json() as { success?: boolean; error?: string }
      if (!res.ok || !data.success) {
        setNewsletterError(data.error ?? 'Something went wrong. Please try again.')
      } else {
        setSubmitted(true)
      }
    } catch {
      setNewsletterError('Network error. Please try again.')
    } finally {
      setNewsletterLoading(false)
    }
  }

  return (
    <footer className="border-t border-[var(--color-border-muted)] bg-[var(--color-ink-plum)] text-white/80">
      <div className="container-fami grid grid-cols-1 gap-10 py-12 md:grid-cols-4">
        <div className="flex flex-col gap-3 md:col-span-1">
          <div className="flex items-center gap-3">
            {/* Logo medallion — white seal on dark plum */}
            <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-md">
              <Image
                src="/logo.jpg"
                alt="FaMi monogram"
                width={34}
                height={34}
                className="object-contain rounded-full"
              />
            </div>
            <span className="font-display text-2xl font-medium text-white tracking-wide">FaMi</span>
          </div>
          <p className="font-ui text-sm">Curated jewellery, bags, dresses and skincare.</p>
          <div className="mt-4 flex flex-col gap-2">
            <a href="mailto:farhanahmed20020@gmail.com" className="font-ui text-sm flex items-center gap-2 hover:text-[var(--color-rose-gold-light)] transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"></rect><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path></svg>
              farhanahmed20020@gmail.com
            </a>
            <a href="https://wa.me/8801611158514" target="_blank" rel="noopener noreferrer" className="font-ui text-sm flex items-center gap-2 hover:text-[var(--color-rose-gold-light)] transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21l1.65-3.8a9 9 0 1 1 3.4 2.9L3 21"></path><path d="M9 10a.5.5 0 0 0 1 0V9a.5.5 0 0 0-1 0v1a5 5 0 0 0 5 5h1a.5.5 0 0 0 0-1h-1a.5.5 0 0 0 0 1"></path></svg>
              WhatsApp: +880 1611-158514
            </a>
          </div>
          <div className="mt-6 flex gap-4">
            <a href="https://www.instagram.com/fami_2024_?stkn=MXQ3YncybW5qeTdrYg==" target="_blank" rel="noopener noreferrer" className="group flex h-10 w-10 items-center justify-center rounded-full bg-white/10 transition-all duration-300 hover:bg-[var(--color-rose-gold)] hover:scale-110" aria-label="Instagram">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white transition-colors">
                <rect width="20" height="20" x="2" y="2" rx="5" ry="5"></rect>
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"></line>
              </svg>
            </a>
            <a href="https://www.facebook.com/share/1Esn3Y7zuK/" target="_blank" rel="noopener noreferrer" className="group flex h-10 w-10 items-center justify-center rounded-full bg-white/10 transition-all duration-300 hover:bg-[#1877F2] hover:scale-110" aria-label="Facebook">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white transition-colors group-hover:fill-current">
                <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
              </svg>
            </a>
            <a href="https://wa.me/8801611158514" target="_blank" rel="noopener noreferrer" className="group flex h-10 w-10 items-center justify-center rounded-full bg-white/10 transition-all duration-300 hover:bg-[#25D366] hover:scale-110" aria-label="WhatsApp">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white transition-colors">
                <path d="M3 21l1.65-3.8a9 9 0 1 1 3.4 2.9L3 21"></path>
                <path d="M9 10a.5.5 0 0 0 1 0V9a.5.5 0 0 0-1 0v1a5 5 0 0 0 5 5h1a.5.5 0 0 0 0-1h-1a.5.5 0 0 0 0 1"></path>
              </svg>
            </a>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <p className="font-ui text-xs uppercase tracking-wide text-white/50">Shop &amp; Explore</p>
          <Link href="/shop" className="font-ui text-sm">All products</Link>
          <Link href="/wishlist" className="font-ui text-sm">Wishlist</Link>
          <Link href="/blog" className="font-ui text-sm">Journal</Link>
          <Link href="/about" className="font-ui text-sm">About FaMi</Link>
          <Link href="/contact" className="font-ui text-sm">Contact us</Link>
        </div>

        <div className="flex flex-col gap-2">
          <p className="font-ui text-xs uppercase tracking-wide text-white/50">Need Help?</p>
          <Link href="/loyalty" className="font-ui text-sm flex items-center gap-2 hover:text-[var(--color-rose-gold-light)] transition-colors">Loyalty &amp; Rewards</Link>
          <Link href="/contact" className="font-ui text-sm flex items-center gap-2 hover:text-[var(--color-rose-gold-light)] transition-colors">Customer Support</Link>
          <p className="font-ui text-sm text-white/60 mt-2">
            FaMi is an exclusive online boutique. We deliver directly to you across Bangladesh.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <p className="font-ui text-xs uppercase tracking-wide text-white/50">Stay in the loop</p>
          {submitted ? (
            <p className="font-ui text-sm text-[var(--color-rose-gold-light)]">Thanks — you&apos;re on the list.</p>
          ) : (
            <form onSubmit={e => void handleSubscribe(e)} className="flex flex-col gap-2">
              <label htmlFor="newsletter-email" className="sr-only">Email address</label>
              <input
                id="newsletter-email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="h-10 rounded-[var(--radius-sm)] border border-white/20 bg-transparent px-3 font-ui text-sm text-white outline-none placeholder:text-white/40 focus:border-[var(--color-rose-gold)]"
              />
              {newsletterError && (
                <p className="font-ui text-xs text-red-300">{newsletterError}</p>
              )}
              <Button
                type="submit"
                variant="outline"
                size="sm"
                loading={newsletterLoading}
                className="!border-white/30 !text-white hover:!bg-white/10"
              >
                Subscribe
              </Button>
            </form>
          )}
        </div>
      </div>
      <div className="border-t border-white/10 py-5">
        <div className="container-fami flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
          <p className="font-ui text-xs text-white/50">© {new Date().getFullYear()} FaMi. All rights reserved.</p>
          <div className="flex gap-4">
            <Link href="/loyalty" className="font-ui text-xs text-white/40 hover:text-white/70 transition-micro">Loyalty &amp; Rewards</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
