import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { orders } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(req: Request) {
  try {
    const url = new URL(req.url);
    const orderIdStr = url.searchParams.get('orderId');
    
    if (orderIdStr) {
      const orderId = parseInt(orderIdStr, 10);
      await db.update(orders)
        .set({ status: 'cancelled' })
        .where(eq(orders.id, orderId));
    }

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    return NextResponse.redirect(`${baseUrl}/checkout?error=payment_cancelled`);
  } catch (error) {
    console.error('SSLCommerz Cancel Error:', error);
    return NextResponse.redirect(new URL('/checkout?error=internal_error', req.url));
  }
}
