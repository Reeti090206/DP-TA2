import { useId, useState, type FormEvent } from 'react'
import { GitBranch, Info, TriangleAlert } from 'lucide-react'
import { Badge } from '../ui/Badge'
import { Button } from '../ui/Button'
import { Dialog } from '../ui/Dialog'
import { formatDateTime } from '../../lib/format'
import {
  getSnapshotAnalysisStatus,
  getUniqueScenarioName,
  normalizeSnapshotName,
  SCENARIO_NAME_MAX_LENGTH,
  type SnapshotOperationResult,
} from '../../lib/snapshotState'
import type {
  DemoSystem,
  Scenario,
  ScenarioSnapshot,
} from '../../types/domain'

interface BranchSnapshotDialogProps {
  system: DemoSystem
  snapshot: ScenarioSnapshot
  scenarios: Scenario[]
  onClose: () => void
  onBranch: (
    snapshotId: string,
    name: string,
  ) => SnapshotOperationResult<Scenario>
}

export function BranchSnapshotDialog({
  system,
  snapshot,
  scenarios,
  onClose,
  onBranch,
}: BranchSnapshotDialogProps) {
  const [name, setName] = useState(
    getUniqueScenarioName(
      `${snapshot.name} branch`,
      scenarios.map((scenario) => scenario.name),
    ),
  )
  const [error, setError] = useState<string | null>(null)
  const formId = useId()
  const errorId = useId()
  const snapshotStatus = getSnapshotAnalysisStatus(snapshot, system.modelVersion)
  const sourceScenarioExists = scenarios.some(
    (scenario) => scenario.id === snapshot.sourceScenarioId,
  )

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const normalizedName = normalizeSnapshotName(name)

    if (normalizedName.length === 0) {
      setError('Enter a name for the new scenario.')
      return
    }

    if (normalizedName.length > SCENARIO_NAME_MAX_LENGTH) {
      setError(
        `Keep the scenario name to ${SCENARIO_NAME_MAX_LENGTH} characters or fewer.`,
      )
      return
    }

    if (
      scenarios.some(
        (scenario) =>
          scenario.name.toLowerCase() === normalizedName.toLowerCase(),
      )
    ) {
      setError('A scenario with this name already exists.')
      return
    }

    const result = onBranch(snapshot.id, normalizedName)

    if (!result.ok) {
      setError(result.error)
      return
    }

    onClose()
  }

  return (
    <Dialog
      title="Branch from snapshot"
      description="Create an independent scenario from this immutable checkpoint."
      icon={GitBranch}
      onClose={onClose}
      footer={
        <>
          <span className="hidden text-[8.5px] text-ink-subtle sm:block">
            The source scenario and snapshot are not modified
          </span>
          <div className="ml-auto flex items-center gap-2">
            <Button variant="ghost" size="md" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" size="md" form={formId}>
              <GitBranch aria-hidden="true" size={12} />
              Create branch
            </Button>
          </div>
        </>
      }
    >
      <form id={formId} noValidate onSubmit={handleSubmit} className="space-y-4">
        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <label
              htmlFor="branch-scenario-name"
              className="text-[10px] font-semibold text-ink"
            >
              New scenario name
            </label>
            <span className="font-mono text-[8.5px] text-ink-subtle">
              {name.length}/{SCENARIO_NAME_MAX_LENGTH}
            </span>
          </div>
          <input
            id="branch-scenario-name"
            autoFocus
            value={name}
            maxLength={SCENARIO_NAME_MAX_LENGTH}
            onChange={(event) => {
              setName(event.target.value)
              if (error) {
                setError(null)
              }
            }}
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? errorId : undefined}
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
              The branch receives a new ID and independent copies of the captured
              state.
            </p>
          )}
        </div>

        <div className="rounded-lg border border-line bg-canvas/50 px-3 py-2.5">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[10px] font-semibold text-ink">{snapshot.name}</span>
            <Badge tone={snapshotStatus.tone}>{snapshotStatus.label}</Badge>
          </div>
          <div className="mt-1 text-[8.5px] leading-4 text-ink-muted">
            Captured {formatDateTime(snapshot.createdAt)} from{' '}
            <span className="font-semibold text-ink">{snapshot.sourceScenarioName}</span>
            {!sourceScenarioExists ? ' (source scenario is no longer available)' : ''}
          </div>
          <dl className="mt-2 grid grid-cols-3 gap-2 border-t border-line pt-2 text-[8.5px]">
            <div>
              <dt className="text-ink-subtle">Revision</dt>
              <dd className="mt-0.5 font-mono font-semibold text-ink">
                {snapshot.revision}
              </dd>
            </div>
            <div>
              <dt className="text-ink-subtle">Changes</dt>
              <dd className="mt-0.5 font-mono font-semibold text-ink">
                {snapshot.changeSet.length}
              </dd>
            </div>
            <div>
              <dt className="text-ink-subtle">Captured score</dt>
              <dd className="mt-0.5 font-mono font-semibold text-ink">
                {snapshot.analysis ? `${snapshot.analysis.overallScore}/100` : 'None'}
              </dd>
            </div>
          </dl>
          {snapshotStatus.issues.length > 0 ? (
            <ul className="mt-2 space-y-1 border-t border-line pt-2 text-[8.5px] leading-4 text-ink-muted">
              {snapshotStatus.issues.map((issue) => (
                <li key={issue}>{issue}</li>
              ))}
            </ul>
          ) : null}
          <div className="mt-2 flex items-start gap-1.5 border-t border-line pt-2 text-[8.5px] leading-4 text-ink-muted">
            <Info aria-hidden="true" size={11} className="mt-0.5 shrink-0 text-ink-subtle" />
            <p>
              Editing the branch later changes only that scenario. It does not
              mutate this snapshot, its source scenario, or other scenarios.
            </p>
          </div>
        </div>
      </form>
    </Dialog>
  )
}
