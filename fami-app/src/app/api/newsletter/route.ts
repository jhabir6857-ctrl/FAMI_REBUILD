import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { rateLimit, clientIp } from '@/lib/rate-limit'

const schema = z.object({
  email: z.string().email(),
})

export async function POST(req: NextRequest) {
  // 3 signups per IP per 10 minutes — prevents bot harvesting
  if (!rateLimit(`newsletter:${clientIp(req)}`, 3, 10 * 60 * 1000)) {
    return NextResponse.json({ error: 'Too many requests. Please wait a few minutes.' }, { status: 429 })
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 })
  }

  // TODO (Phase 7): pipe to a real mailing list (Mailchimp / Resend audience).
  // For now, log the signup so it doesn't silently vanish.
  console.log('[newsletter] new signup:', parsed.data.email)

  return NextResponse.json({ success: true })
}
