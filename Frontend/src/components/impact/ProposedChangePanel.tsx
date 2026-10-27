import { ArrowRight, GitBranch, Lock, SlidersHorizontal } from 'lucide-react'
import { Badge } from '../ui/Badge'
import { Button } from '../ui/Button'
import { EmptyState } from '../ui/EmptyState'
import { Panel, PanelHeader } from '../ui/Panel'
import { ScenarioChangeEditor } from './ScenarioChangeEditor'
import { StaleAnalysisNotice } from './StaleAnalysisNotice'
import { SCENARIO_STATUS_META } from '../../lib/scenarioPresentation'
import { getScenarioStatus } from '../../lib/scenarioState'
import type {
  ComponentId,
  PropertyKey,
  Scenario,
  ScenarioChange,
  SystemComponent,
} from '../../types/domain'

interface ProposedChangePanelProps {
  activeScenario?: Scenario
  component: SystemComponent
  onApplyChange: (scenarioId: string, change: ScenarioChange) => void
  onResetChange: (
    scenarioId: string,
    componentId: ComponentId,
    propertyKey: PropertyKey,
  ) => void
  onOpenScenarioLab: () => void
  className?: string
}

export function ProposedChangePanel({
  activeScenario,
  component,
  onApplyChange,
  onResetChange,
  onOpenScenarioLab,
  className,
}: ProposedChangePanelProps) {
  const scenarioStatus = activeScenario ? getScenarioStatus(activeScenario) : null
  const statusMeta = scenarioStatus ? SCENARIO_STATUS_META[scenarioStatus] : null
  const scenarioChangeCount = activeScenario?.changeSet.length ?? 0

  return (
    <Panel className={className}>
      <PanelHeader
        icon={SlidersHorizontal}
        title="Proposed change"
        description={
          activeScenario
            ? `${component.name} · edits are scoped to the active scenario.`
            : 'Override supported component properties inside a scenario.'
        }
        action={
          activeScenario ? (
            <Badge tone="teal" dot>
              rev {activeScenario.revision}
            </Badge>
          ) : (
            <Badge tone="neutral" dot>
              No scenario
            </Badge>
          )
        }
      />

      {activeScenario && statusMeta ? (
        <div className="p-4">
          <div className="mb-3 flex items-center gap-2.5 rounded-lg border border-brand-line/70 bg-brand-soft/45 px-3 py-2">
            <span className="grid size-6 place-items-center rounded-md border border-brand-line bg-white text-brand-strong">
              <SlidersHorizontal aria-hidden="true" size={11} />
            </span>
            <div className="min-w-0 flex-1">
              <div className="text-[8px] font-bold uppercase tracking-[0.1em] text-brand-strong/70">
                Active scenario
              </div>
              <div className="truncate text-[10.5px] font-semibold text-ink">
                {activeScenario.name}
              </div>
            </div>
            <Badge tone={statusMeta.tone} dot>
              {statusMeta.label}
            </Badge>
          </div>

          <StaleAnalysisNotice scenario={activeScenario} className="mb-3" />

          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-lg border border-line bg-canvas/50 px-2.5 py-2">
              <div className="text-[8px] font-bold uppercase tracking-[0.1em] text-ink-subtle">
                Baseline
              </div>
              <div className="mt-1 flex items-center gap-1 text-[10px] font-semibold text-ink">
                <Lock aria-hidden="true" size={10} />
                Read-only
              </div>
            </div>
            <div className="rounded-lg border border-line bg-canvas/50 px-2.5 py-2">
              <div className="text-[8px] font-bold uppercase tracking-[0.1em] text-ink-subtle">
                Scenario
              </div>
              <div className="mt-1 text-[10px] font-semibold text-ink">
                {scenarioChangeCount === 0
                  ? 'No changes'
                  : `${scenarioChangeCount} ${scenarioChangeCount === 1 ? 'change' : 'changes'}`}
              </div>
            </div>
          </div>

          <div className="mt-3">
            <ScenarioChangeEditor
              scenario={activeScenario}
              component={component}
              onApplyChange={(change) => onApplyChange(activeScenario.id, change)}
              onResetChange={(componentId, propertyKey) =>
                onResetChange(activeScenario.id, componentId, propertyKey)
              }
            />
          </div>

          <div className="mt-3 flex gap-2 rounded-lg border border-line bg-canvas/55 px-2.5 py-2 text-[9px] leading-4 text-ink-muted">
            <GitBranch aria-hidden="true" size={11} className="mt-0.5 shrink-0 text-ink-subtle" />
            <p>
              Changes remain in {activeScenario.name}. The baseline and every other scenario
              stay unchanged.
            </p>
          </div>
        </div>
      ) : (
        <div className="p-4">
          <EmptyState
            icon={SlidersHorizontal}
            title="Start with a scenario"
            description="Proposed values live inside a scenario so the read-only baseline and other scenarios stay unchanged."
            action={
              <Button variant="secondary" size="sm" onClick={onOpenScenarioLab}>
                Open Scenario Lab
                <ArrowRight aria-hidden="true" size={12} />
              </Button>
            }
          />
          <div className="mt-1 space-y-2 rounded-lg border border-line bg-canvas/45 px-3 py-2.5">
            <div className="flex gap-2">
              <span className="font-mono text-[8px] font-semibold text-ink-subtle">01</span>
              <p className="text-[9px] leading-4 text-ink-muted">
                Create a draft scenario from the Scenario Lab.
              </p>
            </div>
            <div className="flex gap-2">
              <span className="font-mono text-[8px] font-semibold text-ink-subtle">02</span>
              <p className="text-[9px] leading-4 text-ink-muted">
                Select a component, then propose a supported property value.
              </p>
            </div>
          </div>
        </div>
      )}
    </Panel>
  )
}
