import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { orders, orderItems, users, products } from '@/lib/db/schema'
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
  paymentMethod: z.enum(['cod', 'whatsapp', 'bkash', 'nagad']),
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

  const { name, email, phone, address, city, paymentMethod, notes, items } = parsed.data
  const shippingAddress = `${address}, ${city}`

  try {
    // Everything below happens atomically: if stock runs out mid-transaction,
    // a concurrent order fails cleanly with SQLite's default IMMEDIATE lock
    // rather than both orders decrementing stock past zero.
    const result = await db.transaction(async (tx) => {
      const productIds = items.map(i => i.productId)
      const dbProducts = await tx.select().from(products).where(inArray(products.id, productIds))
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

      const shipping = subtotal >= 5000 ? 0 : 120
      const total = subtotal + shipping
      const pointsEarned = Math.floor(total / 100) // 1 point per ৳100

      const [order] = await tx.insert(orders).values({
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

      if (!order) throw new CheckoutError('Failed to create order', 500)

      await tx.insert(orderItems).values(
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

      // Conditional decrement (not "current stock minus quantity") so a
      // concurrent transaction can't push stock negative — this row-level
      // WHERE re-checks stock at write time, not just at read time above.
      for (const { product, quantity } of lineItems) {
        const updated = await tx
          .update(products)
          .set({ stock: sql`${products.stock} - ${quantity}` })
          .where(sql`${products.id} = ${product.id} AND ${products.stock} >= ${quantity}`)
        if (updated.rowCount === 0) {
          throw new CheckoutError(`Insufficient stock for ${product.name}`, 409)
        }
      }

      if (userId && pointsEarned > 0) {
        await tx.update(users)
          .set({ loyaltyPoints: sql`${users.loyaltyPoints} + ${pointsEarned}` })
          .where(eq(users.id, userId))
      }

      return { orderId: order.id, total, subtotal, pointsEarned, lineItems }
    })

    // Fire-and-forget — a failed email must never fail the order.
    // lineItems come from the already-completed transaction, no extra DB hit.
    void sendOrderNotification({
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
