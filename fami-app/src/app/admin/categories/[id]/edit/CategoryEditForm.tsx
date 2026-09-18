'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import type { Category } from '@/types'

export function CategoryEditForm({ category }: { category: Category }) {
  const router = useRouter()
  const [imageUrl, setImageUrl] = useState(category.imageUrl || '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const res = await fetch(`/api/admin/categories/${category.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrl }),
      })
      if (!res.ok) throw new Error('Failed to update category')
      router.push('/admin/categories')
      router.refresh()
    } catch (err: any) {
      setError(err.message)
      setLoading(false)
    }
  }

  return (
    <form onSubmit={e => void handleSubmit(e)} className="flex flex-col gap-5">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="imageUrl" className="text-sm font-medium text-[#1a1a1a]">Image URL (Unsplash or Cloudinary)</label>
        <input
          id="imageUrl"
          type="url"
          value={imageUrl}
          onChange={e => setImageUrl(e.target.value)}
          placeholder="https://images.unsplash.com/photo-..."
          className="rounded border border-[#e0e0e0] px-3 py-2 text-sm outline-none focus:border-[#1a1a1a]"
        />
        <p className="text-xs text-[#8a8a8a]">This image is used for the "Shop by category" section on the homepage.</p>
      </div>

      {imageUrl && (
        <div className="mt-2">
          <p className="text-sm font-medium mb-2">Image Preview:</p>
          <div className="relative h-32 w-32 overflow-hidden rounded-full border border-[#e0e0e0]">
            <Image src={imageUrl} alt="Preview" fill className="object-cover" />
          </div>
        </div>
      )}

      {error && <p className="text-sm text-[#a02020]">{error}</p>}

      <div className="mt-4 flex gap-3">
        <button type="button" onClick={() => router.back()} className="rounded px-4 py-2 text-sm font-medium hover:bg-[#f5f5f5]">
          Cancel
        </button>
        <button type="submit" disabled={loading} className="rounded bg-[#1a1a1a] px-4 py-2 text-sm font-medium text-white hover:bg-[#333] disabled:opacity-50">
          {loading ? 'Saving...' : 'Save Image'}
        </button>
      </div>
    </form>
  )
}
