import type { ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'
import { cn } from '../../lib/cn'

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description: string
  action?: ReactNode
  compact?: boolean
  className?: string
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  compact = false,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center',
        compact ? 'px-4 py-6' : 'px-6 py-9',
        className,
      )}
    >
      <div
        className={cn(
          'grid place-items-center rounded-xl border border-dashed border-line-strong bg-canvas/70 text-ink-subtle',
          compact ? 'size-9' : 'size-11',
        )}
      >
        <Icon aria-hidden="true" size={compact ? 16 : 19} strokeWidth={1.7} />
      </div>
      <h3 className={cn('font-semibold text-navy', compact ? 'mt-2.5 text-xs' : 'mt-3 text-[13px]')}>
        {title}
      </h3>
      <p
        className={cn(
          'max-w-[290px] text-balance text-ink-muted',
          compact ? 'mt-1 text-[10.5px] leading-4' : 'mt-1.5 text-[11px] leading-[1.65]',
        )}
      >
        {description}
      </p>
      {action ? <div className="mt-3.5">{action}</div> : null}
    </div>
  )
}
