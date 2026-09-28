'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export function DeleteCategoryButton({ id }: { id: number }) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleDelete() {
    if (!window.confirm('Are you sure you want to delete this category?')) return

    setLoading(true)
    try {
      const res = await fetch(`/api/admin/categories/${id}`, {
        method: 'DELETE',
      })
      
      const data = await res.json()
      
      if (!res.ok) {
        alert(data.error || 'Failed to delete category')
        return
      }

      router.refresh()
    } catch (error) {
      console.error(error)
      alert('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={() => void handleDelete()}
      disabled={loading}
      className="rounded bg-[#ffeeee] px-3 py-1.5 text-xs font-medium text-[#cc0000] hover:bg-[#ffdddd] disabled:opacity-50 transition-colors ml-2"
    >
      {loading ? 'Deleting...' : 'Delete'}
    </button>
  )
}
