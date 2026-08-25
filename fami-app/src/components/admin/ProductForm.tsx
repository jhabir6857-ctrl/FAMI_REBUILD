'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ImageUpload } from './ImageUpload'
import type { Category, Product } from '@/types'

interface Props {
  categories: Category[]
  product?: Product  // if present = edit mode
}

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

export function ProductForm({ categories, product }: Props) {
  const router = useRouter()
  const isEdit = !!product

  const [name, setName] = useState(product?.name ?? '')
  const [slug, setSlug] = useState(product?.slug ?? '')
  const [description, setDescription] = useState(product?.description ?? '')
  const [price, setPrice] = useState(product?.price?.toString() ?? '')
  const [compareAtPrice, setCompareAtPrice] = useState(product?.compareAtPrice?.toString() ?? '')
  const [stock, setStock] = useState(product?.stock?.toString() ?? '0')
  const [categoryId, setCategoryId] = useState(product?.categoryId?.toString() ?? (categories[0]?.id?.toString() ?? ''))
  const [isNew, setIsNew] = useState(product?.isNew ?? false)
  const [isFeatured, setIsFeatured] = useState(product?.isFeatured ?? false)
  const [imageUrl, setImageUrl] = useState(product?.imageUrls?.[0] ?? '')
  const [videoUrl, setVideoUrl] = useState(product?.videoUrl ?? '')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function handleNameChange(val: string) {
    setName(val)
    if (!isEdit) setSlug(slugify(val))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    try {
      const body = {
        name: name.trim(),
        slug: slug.trim(),
        description: description.trim(),
        price: parseInt(price, 10),
        compareAtPrice: compareAtPrice ? parseInt(compareAtPrice, 10) : null,
        stock: parseInt(stock, 10),
        categoryId: parseInt(categoryId, 10),
        isNew,
        isFeatured,
        imageUrls: imageUrl.trim() ? [imageUrl.trim()] : [],
        videoUrl: videoUrl.trim() || null,
      }
      const url = isEdit ? `/api/admin/products/${product!.id}` : '/api/admin/products'
      const method = isEdit ? 'PATCH' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json() as { error?: string; id?: number }
      if (!res.ok) {
        setError(data.error ?? 'Failed to save product.')
        return
      }
      router.push('/admin/products')
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
    <form onSubmit={e => void handleSubmit(e)} className="flex flex-col gap-5 max-w-2xl">
      <div className="flex flex-col gap-1.5">
        <label className={labelClass}>Name *</label>
        <input required value={name} onChange={e => handleNameChange(e.target.value)} className={inputClass} placeholder="Product name" />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className={labelClass}>Slug *</label>
        <input required value={slug} onChange={e => setSlug(e.target.value)} className={inputClass} placeholder="product-slug" pattern="[a-z0-9-]+" />
        <p className="text-xs text-[#8a8a8a]">URL-safe, lowercase, hyphens only. Auto-filled from name.</p>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className={labelClass}>Description</label>
        <textarea value={description} onChange={e => setDescription(e.target.value)} rows={4} className={inputClass} placeholder="Product description" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label className={labelClass}>Price (৳) *</label>
          <input required type="number" min="1" value={price} onChange={e => setPrice(e.target.value)} className={inputClass} placeholder="1200" />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className={labelClass}>Compare-at price (৳)</label>
          <input type="number" min="1" value={compareAtPrice} onChange={e => setCompareAtPrice(e.target.value)} className={inputClass} placeholder="Optional" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label className={labelClass}>Stock *</label>
          <input required type="number" min="0" value={stock} onChange={e => setStock(e.target.value)} className={inputClass} />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className={labelClass}>Category *</label>
          <select required value={categoryId} onChange={e => setCategoryId(e.target.value)} className={inputClass}>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
      </div>

      <div className="flex gap-6">
        <label className="flex items-center gap-2 text-sm text-[#1a1a1a] cursor-pointer">
          <input type="checkbox" checked={isNew} onChange={e => setIsNew(e.target.checked)} className="rounded" />
          Mark as New
        </label>
        <label className="flex items-center gap-2 text-sm text-[#1a1a1a] cursor-pointer">
          <input type="checkbox" checked={isFeatured} onChange={e => setIsFeatured(e.target.checked)} className="rounded" />
          Featured
        </label>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className={labelClass}>Product image</label>
        <ImageUpload value={imageUrl} onChange={setImageUrl} />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className={labelClass}>Video URL (optional)</label>
        <input type="url" value={videoUrl} onChange={e => setVideoUrl(e.target.value)} className={inputClass} placeholder="https://res.cloudinary.com/..." />
        <p className="text-xs text-[#8a8a8a]">9:16 muted loop clip. Cloudinary URL preferred.</p>
      </div>

      {error && <p role="alert" className="text-sm text-[#a02020]">{error}</p>}

      <div className="flex gap-3 pt-2">
        <button type="submit" disabled={saving} className="rounded bg-[#1a1a1a] px-6 py-2 text-sm font-medium text-white hover:bg-[#333] disabled:opacity-50">
          {saving ? 'Saving…' : isEdit ? 'Save changes' : 'Create product'}
        </button>
        <button type="button" onClick={() => router.back()} className="rounded border border-[#e0e0e0] px-6 py-2 text-sm hover:border-[#b0b0b0]">
          Cancel
        </button>
      </div>
    </form>
  )
}
