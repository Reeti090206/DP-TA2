import type { HTMLAttributes, ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'
import { cn } from '../../lib/cn'

type PanelProps = HTMLAttributes<HTMLElement>

export function Panel({ className, children, ...props }: PanelProps) {
  return (
    <section
      className={cn(
        'rounded-xl border border-line bg-surface shadow-panel',
        className,
      )}
      {...props}
    >
      {children}
    </section>
  )
}

interface PanelHeaderProps {
  title: string
  description?: ReactNode
  icon?: LucideIcon
  action?: ReactNode
  className?: string
}

export function PanelHeader({
  title,
  description,
  icon: Icon,
  action,
  className,
}: PanelHeaderProps) {
  return (
    <div
      className={cn(
        'flex items-start justify-between gap-3 border-b border-line px-4 py-3',
        className,
      )}
    >
      <div className="flex min-w-0 items-start gap-2.5">
        {Icon ? (
          <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-md border border-line bg-canvas text-ink-muted">
            <Icon aria-hidden="true" size={13} strokeWidth={1.9} />
          </span>
        ) : null}
        <div className="min-w-0">
          <h2 className="text-[13px] font-semibold tracking-[-0.005em] text-navy">{title}</h2>
          {description ? (
            <p className="mt-0.5 text-[10.5px] leading-4 text-ink-muted">{description}</p>
          ) : null}
        </div>
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  )
}
