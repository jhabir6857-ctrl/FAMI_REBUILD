'use client'

import type { ButtonHTMLAttributes } from 'react'

type Variant = 'primary' | 'outline' | 'ghost'
type Size = 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  loading?: boolean
}

const sizeClasses: Record<Size, string> = {
  sm: 'h-9 px-4 text-xs',
  md: 'h-11 px-6 text-sm',
  lg: 'h-12 px-8 text-sm',
}

// Rose Gold is the single accent — per the design system, at most one
// primary (filled) button per screen. Outline/ghost cover everything else.
const variantClasses: Record<Variant, string> = {
  primary:
    'bg-[var(--color-rose-gold)] text-white hover:bg-[var(--color-rose-gold-dark)] disabled:bg-[var(--color-border-muted)] disabled:text-[var(--color-text-muted)]',
  outline:
    'border border-[var(--color-ink-plum)] text-[var(--color-ink-plum)] hover:bg-[var(--color-ink-plum-50)] disabled:border-[var(--color-border)] disabled:text-[var(--color-text-muted)]',
  ghost:
    'text-[var(--color-ink-plum)] hover:bg-[var(--color-ink-plum-50)] disabled:text-[var(--color-text-muted)]',
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled,
  className = '',
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      disabled={disabled ?? loading}
      className={`inline-flex items-center justify-center gap-2 rounded-[var(--radius-sm)] font-ui font-normal tracking-wider transition-all duration-300 press-active disabled:cursor-not-allowed ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
    >
      {loading && (
        <span
          aria-hidden="true"
          className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
        />
      )}
      <span className="flex items-center justify-center gap-2">{children}</span>
    </button>
  )
}
