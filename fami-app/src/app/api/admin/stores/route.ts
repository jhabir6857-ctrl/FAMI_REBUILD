import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { getStores, createStore } from '@/lib/data'
import { z } from 'zod'

const storeSchema = z.object({
  name: z.string().min(1),
  address: z.string().min(1),
  hours: z.string().default(''),
  phone: z.string().nullable().default(null),
})

export async function GET() {
  const session = await auth()
  if (session?.user?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const stores = await getStores()
  return NextResponse.json(stores)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (session?.user?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  let body: unknown
  try { body = await req.json() } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }) }
  const parsed = storeSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Invalid data', details: parsed.error.flatten() }, { status: 400 })
  const id = await createStore(parsed.data)
  return NextResponse.json({ id }, { status: 201 })
}
