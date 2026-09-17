import type { Metadata } from 'next'
import { CartProvider } from '@/context/CartContext'
import { WishlistProvider } from '@/context/WishlistContext'
import { CartDrawer } from '@/components/cart/CartDrawer'
import { ToastProvider } from '@/context/ToastContext'
import { Analytics } from '@/components/layout/Analytics'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { wishlist } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { ChatBubble } from '@/components/ui/ChatBubble'
import './globals.css'

const BASE = process.env.NEXTAUTH_URL ?? 'https://famibd.shop'

export const metadata: Metadata = {
  metadataBase: new URL(BASE),
  title: {
    default: 'FaMi – Jewellery, bags, dresses & skincare',
    template: '%s | FaMi',
  },
  description:
    'Curated jewellery, bags, dresses and skincare – quality that outlasts trends. Shop online or visit our stores in Dhaka.',
  keywords: ['jewellery', 'bags', 'dresses', 'skincare', 'Dhaka', 'Bangladesh', 'fashion', 'FaMi'],
  openGraph: {
    type: 'website',
    siteName: 'FaMi',
    locale: 'en_BD',
    url: BASE,
    title: 'FaMi – Jewellery, bags, dresses & skincare',
    description:
      'Curated jewellery, bags, dresses and skincare – quality that outlasts trends.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FaMi – Jewellery, bags, dresses & skincare',
    description: 'Curated jewellery, bags, dresses and skincare – quality that outlasts trends.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  let initialWishlistIds: number[] = []

  if (session?.user?.id) {
    const userId = parseInt(session.user.id, 10)
    if (!isNaN(userId)) {
      const results = await db.query.wishlist.findMany({
        where: eq(wishlist.userId, userId),
        columns: { productId: true },
      })
      initialWishlistIds = results.map(r => r.productId)
    }
  }

  return (
    <html lang="en">
      <body className="font-ui antialiased">
        <ToastProvider>
          <CartProvider>
            <WishlistProvider initialIds={initialWishlistIds}>
              {children}
              <CartDrawer />
              <ChatBubble />
            </WishlistProvider>
          </CartProvider>
        </ToastProvider>
        <Analytics />
      </body>
    </html>
  )
}
