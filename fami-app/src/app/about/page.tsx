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
          <span className="hallmark-stamp mb-6 inline-block text-[var(--color-ink-plum)]/70">Who We Are</span>
          {/* Rule: Benefit before feature, punchy */}
          <h1 className="font-display text-5xl md:text-7xl font-medium text-[var(--color-ink-plum)] leading-[1.05] max-w-2xl">
            Stop second-guessing your style.
          </h1>
          <p className="font-editorial text-lg md:text-xl text-[var(--color-text-muted)] mt-6 max-w-xl leading-relaxed">
            We curate the wardrobe you’ve always wanted. Discover premium jewellery, designer bags, and luxurious skincare that look expensive, feel incredible, and actually last.
          </p>
        </section>

        <hr className="divider-gold" />

        {/* Monogram section */}
        <section className="container-fami py-14 md:py-20 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            {/* Rule: Specific headline */}
            <h2 className="font-display text-3xl md:text-4xl font-medium text-[var(--color-ink-plum)] mb-5">The FM Seal of Approval</h2>
            {/* Rule: Break up blocks of text, punchy */}
            <p className="font-ui text-base text-[var(--color-text-muted)] leading-relaxed mb-4">
              When you see the rose-gold FM mark, you know it’s guaranteed to last.
            </p>
            <p className="font-ui text-base text-[var(--color-text-muted)] leading-relaxed">
              We curate, not just source. That means every single piece of jewelry, every bag, and every dress is worn, tested, and reviewed before it ever reaches our store.
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
          <span className="hallmark-stamp mb-6 inline-block text-[var(--color-ink-plum)]/70">What we stand for</span>
          <h2 className="font-display text-3xl md:text-4xl font-medium text-[var(--color-ink-plum)] mb-10">Our Promise To You</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {[
              {
                title: 'Never replace it again',
                body: 'We choose premium materials over cheap trends. Wear your favorite pieces every day without worrying about them breaking or fading.',
              },
              {
                title: 'Tested by us, loved by you',
                body: "We refuse to sell anything we wouldn't wear ourselves. Our catalogue is small, intentional, and strictly vetted.",
              },
              {
                title: 'Zero-hassle shopping',
                body: 'Fast delivery, responsive WhatsApp support, and seamless checkout. We respect your time and money.',
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
          <h2 className="font-display text-3xl font-medium text-[var(--color-ink-plum)] mb-4">Find your next favorite</h2>
          <p className="font-ui text-sm text-[var(--color-text-muted)] mb-8">
            Curated categories selected to build your complete dream wardrobe.
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
        <section className="container-fami py-14 md:py-20 text-center max-w-2xl mx-auto">
          <h2 className="font-display text-3xl md:text-4xl font-medium text-[var(--color-ink-plum)] mb-4">Elevate your everyday.</h2>
          {/* Rule: Handle objections before CTA */}
          <p className="font-ui text-base text-[var(--color-text-muted)] mb-2">
            100% Authentic. Free delivery in Dhaka for orders over ৳5000.
          </p>
          <p className="font-ui text-sm text-[var(--color-text-muted)] mb-8">
            If you need help choosing, reach out to us directly.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {/* Rule: CTA clear verb + outcome */}
            <Link
              href="/shop"
              className="inline-flex items-center justify-center h-12 px-8 rounded-[var(--radius-md)] bg-[var(--color-rose-gold)] text-white font-ui text-sm font-medium hover:bg-[var(--color-rose-gold-dark)] transition-micro"
            >
              Build Your Wardrobe
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center h-12 px-8 rounded-[var(--radius-md)] border border-[var(--color-ink-plum)] text-[var(--color-ink-plum)] font-ui text-sm font-medium hover:bg-[var(--color-ink-plum-50)] transition-micro"
            >
              Ask A Question
            </Link>
          </div>
        </section>
      </main>
      <Footer />
      <MobileBottomNav isLoggedIn={isLoggedIn} />
    </>
  )
}

