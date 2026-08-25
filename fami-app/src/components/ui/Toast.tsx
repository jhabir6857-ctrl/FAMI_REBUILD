'use client'

import { useEffect } from 'react'
import { CheckCircle2, XCircle } from 'lucide-react'

interface ToastProps {
  message: string
  type?: 'success' | 'error'
  onDismiss: () => void
  duration?: number
}

export function Toast({ message, type = 'success', onDismiss, duration = 2500 }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onDismiss, duration)
    return () => clearTimeout(timer)
  }, [onDismiss, duration])

  const Icon = type === 'success' ? CheckCircle2 : XCircle
  const iconColor = type === 'success' ? 'var(--color-emerald)' : 'var(--color-terracotta)'

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-20 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 rounded-[var(--radius-md)] border border-[var(--color-border-muted)] bg-white px-4 py-3 shadow-lg md:bottom-6"
    >
      <Icon size={18} color={iconColor} aria-hidden="true" />
      <span className="font-ui text-sm text-[var(--color-ink-plum)]">{message}</span>
    </div>
  )
}
