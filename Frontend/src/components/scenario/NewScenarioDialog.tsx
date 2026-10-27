import { useEffect, useId, useState, type FormEvent } from 'react'
import { FlaskConical, GitBranch, Plus, TriangleAlert, X } from 'lucide-react'
import { Button } from '../ui/Button'

interface NewScenarioDialogProps {
  existingNames: string[]
  onClose: () => void
  onCreate: (name: string) => void
}

const MAX_NAME_LENGTH = 48

export function NewScenarioDialog({
  existingNames,
  onClose,
  onCreate,
}: NewScenarioDialogProps) {
  const [name, setName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const titleId = useId()
  const descriptionId = useId()
  const errorId = useId()

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

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const normalizedName = name.trim().replace(/\s+/g, ' ')

    if (normalizedName.length === 0) {
      setError('Enter a name for the scenario.')
      return
    }

    if (normalizedName.length > MAX_NAME_LENGTH) {
      setError(`Keep the name to ${MAX_NAME_LENGTH} characters or fewer.`)
      return
    }

    const duplicate = existingNames.some(
      (existingName) => existingName.toLowerCase() === normalizedName.toLowerCase(),
    )

    if (duplicate) {
      setError('A scenario with this name already exists.')
      return
    }

    onCreate(normalizedName)
  }

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
        className="dialog-panel relative w-full max-w-md overflow-hidden rounded-[28px] border border-black/10 bg-white shadow-2xl"
      >
        <div className="flex items-start gap-3.5 border-b border-black/[0.06] px-6 py-5">
          <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-canvas text-ink border border-black/5">
            <FlaskConical aria-hidden="true" size={18} strokeWidth={2} />
          </span>
          <div className="min-w-0 flex-1">
            <h2 id={titleId} className="text-base font-bold tracking-tight text-ink font-display">
              Create draft scenario
            </h2>
            <p id={descriptionId} className="mt-0.5 text-xs text-neutral-500">
              Start a what-if model without changing the read-only baseline.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="grid size-8 shrink-0 place-items-center rounded-full text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-ink cursor-pointer"
          >
            <X aria-hidden="true" size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 px-5 py-4">
            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <label htmlFor="scenario-name" className="text-[10px] font-semibold text-ink">
                  Scenario name
                </label>
                <span className="font-mono text-[8.5px] text-ink-subtle">
                  {name.length}/{MAX_NAME_LENGTH}
                </span>
              </div>
              <input
                id="scenario-name"
                autoFocus
                value={name}
                maxLength={MAX_NAME_LENGTH}
                onChange={(event) => {
                  setName(event.target.value)
                  if (error) {
                    setError(null)
                  }
                }}
                aria-invalid={error ? true : undefined}
                aria-describedby={error ? errorId : undefined}
                placeholder="e.g. Inventory latency spike"
                className="h-10 w-full rounded-full border border-black/10 bg-canvas/40 px-4 text-xs text-ink outline-none transition-colors placeholder:text-neutral-400 hover:border-black/20 focus:border-black focus:bg-white focus:ring-2 focus:ring-black/5"
              />
              {error ? (
                <div
                  id={errorId}
                  role="alert"
                  className="mt-2.5 flex items-start gap-2 rounded-2xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs leading-4 text-rose-700"
                >
                  <TriangleAlert aria-hidden="true" size={13} className="mt-0.5 shrink-0" />
                  {error}
                </div>
              ) : (
                <p className="mt-1.5 text-[10px] text-neutral-400">
                  Use a short, distinct label you will recognize later.
                </p>
              )}
            </div>

            <div className="flex gap-2.5 rounded-2xl border border-black/5 bg-canvas/40 p-3.5 text-xs leading-relaxed text-neutral-500">
              <GitBranch aria-hidden="true" size={14} className="mt-0.5 shrink-0 text-neutral-400" />
              <p>
                The draft starts at revision 1 with an independent change set. It will not
                modify the baseline or other scenarios.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2.5 border-t border-black/[0.06] bg-canvas/20 px-6 py-4">
            <Button variant="ghost" size="md" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" size="md">
              <Plus aria-hidden="true" size={13} />
              Create scenario
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
