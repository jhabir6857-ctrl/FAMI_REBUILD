import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'

// Next.js 16 uses proxy.ts instead of middleware.ts.
// This handles both /admin protection and /account /wishlist /loyalty auth guards.
export default auth(req => {
  const { pathname } = req.nextUrl
  const session = req.auth

  // Admin routes — must be logged in as admin
  if (pathname.startsWith('/admin')) {
    const role = session?.user?.role
    if (role !== 'admin') {
      const destination = session?.user
        ? '/'
        : `/login?callbackUrl=${encodeURIComponent(pathname)}`
      return NextResponse.redirect(new URL(destination, req.url))
    }
  }

  // Auth-required routes — must be logged in (any role)
  const PROTECTED = ['/account', '/wishlist', '/loyalty']
  if (PROTECTED.some(r => pathname.startsWith(r)) && !session?.user) {
    return NextResponse.redirect(new URL(`/login?callbackUrl=${encodeURIComponent(pathname)}`, req.url))
  }

  return NextResponse.next()
})

export const config = {
  // Skip static files, API routes, Next internals.
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|fonts|images).*)'],
}
