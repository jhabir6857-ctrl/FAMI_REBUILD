import { auth } from '@/lib/auth'
import { getCategories, getStores } from '@/lib/data'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { MobileBottomNav } from '@/components/layout/MobileBottomNav'
import { CartClient } from './CartClient'

export const metadata = { title: 'Cart' }

export default async function CartPage() {
  const [categories, stores, session] = await Promise.all([
    getCategories(),
    getStores(),
    auth(),
  ])
  const isLoggedIn = Boolean(session?.user)

  return (
    <>
      <Header categories={categories} isLoggedIn={isLoggedIn} />
      <CartClient />
      <Footer stores={stores} />
      <MobileBottomNav isLoggedIn={isLoggedIn} />
    </>
  )
}
