import { ShoppingBag, Heart, PackageOpen, LucideIcon } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'

export type EmptyStateType = 'cart' | 'wishlist' | 'orders'

interface EmptyStateProps {
  type: EmptyStateType
  title?: string
  description?: string
  actionText?: string
  actionHref?: string
  onActionClick?: () => void
}

const config: Record<EmptyStateType, { icon: LucideIcon; title: string; description: string; actionText: string }> = {
  cart: {
    icon: ShoppingBag,
    title: 'Your cart is empty',
    description: 'Looks like you haven\'t added anything to your cart yet. Discover our curated collection of luxury pieces.',
    actionText: 'Explore collection',
  },
  wishlist: {
    icon: Heart,
    title: 'Your wishlist is empty',
    description: 'Save your favorite pieces here to review later. Keep track of the items you love.',
    actionText: 'Discover favorites',
  },
  orders: {
    icon: PackageOpen,
    title: 'No orders found',
    description: 'You haven\'t placed any orders yet. Once you do, you\'ll be able to track their status here.',
    actionText: 'Start shopping',
  }
}

export function EmptyState({ 
  type, 
  title, 
  description, 
  actionText, 
  actionHref = '/shop',
  onActionClick 
}: EmptyStateProps) {
  const currentConfig = config[type]
  const Icon = currentConfig.icon
  
  const displayTitle = title || currentConfig.title
  const displayDescription = description || currentConfig.description
  const displayActionText = actionText || currentConfig.actionText

  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[40vh] text-center px-4 animate-fade-in">
      <div className="relative mb-6">
        <div className="absolute inset-0 bg-[var(--color-rose-gold)]/10 rounded-full blur-2xl transform scale-150 animate-pulse-slow" />
        <div className="relative flex items-center justify-center w-20 h-20 rounded-full bg-[var(--color-parchment-100)] border border-[var(--color-border)] shadow-sm">
          <Icon size={32} strokeWidth={1} className="text-[var(--color-rose-gold)]" />
        </div>
      </div>
      
      <h3 className="font-editorial text-2xl text-[var(--color-ink-plum)] mb-3">
        {displayTitle}
      </h3>
      
      <p className="font-ui text-[var(--color-text-muted)] max-w-sm mb-8 leading-relaxed">
        {displayDescription}
      </p>

      {onActionClick ? (
        <Button onClick={onActionClick} className="w-full sm:w-auto h-12 px-8 rounded-full bg-[var(--color-ink-plum)] text-white hover:bg-[var(--color-ink-plum)]/90 transition-all duration-300 shadow-md press-active">
          {displayActionText}
        </Button>
      ) : (
        <Link href={actionHref} className="inline-flex items-center justify-center h-12 px-8 rounded-full bg-[var(--color-ink-plum)] text-white font-ui text-sm font-medium hover:bg-[var(--color-ink-plum)]/90 transition-all duration-300 shadow-md press-active">
          {displayActionText}
        </Link>
      )}
    </div>
  )
}
