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
        className="dialog-panel relative w-full max-w-md overflow-hidden rounded-xl border border-line bg-white shadow-float"
      >
        <div className="flex items-start gap-3 border-b border-line px-5 py-4">
          <span className="grid size-9 shrink-0 place-items-center rounded-lg border border-brand-line bg-brand-soft text-brand-strong">
            <FlaskConical aria-hidden="true" size={17} />
          </span>
          <div className="min-w-0 flex-1">
            <h2 id={titleId} className="text-[15px] font-semibold tracking-[-0.015em] text-navy">
              Create draft scenario
            </h2>
            <p id={descriptionId} className="mt-0.5 text-[10.5px] leading-4 text-ink-muted">
              Start a what-if model without changing the read-only baseline.
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
                className="h-9 w-full rounded-lg border border-line-strong bg-white px-3 text-[12px] text-ink outline-none transition-colors placeholder:text-ink-subtle hover:border-ink-subtle/50 focus:border-brand focus:ring-2 focus:ring-brand/10"
              />
              {error ? (
                <div
                  id={errorId}
                  role="alert"
                  className="mt-2 flex items-start gap-1.5 rounded-md border border-risk-critical/20 bg-risk-critical-soft px-2.5 py-1.5 text-[9.5px] leading-4 text-risk-critical"
                >
                  <TriangleAlert aria-hidden="true" size={11} className="mt-0.5 shrink-0" />
                  {error}
                </div>
              ) : (
                <p className="mt-1.5 text-[9px] text-ink-subtle">
                  Use a short, distinct label you will recognize later.
                </p>
              )}
            </div>

            <div className="flex gap-2 rounded-lg border border-line bg-canvas/55 px-3 py-2.5 text-[9px] leading-4 text-ink-muted">
              <GitBranch aria-hidden="true" size={12} className="mt-0.5 shrink-0 text-ink-subtle" />
              <p>
                The draft starts at revision 1 with an independent change set. It will not
                modify the baseline or other scenarios.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 border-t border-line bg-canvas/35 px-5 py-3">
            <Button variant="ghost" size="md" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" size="md">
              <Plus aria-hidden="true" size={12} />
              Create scenario
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
