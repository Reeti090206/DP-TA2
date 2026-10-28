import type { HTMLAttributes } from 'react'
import { cn } from '../../lib/cn'

export type BadgeTone = 'neutral' | 'teal' | 'amber' | 'red' | 'blue' | 'green' | 'navy' | 'lime' | 'white'

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone
  dot?: boolean
}

const TONE_CLASSES: Record<BadgeTone, string> = {
  neutral: 'border-black/10 bg-black/[0.04] text-neutral-700',
  teal: 'border-emerald-600/25 bg-emerald-50 text-emerald-800',
  amber: 'border-amber-600/25 bg-amber-50 text-amber-900',
  red: 'border-rose-600/30 bg-rose-50 text-rose-800',
  blue: 'border-blue-600/25 bg-blue-50 text-blue-800',
  green: 'border-emerald-600/25 bg-emerald-50 text-emerald-800',
  navy: 'border-neutral-800 bg-[#181a1b] text-white',
  lime: 'border-lime-strong/50 bg-[#e7fb63] text-neutral-900',
  white: 'border-black/10 bg-white text-neutral-800',
}

const DOT_CLASSES: Record<BadgeTone, string> = {
  neutral: 'bg-neutral-500',
  teal: 'bg-emerald-600',
  amber: 'bg-amber-600',
  red: 'bg-rose-600',
  blue: 'bg-blue-600',
  green: 'bg-emerald-600',
  navy: 'bg-[#ebff70]',
  lime: 'bg-neutral-900',
  white: 'bg-emerald-600',
}

export function Badge({ tone = 'neutral', dot = false, className, children, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 whitespace-nowrap rounded-[5px] border px-2 py-0.5 text-[11px] font-medium leading-4 tracking-tight',
        TONE_CLASSES[tone],
        className,
      )}
      {...props}
    >
      {dot ? <span aria-hidden="true" className={cn('size-1.5 rounded-full shrink-0', DOT_CLASSES[tone])} /> : null}
      {children}
    </span>
  )
}
