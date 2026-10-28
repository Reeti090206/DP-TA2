import type { ButtonHTMLAttributes } from 'react'
import { cn } from '../../lib/cn'

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'lime'
type ButtonSize = 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
}

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary:
    'bg-[#181a1b] text-white shadow-xs hover:bg-black hover:scale-[1.01] active:scale-[0.98] focus-visible:ring-black/20 disabled:hover:bg-[#181a1b] disabled:hover:scale-100',
  secondary:
    'border border-black/[0.08] bg-white text-ink shadow-xs hover:bg-neutral-50 hover:border-black/15 hover:scale-[1.01] active:scale-[0.98] focus-visible:ring-black/10',
  ghost: 'text-ink-muted hover:bg-black/5 hover:text-ink active:scale-[0.98] focus-visible:ring-black/10',
  danger:
    'bg-risk-critical text-white shadow-xs hover:bg-rose-700 hover:scale-[1.01] active:scale-[0.98] focus-visible:ring-rose-500/25 disabled:hover:bg-risk-critical',
  lime:
    'bg-lime text-lime-ink font-bold shadow-xs hover:bg-[#deee6e] hover:scale-[1.01] active:scale-[0.98] focus-visible:ring-lime-strong/30',
}

const SIZE_CLASSES: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 text-[11.5px]',
  md: 'h-9 px-4 text-xs',
  lg: 'h-10 px-5 text-sm',
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
        'inline-flex shrink-0 items-center justify-center gap-2 rounded-lg font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:opacity-45 disabled:pointer-events-none cursor-pointer',
        VARIANT_CLASSES[variant],
        SIZE_CLASSES[size],
        className,
      )}
      {...props}
    />
  )
}
