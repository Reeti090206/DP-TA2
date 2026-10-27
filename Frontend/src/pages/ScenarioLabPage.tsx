import { useState } from 'react'
import { CircleAlert, CircleCheck, Download, Plus, X } from 'lucide-react'
import { PageHeader } from '../components/layout/PageHeader'
import { Button } from '../components/ui/Button'
import { BaselineCard } from '../components/scenario/BaselineCard'
import { ComparisonPanel } from '../components/scenario/ComparisonPanel'
import { ScenarioList } from '../components/scenario/ScenarioList'
import { SnapshotPanel } from '../components/scenario/SnapshotPanel'
import { NewScenarioDialog } from '../components/scenario/NewScenarioDialog'
import { MAX_COMPARISON_SCENARIOS } from '../lib/scenarioComparison'
import {
  buildWorkspaceExport,
  downloadWorkspaceExport,
} from '../lib/workspaceExport'
import type { SnapshotOperationResult } from '../lib/snapshotState'
import type {
  DemoSystem,
  Scenario,
  ScenarioSnapshot,
} from '../types/domain'

interface ScenarioLabPageProps {
  system: DemoSystem
  scenarios: Scenario[]
  snapshots: ScenarioSnapshot[]
  activeScenarioId: string | null
  onCreateScenario: (name: string) => Scenario
  onOpenScenario: (scenarioId: string) => void
  onInspectSystem: () => void
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

export function ScenarioLabPage({
  system,
  scenarios,
  snapshots,
  activeScenarioId,
  onCreateScenario,
  onOpenScenario,
  onInspectSystem,
  onSaveSnapshot,
  onRestoreSnapshot,
  onBranchFromSnapshot,
}: ScenarioLabPageProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [comparisonScenarioIds, setComparisonScenarioIds] = useState<string[]>([])
  const [notice, setNotice] = useState<{
    message: string
    tone: 'success' | 'error'
  } | null>(null)
  const comparisonIds = comparisonScenarioIds.filter((scenarioId) =>
    scenarios.some((scenario) => scenario.id === scenarioId),
  )

  const handleCreateScenario = (name: string) => {
    const scenario = onCreateScenario(name)
    setIsDialogOpen(false)
    setNotice({
      message: `Scenario “${scenario.name}” was created and set as active.`,
      tone: 'success',
    })
  }

  const handleExportWorkspace = () => {
    try {
      const workspaceExport = buildWorkspaceExport(
        system,
        scenarios,
        snapshots,
        activeScenarioId,
      )
      const result = downloadWorkspaceExport(workspaceExport, system)

      if (!result.ok) {
        setNotice({
          message: `The workspace was not exported. ${result.error}`,
          tone: 'error',
        })
        return
      }

      if (scenarios.length === 0 && snapshots.length === 0) {
        setNotice({
          message: `Exported an empty workspace to “${result.filename}”.`,
          tone: 'success',
        })
        return
      }

      const scenarioLabel =
        scenarios.length === 1 ? '1 scenario' : `${scenarios.length} scenarios`
      const snapshotLabel =
        snapshots.length === 1 ? '1 snapshot' : `${snapshots.length} snapshots`

      setNotice({
        message: `Exported ${scenarioLabel} and ${snapshotLabel} to “${result.filename}”.`,
        tone: 'success',
      })
    } catch {
      setNotice({
        message:
          'The workspace export could not be prepared. No file was downloaded.',
        tone: 'error',
      })
    }
  }

  const handleToggleComparison = (scenarioId: string) => {
    if (comparisonIds.includes(scenarioId)) {
      setComparisonScenarioIds(
        comparisonIds.filter((selectedId) => selectedId !== scenarioId),
      )
      return
    }

    if (comparisonIds.length >= MAX_COMPARISON_SCENARIOS) {
      setNotice({
        message: `You can compare up to ${MAX_COMPARISON_SCENARIOS} scenarios. Deselect one before adding another.`,
        tone: 'error',
      })
      return
    }

    setComparisonScenarioIds([...comparisonIds, scenarioId])
  }

  return (
    <>
      <PageHeader
        eyebrow={`${system.name} · Scenario workspace`}
        title="Scenario Lab"
        description="Keep alternative what-if models independent, compare them against one baseline, and preserve stable checkpoints."
        actions={
          <>
            <Button
              variant="secondary"
              size="md"
              onClick={handleExportWorkspace}
              title="Download scenarios, analyses, and snapshots as JSON"
            >
              <Download aria-hidden="true" size={13} />
              Export JSON
            </Button>
            <Button size="md" onClick={() => setIsDialogOpen(true)}>
              <Plus aria-hidden="true" size={13} />
              New scenario
            </Button>
          </>
        }
      />

      {notice ? (
        <div
          role={notice.tone === 'error' ? 'alert' : 'status'}
          className={
            notice.tone === 'error'
              ? 'notice-enter mb-4 flex items-start gap-2.5 rounded-lg border border-risk-critical/20 bg-risk-critical-soft px-3.5 py-2.5 text-[10.5px] leading-4 text-risk-critical'
              : 'notice-enter mb-4 flex items-start gap-2.5 rounded-lg border border-brand-line bg-brand-soft/70 px-3.5 py-2.5 text-[10.5px] leading-4 text-brand-strong'
          }
        >
          {notice.tone === 'error' ? (
            <CircleAlert aria-hidden="true" size={14} className="mt-0.5 shrink-0" />
          ) : (
            <CircleCheck aria-hidden="true" size={14} className="mt-0.5 shrink-0" />
          )}
          <p className="min-w-0 flex-1">{notice.message}</p>
          <button
            type="button"
            onClick={() => setNotice(null)}
            aria-label="Dismiss notification"
            className="grid size-5 shrink-0 place-items-center rounded opacity-70 transition-opacity hover:bg-white/50 hover:opacity-100"
          >
            <X aria-hidden="true" size={12} />
          </button>
        </div>
      ) : null}

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.35fr)_minmax(0,0.85fr)] xl:items-start">
        <div className="space-y-4">
          <BaselineCard system={system} onInspectSystem={onInspectSystem} />
          <ComparisonPanel
            system={system}
            scenarios={scenarios}
            selectedScenarioIds={comparisonIds}
            activeScenarioId={activeScenarioId}
            onToggleScenario={handleToggleComparison}
            onClearSelection={() => setComparisonScenarioIds([])}
            onCreateScenario={() => setIsDialogOpen(true)}
            onOpenScenario={onOpenScenario}
          />
        </div>
        <div className="space-y-4">
          <ScenarioList
            scenarios={scenarios}
            activeScenarioId={activeScenarioId}
            onCreateScenario={() => setIsDialogOpen(true)}
            onOpenScenario={onOpenScenario}
          />
          <SnapshotPanel
            system={system}
            scenarios={scenarios}
            snapshots={snapshots}
            activeScenarioId={activeScenarioId}
            onCreateScenario={() => setIsDialogOpen(true)}
            onSaveSnapshot={onSaveSnapshot}
            onRestoreSnapshot={onRestoreSnapshot}
            onBranchFromSnapshot={onBranchFromSnapshot}
          />
        </div>
      </div>

      {isDialogOpen ? (
        <NewScenarioDialog
          existingNames={scenarios.map((scenario) => scenario.name)}
          onClose={() => setIsDialogOpen(false)}
          onCreate={handleCreateScenario}
        />
      ) : null}
    </>
  )
}
