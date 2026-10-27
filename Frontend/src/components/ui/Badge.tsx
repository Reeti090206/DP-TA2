import type { HTMLAttributes } from 'react'
import { cn } from '../../lib/cn'

export type BadgeTone = 'neutral' | 'teal' | 'amber' | 'red' | 'blue' | 'green' | 'navy' | 'lime' | 'white'

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone
  dot?: boolean
}

const TONE_CLASSES: Record<BadgeTone, string> = {
  neutral: 'border-black/5 bg-canvas text-ink-muted',
  teal: 'border-emerald-600/15 bg-emerald-50 text-emerald-800',
  amber: 'border-amber-600/15 bg-amber-50 text-amber-800',
  red: 'border-rose-600/15 bg-rose-50 text-rose-800',
  blue: 'border-blue-600/15 bg-blue-50 text-blue-800',
  green: 'border-emerald-600/15 bg-emerald-50 text-emerald-800',
  navy: 'border-black/10 bg-[#181a1b] text-white',
  lime: 'border-lime-strong/30 bg-lime text-lime-ink',
  white: 'border-black/5 bg-white text-ink shadow-2xs',
}

const DOT_CLASSES: Record<BadgeTone, string> = {
  neutral: 'bg-ink-subtle',
  teal: 'bg-emerald-600',
  amber: 'bg-amber-600',
  red: 'bg-rose-600',
  blue: 'bg-blue-600',
  green: 'bg-emerald-600',
  navy: 'bg-lime',
  lime: 'bg-lime-ink',
  white: 'bg-emerald-500',
}

export function Badge({ tone = 'neutral', dot = false, className, children, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-0.5 text-[10.5px] font-semibold leading-4 shadow-2xs',
        TONE_CLASSES[tone],
        className,
      )}
      {...props}
    >
      {dot ? <span aria-hidden="true" className={cn('size-1.5 rounded-full', DOT_CLASSES[tone])} /> : null}
      {children}
    </span>
  )
}
