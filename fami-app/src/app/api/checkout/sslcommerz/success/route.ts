import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { orders } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(req: Request) {
  try {
    const url = new URL(req.url);
    const orderIdStr = url.searchParams.get('orderId');
    
    if (!orderIdStr) {
      return NextResponse.redirect(new URL('/checkout?error=missing_order', req.url));
    }

    const orderId = parseInt(orderIdStr, 10);

    // Form data usually contains the payment response from SSLCommerz
    // const formData = await req.formData();
    // const val_id = formData.get('val_id'); 
    // In a real production app, validate the payment here using the SSLCommerz validate API

    // Update order status to confirmed
    await db.update(orders)
      .set({ status: 'confirmed', paymentMethod: 'sslcommerz' })
      .where(eq(orders.id, orderId));

    // Redirect to a success page
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    return NextResponse.redirect(`${baseUrl}/checkout/success?orderId=${orderId}`);
  } catch (error) {
    console.error('SSLCommerz Success Error:', error);
    return NextResponse.redirect(new URL('/checkout?error=internal_error', req.url));
  }
}
