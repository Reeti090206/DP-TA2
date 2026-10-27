import type { ReactNode } from 'react'

interface PageHeaderProps {
  eyebrow: string
  title: string
  description: string
  actions?: ReactNode
}

export function PageHeader({ eyebrow, title, description, actions }: PageHeaderProps) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-neutral-500">
          <span aria-hidden="true" className="size-2 rounded-full bg-lime border border-lime-strong" />
          {eyebrow}
        </div>
        <h2 className="mt-1.5 text-2xl sm:text-3xl font-bold tracking-tight text-[#141618] font-display">
          {title}
        </h2>
        <p className="mt-1 max-w-2xl text-xs sm:text-[13px] leading-relaxed text-neutral-500">
          {description}
        </p>
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2 shrink-0">{actions}</div> : null}
    </div>
  )
}
