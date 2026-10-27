import { useState } from 'react'
import {
  Camera,
  CircleAlert,
  CircleCheck,
  GitBranch,
  History,
  LockKeyhole,
  Plus,
  X,
} from 'lucide-react'
import { Badge } from '../ui/Badge'
import { Button } from '../ui/Button'
import { EmptyState } from '../ui/EmptyState'
import { Panel, PanelHeader } from '../ui/Panel'
import { cn } from '../../lib/cn'
import { formatDateTime } from '../../lib/format'
import { PROPAGATION_LABELS, SCORING_LABELS } from '../../lib/analysisPresentation'
import {
  getSnapshotAnalysisStatus,
  type SnapshotOperationResult,
} from '../../lib/snapshotState'
import { getScenarioStatus } from '../../lib/scenarioState'
import { BranchSnapshotDialog } from './BranchSnapshotDialog'
import { RestoreSnapshotDialog } from './RestoreSnapshotDialog'
import { SaveSnapshotDialog } from './SaveSnapshotDialog'
import type {
  DemoSystem,
  Scenario,
  ScenarioSnapshot,
} from '../../types/domain'

interface SnapshotPanelProps {
  system: DemoSystem
  scenarios: Scenario[]
  snapshots: ScenarioSnapshot[]
  activeScenarioId: string | null
  onCreateScenario: () => void
  onSaveSnapshot: (
    scenarioId: string,
    name: string,
  ) => SnapshotOperationResult<ScenarioSnapshot>
  onRestoreSnapshot: (
    snapshotId: string,
    targetScenarioId: string,
  ) => SnapshotOperationResult<Scenario>
  onBranchFromSnapshot: (
    snapshotId: string,
    name: string,
  ) => SnapshotOperationResult<Scenario>
}

interface SnapshotFeedback {
  tone: 'success' | 'error'
  message: string
}

