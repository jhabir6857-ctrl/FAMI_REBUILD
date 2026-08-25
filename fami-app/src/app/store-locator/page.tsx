import { MapPin, Clock, Phone } from 'lucide-react'
import { getStores, getCategories } from '@/lib/data'
import { auth } from '@/lib/auth'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { MobileBottomNav } from '@/components/layout/MobileBottomNav'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Store Locator' }

export default async function StoreLocatorPage() {
  const [stores, categories, session] = await Promise.all([
    getStores(),
    getCategories(),
    auth(),
  ])
  const isLoggedIn = Boolean(session?.user)

  return (
    <>
      <Header categories={categories} isLoggedIn={isLoggedIn} />
      <main className="container-fami py-10 md:py-16 pb-24 md:pb-16">
        {/* Hero */}
        <div className="mb-10 md:mb-14">
          <span className="hallmark-stamp mb-4 inline-block">Visit us</span>
          <h1 className="font-display text-4xl md:text-5xl font-medium text-[var(--color-ink-plum)] leading-tight">
            Find a FaMi store
          </h1>
          <p className="font-ui text-base text-[var(--color-text-muted)] mt-3 max-w-xl">
            Come in and browse our full collection in person. Our team is always happy to help you find exactly what you&apos;re looking for.
          </p>
        </div>

        <hr className="divider-gold mb-10" />

        {stores.length === 0 ? (
          <div className="py-20 text-center">
            <p className="font-editorial text-xl text-[var(--color-text-muted)]">Store locations coming soon.</p>
            <p className="font-ui text-sm text-[var(--color-text-muted)] mt-2">
              In the meantime, shop online and we&apos;ll bring FaMi to your door.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {stores.map((store, index) => (
              <div
                key={store.id}
                className="border border-[var(--color-border-muted)] rounded-[var(--radius-md)] overflow-hidden"
              >
                {/* Map placeholder — replace with a real embed or Cloudinary static map image */}
                <div
                  className="w-full h-48 bg-[var(--color-parchment-100)] flex items-center justify-center"
                  aria-hidden="true"
                >
                  <div className="text-center">
                    <MapPin size={32} className="mx-auto mb-2 text-[var(--color-rose-gold)]" />
                    <p className="font-ui text-xs text-[var(--color-text-muted)]">Store {index + 1}</p>
                  </div>
                </div>

                <div className="p-6 flex flex-col gap-4">
                  <h2 className="font-display text-xl font-medium text-[var(--color-ink-plum)]">{store.name}</h2>

                  <div className="flex flex-col gap-3">
                    <div className="flex items-start gap-3">
                      <MapPin size={16} className="mt-0.5 flex-shrink-0 text-[var(--color-rose-gold)]" aria-hidden="true" />
                      <p className="font-ui text-sm text-[var(--color-ink-plum)]">{store.address}</p>
                    </div>

                    {store.hours && (
                      <div className="flex items-start gap-3">
                        <Clock size={16} className="mt-0.5 flex-shrink-0 text-[var(--color-rose-gold)]" aria-hidden="true" />
                        <p className="font-ui text-sm text-[var(--color-ink-plum)]">{store.hours}</p>
                      </div>
                    )}

                    {store.phone && (
                      <div className="flex items-start gap-3">
                        <Phone size={16} className="mt-0.5 flex-shrink-0 text-[var(--color-rose-gold)]" aria-hidden="true" />
                        <a
                          href={`tel:${store.phone}`}
                          className="font-ui text-sm text-[var(--color-ink-plum)] hover:text-[var(--color-rose-gold)] transition-micro"
                        >
                          {store.phone}
                        </a>
                      </div>
                    )}
                  </div>

                  <a
                    href={`https://maps.google.com/?q=${encodeURIComponent(store.address)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-ui text-sm font-medium text-[var(--color-rose-gold)] hover:underline mt-1 inline-flex items-center gap-1"
                  >
                    Open in Google Maps →
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* WhatsApp help */}
        <div className="mt-16 border border-[var(--color-border-muted)] rounded-[var(--radius-md)] p-8 text-center bg-[var(--color-parchment-100)]">
          <h2 className="font-display text-2xl font-medium text-[var(--color-ink-plum)] mb-3">Can&apos;t visit us in person?</h2>
          <p className="font-ui text-sm text-[var(--color-text-muted)] mb-6">
            Shop our full collection online and get it delivered to your door, or reach us on WhatsApp for personalised help.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a
              href="/shop"
              className="inline-flex items-center justify-center h-11 px-6 rounded-[var(--radius-md)] bg-[var(--color-rose-gold)] text-white font-ui text-sm font-medium hover:bg-[var(--color-rose-gold-dark)] transition-micro"
            >
              Shop online
            </a>
            <a
              href="https://wa.me/8801XXXXXXXXX"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center h-11 px-6 rounded-[var(--radius-md)] border border-[var(--color-whatsapp)] text-[var(--color-whatsapp)] font-ui text-sm font-medium hover:bg-[var(--color-whatsapp)] hover:text-white transition-micro"
            >
              Chat on WhatsApp
            </a>
          </div>
        </div>
      </main>
      <Footer stores={stores} />
      <MobileBottomNav isLoggedIn={isLoggedIn} />
    </>
  )
}
