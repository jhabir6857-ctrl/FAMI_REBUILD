import { render } from '@react-email/render'
import nodemailer from 'nodemailer'
import OrderEmail from '@/emails/OrderEmail'

export async function sendEmail({ to, subject, html }: { to: string; subject: string; html: string }) {
  // Option 1: Direct SMTP (Gmail, Hostinger, Resend, or custom SMTP)
  const smtpUser = process.env.SMTP_USER
  const smtpPass = process.env.SMTP_PASS || process.env.SMTP_PASSWORD
  const smtpHost = process.env.SMTP_HOST || 'smtp.gmail.com'
  const smtpPort = process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : 465

  if (smtpUser && smtpPass) {
    try {
      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpPort === 465,
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
      })

      await transporter.sendMail({
        from: `"FaMi" <${smtpUser}>`,
        to,
        subject,
        html,
      })
      console.log(`[Email] Successfully sent email to ${to} via SMTP`)
      return
    } catch (smtpErr) {
      console.error('[Email] SMTP failed, falling back if EmailJS is configured:', smtpErr)
    }
  }

  // Option 2: EmailJS
  const serviceId = process.env.EMAILJS_SERVICE_ID
  const templateId = process.env.EMAILJS_TEMPLATE_ID
  const publicKey = process.env.EMAILJS_PUBLIC_KEY
  const privateKey = process.env.EMAILJS_PRIVATE_KEY

  if (!serviceId || !templateId || !publicKey) {
    console.warn('[Email] Skipping email: Neither SMTP nor EmailJS is fully configured.')
    return
  }

  try {
    const res = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'origin': 'https://famibd.shop',
        'referer': 'https://famibd.shop/',
      },
      body: JSON.stringify({
        service_id: serviceId,
        template_id: templateId,
        user_id: publicKey,
        accessToken: privateKey,
        template_params: {
          to_email: to,
          subject: subject,
          html_content: html,
        },
      }),
    })

    if (!res.ok) {
      const errorText = await res.text()
      console.error('[Email] Failed to send email via EmailJS:', res.status, errorText)
    } else {
      console.log(`[Email] Successfully sent email to ${to} via EmailJS`)
    }
  } catch (err) {
    console.error('[Email] Failed to send email via EmailJS:', err)
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
  statusMessage?: string,
  subject?: string,
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
    subject: opts.subject ?? `FaMi Order #${opts.orderId} Update`,
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
  const adminEmail = process.env.ADMIN_EMAIL || 'farhanahmed20020@gmail.com'

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
    to: adminEmail,
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
    statusMessage: 'We have received your order and are currently processing it.',
    subject: `FaMi Order #${opts.orderId} Received`,
  })
}
