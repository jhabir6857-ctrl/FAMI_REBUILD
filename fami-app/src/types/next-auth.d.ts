import type { DefaultSession } from 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      phone: string | null
      address: string | null
      loyaltyPoints: number
      role: 'customer' | 'admin'
    } & DefaultSession['user']
  }

  interface User {
    id: string
    phone?: string | null
    address?: string | null
    loyaltyPoints?: number
    role?: 'customer' | 'admin'
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id?: string
    phone?: string | null
    address?: string | null
    loyaltyPoints?: number
    role?: 'customer' | 'admin'
  }
}
