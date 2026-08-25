import { Suspense } from 'react'
import { getProducts, getCategories, getStores } from '@/lib/data'
import { auth } from '@/lib/auth'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { MobileBottomNav } from '@/components/layout/MobileBottomNav'
import { ProductCard } from '@/components/shop/ProductCard'
import { SkeletonGrid } from '@/components/ui/SkeletonCard'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Shop' }

export default async function ShopPage() {
  const [products, categories, stores, session] = await Promise.all([
    getProducts(),
    getCategories(),
    getStores(),
    auth(),
  ])
  const isLoggedIn = Boolean(session?.user)

  return (
    <>
      <Header categories={categories} isLoggedIn={isLoggedIn} />
      <main className="container-fami py-10">
        <div className="mb-8">
          <h1 className="font-display text-3xl md:text-4xl font-medium text-[var(--color-ink-plum)]">All products</h1>
          <p className="font-ui text-sm text-[var(--color-text-muted)] mt-2">{products.length} items</p>
        </div>
        <Suspense fallback={<SkeletonGrid count={12} />}>
          {products.length === 0 ? (
            <div className="py-20 text-center">
              <p className="font-editorial text-xl text-[var(--color-text-muted)]">No products yet.</p>
              <p className="font-ui text-sm text-[var(--color-text-muted)] mt-2">Check back soon — new pieces are added regularly.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-8">
              {products.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          )}
        </Suspense>
      </main>
      <Footer stores={stores} />
      <MobileBottomNav isLoggedIn={isLoggedIn} />
    </>
  )
}
