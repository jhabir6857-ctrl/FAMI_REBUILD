/**
 * Order notification email helper.
 *
 * Uses Resend's REST API (https://resend.com) — no SDK required.
 * Set RESEND_API_KEY and ORDER_NOTIFICATION_EMAIL in .env.local to activate.
 * When the key is absent the function logs to the server console and returns
 * silently — the order is always saved in the DB regardless.
 *
 * To promote a future mailer (Mailchimp, SMTP via nodemailer, etc.) just
 * swap the body of sendOrderNotification(); the call-site in the checkout
 * route stays the same.
 */

export interface OrderNotificationPayload {
  orderId: number
  customerName: string
  customerEmail: string
  customerPhone: string
  shippingAddress: string
  paymentMethod: string
  subtotal: number
  total: number
  items: { name: string; quantity: number; price: number }[]
}

function formatBDTPlain(amount: number): string {
  return `৳${amount.toLocaleString('en-BD')}`
}

function buildHtml(p: OrderNotificationPayload): string {
  const itemRows = p.items
    .map(
      i =>
        `<tr>
          <td style="padding:6px 8px;border-bottom:1px solid #eae3e7">${i.name}</td>
          <td style="padding:6px 8px;border-bottom:1px solid #eae3e7;text-align:center">${i.quantity}</td>
          <td style="padding:6px 8px;border-bottom:1px solid #eae3e7;text-align:right">${formatBDTPlain(i.price * i.quantity)}</td>
        </tr>`,
    )
    .join('')

  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#faf6f0;font-family:'Helvetica Neue',Arial,sans-serif">
  <div style="max-width:560px;margin:32px auto;background:#ffffff;border-radius:14px;overflow:hidden;border:1px solid #eae3e7">
    <!-- Header -->
    <div style="background:#2b1f2e;padding:24px 32px">
      <p style="margin:0;font-size:24px;font-weight:600;color:#ffffff;letter-spacing:-0.3px">FaMi</p>
      <p style="margin:6px 0 0;font-size:13px;color:#d9a5ac">New order received</p>
    </div>

    <!-- Body -->
    <div style="padding:32px">
      <h1 style="margin:0 0 4px;font-size:20px;font-weight:600;color:#2b1f2e">Order #${p.orderId}</h1>
      <p style="margin:0 0 24px;font-size:13px;color:#6b5f68">${new Date().toLocaleString('en-BD', { timeZone: 'Asia/Dhaka', dateStyle: 'medium', timeStyle: 'short' })} (BST)</p>

      <!-- Customer -->
      <table style="width:100%;border-collapse:collapse;margin-bottom:24px">
        <tr><td style="padding:5px 0;font-size:13px;color:#6b5f68;width:120px">Customer</td><td style="padding:5px 0;font-size:13px;color:#2b1f2e;font-weight:500">${p.customerName}</td></tr>
        <tr><td style="padding:5px 0;font-size:13px;color:#6b5f68">Email</td><td style="padding:5px 0;font-size:13px;color:#2b1f2e">${p.customerEmail}</td></tr>
        <tr><td style="padding:5px 0;font-size:13px;color:#6b5f68">Phone</td><td style="padding:5px 0;font-size:13px;color:#2b1f2e">${p.customerPhone}</td></tr>
        <tr><td style="padding:5px 0;font-size:13px;color:#6b5f68">Address</td><td style="padding:5px 0;font-size:13px;color:#2b1f2e">${p.shippingAddress}</td></tr>
        <tr><td style="padding:5px 0;font-size:13px;color:#6b5f68">Payment</td><td style="padding:5px 0;font-size:13px;color:#2b1f2e;text-transform:capitalize">${p.paymentMethod}</td></tr>
      </table>

      <!-- Items -->
      <p style="margin:0 0 8px;font-size:13px;font-weight:600;color:#2b1f2e">Items</p>
      <table style="width:100%;border-collapse:collapse;margin-bottom:24px;font-size:13px">
        <thead>
          <tr style="background:#f3ece3">
            <th style="padding:6px 8px;text-align:left;font-weight:600;color:#2b1f2e;border-bottom:1px solid #eae3e7">Product</th>
            <th style="padding:6px 8px;text-align:center;font-weight:600;color:#2b1f2e;border-bottom:1px solid #eae3e7">Qty</th>
            <th style="padding:6px 8px;text-align:right;font-weight:600;color:#2b1f2e;border-bottom:1px solid #eae3e7">Total</th>
          </tr>
        </thead>
        <tbody>${itemRows}</tbody>
      </table>

      <!-- Totals -->
      <table style="width:100%;border-collapse:collapse;margin-bottom:24px;font-size:13px">
        <tr>
          <td style="padding:4px 0;color:#6b5f68">Subtotal</td>
          <td style="padding:4px 0;text-align:right;color:#2b1f2e">${formatBDTPlain(p.subtotal)}</td>
        </tr>
        <tr>
          <td style="padding:4px 0;color:#6b5f68">Shipping</td>
          <td style="padding:4px 0;text-align:right;color:#2b1f2e">${p.total - p.subtotal === 0 ? 'Free' : formatBDTPlain(p.total - p.subtotal)}</td>
        </tr>
        <tr>
          <td style="padding:8px 0 4px;font-weight:600;color:#2b1f2e;border-top:1px solid #eae3e7">Total</td>
          <td style="padding:8px 0 4px;text-align:right;font-weight:600;color:#b76e79;font-size:15px;border-top:1px solid #eae3e7">${formatBDTPlain(p.total)}</td>
        </tr>
      </table>

      <!-- CTA -->
      <a href="${process.env.NEXTAUTH_URL ?? 'http://localhost:3000'}/admin/orders/${p.orderId}"
        style="display:inline-block;background:#b76e79;color:#ffffff;text-decoration:none;padding:12px 24px;border-radius:8px;font-size:13px;font-weight:600">
        View order in admin →
      </a>
    </div>

    <!-- Footer -->
    <div style="padding:16px 32px;border-top:1px solid #eae3e7;background:#f3ece3">
      <p style="margin:0;font-size:11px;color:#6b5f68">FaMi · famibd.shop · This is an automated notification.</p>
    </div>
  </div>
</body>
</html>`
}

/**
 * Sends an order notification email to the store owner.
 * Fire-and-forget — never throws; a failed email must not fail the order.
 * Falls back to console.log when RESEND_API_KEY is not set.
 */
export async function sendOrderNotification(payload: OrderNotificationPayload): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY
  const toEmail = process.env.ORDER_NOTIFICATION_EMAIL ?? 'orders@famibd.shop'

  // ── No key: log to console so the order isn't silently lost ─────────────
  if (!apiKey) {
    console.log('[order-notification] RESEND_API_KEY not set — logging order instead of emailing.')
    console.log('[order-notification]', {
      orderId: payload.orderId,
      customer: payload.customerName,
      email: payload.customerEmail,
      phone: payload.customerPhone,
      address: payload.shippingAddress,
      payment: payload.paymentMethod,
      total: formatBDTPlain(payload.total),
      items: payload.items.map(i => `${i.name} x${i.quantity}`).join(', '),
    })
    return
  }

  // ── Key present: send via Resend REST API ────────────────────────────────
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from: 'FaMi Orders <orders@famibd.shop>',
        to: [toEmail],
        subject: `New order #${payload.orderId} — ${formatBDTPlain(payload.total)} (${payload.paymentMethod.toUpperCase()})`,
        html: buildHtml(payload),
      }),
    })

    if (!res.ok) {
      const body = await res.text()
      console.error(`[order-notification] Resend API error ${res.status}:`, body)
    }
  } catch (err) {
    // Network failure — log but never surface to the caller
    console.error('[order-notification] Failed to send email:', err)
  }
}
