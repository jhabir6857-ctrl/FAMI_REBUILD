import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getOrderById } from '@/lib/data'
import { formatBDT } from '@/lib/currency'
import { StatusPill } from '@/components/admin/StatusPill'
import { OrderStatusForm } from '@/components/admin/OrderStatusForm'

interface Props {
  params: Promise<{ id: string }>
}

export default async function AdminOrderDetailPage({ params }: Props) {
  const { id } = await params
  const orderId = Number(id)
  if (!Number.isInteger(orderId)) notFound()

  const order = await getOrderById(orderId)
  if (!order) notFound()

  const shipping = order.total - order.subtotal

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link href="/admin/orders" className="text-sm text-[#8a8a8a] hover:text-[#1a1a1a]">← All orders</Link>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-medium">Order #{order.id}</h1>
          <StatusPill status={order.status} />
        </div>
        <OrderStatusForm orderId={order.id} currentStatus={order.status} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rounded border border-[#e0e0e0] bg-white p-5 lg:col-span-2">
          <h2 className="mb-4 text-sm font-medium uppercase tracking-wide text-[#8a8a8a]">Items</h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#f0f0f0] text-left text-xs uppercase tracking-wide text-[#8a8a8a]">
                <th className="pb-2 font-medium">Product</th>
                <th className="pb-2 font-medium">Price</th>
                <th className="pb-2 font-medium">Qty</th>
                <th className="pb-2 text-right font-medium">Line total</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item, i) => (
                <tr key={i} className="border-b border-[#f5f5f5] last:border-0">
                  <td className="py-3">{item.productName}</td>
                  <td className="py-3 text-[#4a4a4a]">{formatBDT(item.price)}</td>
                  <td className="py-3 text-[#4a4a4a]">{item.quantity}</td>
                  <td className="py-3 text-right">{formatBDT(item.price * item.quantity)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="mt-4 flex flex-col items-end gap-1 border-t border-[#f0f0f0] pt-4 text-sm">
            <div className="flex w-48 justify-between text-[#4a4a4a]"><span>Subtotal</span><span>{formatBDT(order.subtotal)}</span></div>
            <div className="flex w-48 justify-between text-[#4a4a4a]"><span>Shipping</span><span>{shipping === 0 ? 'Free' : formatBDT(shipping)}</span></div>
            <div className="flex w-48 justify-between font-medium"><span>Total</span><span>{formatBDT(order.total)}</span></div>
          </div>
          {order.notes && (
            <div className="mt-4 rounded bg-[#fafafa] p-3 text-sm text-[#4a4a4a]">
              <span className="font-medium text-[#1a1a1a]">Note: </span>{order.notes}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-6">
          <div className="rounded border border-[#e0e0e0] bg-white p-5">
            <h2 className="mb-3 text-sm font-medium uppercase tracking-wide text-[#8a8a8a]">Customer</h2>
            <p className="text-sm">{order.name}</p>
            <p className="text-sm text-[#4a4a4a]">{order.email}</p>
            <p className="text-sm text-[#4a4a4a]">{order.phone}</p>
            {order.userId && (
              <Link href="#" className="mt-2 inline-block text-xs text-[#4a4a4a] hover:underline">
                Registered account (#{order.userId})
              </Link>
            )}
            {!order.userId && <p className="mt-2 text-xs text-[#8a8a8a]">Guest checkout</p>}
          </div>

          <div className="rounded border border-[#e0e0e0] bg-white p-5">
            <h2 className="mb-3 text-sm font-medium uppercase tracking-wide text-[#8a8a8a]">Shipping</h2>
            <p className="text-sm text-[#4a4a4a]">{order.shippingAddress}</p>
          </div>

          <div className="rounded border border-[#e0e0e0] bg-white p-5">
            <h2 className="mb-3 text-sm font-medium uppercase tracking-wide text-[#8a8a8a]">Payment</h2>
            <p className="text-sm uppercase text-[#4a4a4a]">{order.paymentMethod}</p>
            <p className="mt-2 text-xs text-[#8a8a8a]">Placed {new Date(order.createdAt).toLocaleString('en-BD', { dateStyle: 'medium', timeStyle: 'short' })}</p>
            {order.pointsEarned > 0 && <p className="mt-1 text-xs text-[#8a8a8a]">{order.pointsEarned} loyalty points earned</p>}
          </div>
        </div>
      </div>
    </div>
  )
}
