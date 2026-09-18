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
    <footer className="bg-[var(--color-ink-plum)] text-[var(--color-parchment-100)] pt-24 pb-8 overflow-hidden">
      <div className="container-fami flex flex-col items-center text-center">
        {/* Massive Typography Newsletter Hook */}
        <h2 className="font-display text-[clamp(2.5rem,8vw,6rem)] leading-[0.9] tracking-tight mb-8">
          Join the <em className="text-[var(--color-rose-gold)] italic font-light">Inner Circle.</em>
        </h2>
        <p className="font-ui text-lg text-[var(--color-parchment)]/60 max-w-md mx-auto mb-12">
          Exclusive access to limited releases, private events, and our editorial journal.
        </p>

        {/* Minimalist Newsletter Form */}
        <div className="w-full max-w-md mx-auto mb-24">
          {submitted ? (
            <p className="font-ui text-lg text-[var(--color-rose-gold-light)] animate-fade-in-up">Welcome to the standard.</p>
          ) : (
            <form onSubmit={e => void handleSubscribe(e)} className="flex flex-col gap-4 animate-fade-in-up delay-150">
              <label htmlFor="newsletter-email" className="sr-only">Email address</label>
              <div className="relative group">
                <input
                  id="newsletter-email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="Your email address"
                  className="w-full h-14 bg-transparent border-b border-[var(--color-parchment)]/20 px-0 font-ui text-xl text-white outline-none placeholder:text-white/30 focus:border-[var(--color-rose-gold)] transition-colors rounded-none"
                />
                <button
                  type="submit"
                  disabled={newsletterLoading}
                  className="absolute right-0 bottom-0 h-14 font-ui text-sm font-medium tracking-wide text-[var(--color-rose-gold)] hover:text-white transition-colors"
                >
                  {newsletterLoading ? 'Wait...' : 'Subscribe'}
                </button>
              </div>
              {newsletterError && (
                <p className="font-ui text-xs text-red-300 text-left">{newsletterError}</p>
              )}
            </form>
          )}
        </div>

        {/* Essential Links & Socials */}
        <div className="w-full border-t border-[var(--color-parchment)]/20 pt-8 flex flex-col md:flex-row md:justify-between items-center gap-8">
          <div className="flex items-center gap-6">
            <span className="font-display text-2xl font-medium tracking-wide">FaMi</span>
            <div className="w-px h-6 bg-[var(--color-parchment)]/20 hidden md:block"></div>
            <div className="flex gap-4 font-ui text-sm text-[var(--color-parchment)]/60">
              <Link href="/shop" className="hover:text-[var(--color-rose-gold)] transition-colors">Shop</Link>
              <Link href="/about" className="hover:text-[var(--color-rose-gold)] transition-colors">Standard</Link>
              <Link href="/contact" className="hover:text-[var(--color-rose-gold)] transition-colors">Contact</Link>
            </div>
          </div>

          <div className="flex gap-4">
            <a href="https://www.instagram.com/fami_2024_?stkn=MXQ3YncybW5qeTdrYg==" target="_blank" rel="noopener noreferrer" className="text-[var(--color-parchment)]/60 hover:text-[var(--color-rose-gold)] transition-colors" aria-label="Instagram">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"></line></svg>
            </a>
            <a href="https://www.facebook.com/share/1Esn3Y7zuK/" target="_blank" rel="noopener noreferrer" className="text-[var(--color-parchment)]/60 hover:text-[#1877F2] transition-colors" aria-label="Facebook">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
            </a>
            <a href="https://wa.me/8801611158514" target="_blank" rel="noopener noreferrer" className="text-[var(--color-parchment)]/60 hover:text-[#25D366] transition-colors" aria-label="WhatsApp">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21l1.65-3.8a9 9 0 1 1 3.4 2.9L3 21"></path><path d="M9 10a.5.5 0 0 0 1 0V9a.5.5 0 0 0-1 0v1a5 5 0 0 0 5 5h1a.5.5 0 0 0 0-1h-1a.5.5 0 0 0 0 1"></path></svg>
            </a>
          </div>
        </div>

        <div className="w-full text-left mt-8 font-ui text-[10px] uppercase tracking-widest text-[var(--color-parchment)]/30">
          © {new Date().getFullYear()} FaMi • Dhaka, Bangladesh
        </div>
      </div>
    </footer>
  )
}
