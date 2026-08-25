'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useCart } from '@/context/CartContext'
import { Button } from '@/components/ui/Button'
import { formatBDT } from '@/lib/currency'
import type { PaymentMethod } from '@/types'

const PAYMENT_OPTIONS: { value: PaymentMethod; label: string; hint: string }[] = [
  { value: 'cod', label: 'Cash on delivery', hint: 'Pay in cash when your order arrives.' },
  { value: 'bkash', label: 'bKash', hint: 'We will send you a bKash payment request after confirming.' },
  { value: 'nagad', label: 'Nagad', hint: 'We will send you a Nagad payment request after confirming.' },
  { value: 'whatsapp', label: 'WhatsApp confirmation', hint: 'Place the order here, then confirm payment via WhatsApp.' },
]

export function CheckoutClient() {
  const { items, totalPrice, clearCart } = useCart()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cod')
  const [form, setForm] = useState({
    name: '', email: '', phone: '', address: '', city: '', notes: '',
  })

  const shipping = totalPrice >= 5000 ? 0 : 120
  const total = totalPrice + shipping

  // Pre-fill from session if logged in
  useEffect(() => {
    void fetch('/api/auth/session')
      .then(r => r.json())
      .then((session: { user?: { name?: string; email?: string; phone?: string; address?: string } } | null) => {
        if (session?.user) {
          setForm(f => ({
            ...f,
            name: f.name || session.user?.name || '',
            email: f.email || session.user?.email || '',
            phone: f.phone || session.user?.phone || '',
            address: f.address || session.user?.address || '',
          }))
        }
      })
      .catch(() => {/* silent */})
  }, [])

  function update(field: keyof typeof form, value: string) {
    setForm(f => ({ ...f, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const payload = {
      ...form,
      paymentMethod,
      items: items.map(i => ({ productId: i.productId, quantity: i.quantity })),
    }

    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json() as { success?: boolean; orderId?: number; error?: string }
      if (!res.ok || !data.success) {
        setError(data.error ?? 'Something went wrong. Please try again.')
        return
      }
      clearCart()
      void router.push(`/checkout/success?orderId=${data.orderId ?? ''}`)
    } catch {
      setError('Network error. Please check your connection and try again.')
    } finally {
      setLoading(false)
    }
  }

  if (items.length === 0) {
    return (
      <main className="container-fami py-20 text-center">
        <h1 className="font-display text-3xl font-medium text-[var(--color-ink-plum)] mb-4">Your cart is empty</h1>
        <Link href="/shop" className="font-ui text-sm text-[var(--color-rose-gold)] hover:underline">Continue shopping →</Link>
      </main>
    )
  }

  return (
    <main className="container-fami py-8 md:py-12 pb-24 md:pb-12">
      <h1 className="font-display text-3xl md:text-4xl font-medium text-[var(--color-ink-plum)] mb-8">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form */}
        <form onSubmit={e => void handleSubmit(e)} className="lg:col-span-2 flex flex-col gap-6" noValidate>

          {/* Contact */}
          <fieldset className="flex flex-col gap-4">
            <legend className="font-display text-xl font-medium text-[var(--color-ink-plum)] mb-2">Contact information</legend>

            <div className="flex flex-col gap-1">
              <label htmlFor="name" className="font-ui text-sm font-medium text-[var(--color-ink-plum)]">Full name <span aria-hidden>*</span></label>
              <input
                id="name" type="text" required
                value={form.name} onChange={e => update('name', e.target.value)}
                autoComplete="name"
                placeholder="Your full name"
                className="h-11 px-4 rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-white font-ui text-sm text-[var(--color-ink-plum)] placeholder-[var(--color-text-muted)] outline-none focus:border-[var(--color-rose-gold)] transition-micro"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label htmlFor="email" className="font-ui text-sm font-medium text-[var(--color-ink-plum)]">Email address <span aria-hidden>*</span></label>
                <input
                  id="email" type="email" required
                  value={form.email} onChange={e => update('email', e.target.value)}
                  autoComplete="email"
                  placeholder="you@example.com"
                  className="h-11 px-4 rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-white font-ui text-sm text-[var(--color-ink-plum)] placeholder-[var(--color-text-muted)] outline-none focus:border-[var(--color-rose-gold)] transition-micro"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label htmlFor="phone" className="font-ui text-sm font-medium text-[var(--color-ink-plum)]">Phone number <span aria-hidden>*</span></label>
                <input
                  id="phone" type="tel" required
                  value={form.phone} onChange={e => update('phone', e.target.value)}
                  autoComplete="tel"
                  placeholder="01XXXXXXXXX"
                  className="h-11 px-4 rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-white font-ui text-sm text-[var(--color-ink-plum)] placeholder-[var(--color-text-muted)] outline-none focus:border-[var(--color-rose-gold)] transition-micro"
                />
              </div>
            </div>
          </fieldset>

          {/* Shipping */}
          <fieldset className="flex flex-col gap-4">
            <legend className="font-display text-xl font-medium text-[var(--color-ink-plum)] mb-2">Delivery address</legend>

            <div className="flex flex-col gap-1">
              <label htmlFor="address" className="font-ui text-sm font-medium text-[var(--color-ink-plum)]">Street address <span aria-hidden>*</span></label>
              <input
                id="address" type="text" required
                value={form.address} onChange={e => update('address', e.target.value)}
                autoComplete="street-address"
                placeholder="House, road, area"
                className="h-11 px-4 rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-white font-ui text-sm text-[var(--color-ink-plum)] placeholder-[var(--color-text-muted)] outline-none focus:border-[var(--color-rose-gold)] transition-micro"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label htmlFor="city" className="font-ui text-sm font-medium text-[var(--color-ink-plum)]">City <span aria-hidden>*</span></label>
              <input
                id="city" type="text" required
                value={form.city} onChange={e => update('city', e.target.value)}
                autoComplete="address-level2"
                placeholder="Dhaka"
                className="h-11 px-4 rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-white font-ui text-sm text-[var(--color-ink-plum)] placeholder-[var(--color-text-muted)] outline-none focus:border-[var(--color-rose-gold)] transition-micro"
              />
            </div>
          </fieldset>

          {/* Payment */}
          <fieldset className="flex flex-col gap-3">
            <legend className="font-display text-xl font-medium text-[var(--color-ink-plum)] mb-2">Payment method</legend>
            {PAYMENT_OPTIONS.map(opt => (
              <label
                key={opt.value}
                htmlFor={`pm-${opt.value}`}
                className={[
                  'flex items-start gap-3 p-4 rounded-[var(--radius-md)] border cursor-pointer transition-micro',
                  paymentMethod === opt.value
                    ? 'border-[var(--color-rose-gold)] bg-[var(--color-rose-gold-50)]'
                    : 'border-[var(--color-border)] hover:border-[var(--color-ink-plum-200)]',
                ].join(' ')}
              >
                <input
                  id={`pm-${opt.value}`}
                  type="radio"
                  name="paymentMethod"
                  value={opt.value}
                  checked={paymentMethod === opt.value}
                  onChange={() => setPaymentMethod(opt.value)}
                  className="mt-0.5 accent-[var(--color-rose-gold)]"
                />
                <div>
                  <p className="font-ui text-sm font-medium text-[var(--color-ink-plum)]">{opt.label}</p>
                  <p className="font-ui text-xs text-[var(--color-text-muted)] mt-0.5">{opt.hint}</p>
                </div>
              </label>
            ))}
          </fieldset>

          {/* Notes */}
          <div className="flex flex-col gap-1">
            <label htmlFor="notes" className="font-ui text-sm font-medium text-[var(--color-ink-plum)]">Order notes (optional)</label>
            <textarea
              id="notes"
              value={form.notes} onChange={e => update('notes', e.target.value)}
              rows={3}
              placeholder="Special instructions, gift message, etc."
              className="px-4 py-3 rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-white font-ui text-sm text-[var(--color-ink-plum)] placeholder-[var(--color-text-muted)] outline-none focus:border-[var(--color-rose-gold)] transition-micro resize-none"
            />
          </div>

          {error && (
            <p role="alert" className="font-ui text-sm text-[var(--color-terracotta)] bg-[var(--color-terracotta-50)] px-4 py-3 rounded-[var(--radius-sm)]">
              {error}
            </p>
          )}

          <Button type="submit" variant="primary" size="lg" loading={loading} className="w-full">
            Place order — {formatBDT(total)}
          </Button>
          <p className="font-ui text-xs text-center text-[var(--color-text-muted)]">
            By placing your order you agree to our terms. Guest orders are stored securely.
          </p>
        </form>

        {/* Order summary — collapsible on mobile, sticky on desktop */}
        <div className="lg:sticky lg:top-24 h-fit">
          <details className="lg:open" open>
            <summary className="lg:hidden flex items-center justify-between cursor-pointer py-3 border-b border-[var(--color-border-muted)] mb-4">
              <span className="font-ui text-sm font-medium text-[var(--color-ink-plum)]">Order summary</span>
              <span className="font-ui text-sm font-medium text-[var(--color-ink-plum)]">{formatBDT(total)} ▾</span>
            </summary>
            <div className="border border-[var(--color-border-muted)] rounded-[var(--radius-md)] p-5 flex flex-col gap-3">
              <h2 className="font-display text-lg font-medium text-[var(--color-ink-plum)] hidden lg:block">Order summary</h2>
              {items.map(item => (
                <div key={item.productId} className="flex justify-between gap-2 text-sm font-ui">
                  <span className="text-[var(--color-ink-plum)] line-clamp-1">{item.name} × {item.quantity}</span>
                  <span className="text-[var(--color-ink-plum)] flex-shrink-0">{formatBDT(item.price * item.quantity)}</span>
                </div>
              ))}
              <div className="h-px bg-[var(--color-border-muted)]" />
              <div className="flex justify-between text-sm font-ui">
                <span className="text-[var(--color-text-muted)]">Shipping</span>
                <span className="text-[var(--color-ink-plum)]">{shipping === 0 ? 'Free' : formatBDT(shipping)}</span>
              </div>
              <div className="flex justify-between font-medium font-ui">
                <span className="text-[var(--color-ink-plum)]">Total</span>
                <span className="text-[var(--color-ink-plum)]">{formatBDT(total)}</span>
              </div>
            </div>
          </details>
        </div>
      </div>
    </main>
  )
}
