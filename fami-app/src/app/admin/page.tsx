import Link from 'next/link'
import { getDashboardStats } from '@/lib/data'
import { formatBDT } from '@/lib/currency'
import { StatusPill } from '@/components/admin/StatusPill'

export const metadata = { title: 'Admin dashboard' }

export default async function AdminDashboardPage() {
  const stats = await getDashboardStats()

  const cards = [
    { label: 'Total orders', value: stats.totalOrders.toLocaleString() },
    { label: 'Total revenue', value: formatBDT(stats.totalRevenue) },
    { label: 'Pending orders', value: stats.pendingOrders.toLocaleString() },
    { label: 'Customers', value: stats.totalCustomers.toLocaleString() },
  ]

  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-2xl font-medium">Dashboard</h1>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {cards.map(c => (
          <div key={c.label} className="rounded-lg border border-[#e0e0e0] bg-white p-5 shadow-sm border-t-2" style={{ borderTopColor: '#b76e79' }}>
            <p className="text-xs uppercase tracking-wide text-[#8a8a8a]">{c.label}</p>
            <p className="mt-2 text-3xl font-semibold text-[#1a1a1a]">{c.value}</p>
          </div>
        ))}
      </div>

      <div className="rounded border border-[#e0e0e0] bg-white">
        <div className="flex items-center justify-between border-b border-[#e0e0e0] p-5">
          <h2 className="text-base font-medium">Recent orders</h2>
          <Link href="/admin/orders" className="text-sm text-[#4a4a4a] hover:underline">View all →</Link>
        </div>
        {stats.recentOrders.length === 0 ? (
          <p className="p-5 text-sm text-[#8a8a8a]">No orders yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#e0e0e0] text-left text-xs uppercase tracking-wide text-[#8a8a8a]">
                  <th className="px-5 py-3 font-medium">Order</th>
                  <th className="px-5 py-3 font-medium">Customer</th>
                  <th className="px-5 py-3 font-medium">Total</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium">Placed</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentOrders.map(order => (
                  <tr key={order.id} className="border-b border-[#f0f0f0] last:border-0 hover:bg-[#fafafa]">
                    <td className="px-5 py-3">
                      <Link href={`/admin/orders/${order.id}`} className="font-medium hover:underline">#{order.id}</Link>
                    </td>
                    <td className="px-5 py-3">{order.name}</td>
                    <td className="px-5 py-3">{formatBDT(order.total)}</td>
                    <td className="px-5 py-3"><StatusPill status={order.status} /></td>
                    <td className="px-5 py-3 text-[#8a8a8a]">{new Date(order.createdAt).toLocaleDateString('en-BD', { dateStyle: 'medium' })}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
