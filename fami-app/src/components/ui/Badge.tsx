import type { ReactNode } from 'react'

type BadgeVariant = 'new' | 'sale' | 'loyalty' | 'out-of-stock'

// Loyalty uses Emerald — its one sanctioned use outside the account page,
// per the design system's "final" ruling on Emerald/Terracotta usage.
const variantClasses: Record<BadgeVariant, string> = {
  new: 'bg-[var(--color-rose-gold-50)] text-[var(--color-rose-gold-dark)]',
  sale: 'bg-[var(--color-ink-plum)] text-white',
  loyalty: 'bg-[var(--color-emerald-50)] text-[var(--color-emerald)]',
  'out-of-stock': 'bg-[var(--color-border-muted)] text-[var(--color-text-muted)]',
}

export function Badge({ variant, children }: { variant: BadgeVariant; children: ReactNode }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 font-ui text-xs font-medium capitalize ${variantClasses[variant]}`}
    >
      {children}
    </span>
  )
}
