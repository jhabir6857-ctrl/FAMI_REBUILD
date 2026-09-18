import Link from 'next/link'
import Image from 'next/image'
import { getProducts, getCategories, getBlogPosts } from '@/lib/data'
import { auth } from '@/lib/auth'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { MobileBottomNav } from '@/components/layout/MobileBottomNav'
import { ProductCard } from '@/components/shop/ProductCard'

export default async function HomePage() {
  const [session, categories, featured, newArrivals, blogs] = await Promise.all([
    auth(),
    getCategories(),
    getProducts({ featured: true, limit: 8 }),
    getProducts({ isNew: true, limit: 4 }),
    getBlogPosts(3),
    ])

  const isLoggedIn = Boolean(session?.user)

  return (
    <>
      <Header categories={categories} isLoggedIn={isLoggedIn} />
      <main>
        {/* ✨ Avant-Garde Split-Screen Hero ✨ */}
        <section aria-label="Hero" className="relative flex flex-col lg:flex-row w-full bg-[var(--color-ink-plum)] text-[var(--color-parchment)]">
          {/* Left: Sticky Ambient Video */}
          <div className="relative w-full lg:w-1/2 h-[45vh] lg:h-[100dvh] lg:sticky lg:top-0 overflow-hidden bg-[var(--color-ink-plum)]">
            <video 
              src="/ambient-jewelry.mp4" 
              autoPlay 
              loop 
              muted 
              playsInline 
              className="absolute inset-0 w-full h-full object-cover mix-blend-luminosity opacity-70 scale-105" 
              poster="/hero-slide-1.jpg" 
            />
            {/* Subtle vignette */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_40%,rgba(43,31,46,0.6)_100%)] pointer-events-none" />
          </div>

          {/* Right: Scrollable Editorial Typography */}
          <div className="w-full lg:w-1/2 flex flex-col justify-center px-6 py-12 lg:py-32 lg:px-16 xl:px-24">
            {/* SVG Hallmark Stamp */}
            <div className="mb-8 lg:mb-16 animate-fade-in-up">
              <svg width="120" height="120" viewBox="0 0 100 100" className="animate-[spin_20s_linear_infinite] text-[var(--color-rose-gold)]">
                <defs>
                  <path id="circlePath" d="M 50, 50 m -35, 0 a 35,35 0 1,1 70,0 a 35,35 0 1,1 -70,0" />
                </defs>
                <text fontSize="11" fill="currentColor" fontWeight="500" letterSpacing="4" style={{ fontFamily: 'var(--font-ui)' }}>
                  <textPath href="#circlePath">
                    100% AUTHENTIC • PREMIUM MATERIALS • 
                  </textPath>
                </text>
                {/* Thin hairline rings */}
                <circle cx="50" cy="50" r="24" fill="none" stroke="currentColor" strokeWidth="1" className="opacity-30" />
                <circle cx="50" cy="50" r="46" fill="none" stroke="currentColor" strokeWidth="1" className="opacity-30" />
              </svg>
            </div>

            <h1 className="font-display text-fluid-hero font-medium leading-[0.9] tracking-tight mb-4 lg:mb-8 animate-fade-in-up delay-150">
              Quiet<br />
              <em className="text-[var(--color-rose-gold)] italic font-light">Luxury.</em>
            </h1>
            
            <p className="font-ui text-lg lg:text-xl text-[var(--color-parchment-200)] max-w-md mb-8 lg:mb-12 leading-relaxed animate-fade-in-up delay-250 opacity-80">
              Elevate your daily presence with meticulous craftsmanship that outlasts fleeting trends.
            </p>

            <div className="flex flex-col sm:flex-row gap-6 animate-fade-in-up delay-350">
              <Link href="/shop" className="inline-flex h-14 items-center justify-center rounded-full bg-[var(--color-rose-gold)] px-8 font-ui text-sm font-medium tracking-wide text-white transition-all hover:bg-[var(--color-rose-gold-light)] press-active shadow-lg shadow-[var(--color-rose-gold)]/20">
                Explore Collection
              </Link>
              <Link href="/about" className="inline-flex h-14 items-center justify-center rounded-full border border-[var(--color-parchment)]/20 px-8 font-ui text-sm font-medium tracking-wide text-[var(--color-parchment)] transition-all hover:border-[var(--color-rose-gold)] hover:bg-[var(--color-rose-gold)]/10 press-active backdrop-blur-sm">
                Our Standard
              </Link>
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
              {categories.slice(0, 9).map(cat => {
                return (
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
                          loading="lazy"
                          decoding="async"
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      )}
                    </div>
                  <span className="font-ui text-xs font-medium text-[var(--color-ink-plum)] group-hover:text-[var(--color-rose-gold)] transition-micro">
                    {cat.name}
                  </span>
                </Link>
              )
            })}
            </div>
          </div>
        </section>

        <hr className="hairline-divider container-fami my-12" />

        {/* ── Featured products ── */}
        <section className="section-gap scroll-reveal" aria-labelledby="featured-heading">
          <div className="container-fami">
            <div className="flex items-end justify-between mb-8">
              <h2 id="featured-heading" className="font-display text-fluid-display font-medium text-[var(--color-ink-plum)]">
                Featured pieces
              </h2>
              <Link href="/shop" className="font-ui text-sm text-[var(--color-rose-gold)] hover:underline hidden md:block">
                View all →
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-8 content-auto">
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

        <hr className="hairline-divider container-fami my-12" />

        {/* ✨ Brand story ✨ */}
        <section className="section-gap bg-[var(--color-parchment-100)]" aria-labelledby="brand-story-heading">
          <div className="container-fami max-w-4xl">
            <p className="hallmark-stamp mb-4 text-[var(--color-ink-plum)]/70">The FaMi Standard</p>
            <h2 id="brand-story-heading" className="font-display text-3xl md:text-5xl font-medium text-[var(--color-ink-plum)] mb-10 leading-tight">
              Stop settling for fast fashion.<br /> Invest in yourself.
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 mb-10">
              <div className="flex flex-col gap-3">
                <h3 className="font-display text-2xl text-[var(--color-ink-plum)]">Tired of fading accessories?</h3>
                <p className="font-ui text-base text-[var(--color-text-muted)] leading-relaxed">
                  Most jewelry loses its shine after a few weeks. We source premium materials that stay brilliant, so you never have to throw away a favorite piece again.
                </p>
              </div>
              <div className="flex flex-col gap-3">
                <h3 className="font-display text-2xl text-[var(--color-ink-plum)]">Curated for your lifestyle</h3>
                <p className="font-ui text-base text-[var(--color-text-muted)] leading-relaxed">
                  We filter out the noise. Every bag, dress, and skincare product in our store is meticulously tested for quality before it ever reaches your hands.
                </p>
              </div>
            </div>

            <Link href="/about" className="font-ui text-sm font-medium text-[var(--color-rose-gold)] hover:underline flex items-center gap-1 group w-max">
              Discover how we test our products <span className="group-hover:translate-x-1 transition-transform">→</span>
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
      <Footer />
      <MobileBottomNav isLoggedIn={isLoggedIn} />
    </>
  )
}
