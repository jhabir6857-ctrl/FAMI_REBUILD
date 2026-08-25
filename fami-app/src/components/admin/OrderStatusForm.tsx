'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { OrderStatus } from '@/types'

const STATUSES: OrderStatus[] = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled']

export function OrderStatusForm({ orderId, currentStatus }: { orderId: number; currentStatus: OrderStatus }) {
  const router = useRouter()
  const [status, setStatus] = useState<OrderStatus>(currentStatus)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (status === currentStatus) return
    setSaving(true)
    setError(null)
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      const data = await res.json() as { error?: string }
      if (!res.ok) {
        setError(data.error ?? 'Could not update status.')
        return
      }
      router.refresh()
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={e => void handleSubmit(e)} className="flex items-center gap-2">
      <label htmlFor="order-status" className="text-sm text-[#4a4a4a]">Status</label>
      <select
        id="order-status"
        value={status}
        onChange={e => setStatus(e.target.value as OrderStatus)}
        className="rounded border border-[#d0d0d0] bg-white px-3 py-1.5 text-sm capitalize outline-none focus:border-[#1a1a1a]"
      >
        {STATUSES.map(s => (
          <option key={s} value={s}>{s}</option>
        ))}
      </select>
      <button
        type="submit"
        disabled={saving || status === currentStatus}
        className="rounded bg-[#1a1a1a] px-4 py-1.5 text-sm font-medium text-white transition-colors hover:bg-[#333] disabled:cursor-not-allowed disabled:bg-[#d0d0d0]"
      >
        {saving ? 'Saving…' : 'Update'}
      </button>
      {error && <span role="alert" className="text-sm text-[#a02020]">{error}</span>}
    </form>
  )
}
