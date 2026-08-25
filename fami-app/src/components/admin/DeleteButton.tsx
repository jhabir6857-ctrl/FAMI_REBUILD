'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Props {
  apiPath: string      // e.g. '/api/admin/products/5'
  label?: string
  redirectTo?: string  // where to go after delete
}

export function DeleteButton({ apiPath, label = 'Delete', redirectTo }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleDelete() {
    if (!window.confirm('Are you sure? This cannot be undone.')) return
    setLoading(true)
    try {
      const res = await fetch(apiPath, { method: 'DELETE' })
      if (!res.ok) {
        const data = await res.json() as { error?: string }
        alert(data.error ?? 'Delete failed.')
        return
      }
      if (redirectTo) router.push(redirectTo)
      else router.refresh()
    } catch {
      alert('Network error.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={() => void handleDelete()}
      disabled={loading}
      className="rounded border border-[#e0e0e0] px-3 py-1.5 text-sm text-[#a02020] hover:border-[#a02020] hover:bg-[#fff5f5] disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
    >
      {loading ? 'Deleting…' : label}
    </button>
  )
}
