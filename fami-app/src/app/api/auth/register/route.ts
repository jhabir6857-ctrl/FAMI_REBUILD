import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { db } from '@/lib/db'
import { users } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { z } from 'zod'
import { clientIp, rateLimit } from '@/lib/rate-limit'

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
})

function generateReferralCode(name: string): string {
  const prefix = name.slice(0, 4).toUpperCase().replace(/[^A-Z]/g, 'X').padEnd(4, 'X')
  const suffix = Math.random().toString(36).slice(2, 6).toUpperCase()
  return `FAMI-${prefix}${suffix}`
}

export async function POST(req: NextRequest) {
  // Spam protection (Phase 5 gap-fill): 5 registrations per IP per 10 minutes.
  if (!(await rateLimit(`register:${clientIp(req)}`, 5, 10 * 60 * 1000))) {
    return NextResponse.json({ error: 'Too many attempts. Please wait a few minutes and try again.' }, { status: 429 })
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Please fill in all fields correctly.' }, { status: 400 })
  }

  const parsed = registerSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Please fill in all fields correctly.' }, { status: 400 })
  }
  const { name, email, password } = parsed.data

  const [existing] = await db.select().from(users).where(eq(users.email, email))
  if (existing) {
    return NextResponse.json(
      { error: "That email's already registered. Try logging in instead." },
      { status: 409 }
    )
  }

  const passwordHash = await bcrypt.hash(password, 10)

  // Referral codes are unique; retry on the rare random collision instead
  // of letting the insert throw a raw 500.
  for (let attempt = 0; attempt < 5; attempt++) {
    const referralCode = generateReferralCode(name)
    try {
      await db.insert(users).values({ name, email, passwordHash, referralCode })
      return NextResponse.json({ success: true })
    } catch (err) {
      const message = err instanceof Error ? err.message : ''
      if (message.includes('UNIQUE') && message.includes('referral_code')) continue
      if (message.includes('UNIQUE') && message.includes('email')) {
        return NextResponse.json(
          { error: "That email's already registered. Try logging in instead." },
          { status: 409 }
        )
      }
      console.error('Registration failed', err)
      return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 })
    }
  }

  return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 })
}
