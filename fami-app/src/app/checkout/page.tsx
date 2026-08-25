import { auth } from '@/lib/auth'
import { getCategories, getStores } from '@/lib/data'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { MobileBottomNav } from '@/components/layout/MobileBottomNav'
import { CheckoutClient } from './CheckoutClient'

export const metadata = { title: 'Checkout' }

export default async function CheckoutPage() {
  const [categories, stores, session] = await Promise.all([
    getCategories(),
    getStores(),
    auth(),
  ])
  const isLoggedIn = Boolean(session?.user)

  return (
    <>
      <Header categories={categories} isLoggedIn={isLoggedIn} />
      <CheckoutClient />
      <Footer stores={stores} />
      <MobileBottomNav isLoggedIn={isLoggedIn} />
    </>
  )
}
