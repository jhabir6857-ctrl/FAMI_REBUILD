import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { addToWishlist, removeFromWishlist } from '@/lib/data'
import { z } from 'zod'

const bodySchema = z.object({ productId: z.number().int().positive() })

async function parseBody(req: NextRequest) {
  try {
    return bodySchema.safeParse(await req.json())
  } catch {
    return { success: false as const }
  }
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  const parsed = await parseBody(req)
  if (!parsed.success) return NextResponse.json({ error: 'Invalid body' }, { status: 400 })
  await addToWishlist(Number(session.user.id), parsed.data.productId)
  return NextResponse.json({ success: true })
}

export async function DELETE(req: NextRequest) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  const parsed = await parseBody(req)
  if (!parsed.success) return NextResponse.json({ error: 'Invalid body' }, { status: 400 })
  await removeFromWishlist(Number(session.user.id), parsed.data.productId)
  return NextResponse.json({ success: true })
}
