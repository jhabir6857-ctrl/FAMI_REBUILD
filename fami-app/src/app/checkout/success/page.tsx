import Link from 'next/link'
import { getCategories } from '@/lib/data'
import { auth } from '@/lib/auth'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { MobileBottomNav } from '@/components/layout/MobileBottomNav'

export const metadata = { title: 'Order placed' }

export default async function CheckoutSuccessPage() {
  const [categories, session] = await Promise.all([
    getCategories(),
    auth(),
  ])
  const isLoggedIn = Boolean(session?.user)

  return (
    <>
      <Header categories={categories} isLoggedIn={isLoggedIn} />
      <main className="container-fami py-20 text-center pb-24 md:pb-20">
        <div className="max-w-md mx-auto">
          <div className="w-16 h-16 rounded-full bg-[var(--color-emerald-50)] flex items-center justify-center mx-auto mb-6">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--color-emerald)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"></polyline></svg>
          </div>
          <h1 className="font-display text-3xl font-medium text-[var(--color-ink-plum)] mb-3">Order placed</h1>
          <p className="font-ui text-base text-[var(--color-text-muted)] mb-6">
            Thank you for your order. We&apos;ll contact you shortly to confirm your delivery details.
          </p>
          
          <div className="bg-[var(--color-parchment-100)] border border-[var(--color-parchment-200)] rounded-[var(--radius-md)] p-4 mb-8 text-left flex items-start gap-3">
            <svg className="w-5 h-5 text-[var(--color-rose-gold)] flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2z" />
            </svg>
            <p className="font-ui text-sm text-[var(--color-ink-plum)] leading-relaxed">
              A confirmation receipt has been sent to your email. If you don&apos;t see it immediately, please check your <strong>Promotions</strong> or <strong>Spam</strong> folder.
            </p>
          </div>
          <div className="flex gap-3 justify-center flex-wrap">
            <Link href="/shop" className="inline-flex items-center h-11 px-6 bg-[var(--color-rose-gold)] text-white font-ui text-sm font-medium rounded-[var(--radius-md)] hover:bg-[var(--color-rose-gold-dark)] transition-micro">
              Continue shopping
            </Link>
            {isLoggedIn && (
              <Link href="/account" className="inline-flex items-center h-11 px-6 border border-[var(--color-ink-plum)] text-[var(--color-ink-plum)] font-ui text-sm font-medium rounded-[var(--radius-md)] hover:bg-[var(--color-ink-plum-50)] transition-micro">
                View orders
              </Link>
            )}
          </div>
        </div>
      </main>
      <Footer />
      <MobileBottomNav isLoggedIn={isLoggedIn} />
    </>
  )
}

