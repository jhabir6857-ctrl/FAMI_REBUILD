import { getCategories, getStores } from '@/lib/data'
import { auth } from '@/lib/auth'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { MobileBottomNav } from '@/components/layout/MobileBottomNav'
import { ContactForm } from '@/components/contact/ContactForm'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Contact',
  description: 'Get in touch with FaMi — we\'re happy to help with orders, product questions, or anything else.',
}

export default async function ContactPage() {
  const [categories, stores, session] = await Promise.all([
    getCategories(),
    getStores(),
    auth(),
  ])
  const isLoggedIn = Boolean(session?.user)

  return (
    <>
      <Header categories={categories} isLoggedIn={isLoggedIn} />
      <main className="container-fami py-10 md:py-16 pb-24 md:pb-16">
        {/* Header */}
        <div className="mb-10">
          <span className="hallmark-stamp mb-4 inline-block">Get in touch</span>
          <h1 className="font-display text-4xl md:text-5xl font-medium text-[var(--color-ink-plum)] leading-tight">
            We&apos;d love to hear from you
          </h1>
          <p className="font-ui text-base text-[var(--color-text-muted)] mt-3 max-w-xl">
            Have a question about an order, a product, or anything else? Send us a message and we&apos;ll get back to you within 24 hours.
          </p>
        </div>

        <hr className="divider-gold mb-10" />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Contact form */}
          <div className="lg:col-span-2">
            <ContactForm />
          </div>

          {/* Contact info sidebar */}
          <div className="flex flex-col gap-8">
            {/* WhatsApp */}
            <div>
              <h2 className="font-display text-xl font-medium text-[var(--color-ink-plum)] mb-3">Quick help on WhatsApp</h2>
              <p className="font-ui text-sm text-[var(--color-text-muted)] mb-4">
                For order queries, product questions, or a styling consult — reach us directly on WhatsApp for the fastest response.
              </p>
              <a
                href="https://wa.me/8801XXXXXXXXX"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 h-11 px-6 rounded-[var(--radius-md)] border border-[var(--color-whatsapp)] text-[var(--color-whatsapp)] font-ui text-sm font-medium hover:bg-[var(--color-whatsapp)] hover:text-white transition-micro"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4" aria-hidden="true">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                Chat on WhatsApp
              </a>
            </div>

            {/* Email */}
            <div>
              <h2 className="font-display text-xl font-medium text-[var(--color-ink-plum)] mb-3">Email us</h2>
              <p className="font-ui text-sm text-[var(--color-text-muted)] mb-2">
                Prefer email? Write to us at:
              </p>
              <a
                href="mailto:hello@famibd.shop"
                className="font-ui text-sm font-medium text-[var(--color-rose-gold)] hover:underline"
              >
                hello@famibd.shop
              </a>
            </div>

            {/* Store locations */}
            {stores.length > 0 && (
              <div>
                <h2 className="font-display text-xl font-medium text-[var(--color-ink-plum)] mb-3">Visit us in store</h2>
                <div className="flex flex-col gap-4">
                  {stores.map(store => (
                    <div key={store.id} className="flex flex-col gap-0.5">
                      <p className="font-ui text-sm font-medium text-[var(--color-ink-plum)]">{store.name}</p>
                      <p className="font-ui text-xs text-[var(--color-text-muted)]">{store.address}</p>
                      <p className="font-ui text-xs text-[var(--color-text-muted)]">{store.hours}</p>
                      {store.phone && (
                        <a href={`tel:${store.phone}`} className="font-ui text-xs text-[var(--color-rose-gold)] hover:underline">{store.phone}</a>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer stores={stores} />
      <MobileBottomNav isLoggedIn={isLoggedIn} />
    </>
  )
}
