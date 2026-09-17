import Link from 'next/link'
import { getCategories } from '@/lib/data'
import { auth } from '@/lib/auth'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { MobileBottomNav } from '@/components/layout/MobileBottomNav'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'About',
  description: 'FaMi is a curated collection of jewellery, bags, dresses and skincare — quality pieces that outlast trends.',
}

export default async function AboutPage() {
  const [categories, session] = await Promise.all([
    getCategories(),
    auth(),
  ])
  const isLoggedIn = Boolean(session?.user)

  return (
    <>
      <Header categories={categories} isLoggedIn={isLoggedIn} />
      <main className="pb-24 md:pb-0">

        {/* Hero */}
        <section className="container-fami py-14 md:py-20">
          <span className="hallmark-stamp mb-6 inline-block">Our story</span>
          <h1 className="font-display text-5xl md:text-7xl font-medium text-[var(--color-ink-plum)] leading-[1.05] max-w-2xl">
            Crafted for the women who know themselves
          </h1>
          <p className="font-editorial text-lg md:text-xl text-[var(--color-text-muted)] mt-6 max-w-xl leading-relaxed">
            FaMi started with one simple belief: that beautiful things should be accessible, and that real quality never goes out of style.
          </p>
        </section>

        <hr className="divider-gold" />

        {/* Monogram section */}
        <section className="container-fami py-14 md:py-20 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="font-display text-3xl md:text-4xl font-medium text-[var(--color-ink-plum)] mb-5">The FM monogram</h2>
            <p className="font-ui text-base text-[var(--color-text-muted)] leading-relaxed mb-4">
              Our rose-gold FM mark is more than a logo — it&apos;s a promise. Every piece that carries it has been chosen for its craftsmanship, its material integrity, and its staying power.
            </p>
            <p className="font-ui text-base text-[var(--color-text-muted)] leading-relaxed">
              We curate, not just source. That means every product in our collection has been held, worn, and assessed before it makes it to you.
            </p>
          </div>
          {/* Monogram display */}
          <div
            className="flex items-center justify-center w-full aspect-square max-w-xs mx-auto rounded-[var(--radius-md)] bg-[var(--color-parchment-100)] border border-[var(--color-border-muted)]"
            aria-hidden="true"
          >
            <div className="text-center">
              <p className="font-display text-8xl font-medium text-[var(--color-rose-gold)] leading-none">FM</p>
              <p className="font-ui text-xs text-[var(--color-text-muted)] tracking-widest uppercase mt-3">FaMi</p>
            </div>
          </div>
        </section>

        <hr className="divider-gold" />

        {/* Values */}
        <section className="container-fami py-14 md:py-20">
          <span className="hallmark-stamp mb-6 inline-block">What we stand for</span>
          <h2 className="font-display text-3xl md:text-4xl font-medium text-[var(--color-ink-plum)] mb-10">Our values</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {[
              {
                title: 'Quality first',
                body: 'Every product is chosen for its materials, construction, and longevity — not just its price point.',
              },
              {
                title: 'Honest curation',
                body: "We only carry pieces we'd recommend to someone we care about. Our catalogue is deliberately small and intentional.",
              },
              {
                title: 'Customer in focus',
                body: 'From fast delivery to a no-fuss returns policy, every decision we make starts with the question: what does our customer actually need?',
              },
            ].map(value => (
              <div key={value.title} className="flex flex-col gap-3">
                <div className="w-10 h-px bg-[var(--color-rose-gold)]" aria-hidden="true" />
                <h3 className="font-display text-xl font-medium text-[var(--color-ink-plum)]">{value.title}</h3>
                <p className="font-ui text-sm text-[var(--color-text-muted)] leading-relaxed">{value.body}</p>
              </div>
            ))}
          </div>
        </section>

        <hr className="divider-gold" />

        {/* Categories preview */}
        <section className="container-fami py-14 md:py-20">
          <h2 className="font-display text-3xl font-medium text-[var(--color-ink-plum)] mb-4">What we carry</h2>
          <p className="font-ui text-sm text-[var(--color-text-muted)] mb-8">
            {categories.length} curated categories — each one selected to work together as a complete wardrobe.
          </p>
          <div className="flex flex-wrap gap-3">
            {categories.map(cat => (
              <Link
                key={cat.id}
                href={`/shop/${cat.slug}`}
                className="hallmark-stamp hover:border-[var(--color-rose-gold)] hover:text-[var(--color-rose-gold)] transition-micro"
              >
                {cat.name}
              </Link>
            ))}
          </div>
        </section>

        <hr className="divider-gold" />

        {/* CTA */}
        <section className="container-fami py-14 md:py-20 text-center">
          <h2 className="font-display text-3xl md:text-4xl font-medium text-[var(--color-ink-plum)] mb-4">Ready to explore?</h2>
          <p className="font-ui text-base text-[var(--color-text-muted)] mb-8">
            Browse the collection or get in touch — we&apos;re always happy to help you find the perfect piece.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/shop"
              className="inline-flex items-center justify-center h-12 px-8 rounded-[var(--radius-md)] bg-[var(--color-rose-gold)] text-white font-ui text-sm font-medium hover:bg-[var(--color-rose-gold-dark)] transition-micro"
            >
              Shop the collection
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center h-12 px-8 rounded-[var(--radius-md)] border border-[var(--color-ink-plum)] text-[var(--color-ink-plum)] font-ui text-sm font-medium hover:bg-[var(--color-ink-plum-50)] transition-micro"
            >
              Contact us
            </Link>
          </div>
        </section>
      </main>
      <Footer />
      <MobileBottomNav isLoggedIn={isLoggedIn} />
    </>
  )
}

