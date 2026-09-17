import { auth } from '@/lib/auth'
import { getCategories } from '@/lib/data'
import { db } from '@/lib/db'
import { settings } from '@/lib/db/schema'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { MobileBottomNav } from '@/components/layout/MobileBottomNav'
import { CheckoutClient } from './CheckoutClient'

export const metadata = { title: 'Checkout' }

export default async function CheckoutPage() {
  const [categories, session, currentSettingsRows] = await Promise.all([
    getCategories(),
    auth(),
    db.select().from(settings).limit(1)
  ])
  const isLoggedIn = Boolean(session?.user)

  const storeSettings = currentSettingsRows[0] || {
    deliveryChargeInside: 80,
    deliveryChargeOutside: 150,
    freeShippingThreshold: 5000,
  }

  return (
    <>
      <Header categories={categories} isLoggedIn={isLoggedIn} />
      <CheckoutClient settings={storeSettings} />
      <Footer />
      <MobileBottomNav isLoggedIn={isLoggedIn} />
    </>
  )
}

