import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { getProductById, updateProduct, deleteProduct } from '@/lib/data'
import { z } from 'zod'

const patchSchema = z.object({
  name: z.string().min(1).optional(),
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/).optional(),
  description: z.string().optional(),
  price: z.number().int().positive().optional(),
  compareAtPrice: z.number().int().positive().nullable().optional(),
  stock: z.number().int().min(0).optional(),
  imageUrls: z.array(z.string()).optional(),
  videoUrl: z.string().nullable().optional(),
  categoryId: z.number().int().positive().optional(),
  isNew: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
})

interface Params { params: Promise<{ id: string }> }

export async function GET(_req: NextRequest, { params }: Params) {
  const session = await auth()
  if (session?.user?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const { id } = await params
  const product = await getProductById(Number(id))
  if (!product) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(product)
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const session = await auth()
  if (session?.user?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const { id } = await params
  let body: unknown
  try { body = await req.json() } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }) }
  const parsed = patchSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Invalid data', details: parsed.error.flatten() }, { status: 400 })
  await updateProduct(Number(id), parsed.data)
  return NextResponse.json({ success: true })
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const session = await auth()
  if (session?.user?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const { id } = await params
  await deleteProduct(Number(id))
  return NextResponse.json({ success: true })
}
