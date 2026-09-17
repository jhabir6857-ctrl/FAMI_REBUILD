import { notFound } from 'next/navigation'
import Link from 'next/link'
import { MessageCircle } from 'lucide-react'
import { getProductBySlug, getRelatedProducts, getCategories } from '@/lib/data'
import { auth } from '@/lib/auth'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { MobileBottomNav } from '@/components/layout/MobileBottomNav'
import { ProductGallery } from '@/components/pdp/ProductGallery'
import { ProductCard } from '@/components/shop/ProductCard'
import { Badge } from '@/components/ui/Badge'
import { AddToCartButton } from '@/components/pdp/AddToCartButton'
import { StickyAddToCart } from '@/components/pdp/StickyAddToCart'
import { Accordion } from '@/components/ui/Accordion'
import { formatBDT, discountPercent } from '@/lib/currency'
import type { Metadata } from 'next'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const product = await getProductBySlug(slug)
  if (!product) return { title: 'Product not found' }
  return {
    title: product.name,
    description: product.description,
  }
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params
  const [product, categories, session] = await Promise.all([
    getProductBySlug(slug),
    getCategories(),
    auth(),
  ])

  if (!product) notFound()

  const related = await getRelatedProducts(product, 4)
  const isLoggedIn = Boolean(session?.user)
  const hasDiscount = product.compareAtPrice && product.compareAtPrice > product.price
  const discount = hasDiscount ? discountPercent(product.compareAtPrice!, product.price) : 0
  const whatsappNum = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '8801700000000'
  const whatsappMsg = encodeURIComponent(`Hi, I'd like to order: ${product.name} (${formatBDT(product.price)})\nhttps://fami.com/products/${product.slug}`)
  const whatsappUrl = `https://wa.me/${whatsappNum}?text=${whatsappMsg}`

  return (
    <>
      <Header categories={categories} isLoggedIn={isLoggedIn} />
      <main className="container-fami py-8 md:py-12">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 mb-6">
          <Link href="/shop" className="font-ui text-xs text-[var(--color-text-muted)] hover:text-[var(--color-ink-plum)] transition-micro">Shop</Link>
          <span className="text-[var(--color-border)]" aria-hidden="true">/</span>
          <Link href={`/shop/${product.categorySlug}`} className="font-ui text-xs text-[var(--color-text-muted)] hover:text-[var(--color-ink-plum)] transition-micro">{product.categoryName}</Link>
          <span className="text-[var(--color-border)]" aria-hidden="true">/</span>
          <span className="font-ui text-xs text-[var(--color-ink-plum)]" aria-current="page">{product.name}</span>
        </nav>

        {/* Main layout: gallery + info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-16">
          {/* Gallery — Phase 4: includes video support */}
          <ProductGallery product={product} />

          {/* Product info */}
          <div className="flex flex-col gap-5">
            {/* Category + badges */}
            <div className="flex items-center gap-2 flex-wrap">
              <Link href={`/shop/${product.categorySlug}`} className="font-ui text-xs uppercase tracking-wide text-[var(--color-text-muted)] hover:text-[var(--color-rose-gold)] transition-micro">
                {product.categoryName}
              </Link>
              {product.isNew && <Badge variant="new">New</Badge>}
              {hasDiscount && <Badge variant="sale">-{discount}%</Badge>}
            </div>

            {/* Name */}
            <h1 className="font-editorial text-2xl md:text-3xl font-medium text-[var(--color-ink-plum)] leading-snug">
              {product.name}
            </h1>

            {/* Price */}
            <div className="flex items-baseline gap-3">
              <span className="font-ui text-2xl font-medium text-[var(--color-ink-plum)]">
                {formatBDT(product.price)}
              </span>
              {hasDiscount && (
                <span className="font-ui text-base text-[var(--color-text-muted)] line-through">
                  {formatBDT(product.compareAtPrice!)}
                </span>
              )}
            </div>

            {/* Stock status */}
            <div>
              {product.stock === 0 ? (
                <p className="font-ui text-sm text-[var(--color-terracotta)] font-medium">Out of stock</p>
              ) : product.stock <= 5 ? (
                <p className="font-ui text-sm text-[var(--color-terracotta)]">Only {product.stock} left in stock</p>
              ) : (
                <p className="font-ui text-sm text-[var(--color-emerald)]">In stock</p>
              )}
            </div>

            {/* Details Accordion */}
            <div className="mt-2">
              <Accordion 
                items={[
                  {
                    id: 'desc',
                    title: 'Description',
                    content: <p>{product.description}</p>
                  },
                  {
                    id: 'shipping',
                    title: 'Delivery & Returns',
                    content: (
                      <>
                        <p><strong>Dhaka Delivery:</strong> Same-day delivery for orders placed before 2 PM. Free on orders over {formatBDT(5000)}.</p>
                        <p><strong>Outside Dhaka:</strong> 2-3 business days via premium courier.</p>
                        <p><strong>Returns:</strong> Complimentary returns within 7 days. Items must be unworn and in original packaging.</p>
                      </>
                    )
                  },
                  {
                    id: 'care',
                    title: 'Care Instructions',
                    content: <p>To maintain the pristine condition of your FaMi piece, avoid direct contact with perfumes, lotions, and harsh chemicals. Store in the provided dust bag when not in use.</p>
                  }
                ]} 
              />
            </div>

            {/* Add to cart + WhatsApp — two CTAs side by side */}
            <div className="flex flex-col gap-3" id="main-add-to-cart">
              <AddToCartButton product={product} />
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Order ${product.name} via WhatsApp`}
                className="inline-flex items-center justify-center gap-2 h-11 px-6 border border-[var(--color-whatsapp)] text-[var(--color-whatsapp)] font-ui text-sm font-medium rounded-[var(--radius-md)] hover:bg-[var(--color-whatsapp)] hover:text-white transition-micro press-active"
              >
                <MessageCircle size={18} aria-hidden="true" />
                Order via WhatsApp
              </a>
            </div>

            {/* Trust micro-copy */}
            <p className="font-ui text-xs text-[var(--color-text-muted)]">
              Free delivery in Dhaka on orders over {formatBDT(5000)} · Cash on delivery available
            </p>
          </div>
        </div>

        {/* Related products */}
        {related.length > 0 && (
          <section className="mt-16" aria-labelledby="related-heading">
            <hr className="divider-gold mb-10" />
            <h2 id="related-heading" className="font-display text-2xl md:text-3xl font-medium text-[var(--color-ink-plum)] mb-8">
              You may also like
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-8">
              {related.map(p => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}
      </main>
      <Footer />
      <MobileBottomNav isLoggedIn={isLoggedIn} />
      <StickyAddToCart product={product} />
    </>
  )
}
