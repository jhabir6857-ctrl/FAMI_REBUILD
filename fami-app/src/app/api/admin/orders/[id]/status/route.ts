import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { auth } from '@/lib/auth'
import { getOrderById, updateOrderStatus } from '@/lib/data'

const statusSchema = z.object({
  status: z.enum(['pending', 'confirmed', 'shipped', 'delivered', 'cancelled']),
})

interface Params {
  params: Promise<{ id: string }>
}

export async function PATCH(req: NextRequest, { params }: Params) {
  // Middleware already blocks non-admins from /admin/*, but this API route
  // doesn't live under that path prefix, so it needs its own check —
  // relying solely on middleware here would be a silent hole.
  const session = await auth()
  if (session?.user?.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  const { id } = await params
  const orderId = Number(id)
  if (!Number.isInteger(orderId)) {
    return NextResponse.json({ error: 'Invalid order id' }, { status: 400 })
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const parsed = statusSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
  }

  const existing = await getOrderById(orderId)
  if (!existing) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 })
  }

  await updateOrderStatus(orderId, parsed.data.status)
  
  if (parsed.data.status === 'confirmed' || parsed.data.status === 'delivered') {
    const { sendCustomerOrderReceipt } = await import('@/lib/email')
    const statusMsg = parsed.data.status === 'confirmed' 
      ? 'Great news! Your order has been confirmed and is being prepared for shipment.'
      : 'Your order has been delivered! We hope you enjoy your new items.'
    
    // Fire and forget
    sendCustomerOrderReceipt({
      orderId: existing.id,
      customerName: existing.name,
      customerEmail: existing.email,
      items: existing.items.map(i => ({ name: i.productName, quantity: i.quantity, price: i.price })),
      subtotal: existing.subtotal,
      total: existing.total,
      shippingAddress: existing.shippingAddress,
      statusMessage: statusMsg,
    }).catch(console.error)
  }

  return NextResponse.json({ success: true })
}
