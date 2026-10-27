import type { ButtonHTMLAttributes } from 'react'
import { cn } from '../../lib/cn'

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'
type ButtonSize = 'sm' | 'md'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
}

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary:
    'bg-brand text-white shadow-sm hover:bg-brand-strong focus-visible:ring-brand/25 disabled:hover:bg-brand',
  secondary:
    'border border-line-strong bg-white text-ink shadow-sm hover:border-brand-line hover:bg-brand-soft/50 focus-visible:ring-brand/20',
  ghost: 'text-ink-muted hover:bg-canvas hover:text-ink focus-visible:ring-brand/20',
  danger:
    'bg-risk-critical text-white shadow-sm hover:bg-risk-critical/90 focus-visible:ring-risk-critical/25 disabled:hover:bg-risk-critical',
}

const SIZE_CLASSES: Record<ButtonSize, string> = {
  sm: 'h-8 px-2.5 text-[11px]',
  md: 'h-9 px-3.5 text-xs',
}

export function Button({
  className,
  variant = 'primary',
  size = 'md',
  type = 'button',
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        'inline-flex shrink-0 items-center justify-center gap-1.5 rounded-lg font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:opacity-45',
        VARIANT_CLASSES[variant],
        SIZE_CLASSES[size],
        className,
      )}
      {...props}
    />
  )
}