export function SnapshotPanel({
  system,
  scenarios,
  snapshots,
  activeScenarioId,
  onCreateScenario,
  onSaveSnapshot,
  onRestoreSnapshot,
  onBranchFromSnapshot,
}: SnapshotPanelProps) {
  const [isSaveOpen, setIsSaveOpen] = useState(false)
  const [restoreSnapshot, setRestoreSnapshot] = useState<ScenarioSnapshot | null>(null)
  const [branchSnapshot, setBranchSnapshot] = useState<ScenarioSnapshot | null>(null)
  const [feedback, setFeedback] = useState<SnapshotFeedback | null>(null)
  const canSave = scenarios.length > 0
  const scenarioById = new Map(
    scenarios.map((scenario) => [scenario.id, scenario]),
  )

  const handleSave = (scenarioId: string, name: string) => {
    const result = onSaveSnapshot(scenarioId, name)

    if (result.ok) {
      setFeedback({
        tone: 'success',
        message: `Snapshot “${result.value.name}” saved from “${result.value.sourceScenarioName}” at revision ${result.value.revision}.`,
      })
    }

    return result
  }

  const handleRestore = (snapshotId: string, targetScenarioId: string) => {
    const result = onRestoreSnapshot(snapshotId, targetScenarioId)

    if (result.ok) {
      const status = getScenarioStatus(result.value)
      const analysisMessage =
        status === 'stale'
          ? 'The captured analysis no longer matches the resulting revision or settings and is marked stale; rerun before relying on it.'
          : status === 'analyzed'
            ? 'The captured analysis still matches the restored revision and settings.'
            : 'The snapshot contained no analysis result; run analysis when ready.'

      setFeedback({
        tone: 'success',
        message: `Snapshot restored into “${result.value.name}” at revision ${result.value.revision}. ${analysisMessage}`,
      })
    }

    return result
  }

  const handleBranch = (snapshotId: string, name: string) => {
    const result = onBranchFromSnapshot(snapshotId, name)

    if (result.ok) {
      setFeedback({
        tone: 'success',
        message: `Scenario “${result.value.name}” was branched from the snapshot and set as active.`,
      })
    }

    return result
  }

  return (
    <>
      <Panel className="overflow-hidden">
        <PanelHeader
          icon={Camera}
          title="Snapshots"
          description="Immutable checkpoints with independent restore and branch paths."
          action={
            <div className="flex items-center gap-1.5">
              <Badge tone="neutral" dot>
                {snapshots.length} saved
              </Badge>
              <Button
                variant="secondary"
                size="sm"
                disabled={!canSave}
                onClick={() => setIsSaveOpen(true)}
                title={
                  canSave
                    ? 'Save a snapshot of a scenario'
                    : 'Create a scenario before saving a snapshot'
                }
              >
                <Camera aria-hidden="true" size={11} />
                Save
              </Button>
            </div>
          }
        />

        {feedback ? (
          <div
            role={feedback.tone === 'error' ? 'alert' : 'status'}
            className={cn(
              'notice-enter mx-3 mt-3 flex items-start gap-2 rounded-lg border px-3 py-2 text-[9px] leading-4',
              feedback.tone === 'error'
                ? 'border-risk-critical/20 bg-risk-critical-soft text-risk-critical'
                : 'border-brand-line bg-brand-soft/65 text-brand-strong',
            )}
          >
            {feedback.tone === 'error' ? (
              <CircleAlert aria-hidden="true" size={12} className="mt-0.5 shrink-0" />
            ) : (
              <CircleCheck aria-hidden="true" size={12} className="mt-0.5 shrink-0" />
            )}
            <p className="min-w-0 flex-1">{feedback.message}</p>
            <button
              type="button"
              onClick={() => setFeedback(null)}
              aria-label="Dismiss snapshot notification"
              className="grid size-5 shrink-0 place-items-center rounded opacity-70 transition-opacity hover:bg-white/50 hover:opacity-100"
            >
              <X aria-hidden="true" size={11} />
            </button>
          </div>
        ) : null}

        {snapshots.length === 0 ? (
          <div className="p-4">
            <EmptyState
              icon={Camera}
              title="No snapshots saved"
              description={
                canSave
                  ? 'Save a named checkpoint to preserve a scenario’s confirmed changes, settings, revision, and analysis context.'
                  : 'Create a scenario first, then save an immutable checkpoint you can restore or branch from.'
              }
              action={
                canSave ? (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setIsSaveOpen(true)}
                  >
                    <Camera aria-hidden="true" size={12} />
                    Save first snapshot
                  </Button>
                ) : (
                  <Button variant="secondary" size="sm" onClick={onCreateScenario}>
                    <Plus aria-hidden="true" size={12} />
                    Create a scenario
                  </Button>
                )
              }
            />
            <div className="mt-1 flex items-center gap-2 rounded-lg border border-line bg-canvas/45 px-3 py-2.5 text-[9px] leading-4 text-ink-muted">
              <LockKeyhole aria-hidden="true" size={12} className="shrink-0 text-ink-subtle" />
              Snapshots never modify the baseline, source scenario, or other scenarios.
            </div>
          </div>
        ) : (
          <div className="scrollbar-subtle max-h-[660px] space-y-2 overflow-y-auto p-3">
            {snapshots.map((snapshot) => {
              const status = getSnapshotAnalysisStatus(
                snapshot,
                system.modelVersion,
              )
              const sourceScenario = scenarioById.get(snapshot.sourceScenarioId)

              return (
                <article
                  key={snapshot.id}
                  className="rounded-lg border border-line bg-white p-3"
                >
                  <div className="flex items-start gap-2.5">
                    <span className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-md border border-line bg-canvas text-ink-muted">
                      <Camera aria-hidden="true" size={13} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <h3 className="min-w-0 truncate text-[10.5px] font-semibold text-ink">
                          {snapshot.name}
                        </h3>
                        <Badge tone={status.tone}>{status.label}</Badge>
                      </div>
                      <div className="mt-1 text-[8.5px] leading-4 text-ink-subtle">
                        {formatDateTime(snapshot.createdAt)} · from{' '}
                        <span className="font-semibold text-ink-muted">
                          {sourceScenario?.name ?? snapshot.sourceScenarioName}
                        </span>
                      </div>
                      {!sourceScenario ? (
                        <div className="mt-1.5 flex items-start gap-1.5 rounded-md border border-risk-high/20 bg-risk-high-soft/55 px-2 py-1.5 text-[8px] leading-4 text-risk-high">
                          <CircleAlert aria-hidden="true" size={10} className="mt-0.5 shrink-0" />
                          Source scenario is no longer available. The snapshot and
                          branching remain usable; restore requires another target.
                        </div>
                      ) : null}
                    </div>
                  </div>

                  <dl className="mt-2.5 grid grid-cols-2 gap-x-2 gap-y-1.5 border-t border-line pt-2.5 text-[8.5px] sm:grid-cols-4">
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
                      <dd className="mt-0.5 truncate font-mono font-semibold text-ink">
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

                  <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[8px] text-ink-subtle">
                    <span>
                      {PROPAGATION_LABELS[snapshot.analysisSettings.propagationStrategy]}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>
                      {SCORING_LABELS[snapshot.analysisSettings.scoringStrategy]}
                    </span>
                  </div>

                  {status.issues.length > 0 ? (
                    <ul className="mt-2 space-y-1 rounded-md border border-line bg-canvas/45 px-2 py-1.5 text-[8px] leading-4 text-ink-muted">
                      {status.issues.map((issue) => (
                        <li key={issue}>{issue}</li>
                      ))}
                    </ul>
                  ) : null}

                  <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2 border-t border-line pt-2.5">
                    <span className="inline-flex items-center gap-1 text-[8px] text-ink-subtle">
                      <LockKeyhole aria-hidden="true" size={10} />
                      Immutable record
                    </span>
                    <div className="flex items-center gap-1.5">
                      <Button
                        variant="secondary"
                        size="sm"
                        className="h-7 px-2 text-[9px]"
                        disabled={scenarios.length === 0}
                        onClick={() => setRestoreSnapshot(snapshot)}
                        aria-label={`Restore snapshot ${snapshot.name}`}
                        title={
                          scenarios.length === 0
                            ? 'Create a target scenario before restoring'
                            : 'Restore this snapshot into a scenario'
                        }
                      >
                        <History aria-hidden="true" size={10} />
                        Restore
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 px-2 text-[9px]"
                        onClick={() => setBranchSnapshot(snapshot)}
                        aria-label={`Create scenario from snapshot ${snapshot.name}`}
                      >
                        <GitBranch aria-hidden="true" size={10} />
                        Branch
                      </Button>
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </Panel>

      {isSaveOpen ? (
        <SaveSnapshotDialog
          scenarios={scenarios}
          snapshots={snapshots}
          initialScenarioId={activeScenarioId}
          onClose={() => setIsSaveOpen(false)}
          onSave={handleSave}
        />
      ) : null}

      {restoreSnapshot ? (
        <RestoreSnapshotDialog
          system={system}
          snapshot={restoreSnapshot}
          scenarios={scenarios}
          activeScenarioId={activeScenarioId}
          onClose={() => setRestoreSnapshot(null)}
          onRestore={handleRestore}
        />
      ) : null}

      {branchSnapshot ? (
        <BranchSnapshotDialog
          system={system}
          snapshot={branchSnapshot}
          scenarios={scenarios}
          onClose={() => setBranchSnapshot(null)}
          onBranch={handleBranch}
        />
      ) : null}
    </>
  )
}
