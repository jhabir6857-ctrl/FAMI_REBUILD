import { Resend } from 'resend'
import { render } from '@react-email/render'
import OrderEmail from '@/emails/OrderEmail'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendEmail({ to, subject, html }: { to: string; subject: string; html: string }) {
  if (!process.env.RESEND_API_KEY) {
    console.warn('Email skipped: RESEND_API_KEY not configured.')
    return
  }

  try {
    await resend.emails.send({
      from: 'FaMi <orders@famibd.shop>',
      reply_to: 'farhanahmed20020@gmail.com',
      to,
      subject,
      html,
    })
  } catch (err) {
    console.error('Failed to send email via Resend:', err)
  }
}

export async function sendCustomerOrderReceipt(opts: {
  orderId: number,
  customerName: string,
  customerEmail: string,
  items: { name: string; quantity: number; price: number }[],
  subtotal: number,
  total: number,
  shippingAddress: string,
  statusMessage?: string
}) {
  const html = await render(OrderEmail({
    orderId: opts.orderId,
    customerName: opts.customerName,
    items: opts.items,
    subtotal: opts.subtotal,
    total: opts.total,
    shippingAddress: opts.shippingAddress,
    statusMessage: opts.statusMessage,
  }))

  await sendEmail({
    to: opts.customerEmail,
    subject: `FaMi Order #${opts.orderId} Confirmed`,
    html
  })
}

export async function sendOrderNotification(opts: {
  orderId: number,
  customerName: string,
  customerEmail: string,
  customerPhone: string,
  shippingAddress: string,
  paymentMethod: string,
  subtotal: number,
  total: number,
  items: { name: string; quantity: number; price: number }[]
}) {
  // Send email to admin
  const html = `
    <h2>New Order #${opts.orderId}</h2>
    <p><strong>Customer:</strong> ${opts.customerName} (${opts.customerEmail}) - ${opts.customerPhone}</p>
    <p><strong>Payment:</strong> ${opts.paymentMethod}</p>
    <p><strong>Total:</strong> ${opts.total} BDT</p>
    <p><strong>Address:</strong> ${opts.shippingAddress}</p>
    <hr/>
    <ul>
      ${opts.items.map(i => `<li>${i.quantity}x ${i.name}</li>`).join('')}
    </ul>
    <br/>
    <p><a href="https://famibd.shop/admin/orders/${opts.orderId}">View in Admin Panel</a></p>
  `
  await sendEmail({
    to: 'farhanahmed20020@gmail.com',
    subject: `🚨 New Order #${opts.orderId} from ${opts.customerName}`,
    html
  })

  // Send receipt to customer
  await sendCustomerOrderReceipt({
    orderId: opts.orderId,
    customerName: opts.customerName,
    customerEmail: opts.customerEmail,
    items: opts.items,
    subtotal: opts.subtotal,
    total: opts.total,
    shippingAddress: opts.shippingAddress,
    statusMessage: 'We have received your order and are currently processing it.'
  })
}
