import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { getUserWishlist, getCategories } from '@/lib/data'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { MobileBottomNav } from '@/components/layout/MobileBottomNav'
import { ProductCard } from '@/components/shop/ProductCard'
import { EmptyState } from '@/components/ui/EmptyState'

export default async function WishlistPage() {
  const session = await auth()
  if (!session?.user) redirect('/login')

  const userId = Number(session.user.id)
  const [wishlistItems, categories] = await Promise.all([
    getUserWishlist(userId),
    getCategories(),
    ])

  return (
    <>
      <Header categories={categories} isLoggedIn />
      <main className="container-fami py-8 md:py-12">
        <h1 className="font-display text-3xl md:text-4xl font-medium text-[var(--color-ink-plum)] mb-8">
          Wishlist <span className="font-ui text-xl text-[var(--color-text-muted)] font-normal">({wishlistItems.length})</span>
        </h1>
        {wishlistItems.length === 0 ? (
          <div className="py-10 md:py-20 flex justify-center">
            <div className="w-full max-w-md">
              <EmptyState type="wishlist" />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-8">
            {wishlistItems.map(item => <ProductCard key={item.id} product={item.product} />)}
          </div>
        )}
      </main>
      <Footer />
      <MobileBottomNav isLoggedIn />
    </>
  )
}

