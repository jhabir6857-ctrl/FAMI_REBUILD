import Link from 'next/link'
import { getAllOrders } from '@/lib/data'
import { formatBDT } from '@/lib/currency'
import { StatusPill } from '@/components/admin/StatusPill'
import type { OrderStatus } from '@/types'

export const metadata = { title: 'Orders · Admin' }

const STATUSES: OrderStatus[] = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled']

interface Props {
  searchParams: Promise<{ status?: string }>
}

export default async function AdminOrdersPage({ searchParams }: Props) {
  const { status } = await searchParams
  const activeStatus = STATUSES.includes(status as OrderStatus) ? (status as OrderStatus) : undefined
  const orders = await getAllOrders(activeStatus)

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-medium">Orders</h1>
        <p className="text-sm text-[#8a8a8a]">{orders.length} order{orders.length === 1 ? '' : 's'}</p>
      </div>

      <div className="flex flex-wrap gap-2">
        <Link
          href="/admin/orders"
          className={`rounded-full border px-3 py-1.5 text-sm ${!activeStatus ? 'border-[#1a1a1a] bg-[#1a1a1a] text-white' : 'border-[#e0e0e0] text-[#4a4a4a] hover:border-[#b0b0b0]'}`}
        >
          All
        </Link>
        {STATUSES.map(s => (
          <Link
            key={s}
            href={`/admin/orders?status=${s}`}
            className={`rounded-full border px-3 py-1.5 text-sm capitalize ${activeStatus === s ? 'border-[#1a1a1a] bg-[#1a1a1a] text-white' : 'border-[#e0e0e0] text-[#4a4a4a] hover:border-[#b0b0b0]'}`}
          >
            {s}
          </Link>
        ))}
      </div>

      <div className="rounded border border-[#e0e0e0] bg-white">
        {orders.length === 0 ? (
          <p className="p-5 text-sm text-[#8a8a8a]">No orders match this filter.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#e0e0e0] text-left text-xs uppercase tracking-wide text-[#8a8a8a]">
                <th className="px-5 py-3 font-medium">Order</th>
                <th className="px-5 py-3 font-medium">Customer</th>
                <th className="px-5 py-3 font-medium">Items</th>
                <th className="px-5 py-3 font-medium">Total</th>
                <th className="px-5 py-3 font-medium">Payment</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium">Placed</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(order => (
                <tr key={order.id} className="border-b border-[#f0f0f0] last:border-0 hover:bg-[#fafafa]">
                  <td className="px-5 py-3">
                    <Link href={`/admin/orders/${order.id}`} className="font-medium hover:underline">#{order.id}</Link>
                  </td>
                  <td className="px-5 py-3">
                    <div>{order.name}</div>
                    <div className="text-xs text-[#8a8a8a]">{order.email}</div>
                  </td>
                  <td className="px-5 py-3 text-[#4a4a4a]">{order.items.reduce((n, i) => n + i.quantity, 0)}</td>
                  <td className="px-5 py-3">{formatBDT(order.total)}</td>
                  <td className="px-5 py-3 uppercase text-[#4a4a4a]">{order.paymentMethod}</td>
                  <td className="px-5 py-3"><StatusPill status={order.status} /></td>
                  <td className="px-5 py-3 text-[#8a8a8a]">{new Date(order.createdAt).toLocaleDateString('en-BD', { dateStyle: 'medium' })}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
