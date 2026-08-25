import type { Metadata } from 'next'
import { CartProvider } from '@/context/CartContext'
import { Analytics } from '@/components/layout/Analytics'
import './globals.css'

const BASE = process.env.NEXTAUTH_URL ?? 'https://famibd.shop'

export const metadata: Metadata = {
  metadataBase: new URL(BASE),
  title: {
    default: 'FaMi — Jewellery, bags, dresses & skincare',
    template: '%s · FaMi',
  },
  description:
    'Curated jewellery, bags, dresses and skincare — quality that outlasts trends. Shop online or visit our stores in Dhaka.',
  keywords: ['jewellery', 'bags', 'dresses', 'skincare', 'Dhaka', 'Bangladesh', 'fashion', 'FaMi'],
  openGraph: {
    type: 'website',
    siteName: 'FaMi',
    locale: 'en_BD',
    url: BASE,
    title: 'FaMi — Jewellery, bags, dresses & skincare',
    description:
      'Curated jewellery, bags, dresses and skincare — quality that outlasts trends.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FaMi — Jewellery, bags, dresses & skincare',
    description: 'Curated jewellery, bags, dresses and skincare — quality that outlasts trends.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="font-ui antialiased">
        <CartProvider>{children}</CartProvider>
        <Analytics />
      </body>
    </html>
  )
}
