import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { getAllProductsAdmin, createProduct } from '@/lib/data'
import { z } from 'zod'

const productSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/),
  description: z.string().default(''),
  price: z.number().int().positive(),
  compareAtPrice: z.number().int().positive().nullable().default(null),
  stock: z.number().int().min(0).default(0),
  imageUrls: z.array(z.string()).default([]),
  videoUrl: z.string().nullable().default(null),
  categoryId: z.number().int().positive(),
  isNew: z.boolean().default(false),
  isFeatured: z.boolean().default(false),
})

export async function GET() {
  const session = await auth()
  if (session?.user?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const products = await getAllProductsAdmin()
  return NextResponse.json(products)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (session?.user?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  let body: unknown
  try { body = await req.json() } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }) }
  const parsed = productSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Invalid data', details: parsed.error.flatten() }, { status: 400 })
  const id = await createProduct(parsed.data)
  return NextResponse.json({ id }, { status: 201 })
}
