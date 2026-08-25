'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/Button'
import type { Store } from '@/types'

export function Footer({ stores }: { stores: Store[] }) {
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
          <div className="mt-2 flex gap-4">
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="font-ui text-sm underline underline-offset-2">Instagram</a>
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="font-ui text-sm underline underline-offset-2">Facebook</a>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <p className="font-ui text-xs uppercase tracking-wide text-white/50">Shop &amp; Explore</p>
          <Link href="/shop" className="font-ui text-sm">All products</Link>
          <Link href="/wishlist" className="font-ui text-sm">Wishlist</Link>
          <Link href="/blog" className="font-ui text-sm">Journal</Link>
          <Link href="/about" className="font-ui text-sm">About FaMi</Link>
          <Link href="/contact" className="font-ui text-sm">Contact us</Link>
          <Link href="/store-locator" className="font-ui text-sm">Store locator</Link>
        </div>

        <div className="flex flex-col gap-2">
          <p className="font-ui text-xs uppercase tracking-wide text-white/50">Visit us</p>
          {stores.length === 0 && <p className="font-ui text-sm text-white/60">Store locations coming soon</p>}
          {stores.map(store => (
            <div key={store.id} className="font-ui text-sm flex flex-col gap-0.5">
              <p className="text-white font-medium">{store.name}</p>
              <p className="text-white/60">{store.address}</p>
              <p className="text-white/60">{store.hours}</p>
              {store.phone && (
                <a href={`tel:${store.phone}`} className="text-[var(--color-rose-gold-light)] hover:underline">{store.phone}</a>
              )}
            </div>
          ))}
          <Link href="/store-locator" className="font-ui text-xs text-white/50 underline underline-offset-2 mt-1">View all locations →</Link>
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
