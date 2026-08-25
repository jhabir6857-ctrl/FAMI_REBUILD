$ErrorActionPreference = "Stop"

function Ensure-Dir {
    param([string]$path)
    if (!(Test-Path $path)) {
        New-Item -ItemType Directory -Force -Path $path | Out-Null
    }
}

Ensure-Dir "src/app/api/auth/[...nextauth]"
Ensure-Dir "src/app/api/search"
Ensure-Dir "src/app/api/wishlist"
Ensure-Dir "src/app/api/checkout"
Ensure-Dir "src/app/api/auth/register"
Ensure-Dir "src/app/products/[slug]"
Ensure-Dir "src/components/pdp"
Ensure-Dir "src/app/shop/[category]"
Ensure-Dir "src/app/cart"
Ensure-Dir "src/app/checkout/success"
Ensure-Dir "src/app/login"
Ensure-Dir "src/app/register"
Ensure-Dir "src/app/blog/[slug]"
Ensure-Dir "src/app/account"
Ensure-Dir "src/components/account"
Ensure-Dir "src/app/wishlist"

Set-Content -Path "src/app/api/auth/[...nextauth]/route.ts" -Encoding UTF8 -Value @'
export { GET, POST } from '@/lib/auth'
'@

Set-Content -Path "src/app/api/search/route.ts" -Encoding UTF8 -Value @'
import { NextRequest, NextResponse } from 'next/server'
import { searchProducts } from '@/lib/data'

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('q') ?? ''
  const limit = Number(req.nextUrl.searchParams.get('limit') ?? '5')
  if (!q.trim()) return NextResponse.json({ products: [] })
  const products = await searchProducts(q, Math.min(limit, 10))
  return NextResponse.json({ products })
}
'@

Set-Content -Path "src/app/api/wishlist/route.ts" -Encoding UTF8 -Value @'
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { addToWishlist, removeFromWishlist } from '@/lib/data'
import { z } from 'zod'

const body = z.object({ productId: z.number().int().positive() })

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  const parsed = body.safeParse(await req.json())
  if (!parsed.success) return NextResponse.json({ error: 'Invalid body' }, { status: 400 })
  await addToWishlist(Number(session.user.id), parsed.data.productId)
  return NextResponse.json({ success: true })
}

export async function DELETE(req: NextRequest) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  const parsed = body.safeParse(await req.json())
  if (!parsed.success) return NextResponse.json({ error: 'Invalid body' }, { status: 400 })
  await removeFromWishlist(Number(session.user.id), parsed.data.productId)
  return NextResponse.json({ success: true })
}
'@

Set-Content -Path "src/app/api/checkout/route.ts" -Encoding UTF8 -Value @'
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { orders, orderItems, users, products } from '@/lib/db/schema'
import { eq, inArray } from 'drizzle-orm'
import { z } from 'zod'

const checkoutSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(10),
  address: z.string().min(5),
  city: z.string().min(2),
  paymentMethod: z.enum(['cod', 'whatsapp', 'bkash', 'nagad']),
  notes: z.string().optional(),
  items: z.array(z.object({
    productId: z.number().int().positive(),
    quantity: z.number().int().min(1).max(99),
  })).min(1),
})

export async function POST(req: NextRequest) {
  const parsed = checkoutSchema.safeParse(await req.json())
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid order data', details: parsed.error.flatten() }, { status: 400 })
  }

  const session = await auth()
  const userId = session?.user?.id ? Number(session.user.id) : null

  const { name, email, phone, address, city, paymentMethod, notes, items } = parsed.data

  // Fetch real product prices (never trust client-side prices)
  const productIds = items.map(i => i.productId)
  const dbProducts = await db.select().from(products).where(inArray(products.id, productIds))
  const productMap = new Map(dbProducts.map(p => [p.id, p]))

  // Calculate total from DB prices
  let subtotal = 0
  const lineItems = []
  for (const item of items) {
    const product = productMap.get(item.productId)
    if (!product) return NextResponse.json({ error: `Product ${item.productId} not found` }, { status: 400 })
    if (product.stock < item.quantity) {
      return NextResponse.json({ error: `Insufficient stock for ${product.name}` }, { status: 400 })
    }
    const lineTotal = product.price * item.quantity
    subtotal += lineTotal
    lineItems.push({ product, quantity: item.quantity, price: product.price })
  }

  // Flat shipping: free over ৳5000
  const shipping = subtotal >= 5000 ? 0 : 120
  const total = subtotal + shipping
  const pointsEarned = Math.floor(total / 100) // 1 point per ৳100

  const shippingAddress = `${address}, ${city}`

  // Insert order
  const [order] = await db.insert(orders).values({
    userId,
    paymentMethod,
    subtotal,
    total,
    shippingAddress,
    phone,
    email,
    name,
    notes: notes ?? null,
    pointsEarned,
  }).returning()

  if (!order) return NextResponse.json({ error: 'Failed to create order' }, { status: 500 })

  // Insert order items
  await db.insert(orderItems).values(
    lineItems.map(({ product, quantity, price }) => ({
      orderId: order.id,
      productId: product.id,
      productName: product.name,
      productImage: JSON.parse(product.imageUrls as string)[0] ?? '',
      price,
      quantity,
    }))
  )

  // Decrement stock
  for (const { product, quantity } of lineItems) {
    await db.update(products)
      .set({ stock: product.stock - quantity })
      .where(eq(products.id, product.id))
  }

  // Award loyalty points to logged-in user
  if (userId && pointsEarned > 0) {
    await db.update(users)
      .set({ loyaltyPoints: session!.user.loyaltyPoints + pointsEarned })
      .where(eq(users.id, userId))
  }

  return NextResponse.json({ success: true, orderId: order.id, total, pointsEarned })
}
'@

Set-Content -Path "src/app/page.tsx" -Encoding UTF8 -Value @'
import Link from 'next/link'
import Image from 'next/image'
import { ShieldCheck, Truck, MessageCircle, Gift } from 'lucide-react'
import { getProducts, getCategories, getBlogPosts, getStores } from '@/lib/data'
import { auth } from '@/lib/auth'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { MobileBottomNav } from '@/components/layout/MobileBottomNav'
import { ProductCard } from '@/components/shop/ProductCard'
import { formatBDT } from '@/lib/currency'

