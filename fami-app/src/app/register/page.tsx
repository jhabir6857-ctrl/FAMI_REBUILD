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
