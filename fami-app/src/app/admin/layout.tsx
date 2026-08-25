'use server'

import { redirect } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { auth } from '@/lib/auth'
import { SignOutButton } from '@/components/account/SignOutButton'

// Defense in depth: middleware already blocks non-admins from reaching this
// layout, but a layout that assumes middleware always ran is one config
// change away from a hole. Re-check here too.
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (session?.user?.role !== 'admin') redirect('/login?callbackUrl=/admin')

  const adminName = session.user.name ?? 'Admin'
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'
  const dateStr = new Date().toLocaleDateString('en-BD', { weekday: 'long', day: 'numeric', month: 'long' })

  return (
    <div className="flex min-h-screen font-ui text-[#1a1a1a]">
      {/* ── Sidebar — dark plum, branded ── */}
      <aside className="flex w-64 flex-shrink-0 flex-col bg-[var(--color-ink-plum)]">
        {/* Logo + wordmark */}
        <div className="flex items-center gap-3 border-b border-white/10 px-5 py-5">
          <Image
            src="/logo.jpg"
            alt="FaMi"
            width={36}
            height={36}
            className="rounded-sm object-contain"
          />
          <div>
            <p className="font-display text-base font-medium text-white leading-none">FaMi</p>
            <p className="font-ui text-[10px] text-[var(--color-rose-gold-light)] uppercase tracking-widest mt-0.5">Admin</p>
          </div>
        </div>

        {/* Nav links */}
        <nav className="flex flex-col gap-0.5 px-3 py-4 flex-1" aria-label="Admin navigation">
          {[
            { href: '/admin', label: 'Dashboard' },
            { href: '/admin/orders', label: 'Orders' },
            { href: '/admin/products', label: 'Products' },
            { href: '/admin/blog', label: 'Blog' },
            { href: '/admin/stores', label: 'Stores' },
          ].map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-white/70 transition-colors hover:bg-white/10 hover:text-white"
            >
              {label}
            </Link>
          ))}
        </nav>

        {/* Bottom actions */}
        <div className="flex flex-col gap-2 border-t border-white/10 px-5 py-4">
          <Link
            href="/"
            className="font-ui text-xs text-white/50 hover:text-white/80 transition-micro"
          >
            ← Back to site
          </Link>
          <SignOutButton />
        </div>
      </aside>

      {/* ── Main area ── */}
      <div className="flex flex-1 flex-col bg-[#f5f5f5]">
        {/* Top header bar */}
        <header className="flex items-center justify-between border-b border-[#e0e0e0] bg-white px-8 py-4">
          <div>
            <p className="text-xs text-[#8a8a8a]">{dateStr}</p>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium text-[#1a1a1a]">{greeting}, {adminName}</p>
            <p className="text-xs text-[#8a8a8a]">FaMi Admin Panel</p>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-6 md:p-8">{children}</main>
      </div>
    </div>
  )
}
