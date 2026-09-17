import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { settings } from '@/lib/db/schema'
import { z } from 'zod'

export async function GET() {
  let [current] = await db.select().from(settings).limit(1)
  if (!current) {
    const [inserted] = await db.insert(settings).values({
      deliveryChargeInside: 80,
      deliveryChargeOutside: 150,
      freeShippingThreshold: 5000
    }).returning()
    current = inserted
  }
  return NextResponse.json(current)
}

const settingsSchema = z.object({
  deliveryChargeInside: z.number().min(0),
  deliveryChargeOutside: z.number().min(0),
  freeShippingThreshold: z.number().min(0),
})

export async function POST(req: NextRequest) {
  const session = await auth()
  if (session?.user?.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 })
  }

  const parsed = settingsSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid data' }, { status: 400 })
  }

  let [current] = await db.select().from(settings).limit(1)
  
  if (current) {
    await db.update(settings)
      .set(parsed.data)
  } else {
    await db.insert(settings).values(parsed.data)
  }
  
  return NextResponse.json({ success: true })
}
