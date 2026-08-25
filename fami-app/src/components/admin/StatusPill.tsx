import type { OrderStatus } from '@/types'

const styles: Record<OrderStatus, string> = {
  pending: 'bg-[#fff4e0] text-[#8a5a00]',
  confirmed: 'bg-[#e0edff] text-[#0a4fa0]',
  shipped: 'bg-[#e8e0ff] text-[#5a2fa0]',
  delivered: 'bg-[#e0f5e8] text-[#0a7a3a]',
  cancelled: 'bg-[#f5e0e0] text-[#a02020]',
}

export function StatusPill({ status }: { status: OrderStatus }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium capitalize ${styles[status]}`}>
      {status}
    </span>
  )
}
