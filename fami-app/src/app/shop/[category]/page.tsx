import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getProducts, getCategories, getCategoryBySlug } from '@/lib/data'
import { auth } from '@/lib/auth'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { MobileBottomNav } from '@/components/layout/MobileBottomNav'
import { ProductCard } from '@/components/shop/ProductCard'
import { ShopControls } from '@/components/shop/ShopControls'
import type { Metadata } from 'next'

interface Props { 
  params: Promise<{ category: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category: slug } = await params
  const cat = await getCategoryBySlug(slug)
  return { title: cat?.name ?? 'Category' }
}

export default async function CategoryPage(props: Props) {
  const { category: slug } = await props.params
  const searchParams = await props.searchParams;
  const sort = typeof searchParams.sort === 'string' ? searchParams.sort : undefined;
  const inStock = searchParams.inStock === 'true';

  const [cat, categories, products, session] = await Promise.all([
    getCategoryBySlug(slug),
    getCategories(),
    getProducts({ categorySlug: slug, sort, inStock }),
    auth(),
  ])

  if (!cat) notFound()
  const isLoggedIn = Boolean(session?.user)

  return (
    <>
      <Header categories={categories} isLoggedIn={isLoggedIn} />
      <main className="container-fami py-10">
        <ShopControls categories={categories} totalItems={products.length} currentCategory={cat.name} />
        <div className="mb-8 hidden">
          <h1 className="font-display text-3xl md:text-4xl font-medium text-[var(--color-ink-plum)]">{cat.name}</h1>
          {cat.description && <p className="font-ui text-sm text-[var(--color-text-muted)] mt-2">{cat.description}</p>}
          <p className="font-ui text-sm text-[var(--color-text-muted)] mt-1">{products.length} items</p>
        </div>
        {products.length === 0 ? (
          <div className="py-20 text-center">
            <p className="font-editorial text-xl text-[var(--color-text-muted)]">No products in this category yet.</p>
            <Link href="/shop" className="font-ui text-sm text-[var(--color-rose-gold)] hover:underline mt-4 inline-block">Browse all products →</Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-8">
            {products.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
      </main>
      <Footer />
      <MobileBottomNav isLoggedIn={isLoggedIn} />
    </>
  )
}
