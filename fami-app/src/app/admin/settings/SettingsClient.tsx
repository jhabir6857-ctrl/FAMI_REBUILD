'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { useToast } from '@/context/ToastContext'

type StoreSettings = {
  deliveryChargeInside: number
  deliveryChargeOutside: number
  freeShippingThreshold: number
}

export function SettingsClient({ initialSettings }: { initialSettings: StoreSettings }) {
  const router = useRouter()
  const { showToast } = useToast()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState(initialSettings)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })

      if (!res.ok) throw new Error('Failed to update settings')
      
      showToast('Settings saved successfully', 'success')
      router.refresh()
    } catch (err: any) {
      showToast(err.message, 'error')
    } finally {
      setLoading(false)
    }
  }

  function update(field: keyof StoreSettings, value: string) {
    setForm(prev => ({ ...prev, [field]: parseInt(value) || 0 }))
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-[var(--radius-lg)] border border-[var(--color-border)] p-6 max-w-xl">
      <h2 className="font-ui text-lg font-medium text-[var(--color-ink-plum)] mb-4">Delivery & Shipping</h2>
      
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="font-ui text-sm font-medium text-[var(--color-ink-plum)]">Delivery Charge (Inside Dhaka)</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] font-ui">?</span>
            <input
              type="number"
              min="0"
              value={form.deliveryChargeInside}
              onChange={e => update('deliveryChargeInside', e.target.value)}
              className="h-11 w-full rounded-[var(--radius-sm)] border border-[var(--color-border)] pl-8 pr-4 font-ui text-sm text-[var(--color-ink-plum)] outline-none focus:border-[var(--color-rose-gold)] transition-micro"
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="font-ui text-sm font-medium text-[var(--color-ink-plum)]">Delivery Charge (Outside Dhaka)</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] font-ui">?</span>
            <input
              type="number"
              min="0"
              value={form.deliveryChargeOutside}
              onChange={e => update('deliveryChargeOutside', e.target.value)}
              className="h-11 w-full rounded-[var(--radius-sm)] border border-[var(--color-border)] pl-8 pr-4 font-ui text-sm text-[var(--color-ink-plum)] outline-none focus:border-[var(--color-rose-gold)] transition-micro"
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="font-ui text-sm font-medium text-[var(--color-ink-plum)]">Free Shipping Threshold</label>
          <p className="font-ui text-xs text-[var(--color-text-muted)] mb-1">Orders above this amount will get free shipping.</p>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] font-ui">?</span>
            <input
              type="number"
              min="0"
              value={form.freeShippingThreshold}
              onChange={e => update('freeShippingThreshold', e.target.value)}
              className="h-11 w-full rounded-[var(--radius-sm)] border border-[var(--color-border)] pl-8 pr-4 font-ui text-sm text-[var(--color-ink-plum)] outline-none focus:border-[var(--color-rose-gold)] transition-micro"
            />
          </div>
        </div>
      </div>

      <div className="mt-8">
        <Button type="submit" loading={loading} variant="primary">
          Save Settings
        </Button>
      </div>
    </form>
  )
}
