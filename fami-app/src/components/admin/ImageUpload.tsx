'use client'

import { useState, useRef } from 'react'

interface Props {
  value: string        // current URL
  onChange: (url: string) => void
}

export function ImageUpload({ value, onChange }: Props) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  async function handleFile(file: File) {
    setUploading(true)
    setError(null)
    try {
      const form = new FormData()
      form.append('file', file)
      const res = await fetch('/api/admin/upload', { method: 'POST', body: form })
      const data = await res.json() as { url?: string; error?: string }
      if (!res.ok || !data.url) {
        setError(data.error ?? 'Upload failed')
        return
      }
      onChange(data.url)
    } catch {
      setError('Network error during upload')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-2">
        <input
          type="text"
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder="Image URL or upload below"
          className="flex-1 border border-[#d0d0d0] rounded px-3 py-2 text-sm outline-none focus:border-[#1a1a1a]"
        />
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="rounded border border-[#d0d0d0] px-3 py-2 text-sm hover:border-[#1a1a1a] disabled:opacity-50"
        >
          {uploading ? 'Uploading…' : 'Upload'}
        </button>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={e => { const f = e.target.files?.[0]; if (f) void handleFile(f) }}
      />
      {value && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={value} alt="Preview" className="h-20 w-20 rounded object-cover border border-[#e0e0e0]" />
      )}
      {error && <p className="text-xs text-[#a02020]">{error}</p>}
    </div>
  )
}
