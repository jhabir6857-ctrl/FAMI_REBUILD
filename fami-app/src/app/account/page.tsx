import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { getUserById, getUserOrders, getCategories } from '@/lib/data'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { MobileBottomNav } from '@/components/layout/MobileBottomNav'
import { Badge } from '@/components/ui/Badge'
import { SignOutButton } from '@/components/account/SignOutButton'
import { formatBDT } from '@/lib/currency'
import { EmptyState } from '@/components/ui/EmptyState'

export default async function AccountPage() {
  const session = await auth()
  if (!session?.user) redirect('/login')

  const userId = Number(session.user.id)
  
  // Instantly route Admins to the Admin Dashboard
  if (session.user.role === 'admin') {
    redirect('/admin')
  }

  const [user, orders, categories] = await Promise.all([
    getUserById(userId),
    getUserOrders(userId),
    getCategories(),
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
          <div className="py-8">
            <EmptyState type="orders" />
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
      <Footer />
      <MobileBottomNav isLoggedIn />
    </>
  )
}

