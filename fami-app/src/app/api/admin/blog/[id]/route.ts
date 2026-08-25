import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { getBlogPostById, updateBlogPost, deleteBlogPost } from '@/lib/data'
import { z } from 'zod'

const patchSchema = z.object({
  title: z.string().min(1).optional(),
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/).optional(),
  excerpt: z.string().optional(),
  content: z.string().optional(),
  imageUrl: z.string().nullable().optional(),
  tags: z.array(z.string()).optional(),
})

interface Params { params: Promise<{ id: string }> }

export async function GET(_req: NextRequest, { params }: Params) {
  const session = await auth()
  if (session?.user?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const { id } = await params
  const post = await getBlogPostById(Number(id))
  if (!post) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(post)
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const session = await auth()
  if (session?.user?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const { id } = await params
  let body: unknown
  try { body = await req.json() } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }) }
  const parsed = patchSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Invalid data', details: parsed.error.flatten() }, { status: 400 })
  await updateBlogPost(Number(id), parsed.data)
  return NextResponse.json({ success: true })
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const session = await auth()
  if (session?.user?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const { id } = await params
  await deleteBlogPost(Number(id))
  return NextResponse.json({ success: true })
}
