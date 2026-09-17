'use server'

import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { AdminSidebar } from '@/components/admin/AdminSidebar'

// Defense in depth: middleware already blocks non-admins from reaching this
// layout, but a layout that assumes middleware always ran is one config
// change away from a hole. Re-check here too.
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (session?.user?.role !== 'admin') redirect('/login?callbackUrl=/admin')

  const adminName = session.user?.name ?? 'Admin'
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'
  const dateStr = new Date().toLocaleDateString('en-BD', { weekday: 'long', day: 'numeric', month: 'long' })

  return (
    <div className="flex min-h-screen font-ui text-[#1a1a1a] relative">
      <AdminSidebar />

      {/* ── Main area ── */}
      <div className="flex flex-1 flex-col bg-[#f5f5f5] w-full min-w-0">
        {/* Top header bar */}
        <header className="flex items-center justify-between border-b border-[#e0e0e0] bg-white px-14 md:px-8 py-4">
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
