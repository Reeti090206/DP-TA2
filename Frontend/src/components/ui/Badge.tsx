import type { HTMLAttributes } from 'react'
import { cn } from '../../lib/cn'

export type BadgeTone = 'neutral' | 'teal' | 'amber' | 'red' | 'blue' | 'green' | 'navy'

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone
  dot?: boolean
}

const TONE_CLASSES: Record<BadgeTone, string> = {
  neutral: 'border-line bg-canvas text-ink-muted',
  teal: 'border-brand-line bg-brand-soft text-brand-strong',
  amber: 'border-risk-high/20 bg-risk-high-soft text-risk-high',
  red: 'border-risk-critical/20 bg-risk-critical-soft text-risk-critical',
  blue: 'border-risk-medium/20 bg-risk-medium-soft text-risk-medium',
  green: 'border-risk-low/20 bg-risk-low-soft text-risk-low',
  navy: 'border-navy/10 bg-navy text-white',
}

const DOT_CLASSES: Record<BadgeTone, string> = {
  neutral: 'bg-ink-subtle',
  teal: 'bg-brand',
  amber: 'bg-risk-high',
  red: 'bg-risk-critical',
  blue: 'bg-risk-medium',
  green: 'bg-risk-low',
  navy: 'bg-brand-light',
}

export function Badge({ tone = 'neutral', dot = false, className, children, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 whitespace-nowrap rounded-md border px-1.5 py-0.5 text-[10px] font-semibold leading-4',
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
