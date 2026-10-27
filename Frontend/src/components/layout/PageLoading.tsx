import { LoaderCircle } from 'lucide-react'

export function PageLoading() {
  return (
    <div role="status" aria-live="polite" className="grid min-h-[50vh] place-items-center">
      <div className="flex items-center gap-2 text-[11px] font-medium text-ink-muted">
        <LoaderCircle aria-hidden="true" size={16} className="animate-spin text-brand" />
        Loading workspace
      </div>
    </div>
  )
}