export default async function HomePage() {
  const [session, categories, featured, newArrivals, blogs, stores] = await Promise.all([
    auth(),
    getCategories(),
    getProducts({ featured: true, limit: 8 }),
    getProducts({ isNew: true, limit: 4 }),
    getBlogPosts(3),
    getStores(),
  ])

  const isLoggedIn = Boolean(session?.user)

  const trustBadges = [
    { icon: ShieldCheck, label: '100% Authentic', desc: 'Every product verified' },
    { icon: Truck, label: 'Dhaka delivery', desc: 'Same-day for orders before 2pm' },
    { icon: MessageCircle, label: 'WhatsApp support', desc: 'Real humans, real answers' },
    { icon: Gift, label: 'Gift wrapping', desc: 'Complimentary on request' },
  ]

  return (
    <>
      <Header categories={categories} isLoggedIn={isLoggedIn} />
      <main>
        {/* ── Hero ── */}
        <section className="relative min-h-[80vh] md:min-h-screen flex items-end bg-[var(--color-ink-plum)] overflow-hidden" aria-label="Hero">
          {/* Background texture */}
          <div className="absolute inset-0 opacity-20 bg-gradient-to-br from-[var(--color-rose-gold)] via-transparent to-[var(--color-ink-plum)]" aria-hidden="true" />
          <div className="container-fami relative z-10 pb-16 md:pb-24">
            <p className="hallmark-stamp text-white/60 border-white/30 mb-4">New collection 2026</p>
            <h1 className="font-display text-5xl md:text-7xl font-medium text-white leading-[1.1] max-w-2xl mb-6">
              Curated for the
              <br />
              <em className="italic not-italic text-[var(--color-rose-gold-light)]">discerning</em> shopper
            </h1>
            <p className="font-ui text-base text-white/70 max-w-md mb-8">
              Fashion, jewellery, bags and skincare — each piece chosen for quality that outlasts trends.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/shop"
                className="inline-flex items-center h-12 px-8 bg-[var(--color-rose-gold)] text-white font-ui text-sm font-medium rounded-[var(--radius-md)] hover:bg-[var(--color-rose-gold-dark)] transition-micro press-active"
              >
                Shop the collection
              </Link>
              <Link
                href="/blog"
                className="inline-flex items-center h-12 px-8 border border-white/40 text-white font-ui text-sm font-medium rounded-[var(--radius-md)] hover:bg-white/10 transition-micro press-active"
              >
                Read the journal
              </Link>
            </div>
          </div>
        </section>

        {/* ── Trust badges — above fold on mobile ── */}
        <section aria-label="Why shop with FaMi" className="bg-[var(--color-parchment-100)] border-b border-[var(--color-border-muted)]">
          <div className="container-fami py-8">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {trustBadges.map(({ icon: Icon, label, desc }) => (
                <div key={label} className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-0.5">
                    <Icon size={20} className="text-[var(--color-rose-gold)]" aria-hidden="true" />
                  </div>
                  <div>
                    <p className="font-ui text-sm font-medium text-[var(--color-ink-plum)]">{label}</p>
                    <p className="font-ui text-xs text-[var(--color-text-muted)] mt-0.5">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Category shelf ── */}
        <section className="section-gap" aria-labelledby="categories-heading">
          <div className="container-fami">
            <h2 id="categories-heading" className="font-display text-3xl md:text-4xl font-medium text-[var(--color-ink-plum)] mb-8">
              Shop by category
            </h2>
            <div className="grid grid-cols-3 md:grid-cols-5 gap-3 md:gap-4">
              {categories.slice(0, 9).map(cat => (
                <Link
                  key={cat.id}
                  href={`/shop/${cat.slug}`}
                  className="group flex flex-col items-center gap-2 text-center"
                >
                  <div className="relative w-full aspect-square rounded-full overflow-hidden bg-[var(--color-parchment-100)] border border-[var(--color-border-muted)] group-hover:border-[var(--color-rose-gold)] transition-micro">
                    {cat.imageUrl && (
                      <Image
                        src={cat.imageUrl}
                        alt={cat.name}
                        fill
                        sizes="(max-width: 640px) 33vw, 20vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    )}
                  </div>
                  <span className="font-ui text-xs font-medium text-[var(--color-ink-plum)] group-hover:text-[var(--color-rose-gold)] transition-micro">
                    {cat.name}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <hr className="divider-gold container-fami" />

        {/* ── Featured products ── */}
        <section className="section-gap" aria-labelledby="featured-heading">
          <div className="container-fami">
            <div className="flex items-end justify-between mb-8">
              <h2 id="featured-heading" className="font-display text-3xl md:text-4xl font-medium text-[var(--color-ink-plum)]">
                Featured pieces
              </h2>
              <Link href="/shop" className="font-ui text-sm text-[var(--color-rose-gold)] hover:underline hidden md:block">
                View all →
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-8">
              {featured.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
            <div className="mt-8 text-center md:hidden">
              <Link href="/shop" className="font-ui text-sm text-[var(--color-rose-gold)] hover:underline">
                View all products →
              </Link>
            </div>
          </div>
        </section>

        <hr className="divider-gold container-fami" />

        {/* ── Brand story ── */}
        <section className="section-gap bg-[var(--color-parchment-100)]" aria-labelledby="brand-story-heading">
          <div className="container-fami max-w-3xl">
            <p className="hallmark-stamp mb-4">Our story</p>
            <h2 id="brand-story-heading" className="font-display text-3xl md:text-4xl font-medium text-[var(--color-ink-plum)] mb-6">
              Quiet luxury,
              <br />every day
            </h2>
            <p className="font-ui text-base text-[var(--color-text-muted)] leading-relaxed mb-4">
              FaMi was founded on a simple belief: that beautiful things should be accessible to everyone who appreciates them. We source each piece with intention — from jewellery ateliers, bag workshops, and skincare labs that share our commitment to craft over convenience.
            </p>
            <p className="font-ui text-base text-[var(--color-text-muted)] leading-relaxed mb-8">
              Every product we carry passes a quality review before it earns a place in our collection. We think that matters.
            </p>
            <Link href="/about" className="font-ui text-sm font-medium text-[var(--color-rose-gold)] hover:underline">
              Read our full story →
            </Link>
          </div>
        </section>

        {/* ── New arrivals ── */}
        {newArrivals.length > 0 && (
          <section className="section-gap" aria-labelledby="new-arrivals-heading">
            <div className="container-fami">
              <h2 id="new-arrivals-heading" className="font-display text-3xl md:text-4xl font-medium text-[var(--color-ink-plum)] mb-8">
                New arrivals
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-8">
                {newArrivals.map(product => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ── Journal preview ── */}
        {blogs.length > 0 && (
          <section className="section-gap bg-[var(--color-parchment-100)]" aria-labelledby="journal-heading">
            <div className="container-fami">
              <div className="flex items-end justify-between mb-8">
                <h2 id="journal-heading" className="font-display text-3xl md:text-4xl font-medium text-[var(--color-ink-plum)]">
                  From the journal
                </h2>
                <Link href="/blog" className="font-ui text-sm text-[var(--color-rose-gold)] hover:underline hidden md:block">
                  All articles →
                </Link>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {blogs.map(post => (
                  <Link key={post.id} href={`/blog/${post.slug}`} className="group flex flex-col gap-3">
                    {post.imageUrl && (
                      <div className="relative aspect-[16/9] w-full overflow-hidden rounded-[var(--radius-sm)] bg-[var(--color-parchment-200)]">
                        <Image
                          src={post.imageUrl}
                          alt={post.title}
                          fill
                          sizes="(max-width: 768px) 100vw, 33vw"
                          className="object-cover group-hover:scale-[1.03] transition-transform duration-300"
                        />
                      </div>
                    )}
                    <div className="flex flex-col gap-1">
                      <div className="flex gap-1.5 flex-wrap">
                        {post.tags.slice(0, 2).map(tag => (
                          <span key={tag} className="font-ui text-xs text-[var(--color-terracotta)] uppercase tracking-wide">{tag}</span>
                        ))}
                      </div>
                      <h3 className="font-editorial text-lg text-[var(--color-ink-plum)] leading-snug group-hover:text-[var(--color-rose-gold)] transition-micro">{post.title}</h3>
                      <p className="font-ui text-sm text-[var(--color-text-muted)] line-clamp-2">{post.excerpt}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}
      </main>
      <Footer stores={stores} />
      <MobileBottomNav isLoggedIn={isLoggedIn} />
    </>
  )
}
'@

Set-Content -Path "src/app/products/[slug]/page.tsx" -Encoding UTF8 -Value @'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { MessageCircle } from 'lucide-react'
import { getProductBySlug, getRelatedProducts, getCategories, getStores } from '@/lib/data'
import { auth } from '@/lib/auth'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { MobileBottomNav } from '@/components/layout/MobileBottomNav'
import { ProductGallery } from '@/components/pdp/ProductGallery'
import { ProductCard } from '@/components/shop/ProductCard'
import { Badge } from '@/components/ui/Badge'
import { AddToCartButton } from '@/components/pdp/AddToCartButton'
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
  const [product, categories, stores, session] = await Promise.all([
    getProductBySlug(slug),
    getCategories(),
    getStores(),
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

            {/* Description */}
            <p className="font-ui text-sm text-[var(--color-text-muted)] leading-relaxed">
              {product.description}
            </p>

            <hr className="divider-gold" />

            {/* Add to cart + WhatsApp — two CTAs side by side */}
            <div className="flex flex-col gap-3">
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
      <Footer stores={stores} />
      <MobileBottomNav isLoggedIn={isLoggedIn} />
    </>
  )
}
'@

Set-Content -Path "src/components/pdp/AddToCartButton.tsx" -Encoding UTF8 -Value @'
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Toast } from '@/components/ui/Toast'
import { useCart } from '@/context/CartContext'
import type { Product } from '@/types'

export function AddToCartButton({ product }: { product: Product }) {
  const { addItem } = useCart()
  const [showToast, setShowToast] = useState(false)

  function handleAdd() {
    if (product.stock === 0) return
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      imageUrl: product.imageUrls[0] ?? '',
      slug: product.slug,
      stock: product.stock,
    })
    setShowToast(true)
  }

  return (
    <>
      <Button
        variant="primary"
        size="lg"
        disabled={product.stock === 0}
        onClick={handleAdd}
        className="w-full"
      >
        {product.stock === 0 ? 'Out of stock' : 'Add to cart'}
      </Button>
      {showToast && (
        <Toast
          message={`${product.name} added to cart`}
          type="success"
          onDismiss={() => setShowToast(false)}
        />
      )}
    </>
  )
}
'@

Set-Content -Path "src/app/shop/page.tsx" -Encoding UTF8 -Value @'
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
'@

Set-Content -Path "src/app/shop/[category]/page.tsx" -Encoding UTF8 -Value @'
import { notFound } from 'next/navigation'
import { getProducts, getCategories, getCategoryBySlug, getStores } from '@/lib/data'
import { auth } from '@/lib/auth'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { MobileBottomNav } from '@/components/layout/MobileBottomNav'
import { ProductCard } from '@/components/shop/ProductCard'
import type { Metadata } from 'next'

interface Props { params: Promise<{ category: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category: slug } = await params
  const cat = await getCategoryBySlug(slug)
  return { title: cat?.name ?? 'Category' }
}

export default async function CategoryPage({ params }: Props) {
  const { category: slug } = await params
  const [cat, categories, products, stores, session] = await Promise.all([
    getCategoryBySlug(slug),
    getCategories(),
    getProducts({ categorySlug: slug }),
    getStores(),
    auth(),
  ])

  if (!cat) notFound()
  const isLoggedIn = Boolean(session?.user)

  return (
    <>
      <Header categories={categories} isLoggedIn={isLoggedIn} />
      <main className="container-fami py-10">
        <div className="mb-8">
          <h1 className="font-display text-3xl md:text-4xl font-medium text-[var(--color-ink-plum)]">{cat.name}</h1>
          {cat.description && <p className="font-ui text-sm text-[var(--color-text-muted)] mt-2">{cat.description}</p>}
          <p className="font-ui text-sm text-[var(--color-text-muted)] mt-1">{products.length} items</p>
        </div>
        {products.length === 0 ? (
          <div className="py-20 text-center">
            <p className="font-editorial text-xl text-[var(--color-text-muted)]">No products in this category yet.</p>
            <a href="/shop" className="font-ui text-sm text-[var(--color-rose-gold)] hover:underline mt-4 inline-block">Browse all products →</a>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-8">
            {products.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
      </main>
      <Footer stores={stores} />
      <MobileBottomNav isLoggedIn={isLoggedIn} />
    </>
  )
}
'@

Set-Content -Path "src/app/cart/page.tsx" -Encoding UTF8 -Value @'
'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Trash2, Plus, Minus } from 'lucide-react'
import { useCart } from '@/context/CartContext'
import { Button } from '@/components/ui/Button'
import { formatBDT } from '@/lib/currency'

export default function CartPage() {
  const { items, removeItem, updateQuantity, totalItems, totalPrice } = useCart()
  const shipping = totalPrice >= 5000 ? 0 : 120
  const total = totalPrice + shipping

  if (items.length === 0) {
    return (
      <main className="container-fami py-20 text-center">
        <h1 className="font-display text-3xl font-medium text-[var(--color-ink-plum)] mb-4">Your cart</h1>
        <p className="font-ui text-base text-[var(--color-text-muted)] mb-8">Your cart is empty — add something beautiful.</p>
        <Link href="/shop">
          <Button variant="primary" size="md">Shop the collection</Button>
        </Link>
      </main>
    )
  }

  return (
    <main className="container-fami py-8 md:py-12">
      <h1 className="font-display text-3xl md:text-4xl font-medium text-[var(--color-ink-plum)] mb-8">
        Your cart <span className="text-[var(--color-text-muted)] text-xl font-ui font-normal">({totalItems})</span>
      </h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Line items */}
        <div className="lg:col-span-2 flex flex-col divide-y divide-[var(--color-border-muted)]">
          {items.map(item => (
            <div key={item.productId} className="flex gap-4 py-5">
              <Link href={`/products/${item.slug}`} className="flex-shrink-0">
                <div className="relative w-20 h-24 md:w-24 md:h-28 rounded-[var(--radius-sm)] overflow-hidden bg-[var(--color-parchment-100)]">
                  {item.imageUrl && (
                    <Image src={item.imageUrl} alt={item.name} fill className="object-cover" />
                  )}
                </div>
              </Link>
              <div className="flex-1 flex flex-col gap-2">
                <Link href={`/products/${item.slug}`} className="font-editorial text-base text-[var(--color-ink-plum)] hover:text-[var(--color-rose-gold)] transition-micro">
                  {item.name}
                </Link>
                <p className="font-ui text-sm font-medium text-[var(--color-ink-plum)]">{formatBDT(item.price)}</p>
                <div className="flex items-center gap-2 mt-auto">
                  <button
                    onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                    aria-label={`Decrease quantity of ${item.name}`}
                    className="touch-target w-8 h-8 flex items-center justify-center border border-[var(--color-border)] rounded-[var(--radius-sm)] hover:border-[var(--color-ink-plum)] transition-micro"
                  >
                    <Minus size={14} aria-hidden="true" />
                  </button>
                  <span className="font-ui text-sm w-6 text-center" aria-label={`Quantity: ${item.quantity}`}>{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                    aria-label={`Increase quantity of ${item.name}`}
                    disabled={item.quantity >= item.stock}
                    className="touch-target w-8 h-8 flex items-center justify-center border border-[var(--color-border)] rounded-[var(--radius-sm)] hover:border-[var(--color-ink-plum)] transition-micro disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <Plus size={14} aria-hidden="true" />
                  </button>
                  <button
                    onClick={() => removeItem(item.productId)}
                    aria-label={`Remove ${item.name} from cart`}
                    className="ml-auto touch-target text-[var(--color-text-muted)] hover:text-[var(--color-terracotta)] transition-micro"
                  >
                    <Trash2 size={16} aria-hidden="true" />
                  </button>
                </div>
              </div>
              <p className="font-ui text-sm font-medium text-[var(--color-ink-plum)] hidden md:block">
                {formatBDT(item.price * item.quantity)}
              </p>
            </div>
          ))}
        </div>

        {/* Order summary — sticky on desktop */}
        <div className="lg:sticky lg:top-24 h-fit">
          <div className="border border-[var(--color-border-muted)] rounded-[var(--radius-md)] p-6 flex flex-col gap-4">
            <h2 className="font-display text-xl font-medium text-[var(--color-ink-plum)]">Order summary</h2>
            <div className="flex flex-col gap-2 text-sm font-ui">
              <div className="flex justify-between">
                <span className="text-[var(--color-text-muted)]">Subtotal</span>
                <span className="text-[var(--color-ink-plum)]">{formatBDT(totalPrice)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--color-text-muted)]">Shipping</span>
                <span className="text-[var(--color-ink-plum)]">{shipping === 0 ? 'Free' : formatBDT(shipping)}</span>
              </div>
              {shipping > 0 && (
                <p className="text-xs text-[var(--color-text-muted)]">Free shipping on orders over {formatBDT(5000)}</p>
              )}
              <div className="h-px bg-[var(--color-border-muted)] my-1" />
              <div className="flex justify-between font-medium">
                <span className="text-[var(--color-ink-plum)]">Total</span>
                <span className="text-[var(--color-ink-plum)]">{formatBDT(total)}</span>
              </div>
            </div>
            <Link href="/checkout">
              <Button variant="primary" size="lg" className="w-full">Proceed to checkout</Button>
            </Link>
            <Link href="/shop" className="text-center font-ui text-sm text-[var(--color-text-muted)] hover:text-[var(--color-ink-plum)] transition-micro">
              Continue shopping
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}
'@

Set-Content -Path "src/app/checkout/page.tsx" -Encoding UTF8 -Value @'
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useCart } from '@/context/CartContext'
import { Button } from '@/components/ui/Button'
import { formatBDT } from '@/lib/currency'
import type { PaymentMethod } from '@/types'

const PAYMENT_OPTIONS: { value: PaymentMethod; label: string; hint: string }[] = [
  { value: 'cod', label: 'Cash on delivery', hint: 'Pay in cash when your order arrives.' },
  { value: 'bkash', label: 'bKash', hint: 'We will send you a bKash payment request after confirming.' },
  { value: 'nagad', label: 'Nagad', hint: 'We will send you a Nagad payment request after confirming.' },
  { value: 'whatsapp', label: 'WhatsApp confirmation', hint: 'Place the order here, then confirm payment via WhatsApp.' },
]

export default function CheckoutPage() {
  const { items, totalPrice, clearCart } = useCart()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cod')
  const [form, setForm] = useState({
    name: '', email: '', phone: '', address: '', city: '', notes: '',
  })

  const shipping = totalPrice >= 5000 ? 0 : 120
  const total = totalPrice + shipping

  // Pre-fill from session if logged in
  useEffect(() => {
    void fetch('/api/auth/session')
      .then(r => r.json())
      .then((session: { user?: { name?: string; email?: string; phone?: string; address?: string } } | null) => {
        if (session?.user) {
          setForm(f => ({
            ...f,
            name: f.name || session.user?.name || '',
            email: f.email || session.user?.email || '',
            phone: f.phone || session.user?.phone || '',
            address: f.address || session.user?.address || '',
          }))
        }
      })
      .catch(() => {/* silent */})
  }, [])

  function update(field: keyof typeof form, value: string) {
    setForm(f => ({ ...f, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const payload = {
      ...form,
      paymentMethod,
      items: items.map(i => ({ productId: i.productId, quantity: i.quantity })),
    }

    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json() as { success?: boolean; orderId?: number; error?: string }
      if (!res.ok || !data.success) {
        setError(data.error ?? 'Something went wrong. Please try again.')
        return
      }
      clearCart()
      void router.push(`/checkout/success?orderId=${data.orderId ?? ''}`)
    } catch {
      setError('Network error. Please check your connection and try again.')
    } finally {
      setLoading(false)
    }
  }

  if (items.length === 0) {
    return (
      <main className="container-fami py-20 text-center">
        <h1 className="font-display text-3xl font-medium text-[var(--color-ink-plum)] mb-4">Your cart is empty</h1>
        <a href="/shop" className="font-ui text-sm text-[var(--color-rose-gold)] hover:underline">Continue shopping →</a>
      </main>
    )
  }

  return (
    <main className="container-fami py-8 md:py-12">
      <h1 className="font-display text-3xl md:text-4xl font-medium text-[var(--color-ink-plum)] mb-8">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form */}
        <form onSubmit={e => void handleSubmit(e)} className="lg:col-span-2 flex flex-col gap-6" noValidate>

          {/* Contact */}
          <fieldset className="flex flex-col gap-4">
            <legend className="font-display text-xl font-medium text-[var(--color-ink-plum)] mb-2">Contact information</legend>

            <div className="flex flex-col gap-1">
              <label htmlFor="name" className="font-ui text-sm font-medium text-[var(--color-ink-plum)]">Full name <span aria-hidden>*</span></label>
              <input
                id="name" type="text" required
                value={form.name} onChange={e => update('name', e.target.value)}
                autoComplete="name"
                placeholder="Your full name"
                className="h-11 px-4 rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-white font-ui text-sm text-[var(--color-ink-plum)] placeholder-[var(--color-text-muted)] outline-none focus:border-[var(--color-rose-gold)] transition-micro"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label htmlFor="email" className="font-ui text-sm font-medium text-[var(--color-ink-plum)]">Email address <span aria-hidden>*</span></label>
                <input
                  id="email" type="email" required
                  value={form.email} onChange={e => update('email', e.target.value)}
                  autoComplete="email"
                  placeholder="you@example.com"
                  className="h-11 px-4 rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-white font-ui text-sm text-[var(--color-ink-plum)] placeholder-[var(--color-text-muted)] outline-none focus:border-[var(--color-rose-gold)] transition-micro"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label htmlFor="phone" className="font-ui text-sm font-medium text-[var(--color-ink-plum)]">Phone number <span aria-hidden>*</span></label>
                <input
                  id="phone" type="tel" required
                  value={form.phone} onChange={e => update('phone', e.target.value)}
                  autoComplete="tel"
                  placeholder="01XXXXXXXXX"
                  className="h-11 px-4 rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-white font-ui text-sm text-[var(--color-ink-plum)] placeholder-[var(--color-text-muted)] outline-none focus:border-[var(--color-rose-gold)] transition-micro"
                />
              </div>
            </div>
          </fieldset>

          {/* Shipping */}
          <fieldset className="flex flex-col gap-4">
            <legend className="font-display text-xl font-medium text-[var(--color-ink-plum)] mb-2">Delivery address</legend>

            <div className="flex flex-col gap-1">
              <label htmlFor="address" className="font-ui text-sm font-medium text-[var(--color-ink-plum)]">Street address <span aria-hidden>*</span></label>
              <input
                id="address" type="text" required
                value={form.address} onChange={e => update('address', e.target.value)}
                autoComplete="street-address"
                placeholder="House, road, area"
                className="h-11 px-4 rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-white font-ui text-sm text-[var(--color-ink-plum)] placeholder-[var(--color-text-muted)] outline-none focus:border-[var(--color-rose-gold)] transition-micro"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label htmlFor="city" className="font-ui text-sm font-medium text-[var(--color-ink-plum)]">City <span aria-hidden>*</span></label>
              <input
                id="city" type="text" required
                value={form.city} onChange={e => update('city', e.target.value)}
                autoComplete="address-level2"
                placeholder="Dhaka"
                className="h-11 px-4 rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-white font-ui text-sm text-[var(--color-ink-plum)] placeholder-[var(--color-text-muted)] outline-none focus:border-[var(--color-rose-gold)] transition-micro"
              />
            </div>
          </fieldset>

          {/* Payment */}
          <fieldset className="flex flex-col gap-3">
            <legend className="font-display text-xl font-medium text-[var(--color-ink-plum)] mb-2">Payment method</legend>
            {PAYMENT_OPTIONS.map(opt => (
              <label
                key={opt.value}
                htmlFor={`pm-${opt.value}`}
                className={[
                  'flex items-start gap-3 p-4 rounded-[var(--radius-md)] border cursor-pointer transition-micro',
                  paymentMethod === opt.value
                    ? 'border-[var(--color-rose-gold)] bg-[var(--color-rose-gold-50)]'
                    : 'border-[var(--color-border)] hover:border-[var(--color-ink-plum-200)]',
                ].join(' ')}
              >
                <input
                  id={`pm-${opt.value}`}
                  type="radio"
                  name="paymentMethod"
                  value={opt.value}
                  checked={paymentMethod === opt.value}
                  onChange={() => setPaymentMethod(opt.value)}
                  className="mt-0.5 accent-[var(--color-rose-gold)]"
                />
                <div>
                  <p className="font-ui text-sm font-medium text-[var(--color-ink-plum)]">{opt.label}</p>
                  <p className="font-ui text-xs text-[var(--color-text-muted)] mt-0.5">{opt.hint}</p>
                </div>
              </label>
            ))}
          </fieldset>

          {/* Notes */}
          <div className="flex flex-col gap-1">
            <label htmlFor="notes" className="font-ui text-sm font-medium text-[var(--color-ink-plum)]">Order notes (optional)</label>
            <textarea
              id="notes"
              value={form.notes} onChange={e => update('notes', e.target.value)}
              rows={3}
              placeholder="Special instructions, gift message, etc."
              className="px-4 py-3 rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-white font-ui text-sm text-[var(--color-ink-plum)] placeholder-[var(--color-text-muted)] outline-none focus:border-[var(--color-rose-gold)] transition-micro resize-none"
            />
          </div>

          {error && (
            <p role="alert" className="font-ui text-sm text-[var(--color-terracotta)] bg-[var(--color-terracotta-50)] px-4 py-3 rounded-[var(--radius-sm)]">
              {error}
            </p>
          )}

          <Button type="submit" variant="primary" size="lg" loading={loading} className="w-full">
            Place order — {formatBDT(total)}
          </Button>
          <p className="font-ui text-xs text-center text-[var(--color-text-muted)]">
            By placing your order you agree to our terms. Guest orders are stored securely.
          </p>
        </form>

        {/* Order summary — collapsible on mobile, sticky on desktop */}
        <div className="lg:sticky lg:top-24 h-fit">
          <details className="lg:open" open>
            <summary className="lg:hidden flex items-center justify-between cursor-pointer py-3 border-b border-[var(--color-border-muted)] mb-4">
              <span className="font-ui text-sm font-medium text-[var(--color-ink-plum)]">Order summary</span>
              <span className="font-ui text-sm font-medium text-[var(--color-ink-plum)]">{formatBDT(total)} ▾</span>
            </summary>
            <div className="border border-[var(--color-border-muted)] rounded-[var(--radius-md)] p-5 flex flex-col gap-3">
              <h2 className="font-display text-lg font-medium text-[var(--color-ink-plum)] hidden lg:block">Order summary</h2>
              {items.map(item => (
                <div key={item.productId} className="flex justify-between gap-2 text-sm font-ui">
                  <span className="text-[var(--color-ink-plum)] line-clamp-1">{item.name} × {item.quantity}</span>
                  <span className="text-[var(--color-ink-plum)] flex-shrink-0">{formatBDT(item.price * item.quantity)}</span>
                </div>
              ))}
              <div className="h-px bg-[var(--color-border-muted)]" />
              <div className="flex justify-between text-sm font-ui">
                <span className="text-[var(--color-text-muted)]">Shipping</span>
                <span className="text-[var(--color-ink-plum)]">{shipping === 0 ? 'Free' : formatBDT(shipping)}</span>
              </div>
              <div className="flex justify-between font-medium font-ui">
                <span className="text-[var(--color-ink-plum)]">Total</span>
                <span className="text-[var(--color-ink-plum)]">{formatBDT(total)}</span>
              </div>
            </div>
          </details>
        </div>
      </div>
    </main>
  )
}
'@

Set-Content -Path "src/app/login/page.tsx" -Encoding UTF8 -Value @'
'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { signIn } from 'next-auth/react'
import { Button } from '@/components/ui/Button'

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') ?? '/account'
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const result = await signIn('credentials', {
      email: form.email,
      password: form.password,
      redirect: false,
    })
    setLoading(false)
    if (result?.error) {
      setError("That email and password combination doesn't match. Try again.")
      return
    }
    void router.push(callbackUrl)
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-[var(--color-parchment)] px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <p className="font-display text-3xl font-medium text-[var(--color-ink-plum)]">FM</p>
          <p className="font-ui text-xs text-[var(--color-rose-gold)] tracking-widest uppercase mt-1">FaMi</p>
        </div>
        <h1 className="font-display text-2xl font-medium text-[var(--color-ink-plum)] mb-6 text-center">Sign in</h1>
        <form onSubmit={e => void handleSubmit(e)} className="flex flex-col gap-4" noValidate>
          <div className="flex flex-col gap-1">
            <label htmlFor="email" className="font-ui text-sm font-medium text-[var(--color-ink-plum)]">Email</label>
            <input
              id="email" type="email" required autoComplete="email"
              value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              placeholder="you@example.com"
              className="h-11 px-4 rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-white font-ui text-sm text-[var(--color-ink-plum)] placeholder-[var(--color-text-muted)] outline-none focus:border-[var(--color-rose-gold)] transition-micro"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="password" className="font-ui text-sm font-medium text-[var(--color-ink-plum)]">Password</label>
            <input
              id="password" type="password" required autoComplete="current-password"
              value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
              placeholder="Your password"
              className="h-11 px-4 rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-white font-ui text-sm text-[var(--color-ink-plum)] placeholder-[var(--color-text-muted)] outline-none focus:border-[var(--color-rose-gold)] transition-micro"
            />
          </div>
          {error && (
            <p role="alert" aria-live="polite" className="font-ui text-sm text-[var(--color-terracotta)] bg-[var(--color-terracotta-50)] px-4 py-3 rounded-[var(--radius-sm)]">
              {error}
            </p>
          )}
          <Button type="submit" variant="primary" size="lg" loading={loading} className="w-full mt-2">
            Sign in
          </Button>
        </form>
        <p className="font-ui text-sm text-center text-[var(--color-text-muted)] mt-6">
          Don't have an account?{' '}
          <Link href="/register" className="text-[var(--color-rose-gold)] hover:underline">Register</Link>
        </p>
      </div>
    </main>
  )
}
'@

Set-Content -Path "src/app/register/page.tsx" -Encoding UTF8 -Value @'
'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'

export default function RegisterPage() {
  const router = useRouter()
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json() as { error?: string }
      if (!res.ok) { setError(data.error ?? 'Registration failed.'); return }
      void router.push('/login?registered=true')
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-[var(--color-parchment)] px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <p className="font-display text-3xl font-medium text-[var(--color-ink-plum)]">FM</p>
          <p className="font-ui text-xs text-[var(--color-rose-gold)] tracking-widest uppercase mt-1">FaMi</p>
        </div>
        <h1 className="font-display text-2xl font-medium text-[var(--color-ink-plum)] mb-6 text-center">Create an account</h1>
        <form onSubmit={e => void handleSubmit(e)} className="flex flex-col gap-4" noValidate>
          <div className="flex flex-col gap-1">
            <label htmlFor="name" className="font-ui text-sm font-medium text-[var(--color-ink-plum)]">Full name</label>
            <input id="name" type="text" required autoComplete="name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Your full name" className="h-11 px-4 rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-white font-ui text-sm text-[var(--color-ink-plum)] placeholder-[var(--color-text-muted)] outline-none focus:border-[var(--color-rose-gold)] transition-micro" />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="email" className="font-ui text-sm font-medium text-[var(--color-ink-plum)]">Email address</label>
            <input id="email" type="email" required autoComplete="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="you@example.com" className="h-11 px-4 rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-white font-ui text-sm text-[var(--color-ink-plum)] placeholder-[var(--color-text-muted)] outline-none focus:border-[var(--color-rose-gold)] transition-micro" />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="password" className="font-ui text-sm font-medium text-[var(--color-ink-plum)]">Password</label>
            <input id="password" type="password" required autoComplete="new-password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} placeholder="At least 8 characters" className="h-11 px-4 rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-white font-ui text-sm text-[var(--color-ink-plum)] placeholder-[var(--color-text-muted)] outline-none focus:border-[var(--color-rose-gold)] transition-micro" />
          </div>
          {error && <p role="alert" aria-live="polite" className="font-ui text-sm text-[var(--color-terracotta)] bg-[var(--color-terracotta-50)] px-4 py-3 rounded-[var(--radius-sm)]">{error}</p>}
          <Button type="submit" variant="primary" size="lg" loading={loading} className="w-full mt-2">Create account</Button>
        </form>
        <p className="font-ui text-sm text-center text-[var(--color-text-muted)] mt-6">
          Already have an account? <Link href="/login" className="text-[var(--color-rose-gold)] hover:underline">Sign in</Link>
        </p>
      </div>
    </main>
  )
}
'@

Set-Content -Path "src/app/blog/page.tsx" -Encoding UTF8 -Value @'
import Image from 'next/image'
import Link from 'next/link'
import { getBlogPosts, getCategories, getStores } from '@/lib/data'
import { auth } from '@/lib/auth'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { MobileBottomNav } from '@/components/layout/MobileBottomNav'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Journal' }

export default async function BlogPage() {
  const [posts, categories, stores, session] = await Promise.all([getBlogPosts(), getCategories(), getStores(), auth()])
  const isLoggedIn = Boolean(session?.user)

  return (
    <>
      <Header categories={categories} isLoggedIn={isLoggedIn} />
      <main className="container-fami py-10">
        <h1 className="font-display text-3xl md:text-5xl font-medium text-[var(--color-ink-plum)] mb-2">The Journal</h1>
        <p className="font-ui text-sm text-[var(--color-text-muted)] mb-10">Style notes, care guides, and curatorial thoughts from the FaMi team.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map(post => (
            <Link key={post.id} href={`/blog/${post.slug}`} className="group flex flex-col gap-4">
              {post.imageUrl && (
                <div className="relative aspect-[16/9] w-full overflow-hidden rounded-[var(--radius-sm)] bg-[var(--color-parchment-100)]">
                  <Image src={post.imageUrl} alt={post.title} fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover group-hover:scale-[1.03] transition-transform duration-300" />
                </div>
              )}
              <div className="flex flex-col gap-2">
                <div className="flex gap-2 flex-wrap">
                  {post.tags.map(tag => <span key={tag} className="font-ui text-xs text-[var(--color-terracotta)] uppercase tracking-wide">{tag}</span>)}
                </div>
                <h2 className="font-editorial text-xl text-[var(--color-ink-plum)] leading-snug group-hover:text-[var(--color-rose-gold)] transition-micro">{post.title}</h2>
                <p className="font-ui text-sm text-[var(--color-text-muted)] line-clamp-3">{post.excerpt}</p>
                <span className="font-ui text-xs text-[var(--color-rose-gold)] font-medium mt-1">Read more →</span>
              </div>
            </Link>
          ))}
        </div>
      </main>
      <Footer stores={stores} />
      <MobileBottomNav isLoggedIn={isLoggedIn} />
    </>
  )
}
'@

Set-Content -Path "src/app/blog/[slug]/page.tsx" -Encoding UTF8 -Value @'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { getBlogPostBySlug, getCategories, getStores } from '@/lib/data'
import { auth } from '@/lib/auth'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { MobileBottomNav } from '@/components/layout/MobileBottomNav'
import type { Metadata } from 'next'

interface Props { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const post = await getBlogPostBySlug(slug)
  return { title: post?.title ?? 'Journal' }
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params
  const [post, categories, stores, session] = await Promise.all([getBlogPostBySlug(slug), getCategories(), getStores(), auth()])
  if (!post) notFound()
  const isLoggedIn = Boolean(session?.user)

  return (
    <>
      <Header categories={categories} isLoggedIn={isLoggedIn} />
      <main className="container-fami py-10 max-w-3xl">
        <Link href="/blog" className="font-ui text-xs text-[var(--color-text-muted)] hover:text-[var(--color-rose-gold)] transition-micro mb-8 inline-block">← Back to journal</Link>
        <div className="flex gap-2 flex-wrap mb-4">
          {post.tags.map(tag => <span key={tag} className="font-ui text-xs text-[var(--color-terracotta)] uppercase tracking-wide">{tag}</span>)}
        </div>
        <h1 className="font-display text-3xl md:text-5xl font-medium text-[var(--color-ink-plum)] leading-tight mb-6">{post.title}</h1>
        {post.imageUrl && (
          <div className="relative aspect-[16/9] w-full overflow-hidden rounded-[var(--radius-sm)] mb-8">
            <Image src={post.imageUrl} alt={post.title} fill sizes="(max-width: 768px) 100vw, 800px" className="object-cover" priority />
          </div>
        )}
        <div
          className="font-ui text-base text-[var(--color-ink-plum)] leading-relaxed prose-p:mb-4"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />
      </main>
      <Footer stores={stores} />
      <MobileBottomNav isLoggedIn={isLoggedIn} />
    </>
  )
}
'@

Set-Content -Path "src/app/account/page.tsx" -Encoding UTF8 -Value @'
import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { getUserById, getUserOrders, getCategories, getStores } from '@/lib/data'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { MobileBottomNav } from '@/components/layout/MobileBottomNav'
import { Badge } from '@/components/ui/Badge'
import { SignOutButton } from '@/components/account/SignOutButton'
import { formatBDT } from '@/lib/currency'

export default async function AccountPage() {
  const session = await auth()
  if (!session?.user) redirect('/login')

  const userId = Number(session.user.id)
  const [user, orders, categories, stores] = await Promise.all([
    getUserById(userId),
    getUserOrders(userId),
    getCategories(),
    getStores(),
  ])

  if (!user) redirect('/login')

  return (
    <>
      <Header categories={categories} isLoggedIn />
      <main className="container-fami py-8 md:py-12">
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="font-display text-3xl font-medium text-[var(--color-ink-plum)]">My account</h1>
            <p className="font-ui text-sm text-[var(--color-text-muted)] mt-1">{user.email}</p>
          </div>
          <SignOutButton />
        </div>

        {/* Loyalty snapshot */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-10">
          <div className="border border-[var(--color-border-muted)] rounded-[var(--radius-md)] p-5">
            <p className="font-ui text-xs text-[var(--color-text-muted)] uppercase tracking-wide mb-1">Loyalty points</p>
            <p className="font-display text-2xl font-medium text-[var(--color-emerald)]">{user.loyaltyPoints.toLocaleString()}</p>
            <p className="font-ui text-xs text-[var(--color-text-muted)] mt-1">1 point earned per ৳100</p>
          </div>
          <div className="border border-[var(--color-border-muted)] rounded-[var(--radius-md)] p-5">
            <p className="font-ui text-xs text-[var(--color-text-muted)] uppercase tracking-wide mb-1">Orders</p>
            <p className="font-display text-2xl font-medium text-[var(--color-ink-plum)]">{orders.length}</p>
          </div>
          <div className="border border-[var(--color-border-muted)] rounded-[var(--radius-md)] p-5 col-span-2 md:col-span-1">
            <p className="font-ui text-xs text-[var(--color-text-muted)] uppercase tracking-wide mb-1">Referral code</p>
            <p className="font-ui text-base font-medium text-[var(--color-ink-plum)] tracking-widest">{user.referralCode}</p>
            <p className="font-ui text-xs text-[var(--color-text-muted)] mt-1">Share to earn 100 bonus points</p>
          </div>
        </div>

        {/* Order history */}
        <h2 className="font-display text-xl font-medium text-[var(--color-ink-plum)] mb-4">Order history</h2>
        {orders.length === 0 ? (
          <div className="py-12 text-center border border-[var(--color-border-muted)] rounded-[var(--radius-md)]">
            <p className="font-editorial text-lg text-[var(--color-text-muted)]">No orders yet</p>
            <a href="/shop" className="font-ui text-sm text-[var(--color-rose-gold)] hover:underline mt-2 inline-block">Shop the collection →</a>
          </div>
        ) : (
          <div className="flex flex-col divide-y divide-[var(--color-border-muted)] border border-[var(--color-border-muted)] rounded-[var(--radius-md)]">
            {orders.map(order => (
              <div key={order.id} className="p-5 flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                <div className="flex flex-col gap-1">
                  <p className="font-ui text-sm font-medium text-[var(--color-ink-plum)]">Order #{order.id}</p>
                  <p className="font-ui text-xs text-[var(--color-text-muted)]">{new Date(order.createdAt).toLocaleDateString('en-BD', { dateStyle: 'medium' })}</p>
                  <p className="font-ui text-xs text-[var(--color-text-muted)]">{order.items.length} item{order.items.length !== 1 ? 's' : ''}</p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge
                    variant={order.status === 'delivered' ? 'loyalty' : order.status === 'cancelled' ? 'out-of-stock' : 'new'}
                  >
                    {order.status}
                  </Badge>
                  <p className="font-ui text-sm font-medium text-[var(--color-ink-plum)]">{formatBDT(order.total)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
      <Footer stores={stores} />
      <MobileBottomNav isLoggedIn />
    </>
  )
}
'@

Set-Content -Path "src/components/account/SignOutButton.tsx" -Encoding UTF8 -Value @'
'use client'
import { signOut } from 'next-auth/react'
import { Button } from '@/components/ui/Button'

export function SignOutButton() {
  return (
    <Button variant="ghost" size="sm" onClick={() => void signOut({ callbackUrl: '/' })}>
      Sign out
    </Button>
  )
}
'@

Set-Content -Path "src/app/api/auth/register/route.ts" -Encoding UTF8 -Value @'
import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { db } from '@/lib/db'
import { users } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { z } from 'zod'

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
})

function generateReferralCode(name: string): string {
  const prefix = name.slice(0, 4).toUpperCase().replace(/[^A-Z]/g, 'X').padEnd(4, 'X')
  const suffix = Math.random().toString(36).slice(2, 6).toUpperCase()
  return `FAMI-${prefix}${suffix}`
}

export async function POST(req: NextRequest) {
  const parsed = registerSchema.safeParse(await req.json())
  if (!parsed.success) {
    return NextResponse.json({ error: 'Please fill in all fields correctly.' }, { status: 400 })
  }
  const { name, email, password } = parsed.data

  // Check if email already exists
  const [existing] = await db.select().from(users).where(eq(users.email, email))
  if (existing) {
    return NextResponse.json(
      { error: "That email's already registered. Try logging in instead." },
      { status: 409 }
    )
  }

  const passwordHash = await bcrypt.hash(password, 10)
  const referralCode = generateReferralCode(name)

  await db.insert(users).values({ name, email, passwordHash, referralCode })
  return NextResponse.json({ success: true })
}
'@

Set-Content -Path "src/app/wishlist/page.tsx" -Encoding UTF8 -Value @'
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
'@

Set-Content -Path "src/app/checkout/success/page.tsx" -Encoding UTF8 -Value @'
import Link from 'next/link'
export default function CheckoutSuccessPage() {
  return (
    <main className="container-fami py-20 text-center">
      <div className="max-w-md mx-auto">
        <div className="w-16 h-16 rounded-full bg-[var(--color-emerald-50)] flex items-center justify-center mx-auto mb-6">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--color-emerald)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
        </div>
        <h1 className="font-display text-3xl font-medium text-[var(--color-ink-plum)] mb-3">Order placed</h1>
        <p className="font-ui text-base text-[var(--color-text-muted)] mb-8">Thank you for your order. We will contact you to confirm delivery details.</p>
        <div className="flex gap-3 justify-center">
          <Link href="/shop" className="inline-flex items-center h-11 px-6 bg-[var(--color-rose-gold)] text-white font-ui text-sm font-medium rounded-[var(--radius-md)] hover:bg-[var(--color-rose-gold-dark)] transition-micro">Continue shopping</Link>
          <Link href="/account" className="inline-flex items-center h-11 px-6 border border-[var(--color-ink-plum)] text-[var(--color-ink-plum)] font-ui text-sm font-medium rounded-[var(--radius-md)] hover:bg-[var(--color-ink-plum-50)] transition-micro">View orders</Link>
        </div>
      </div>
    </main>
  )
}
'@

Write-Host "All files created successfully."
