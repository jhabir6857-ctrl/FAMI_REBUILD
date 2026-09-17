import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import Google from 'next-auth/providers/google'
import bcrypt from 'bcryptjs'
import { eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { users } from '@/lib/db/schema'

function generateReferralCode(name: string): string {
  const prefix = name.slice(0, 4).toUpperCase().replace(/[^A-Z]/g, 'X').padEnd(4, 'X')
  const suffix = Math.random().toString(36).slice(2, 6).toUpperCase()
  return `FAMI-${prefix}${suffix}`
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: 'jwt' },
  pages: { signIn: '/login' },
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    Credentials({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const email = typeof credentials?.email === 'string' ? credentials.email : null
        const password = typeof credentials?.password === 'string' ? credentials.password : null
        if (!email || !password) return null

        const [user] = await db.select().from(users).where(eq(users.email, email))
        if (!user) return null

        // If it's a Google user trying to log in with password, bcrypt compare will fail
        // because we saved 'GOOGLE_OAUTH_USER' instead of a real hash.
        if (user.passwordHash === 'GOOGLE_OAUTH_USER') return null

        const valid = await bcrypt.compare(password, user.passwordHash)
        if (!valid) return null

        return {
          id: String(user.id),
          name: user.name,
          email: user.email,
          phone: user.phone,
          address: user.address,
          loyaltyPoints: user.loyaltyPoints,
          role: user.role,
        }
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === 'google' && user.email) {
        // Auto-register Google users if they don't exist in our custom DB
        const existingUsers = await db.select().from(users).where(eq(users.email, user.email))
        
        if (existingUsers.length === 0) {
          const name = user.name || 'FaMi User'
          const role = user.email === 'farhanahmed20020@gmail.com' ? 'admin' : 'customer'
          
          let referralCode = ''
          for (let attempt = 0; attempt < 5; attempt++) {
            referralCode = generateReferralCode(name)
            try {
              await db.insert(users).values({ 
                name, 
                email: user.email, 
                passwordHash: 'GOOGLE_OAUTH_USER', 
                referralCode, 
                role 
              })
              break
            } catch (err) {
              const msg = err instanceof Error ? err.message : ''
              if (msg.includes('UNIQUE') && msg.includes('referral_code')) continue
              throw err
            }
          }
        }
        return true
      }
      return true
    },
    async jwt({ token, user, account }) {
      // Upon sign-in, attach DB data
      if (account && user?.email) {
        // We do a DB lookup here once to get their actual database ID instead of the Google ID
        const dbUsers = await db.select().from(users).where(eq(users.email, user.email))
        if (dbUsers.length > 0) {
          const dbUser = dbUsers[0]
          token.id = String(dbUser.id)
          token.phone = dbUser.phone ?? null
          token.address = dbUser.address ?? null
          token.loyaltyPoints = dbUser.loyaltyPoints ?? 0
          token.role = dbUser.role ?? 'customer'
        }
      } else if (user) {
        // Credentials provider fallback
        token.id = user.id
        token.phone = user.phone ?? null
        token.address = user.address ?? null
        token.loyaltyPoints = user.loyaltyPoints ?? 0
        token.role = user.role ?? 'customer'
      }
      return token
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.phone = (token.phone as string | null) ?? null
        session.user.address = (token.address as string | null) ?? null
        session.user.loyaltyPoints = (token.loyaltyPoints as number) ?? 0
        session.user.role = (token.role as 'customer' | 'admin') ?? 'customer'
      }
      return session
    },
  },
})

export const { GET, POST } = handlers
