import { useEffect, useId, type ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'
import { X } from 'lucide-react'
import { cn } from '../../lib/cn'

interface DialogProps {
  title: string
  description: string
  icon: LucideIcon
  onClose: () => void
  children: ReactNode
  footer?: ReactNode
  width?: 'md' | 'lg'
}

export function Dialog({
  title,
  description,
  icon: Icon,
  onClose,
  children,
  footer,
  width = 'md',
}: DialogProps) {
  const titleId = useId()
  const descriptionId = useId()

  useEffect(() => {
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [onClose])

  return (
    <div className="fixed inset-0 z-50 grid place-items-center p-4">
      <div
        aria-hidden="true"
        onClick={onClose}
        className="modal-backdrop absolute inset-0 bg-navy/45 backdrop-blur-[2px]"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        className={cn(
          'dialog-panel relative w-full overflow-hidden rounded-xl border border-line bg-white shadow-float',
          width === 'lg' ? 'max-w-lg' : 'max-w-md',
        )}
      >
        <div className="flex items-start gap-3 border-b border-line px-5 py-4">
          <span className="grid size-9 shrink-0 place-items-center rounded-lg border border-brand-line bg-brand-soft text-brand-strong">
            <Icon aria-hidden="true" size={17} />
          </span>
          <div className="min-w-0 flex-1">
            <h2 id={titleId} className="text-[15px] font-semibold tracking-[-0.015em] text-navy">
              {title}
            </h2>
            <p id={descriptionId} className="mt-0.5 text-[10.5px] leading-4 text-ink-muted">
              {description}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="grid size-7 shrink-0 place-items-center rounded-md text-ink-subtle transition-colors hover:bg-canvas hover:text-ink"
          >
            <X aria-hidden="true" size={15} />
          </button>
        </div>

        <div className="scrollbar-subtle max-h-[min(70vh,560px)] overflow-y-auto px-5 py-4">
          {children}
        </div>

        {footer ? (
          <div className="flex items-center justify-between gap-2 border-t border-line bg-canvas/35 px-5 py-3">
            {footer}
          </div>
        ) : null}
      </div>
    </div>
  )
}
