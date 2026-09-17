'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/Button'

export default function RegisterPage() {
  const router = useRouter()
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json() as { error?: string }
      if (!res.ok) { setError(data.error ?? 'Registration failed.'); return }
      void router.push('/login?registered=true')
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const inputClass =
    'h-12 w-full px-4 rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-white font-ui text-sm text-[var(--color-ink-plum)] placeholder-[var(--color-text-muted)] outline-none focus:border-[var(--color-rose-gold)] transition-micro'

  return (
    <main className="min-h-screen flex flex-col md:flex-row">
      {/* ── Left panel — dark plum with logo ── */}
      <div className="relative flex flex-col items-center justify-center gap-6 bg-[var(--color-ink-plum)] px-8 py-14 md:w-1/2 md:py-0">
        <div
          className="pointer-events-none absolute inset-0 opacity-20"
          style={{ background: 'radial-gradient(ellipse at 50% 40%, #b76e79 0%, transparent 70%)' }}
          aria-hidden="true"
        />
        <div className="relative z-10 flex flex-col items-center gap-5 text-center">
          {/* Logo medallion — white seal on dark plum */}
          <div className="w-24 h-24 rounded-full bg-white/95 flex items-center justify-center shadow-2xl ring-1 ring-white/20 animate-scale-in">
            <Image
              src="/logo.jpg"
              alt="FaMi monogram"
              width={72}
              height={72}
              className="object-contain rounded-full"
              priority
            />
          </div>
          <div className="animate-fade-in-up delay-150">
            <p className="font-display text-3xl font-medium text-white tracking-wide">FaMi</p>
            <p className="font-ui text-sm text-[var(--color-rose-gold-light)] tracking-widest uppercase mt-1">
              Join the community
            </p>
          </div>
        </div>
      </div>

      {/* ── Right panel — form ── */}
      <div className="flex flex-1 items-center justify-center bg-[var(--color-parchment)] px-6 py-14 md:py-0">
        <div className="w-full max-w-sm">
          <h1 className="font-display text-3xl font-medium text-[var(--color-ink-plum)] mb-2 animate-fade-in-up delay-150">
            Create account
          </h1>
          <p className="font-ui text-sm text-[var(--color-text-muted)] mb-8 animate-fade-in-up delay-250">
            Start your FaMi journey today
          </p>

          <form onSubmit={e => void handleSubmit(e)} className="flex flex-col gap-4 animate-fade-in-up delay-350" noValidate>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="name" className="font-ui text-sm font-medium text-[var(--color-ink-plum)]">
                Full name
              </label>
              <input
                id="name"
                type="text"
                required
                autoComplete="name"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="Your full name"
                className={inputClass}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="email" className="font-ui text-sm font-medium text-[var(--color-ink-plum)]">
                Email address
              </label>
              <input
                id="email"
                type="email"
                required
                autoComplete="email"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                placeholder="you@example.com"
                className={inputClass}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="password" className="font-ui text-sm font-medium text-[var(--color-ink-plum)]">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="new-password"
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  placeholder="At least 8 characters"
                  className={`${inputClass} pr-11`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(s => !s)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] hover:text-[var(--color-ink-plum)] transition-micro"
                >
                  {showPassword ? <EyeOff size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}
                </button>
              </div>
            </div>

            {error && (
              <p role="alert" aria-live="polite" className="font-ui text-sm text-[var(--color-terracotta)] bg-[var(--color-terracotta-50)] px-4 py-3 rounded-[var(--radius-sm)] animate-fade-in">
                {error}
              </p>
            )}

            <Button type="submit" variant="primary" size="lg" loading={loading} className="w-full mt-2">
              Create account
            </Button>
          </form>

          <div className="my-6 flex items-center gap-3 animate-fade-in-up delay-450">
            <div className="h-px flex-1 bg-[var(--color-border-muted)]" />
            <span className="font-ui text-xs text-[var(--color-text-muted)] uppercase tracking-wider">or</span>
            <div className="h-px flex-1 bg-[var(--color-border-muted)]" />
          </div>

          <Button 
            type="button" 
            variant="outline" 
            size="lg" 
            className="w-full mb-6 animate-fade-in-up delay-450 bg-white"
            onClick={() => {
              const { signIn } = require('next-auth/react')
              void signIn('google', { callbackUrl: '/account' })
            }}
          >
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </Button>

          <p className="font-ui text-sm text-center text-[var(--color-text-muted)] animate-fade-in-up delay-550">
            Already have an account?{' '}
            <Link href="/login" className="text-[var(--color-rose-gold)] font-medium hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </main>
  )
}
