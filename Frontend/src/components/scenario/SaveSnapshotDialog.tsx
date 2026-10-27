import { useId, useState, type FormEvent } from 'react'
import { Camera, Info, LockKeyhole, TriangleAlert } from 'lucide-react'
import { Badge } from '../ui/Badge'
import { Button } from '../ui/Button'
import { Dialog } from '../ui/Dialog'
import {
  getDefaultSnapshotName,
  isSnapshotNameDuplicate,
  normalizeSnapshotName,
  SNAPSHOT_NAME_MAX_LENGTH,
  type SnapshotOperationResult,
} from '../../lib/snapshotState'
import {
  PROPAGATION_LABELS,
  SCORING_LABELS,
} from '../../lib/analysisPresentation'
import { SCENARIO_STATUS_META } from '../../lib/scenarioPresentation'
import { getScenarioStatus } from '../../lib/scenarioState'
import type { Scenario, ScenarioSnapshot } from '../../types/domain'

interface SaveSnapshotDialogProps {
  scenarios: Scenario[]
  snapshots: ScenarioSnapshot[]
  initialScenarioId: string | null
  onClose: () => void
  onSave: (
    scenarioId: string,
    name: string,
  ) => SnapshotOperationResult<ScenarioSnapshot>
}

export function SaveSnapshotDialog({
  scenarios,
  snapshots,
  initialScenarioId,
  onClose,
  onSave,
}: SaveSnapshotDialogProps) {
  const initialScenario =
    scenarios.find((scenario) => scenario.id === initialScenarioId) ?? scenarios[0]
  const [sourceScenarioId, setSourceScenarioId] = useState(initialScenario?.id ?? '')
  const [name, setName] = useState(
    initialScenario ? getDefaultSnapshotName(initialScenario, snapshots) : '',
  )
  const [nameTouched, setNameTouched] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const formId = useId()
  const errorId = useId()
  const sourceScenario = scenarios.find(
    (scenario) => scenario.id === sourceScenarioId,
  )
  const scenarioStatus = sourceScenario
    ? SCENARIO_STATUS_META[getScenarioStatus(sourceScenario)]
    : null

  const handleSourceChange = (nextScenarioId: string) => {
    setSourceScenarioId(nextScenarioId)
    setError(null)

    if (!nameTouched) {
      const nextScenario = scenarios.find(
        (scenario) => scenario.id === nextScenarioId,
      )

      if (nextScenario) {
        setName(getDefaultSnapshotName(nextScenario, snapshots))
      }
    }
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const normalizedName = normalizeSnapshotName(name)

    if (!sourceScenario) {
      setError('Choose an existing scenario to snapshot.')
      return
    }

    if (normalizedName.length === 0) {
      setError('Enter a name for the snapshot.')
      return
    }

    if (normalizedName.length > SNAPSHOT_NAME_MAX_LENGTH) {
      setError(
        `Keep the snapshot name to ${SNAPSHOT_NAME_MAX_LENGTH} characters or fewer.`,
      )
      return
    }

    if (
      isSnapshotNameDuplicate(normalizedName, sourceScenario.id, snapshots)
    ) {
      setError('A snapshot with this name already exists for this scenario.')
      return
    }

    const result = onSave(sourceScenario.id, normalizedName)

    if (!result.ok) {
      setError(result.error)
      return
    }

    onClose()
  }

  return (
    <Dialog
      title="Save scenario snapshot"
      description="Capture this scenario’s confirmed state and preserved analysis context."
      icon={Camera}
      onClose={onClose}
      footer={
        <>
          <span className="hidden items-center gap-1.5 text-[8.5px] text-ink-subtle sm:flex">
            <LockKeyhole aria-hidden="true" size={11} />
            Snapshots are immutable
          </span>
          <div className="ml-auto flex items-center gap-2">
            <Button variant="ghost" size="md" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              size="md"
              form={formId}
              disabled={!sourceScenario}
            >
              <Camera aria-hidden="true" size={12} />
              Save snapshot
            </Button>
          </div>
        </>
      }
    >
      <form id={formId} noValidate onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="snapshot-source-scenario"
            className="text-[10px] font-semibold text-ink"
          >
            Source scenario
          </label>
          <select
            id="snapshot-source-scenario"
            value={sourceScenarioId}
            onChange={(event) => handleSourceChange(event.target.value)}
            className="mt-1.5 h-9 w-full rounded-lg border border-line-strong bg-white px-2.5 text-[11px] text-ink outline-none transition-colors hover:border-ink-subtle/50 focus:border-brand focus:ring-2 focus:ring-brand/10"
          >
            {scenarios.map((scenario) => (
              <option key={scenario.id} value={scenario.id}>
                {scenario.name} · revision {scenario.revision}
              </option>
            ))}
          </select>
        </div>

        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <label htmlFor="snapshot-name" className="text-[10px] font-semibold text-ink">
              Snapshot name
            </label>
            <span className="font-mono text-[8.5px] text-ink-subtle">
              {name.length}/{SNAPSHOT_NAME_MAX_LENGTH}
            </span>
          </div>
          <input
            id="snapshot-name"
            autoFocus
            value={name}
            maxLength={SNAPSHOT_NAME_MAX_LENGTH}
            onChange={(event) => {
              setName(event.target.value)
              setNameTouched(true)
              if (error) {
                setError(null)
              }
            }}
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? errorId : undefined}
            placeholder="e.g. Before latency rollback"
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
              Names are unique per source scenario. Duplicate names in another
              scenario are allowed.
            </p>
          )}
        </div>

        {sourceScenario ? (
          <div className="rounded-lg border border-line bg-canvas/50 px-3 py-2.5">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[9.5px] font-semibold text-ink">
                Captured state
              </span>
              {scenarioStatus ? (
                <Badge tone={scenarioStatus.tone} dot>
                  {scenarioStatus.label}
                </Badge>
              ) : null}
            </div>
            <dl className="mt-2 grid grid-cols-2 gap-2 text-[8.5px]">
              <div>
                <dt className="text-ink-subtle">Revision</dt>
                <dd className="mt-0.5 font-mono font-semibold text-ink">
                  {sourceScenario.revision}
                </dd>
              </div>
              <div>
                <dt className="text-ink-subtle">Confirmed changes</dt>
                <dd className="mt-0.5 font-mono font-semibold text-ink">
                  {sourceScenario.changeSet.length}
                </dd>
              </div>
              <div>
                <dt className="text-ink-subtle">Propagation</dt>
                <dd className="mt-0.5 font-semibold text-ink">
                  {
                    PROPAGATION_LABELS[
                      sourceScenario.analysisSettings.propagationStrategy
                    ]
                  }
                </dd>
              </div>
              <div>
                <dt className="text-ink-subtle">Scoring</dt>
                <dd className="mt-0.5 font-semibold text-ink">
                  {SCORING_LABELS[sourceScenario.analysisSettings.scoringStrategy]}
                </dd>
              </div>
            </dl>
            <div className="mt-2 flex items-start gap-1.5 border-t border-line pt-2 text-[8.5px] leading-4 text-ink-muted">
              <Info aria-hidden="true" size={11} className="mt-0.5 shrink-0 text-ink-subtle" />
              <p>
                {sourceScenario.analysis
                  ? 'The captured analysis is stored with the snapshot. If it is already stale, it remains clearly flagged after restore or branch.'
                  : 'No analysis exists yet. The snapshot will contain the change set and settings, but no fabricated analysis result.'}
              </p>
            </div>
          </div>
        ) : null}
      </form>
    </Dialog>
  )
}
