import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { orders, orderItems, users, products, settings } from '@/lib/db/schema'
import { eq, inArray, sql } from 'drizzle-orm'
import { z } from 'zod'
import { clientIp, rateLimit } from '@/lib/rate-limit'
import { sendOrderNotification } from '@/lib/email'

const checkoutSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(10),
  address: z.string().min(5),
  city: z.string().min(2),
  paymentMethod: z.enum(['cod', 'whatsapp', 'bkash', 'nagad', 'sslcommerz']),
  deliveryZone: z.enum(['inside', 'outside']),
  notes: z.string().optional(),
  items: z.array(z.object({
    productId: z.number().int().positive(),
    quantity: z.number().int().min(1).max(99),
  })).min(1),
})

export async function POST(req: NextRequest) {
  if (!(await rateLimit(`checkout:${clientIp(req)}`, 10, 10 * 60 * 1000))) {
    return NextResponse.json({ error: 'Too many orders placed. Please wait a few minutes and try again.' }, { status: 429 })
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const parsed = checkoutSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid order data', details: parsed.error.flatten() }, { status: 400 })
  }

  const session = await auth()
  const userId = session?.user?.id ? Number(session.user.id) : null

  const { name, email, phone, address, city, paymentMethod, deliveryZone, notes, items } = parsed.data
  const shippingAddress = `${address}, ${city} (${deliveryZone === 'inside' ? 'Inside Dhaka' : 'Outside Dhaka'})`

  try {
    const productIds = items.map(i => i.productId)
    const dbProducts = await db.select().from(products).where(inArray(products.id, productIds))
    const productMap = new Map(dbProducts.map(p => [p.id, p]))

    let subtotal = 0
    const lineItems: { product: typeof dbProducts[number]; quantity: number; price: number }[] = []
    for (const item of items) {
      const product = productMap.get(item.productId)
      if (!product) throw new CheckoutError(`Product ${item.productId} not found`, 400)
      if (product.stock < item.quantity) {
        throw new CheckoutError(`Insufficient stock for ${product.name}`, 409)
      }
      const lineTotal = product.price * item.quantity
      subtotal += lineTotal
      lineItems.push({ product, quantity: item.quantity, price: product.price })
    }

    let [currentSettings] = await db.select().from(settings).limit(1)
    if (!currentSettings) {
      currentSettings = { deliveryChargeInside: 80, deliveryChargeOutside: 150, freeShippingThreshold: 5000, id: 1, updatedAt: new Date() }
    }

    const baseShipping = deliveryZone === 'inside' ? currentSettings.deliveryChargeInside : currentSettings.deliveryChargeOutside
    const shipping = subtotal >= currentSettings.freeShippingThreshold ? 0 : baseShipping
    const total = subtotal + shipping
    const pointsEarned = Math.floor(total / 100) // 1 point per ৳100

    const orderRows = await db.insert(orders).values({
      userId,
      paymentMethod,
      subtotal,
      total,
      shippingAddress,
      phone,
      email,
      name,
      notes: notes ?? null,
      pointsEarned,
    }).returning()

    const order = orderRows[0]
    if (!order) throw new CheckoutError('Failed to create order', 500)

    try {
      await db.insert(orderItems).values(
        lineItems.map(({ product, quantity, price }) => {
          let firstImage = ''
          try {
            const parsedImages: unknown = JSON.parse(product.imageUrls)
            if (Array.isArray(parsedImages) && typeof parsedImages[0] === 'string') firstImage = parsedImages[0]
          } catch {
            firstImage = ''
          }
          return {
            orderId: order.id,
            productId: product.id,
            productName: product.name,
            productImage: firstImage,
            price,
            quantity,
          }
        })
      )

      // Conditional decrement: row-level WHERE stock >= quantity
      for (const { product, quantity } of lineItems) {
        const updated = await db
          .update(products)
          .set({ stock: sql`${products.stock} - ${quantity}` })
          .where(sql`${products.id} = ${product.id} AND ${products.stock} >= ${quantity}`)
          .returning({ id: products.id })
        if (updated.length === 0) {
          throw new CheckoutError(`Insufficient stock for ${product.name}`, 409)
        }
      }

      if (userId && pointsEarned > 0) {
        await db.update(users)
          .set({ loyaltyPoints: sql`${users.loyaltyPoints} + ${pointsEarned}` })
          .where(eq(users.id, userId))
      }
    } catch (orderStepErr) {
      // Roll back the order if items or stock decrement failed
      await db.delete(orders).where(eq(orders.id, order.id)).catch(() => {})
      throw orderStepErr
    }

    const result = { orderId: order.id, total, subtotal, pointsEarned, lineItems }

    // Fire-and-forget — a failed email must never fail the order.
    // lineItems come from the already-completed transaction, no extra DB hit.
    sendOrderNotification({
      orderId: result.orderId,
      customerName: name,
      customerEmail: email,
      customerPhone: phone,
      shippingAddress,
      paymentMethod,
      subtotal: result.subtotal,
      total: result.total,
      items: result.lineItems.map(li => ({
        name: li.product.name,
        quantity: li.quantity,
        price: li.price,
      })),
    }).catch(emailErr => {
      console.error('Failed to trigger order notification email:', emailErr)
    })

    return NextResponse.json({ success: true, orderId: result.orderId, total: result.total, pointsEarned: result.pointsEarned })
  } catch (err) {
    if (err instanceof CheckoutError) {
      return NextResponse.json({ error: err.message }, { status: err.status })
    }
    console.error('Checkout failed', err)
    return NextResponse.json({ error: 'Something went wrong placing your order. Please try again.' }, { status: 500 })
  }
}

class CheckoutError extends Error {
  status: number
  constructor(message: string, status: number) {
    super(message)
    this.status = status
  }
}
