import { useId, useState, type FormEvent } from 'react'
import { AlertTriangle, History, Info, ShieldAlert, TriangleAlert } from 'lucide-react'
import { Badge } from '../ui/Badge'
import { Button } from '../ui/Button'
import { Dialog } from '../ui/Dialog'
import { cn } from '../../lib/cn'
import { formatDateTime } from '../../lib/format'
import {
  getSnapshotAnalysisStatus,
  type SnapshotOperationResult,
} from '../../lib/snapshotState'
import { SCENARIO_STATUS_META } from '../../lib/scenarioPresentation'
import { getScenarioStatus } from '../../lib/scenarioState'
import type {
  DemoSystem,
  Scenario,
  ScenarioSnapshot,
} from '../../types/domain'

interface RestoreSnapshotDialogProps {
  system: DemoSystem
  snapshot: ScenarioSnapshot
  scenarios: Scenario[]
  activeScenarioId: string | null
  onClose: () => void
  onRestore: (
    snapshotId: string,
    targetScenarioId: string,
  ) => SnapshotOperationResult<Scenario>
}

export function RestoreSnapshotDialog({
  system,
  snapshot,
  scenarios,
  activeScenarioId,
  onClose,
  onRestore,
}: RestoreSnapshotDialogProps) {
  const defaultTarget =
    scenarios.find((scenario) => scenario.id === snapshot.sourceScenarioId) ??
    scenarios.find((scenario) => scenario.id === activeScenarioId) ??
    scenarios[0]
  const [targetScenarioId, setTargetScenarioId] = useState(defaultTarget?.id ?? '')
  const [error, setError] = useState<string | null>(null)
  const targetScenario = scenarios.find(
    (scenario) => scenario.id === targetScenarioId,
  )
  const sourceScenarioExists = scenarios.some(
    (scenario) => scenario.id === snapshot.sourceScenarioId,
  )
  const snapshotStatus = getSnapshotAnalysisStatus(snapshot, system.modelVersion)
  const targetStatus = targetScenario
    ? SCENARIO_STATUS_META[getScenarioStatus(targetScenario)]
    : null
  const formId = useId()
  const errorId = useId()

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!targetScenario) {
      setError('Choose an existing target scenario.')
      return
    }

    const result = onRestore(snapshot.id, targetScenario.id)

    if (!result.ok) {
      setError(result.error)
      return
    }

    onClose()
  }

  return (
    <Dialog
      title="Restore snapshot"
      description="Replace one scenario’s current state with this immutable checkpoint."
      icon={History}
      onClose={onClose}
      width="lg"
      footer={
        <>
          <span className="hidden items-center gap-1.5 text-[8.5px] text-ink-subtle sm:flex">
            <ShieldAlert aria-hidden="true" size={11} />
            Read-only baseline is never a target
          </span>
          <div className="ml-auto flex items-center gap-2">
            <Button variant="ghost" size="md" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              size="md"
              variant="danger"
              form={formId}
              disabled={!targetScenario}
            >
              <History aria-hidden="true" size={12} />
              Restore snapshot
            </Button>
          </div>
        </>
      }
    >
      <form id={formId} noValidate onSubmit={handleSubmit} className="space-y-4">
        <div className="rounded-lg border border-line bg-canvas/45 p-3">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-semibold text-navy">{snapshot.name}</span>
            <Badge tone={snapshotStatus.tone}>{snapshotStatus.label}</Badge>
          </div>
          <div className="mt-1 text-[8.5px] leading-4 text-ink-muted">
            Captured {formatDateTime(snapshot.createdAt)} from{' '}
            <span className="font-semibold text-ink">{snapshot.sourceScenarioName}</span>
            {!sourceScenarioExists ? ' (source scenario is no longer available)' : ''}
          </div>
          <dl className="mt-2.5 grid grid-cols-2 gap-2 border-t border-line pt-2.5 text-[8.5px] sm:grid-cols-4">
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
              <dt className="text-ink-subtle">Model</dt>
              <dd className="mt-0.5 font-mono font-semibold text-ink">
                {snapshot.modelVersion}
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
        </div>

        <div>
          <label
            htmlFor="restore-target-scenario"
            className="text-[10px] font-semibold text-ink"
          >
            Restore into
          </label>
          <select
            id="restore-target-scenario"
            value={targetScenarioId}
            onChange={(event) => {
              setTargetScenarioId(event.target.value)
              setError(null)
            }}
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? errorId : undefined}
            className="mt-1.5 h-9 w-full rounded-lg border border-line-strong bg-white px-2.5 text-[11px] text-ink outline-none transition-colors hover:border-ink-subtle/50 focus:border-brand focus:ring-2 focus:ring-brand/10"
          >
            {scenarios.map((scenario) => (
              <option key={scenario.id} value={scenario.id}>
                {scenario.name}
                {scenario.id === snapshot.sourceScenarioId ? ' (source)' : ''} ·
                revision {scenario.revision}
              </option>
            ))}
          </select>
          <p className="mt-1.5 text-[8.5px] leading-4 text-ink-subtle">
            The target keeps its name and ID. Its revision becomes the next
            revision after its current state.
          </p>
        </div>

        {targetScenario ? (
          <div className="rounded-lg border border-risk-critical/20 bg-risk-critical-soft/55 px-3 py-2.5">
            <div className="flex items-start gap-2">
              <AlertTriangle
                aria-hidden="true"
                size={13}
                className="mt-0.5 shrink-0 text-risk-critical"
              />
              <div className="min-w-0">
                <div className="text-[9.5px] font-semibold text-risk-critical">
                  Replace current scenario state?
                </div>
                <p className="mt-1 text-[8.5px] leading-4 text-ink-muted">
                  {targetScenario.name} is currently revision {targetScenario.revision}{' '}
                  {targetStatus ? (
                    <Badge tone={targetStatus.tone} dot>
                      {targetStatus.label}
                    </Badge>
                  ) : null}{' '}
                  with {targetScenario.changeSet.length}{' '}
                  {targetScenario.changeSet.length === 1 ? 'change' : 'changes'}.
                  Restoring replaces its change set and analysis settings, and
                  increments its revision to {targetScenario.revision + 1}.
                </p>
                <p
                  className={cn(
                    'mt-1.5 flex items-start gap-1.5 text-[8.5px] leading-4',
                    'text-ink-muted',
                  )}
                >
                  <Info
                    aria-hidden="true"
                    size={10}
                    className="mt-0.5 shrink-0 text-ink-subtle"
                  />
                  The captured analysis is restored only as recorded. It is
                  marked stale if it does not match the resulting revision or
                  settings, and it is never silently labeled current.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-lg border border-risk-critical/20 bg-risk-critical-soft px-3 py-2.5 text-[9px] text-risk-critical">
            No scenarios are available to restore into. Create a scenario or branch
            from this snapshot instead.
          </div>
        )}

        {error ? (
          <div
            id={errorId}
            role="alert"
            className="flex items-start gap-1.5 rounded-md border border-risk-critical/20 bg-risk-critical-soft px-2.5 py-1.5 text-[9.5px] leading-4 text-risk-critical"
          >
            <TriangleAlert aria-hidden="true" size={11} className="mt-0.5 shrink-0" />
            {error}
          </div>
        ) : null}
      </form>
    </Dialog>
  )
}
