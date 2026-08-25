import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { users } from '@/lib/db/schema'

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: 'jwt' },
  pages: { signIn: '/login' },
  providers: [
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
    // Runs on sign-in and whenever the session is read; keep it cheap.
    jwt({ token, user }) {
      if (user) {
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
