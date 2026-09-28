'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function NewCategoryPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [form, setForm] = useState({
    name: '',
    slug: '',
    description: '',
    imageUrl: '',
    sortOrder: '0',
  })

  // Auto-generate slug from name
  function handleNameChange(e: React.ChangeEvent<HTMLInputElement>) {
    const name = e.target.value
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')
    setForm(f => ({ ...f, name, slug }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const res = await fetch('/api/admin/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          slug: form.slug,
          description: form.description || undefined,
          imageUrl: form.imageUrl || undefined,
          sortOrder: parseInt(form.sortOrder, 10),
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Failed to create category')
        return
      }

      router.push('/admin/categories')
      router.refresh()
    } catch (err) {
      console.error(err)
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex max-w-2xl flex-col gap-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/categories" className="text-[#8a8a8a] hover:text-[#1a1a1a]">
          ← Back
        </Link>
        <h1 className="text-2xl font-medium">Create Category</h1>
      </div>

      {error && (
        <div className="rounded bg-[#ffeeee] p-4 text-sm text-[#cc0000]">
          {error}
        </div>
      )}

      <form onSubmit={e => void handleSubmit(e)} className="flex flex-col gap-6 rounded border border-[#e0e0e0] bg-white p-6">
        <div className="flex flex-col gap-2">
          <label htmlFor="name" className="text-sm font-medium">Name</label>
          <input
            id="name"
            type="text"
            required
            value={form.name}
            onChange={handleNameChange}
            className="rounded border border-[#e0e0e0] px-3 py-2 text-sm outline-none focus:border-[#1a1a1a]"
            placeholder="e.g. Rings"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="slug" className="text-sm font-medium">Slug (URL)</label>
          <input
            id="slug"
            type="text"
            required
            pattern="^[a-z0-9-]+$"
            value={form.slug}
            onChange={e => setForm(f => ({ ...f, slug: e.target.value }))}
            className="rounded border border-[#e0e0e0] px-3 py-2 text-sm outline-none focus:border-[#1a1a1a]"
            placeholder="e.g. rings"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="description" className="text-sm font-medium">Description (Optional)</label>
          <textarea
            id="description"
            rows={3}
            value={form.description}
            onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            className="rounded border border-[#e0e0e0] px-3 py-2 text-sm outline-none focus:border-[#1a1a1a]"
            placeholder="Brief description of the category"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="imageUrl" className="text-sm font-medium">Image URL (Optional)</label>
          <input
            id="imageUrl"
            type="url"
            value={form.imageUrl}
            onChange={e => setForm(f => ({ ...f, imageUrl: e.target.value }))}
            className="rounded border border-[#e0e0e0] px-3 py-2 text-sm outline-none focus:border-[#1a1a1a]"
            placeholder="https://..."
          />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="sortOrder" className="text-sm font-medium">Sort Order</label>
          <input
            id="sortOrder"
            type="number"
            required
            value={form.sortOrder}
            onChange={e => setForm(f => ({ ...f, sortOrder: e.target.value }))}
            className="rounded border border-[#e0e0e0] px-3 py-2 text-sm outline-none focus:border-[#1a1a1a]"
          />
        </div>

        <div className="flex justify-end gap-3 mt-4">
          <Link
            href="/admin/categories"
            className="rounded border border-[#e0e0e0] px-4 py-2 text-sm font-medium hover:bg-[#fafafa]"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="rounded bg-[#1a1a1a] px-4 py-2 text-sm font-medium text-white hover:bg-[#333] disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Create Category'}
          </button>
        </div>
      </form>
    </div>
  )
}
