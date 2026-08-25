import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { getAllBlogPostsAdmin, createBlogPost } from '@/lib/data'
import { z } from 'zod'

const blogSchema = z.object({
  title: z.string().min(1),
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/),
  excerpt: z.string().default(''),
  content: z.string().default(''),
  imageUrl: z.string().nullable().default(null),
  tags: z.array(z.string()).default([]),
})

export async function GET() {
  const session = await auth()
  if (session?.user?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const posts = await getAllBlogPostsAdmin()
  return NextResponse.json(posts)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (session?.user?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  let body: unknown
  try { body = await req.json() } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }) }
  const parsed = blogSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Invalid data', details: parsed.error.flatten() }, { status: 400 })
  const id = await createBlogPost(parsed.data)
  return NextResponse.json({ id }, { status: 201 })
}
