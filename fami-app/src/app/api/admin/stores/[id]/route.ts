import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { updateStore, deleteStore } from '@/lib/data'
import { z } from 'zod'

const patchSchema = z.object({
  name: z.string().min(1).optional(),
  address: z.string().min(1).optional(),
  hours: z.string().optional(),
  phone: z.string().nullable().optional(),
})

interface Params { params: Promise<{ id: string }> }

export async function PATCH(req: NextRequest, { params }: Params) {
  const session = await auth()
  if (session?.user?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const { id } = await params
  let body: unknown
  try { body = await req.json() } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }) }
  const parsed = patchSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Invalid data', details: parsed.error.flatten() }, { status: 400 })
  await updateStore(Number(id), parsed.data)
  return NextResponse.json({ success: true })
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const session = await auth()
  if (session?.user?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const { id } = await params
  await deleteStore(Number(id))
  return NextResponse.json({ success: true })
}
