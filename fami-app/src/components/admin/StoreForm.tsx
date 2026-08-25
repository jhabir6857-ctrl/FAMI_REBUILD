'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Store } from '@/types'

interface Props {
  store?: Store  // if present = edit mode
}

export function StoreForm({ store }: Props) {
  const router = useRouter()
  const isEdit = !!store

  const [name, setName] = useState(store?.name ?? '')
  const [address, setAddress] = useState(store?.address ?? '')
  const [hours, setHours] = useState(store?.hours ?? '')
  const [phone, setPhone] = useState(store?.phone ?? '')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    try {
      const body = {
        name: name.trim(),
        address: address.trim(),
        hours: hours.trim(),
        phone: phone.trim() || null,
      }
      const url = isEdit ? `/api/admin/stores/${store!.id}` : '/api/admin/stores'
      const method = isEdit ? 'PATCH' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json() as { error?: string }
      if (!res.ok) {
        setError(data.error ?? 'Failed to save store.')
        return
      }
      router.push('/admin/stores')
      router.refresh()
    } catch {
      setError('Network error.')
    } finally {
      setSaving(false)
    }
  }

  const labelClass = 'text-sm font-medium text-[#1a1a1a]'
  const inputClass = 'border border-[#d0d0d0] rounded px-3 py-2 text-sm outline-none focus:border-[#1a1a1a] w-full'

  return (
    <form onSubmit={e => void handleSubmit(e)} className="flex flex-col gap-5 max-w-xl">
      <div className="flex flex-col gap-1.5">
        <label className={labelClass}>Store name *</label>
        <input required value={name} onChange={e => setName(e.target.value)} className={inputClass} placeholder="FaMi Dhanmondi" />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className={labelClass}>Address *</label>
        <textarea required value={address} onChange={e => setAddress(e.target.value)} rows={2} className={inputClass} placeholder="House 12, Road 4, Dhanmondi, Dhaka 1205" />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className={labelClass}>Opening hours</label>
        <input value={hours} onChange={e => setHours(e.target.value)} className={inputClass} placeholder="Sat–Thu 10am–9pm · Fri 2pm–9pm" />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className={labelClass}>Phone</label>
        <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} className={inputClass} placeholder="01700000000" />
      </div>

      {error && <p role="alert" className="text-sm text-[#a02020]">{error}</p>}

      <div className="flex gap-3 pt-2">
        <button type="submit" disabled={saving} className="rounded bg-[#1a1a1a] px-6 py-2 text-sm font-medium text-white hover:bg-[#333] disabled:opacity-50">
          {saving ? 'Saving…' : isEdit ? 'Save changes' : 'Add store'}
        </button>
        <button type="button" onClick={() => router.back()} className="rounded border border-[#e0e0e0] px-6 py-2 text-sm hover:border-[#b0b0b0]">
          Cancel
        </button>
      </div>
    </form>
  )
}
