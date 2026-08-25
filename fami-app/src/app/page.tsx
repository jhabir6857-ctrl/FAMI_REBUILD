import Link from 'next/link'
import Image from 'next/image'
import { ShieldCheck, Truck, MessageCircle, Gift } from 'lucide-react'
import { getProducts, getCategories, getBlogPosts, getStores } from '@/lib/data'
import { auth } from '@/lib/auth'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { MobileBottomNav } from '@/components/layout/MobileBottomNav'
import { ProductCard } from '@/components/shop/ProductCard'

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
        {/* ── Hero — split layout: text left, editorial image right ── */}
        <section className="relative flex items-center min-h-[580px] md:min-h-[640px] bg-[var(--color-ink-plum)] overflow-hidden" aria-label="Hero">
          {/* Subtle radial glow behind text */}
          <div
            className="pointer-events-none absolute left-0 top-0 h-full w-full md:w-1/2 opacity-25"
            style={{ background: 'radial-gradient(ellipse at 30% 50%, #b76e79 0%, transparent 60%)' }}
            aria-hidden="true"
          />

          {/* Right-side image bleeding to the edge */}
          <div className="hidden md:block absolute right-0 top-0 w-1/2 h-full animate-slide-in-right delay-150">
            <Image
              src="/hero.jpg"
              alt="FaMi — curated jewellery, bags and skincare"
              fill
              sizes="50vw"
              className="object-cover object-center"
              priority
            />
            {/* Gradient fade from plum on the left edge of the image */}
            <div
              className="absolute inset-y-0 left-0 w-32 pointer-events-none"
              style={{ background: 'linear-gradient(to right, #2b1f2e, transparent)' }}
              aria-hidden="true"
            />
          </div>

          <div className="container-fami relative z-10 w-full py-16 md:py-20">
            <div className="md:w-1/2 pr-0 md:pr-12 flex flex-col justify-center">
              <p className="hallmark-stamp text-white/60 border-white/20 mb-5 animate-fade-in self-start">
                New collection 2026
              </p>
              <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-medium text-white leading-[1.1] mb-5 animate-fade-in-up delay-150">
                Curated for the{' '}
                <em className="not-italic text-[var(--color-rose-gold-light)]">discerning</em>
                <br />
                shopper
              </h1>
              <p className="font-ui text-base text-white/70 max-w-sm leading-relaxed mb-8 animate-fade-in-up delay-250">
                Fashion, jewellery, bags and skincare — each piece chosen for quality that outlasts trends.
              </p>
              <div className="flex flex-wrap gap-3 animate-fade-in-up delay-350">
                <Link
                  href="/shop"
                  className="inline-flex items-center h-12 px-8 bg-[var(--color-rose-gold)] text-white font-ui text-sm font-medium rounded-[var(--radius-md)] hover:bg-[var(--color-rose-gold-dark)] transition-micro press-active"
                >
                  Shop the collection
                </Link>
                <Link
                  href="/about"
                  className="inline-flex items-center h-12 px-7 border border-white/30 text-white font-ui text-sm font-medium rounded-[var(--radius-md)] hover:bg-white/10 transition-micro press-active"
                >
                  Our story
                </Link>
              </div>
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
