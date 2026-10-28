import type { HTMLAttributes, ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'
import { cn } from '../../lib/cn'

type PanelProps = HTMLAttributes<HTMLElement>

export function Panel({ className, children, ...props }: PanelProps) {
  return (
    <section
      className={cn(
        'rounded-[28px] border border-black/[0.05] bg-surface shadow-bento overflow-hidden',
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
        'flex items-start justify-between gap-3 border-b border-line/70 px-5 py-4',
        className,
      )}
    >
      <div className="flex min-w-0 items-start gap-3">
        {Icon ? (
          <span className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-lg border border-black/5 bg-canvas text-ink">
            <Icon aria-hidden="true" size={13} strokeWidth={2} />
          </span>
        ) : null}
        <div className="min-w-0">
          <h2 className="text-[14px] font-semibold tracking-[-0.01em] text-ink font-display">{title}</h2>
          {description ? (
            <p className="mt-0.5 text-[11px] leading-4 text-ink-muted">{description}</p>
          ) : null}
        </div>
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  )
}
