import Link from 'next/link'
import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { getUserWishlist, getCategories, getStores } from '@/lib/data'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { MobileBottomNav } from '@/components/layout/MobileBottomNav'
import { ProductCard } from '@/components/shop/ProductCard'

export default async function WishlistPage() {
  const session = await auth()
  if (!session?.user) redirect('/login')

  const userId = Number(session.user.id)
  const [wishlistItems, categories, stores] = await Promise.all([
    getUserWishlist(userId),
    getCategories(),
    getStores(),
  ])

  return (
    <>
      <Header categories={categories} isLoggedIn />
      <main className="container-fami py-8 md:py-12">
        <h1 className="font-display text-3xl md:text-4xl font-medium text-[var(--color-ink-plum)] mb-8">
          Wishlist <span className="font-ui text-xl text-[var(--color-text-muted)] font-normal">({wishlistItems.length})</span>
        </h1>
        {wishlistItems.length === 0 ? (
          <div className="py-20 text-center">
            <p className="font-editorial text-xl text-[var(--color-text-muted)] mb-4">Your wishlist is empty</p>
            <Link href="/shop" className="font-ui text-sm text-[var(--color-rose-gold)] hover:underline">Explore products and save your favourites →</Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-8">
            {wishlistItems.map(item => <ProductCard key={item.id} product={item.product} />)}
          </div>
        )}
      </main>
      <Footer stores={stores} />
      <MobileBottomNav isLoggedIn />
    </>
  )
}
