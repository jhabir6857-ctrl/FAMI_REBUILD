import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { auth } from '@/lib/auth'
import { createCategory } from '@/lib/data'

const categorySchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/),
  description: z.string().optional(),
  imageUrl: z.string().optional(),
  sortOrder: z.number().int().default(0),
})

// Helper function to make URLs foolproof for non-technical clients
function optimizeImageUrl(url: string | undefined): string | undefined {
  if (!url) return url
  if (url.includes('res.cloudinary.com') && url.includes('/upload/')) {
    if (!url.includes('f_auto') && !url.includes('q_auto')) {
      return url.replace('/upload/', '/upload/f_auto,q_auto/')
    }
  }
  if (url.includes('images.unsplash.com') && !url.includes('auto=')) {
    const separator = url.includes('?') ? '&' : '?'
    return `${url}${separator}auto=format&fit=crop&w=600&q=80`
  }
  return url
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (session?.user?.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const parsed = categorySchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid data', details: parsed.error.flatten() }, { status: 400 })
  }

  try {
    const data = parsed.data
    data.imageUrl = optimizeImageUrl(data.imageUrl)

    const id = await createCategory(data)
    return NextResponse.json({ success: true, id }, { status: 201 })
  } catch (err: unknown) {
    console.error('Create category error:', err)
    const msg = err instanceof Error ? err.message : ''
    if (msg.includes('unique constraint') || msg.includes('UNIQUE')) {
      return NextResponse.json({ error: 'Category slug must be unique' }, { status: 400 })
    }
    return NextResponse.json({ error: 'Failed to create category' }, { status: 500 })
  }
}
