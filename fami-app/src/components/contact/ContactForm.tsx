'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Check } from 'lucide-react'

export function ContactForm() {
  const [form, setForm] = useState({ name: '', email: '', message: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  function update(field: keyof typeof form, value: string) {
    setForm(f => ({ ...f, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json() as { success?: boolean; error?: string }
      if (!res.ok || !data.success) {
        setError(data.error ?? 'Something went wrong. Please try again.')
      } else {
        setSuccess(true)
      }
    } catch {
      setError('Network error. Please check your connection and try again.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="flex flex-col items-start gap-4 py-10">
        <div className="w-12 h-12 rounded-full bg-[var(--color-emerald-50)] flex items-center justify-center">
          <Check size={22} className="text-[var(--color-emerald)]" aria-hidden="true" />
        </div>
        <h2 className="font-display text-2xl font-medium text-[var(--color-ink-plum)]">Message sent</h2>
        <p className="font-ui text-base text-[var(--color-text-muted)] max-w-sm">
          Thank you for reaching out — we&apos;ll get back to you within 24 hours. In the meantime, you can also reach us on WhatsApp for faster help.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={e => void handleSubmit(e)} className="flex flex-col gap-5" noValidate>
      <div className="flex flex-col gap-1">
        <label htmlFor="contact-name" className="font-ui text-sm font-medium text-[var(--color-ink-plum)]">
          Full name <span aria-hidden>*</span>
        </label>
        <input
          id="contact-name"
          type="text"
          required
          autoComplete="name"
          value={form.name}
          onChange={e => update('name', e.target.value)}
          placeholder="Your full name"
          className="h-11 px-4 rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-white font-ui text-sm text-[var(--color-ink-plum)] placeholder-[var(--color-text-muted)] outline-none focus:border-[var(--color-rose-gold)] transition-micro"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="contact-email" className="font-ui text-sm font-medium text-[var(--color-ink-plum)]">
          Email address <span aria-hidden>*</span>
        </label>
        <input
          id="contact-email"
          type="email"
          required
          autoComplete="email"
          value={form.email}
          onChange={e => update('email', e.target.value)}
          placeholder="you@example.com"
          className="h-11 px-4 rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-white font-ui text-sm text-[var(--color-ink-plum)] placeholder-[var(--color-text-muted)] outline-none focus:border-[var(--color-rose-gold)] transition-micro"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="contact-message" className="font-ui text-sm font-medium text-[var(--color-ink-plum)]">
          Message <span aria-hidden>*</span>
        </label>
        <textarea
          id="contact-message"
          required
          rows={6}
          value={form.message}
          onChange={e => update('message', e.target.value)}
          placeholder="Tell us how we can help..."
          className="px-4 py-3 rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-white font-ui text-sm text-[var(--color-ink-plum)] placeholder-[var(--color-text-muted)] outline-none focus:border-[var(--color-rose-gold)] transition-micro resize-none"
        />
      </div>

      {error && (
        <p role="alert" aria-live="polite" className="font-ui text-sm text-[var(--color-terracotta)] bg-[var(--color-terracotta-50)] px-4 py-3 rounded-[var(--radius-sm)]">
          {error}
        </p>
      )}

      <Button type="submit" variant="primary" size="lg" loading={loading} className="w-full md:w-auto">
        Send message
      </Button>

      <p className="font-ui text-xs text-[var(--color-text-muted)]">
        We aim to respond within 24 hours on business days.
      </p>
    </form>
  )
}
