import { CircleAlert, X } from 'lucide-react'
import { cn } from '../../lib/cn'
import type { WorkspaceNotice as WorkspaceNoticeData } from '../../lib/workspacePersistence'

interface WorkspaceNoticeProps {
  notice: WorkspaceNoticeData
  onDismiss: () => void
}

export function WorkspaceNotice({ notice, onDismiss }: WorkspaceNoticeProps) {
  const isError = notice.tone === 'error'

  return (
    <div
      role={isError ? 'alert' : 'status'}
      className={cn(
        'notice-enter mb-4 flex items-start gap-2.5 rounded-lg border px-3.5 py-2.5 text-[10.5px] leading-4',
        isError
          ? 'border-risk-critical/20 bg-risk-critical-soft text-risk-critical'
          : 'border-risk-high/25 bg-risk-high-soft text-risk-high',
      )}
    >
      <CircleAlert aria-hidden="true" size={14} className="mt-0.5 shrink-0" />
      <div className="min-w-0 flex-1">
        <p className="font-semibold">{notice.title}</p>
        <p className="mt-0.5 opacity-90">{notice.message}</p>
      </div>
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Dismiss workspace notice"
        className="grid size-5 shrink-0 place-items-center rounded opacity-70 transition-opacity hover:bg-white/50 hover:opacity-100"
      >
        <X aria-hidden="true" size={12} />
      </button>
    </div>
  )
}
