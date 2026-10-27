import type { ReactNode } from 'react'

interface PageHeaderProps {
  eyebrow: string
  title: string
  description: string
  actions?: ReactNode
}

export function PageHeader({ eyebrow, title, description, actions }: PageHeaderProps) {
  return (
    <div className="mb-5 flex flex-col gap-3.5 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        <div className="flex items-center gap-2 text-[9.5px] font-bold uppercase tracking-[0.17em] text-brand-strong">
          <span aria-hidden="true" className="size-1.5 rounded-full bg-brand" />
          {eyebrow}
        </div>
        <h1 className="mt-1.5 text-[26px] font-semibold tracking-[-0.035em] text-navy sm:text-[30px]">
          {title}
        </h1>
        <p className="mt-1 max-w-xl text-[12px] leading-[1.6] text-ink-muted">{description}</p>
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  )
}
