import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { rateLimit, clientIp } from '@/lib/rate-limit'

const schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  message: z.string().min(10, 'Message must be at least 10 characters').max(2000),
})

export async function POST(req: NextRequest) {
  // 5 messages per IP per 10 minutes
  if (!rateLimit(`contact:${clientIp(req)}`, 5, 10 * 60 * 1000)) {
    return NextResponse.json({ error: 'Too many requests. Please wait a few minutes and try again.' }, { status: 429 })
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    const firstError = parsed.error.errors[0]?.message ?? 'Invalid form data'
    return NextResponse.json({ error: firstError }, { status: 400 })
  }

  // TODO (Phase 7): forward to the client's inbox via Resend/SMTP.
  // Until that's wired, log to the server console so messages aren't silently lost.
  console.log('[contact form]', {
    name: parsed.data.name,
    email: parsed.data.email,
    message: parsed.data.message,
    at: new Date().toISOString(),
  })

  return NextResponse.json({ success: true })
}
