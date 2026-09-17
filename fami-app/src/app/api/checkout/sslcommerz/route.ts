import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { orders } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import SSLCommerzPayment from 'sslcommerz-lts';

const store_id = process.env.SSLC_STORE_ID || 'testbox';
const store_passwd = process.env.SSLC_STORE_PASSWORD || 'qwerty';
const is_live = process.env.NODE_ENV === 'production' && process.env.SSLC_IS_LIVE === 'true';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { orderId } = body;

    if (!orderId) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
    }

    const order = await db.query.orders.findFirst({
      where: eq(orders.id, orderId),
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const tran_id = `FAMI_${order.id}_${Date.now()}`;
    await db.update(orders).set({ tranId: tran_id }).where(eq(orders.id, order.id));

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

    const data = {
      total_amount: order.total,
      currency: 'BDT',
      tran_id: tran_id,
      success_url: `${baseUrl}/api/checkout/sslcommerz/success?orderId=${order.id}`,
      fail_url: `${baseUrl}/api/checkout/sslcommerz/fail?orderId=${order.id}`,
      cancel_url: `${baseUrl}/api/checkout/sslcommerz/cancel?orderId=${order.id}`,
      ipn_url: `${baseUrl}/api/checkout/sslcommerz/ipn`,
      shipping_method: 'Courier',
      product_name: 'Jewellery',
      product_category: 'Jewellery',
      product_profile: 'general',
      cus_name: order.name,
      cus_email: order.email,
      cus_add1: order.shippingAddress,
      cus_add2: '',
      cus_city: 'Dhaka',
      cus_state: 'Dhaka',
      cus_postcode: '1000',
      cus_country: 'Bangladesh',
      cus_phone: order.phone,
      cus_fax: '',
      ship_name: order.name,
      ship_add1: order.shippingAddress,
      ship_add2: '',
      ship_city: 'Dhaka',
      ship_state: 'Dhaka',
      ship_postcode: 1000,
      ship_country: 'Bangladesh',
    };

    const sslcz = new SSLCommerzPayment(store_id, store_passwd, is_live);
    const apiResponse = await sslcz.init(data);
    
    if (apiResponse?.GatewayPageURL) {
      return NextResponse.json({ url: apiResponse.GatewayPageURL });
    } else {
      return NextResponse.json({ error: 'Failed to initialize payment gateway' }, { status: 500 });
    }

  } catch (error) {
    console.error('SSLCommerz Init Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
