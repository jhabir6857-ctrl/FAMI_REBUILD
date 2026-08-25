'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { BlogPost } from '@/types'

interface Props {
  post?: BlogPost  // if present = edit mode
}

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

export function BlogForm({ post }: Props) {
  const router = useRouter()
  const isEdit = !!post

  const [title, setTitle] = useState(post?.title ?? '')
  const [slug, setSlug] = useState(post?.slug ?? '')
  const [excerpt, setExcerpt] = useState(post?.excerpt ?? '')
  const [content, setContent] = useState(post?.content ?? '')
  const [imageUrl, setImageUrl] = useState(post?.imageUrl ?? '')
  const [tags, setTags] = useState(post?.tags?.join(', ') ?? '')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function handleTitleChange(val: string) {
    setTitle(val)
    if (!isEdit) setSlug(slugify(val))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    try {
      const body = {
        title: title.trim(),
        slug: slug.trim(),
        excerpt: excerpt.trim(),
        content: content.trim(),
        imageUrl: imageUrl.trim() || null,
        tags: tags.split(',').map(t => t.trim()).filter(Boolean),
      }
      const url = isEdit ? `/api/admin/blog/${post!.id}` : '/api/admin/blog'
      const method = isEdit ? 'PATCH' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json() as { error?: string }
      if (!res.ok) {
        setError(data.error ?? 'Failed to save post.')
        return
      }
      router.push('/admin/blog')
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
        <label className={labelClass}>Title *</label>
        <input required value={title} onChange={e => handleTitleChange(e.target.value)} className={inputClass} placeholder="Post title" />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className={labelClass}>Slug *</label>
        <input required value={slug} onChange={e => setSlug(e.target.value)} className={inputClass} pattern="[a-z0-9-]+" />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className={labelClass}>Excerpt</label>
        <textarea value={excerpt} onChange={e => setExcerpt(e.target.value)} rows={3} className={inputClass} placeholder="Short summary shown on blog listing" />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className={labelClass}>Content (HTML allowed)</label>
        <textarea value={content} onChange={e => setContent(e.target.value)} rows={12} className={inputClass} placeholder="<p>Full post content…</p>" />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className={labelClass}>Image URL</label>
        <input type="url" value={imageUrl} onChange={e => setImageUrl(e.target.value)} className={inputClass} placeholder="https://…" />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className={labelClass}>Tags (comma-separated)</label>
        <input value={tags} onChange={e => setTags(e.target.value)} className={inputClass} placeholder="skincare, style guide" />
      </div>

      {error && <p role="alert" className="text-sm text-[#a02020]">{error}</p>}

      <div className="flex gap-3 pt-2">
        <button type="submit" disabled={saving} className="rounded bg-[#1a1a1a] px-6 py-2 text-sm font-medium text-white hover:bg-[#333] disabled:opacity-50">
          {saving ? 'Saving…' : isEdit ? 'Save changes' : 'Publish post'}
        </button>
        <button type="button" onClick={() => router.back()} className="rounded border border-[#e0e0e0] px-6 py-2 text-sm hover:border-[#b0b0b0]">
          Cancel
        </button>
      </div>
    </form>
  )
}
