import { ArrowUpRight, FlaskConical, GitBranch, Plus } from 'lucide-react'
import { Badge } from '../ui/Badge'
import { Button } from '../ui/Button'
import { EmptyState } from '../ui/EmptyState'
import { Panel, PanelHeader } from '../ui/Panel'
import { formatDate } from '../../lib/format'
import { SCENARIO_STATUS_META } from '../../lib/scenarioPresentation'
import { getScenarioStatus } from '../../lib/scenarioState'
import { cn } from '../../lib/cn'
import type { Scenario } from '../../types/domain'

interface ScenarioListProps {
  scenarios: Scenario[]
  activeScenarioId: string | null
  onCreateScenario: () => void
  onOpenScenario: (scenarioId: string) => void
}

export function ScenarioList({
  scenarios,
  activeScenarioId,
  onCreateScenario,
  onOpenScenario,
}: ScenarioListProps) {
  return (
    <Panel className="overflow-hidden">
      <PanelHeader
        icon={FlaskConical}
        title="Scenarios"
        description="Independent drafts kept separate from the baseline."
        action={
          <span className="rounded border border-line bg-canvas px-1.5 py-0.5 font-mono text-[8.5px] text-ink-muted">
            {scenarios.length}
          </span>
        }
      />

      {scenarios.length === 0 ? (
        <EmptyState
          icon={FlaskConical}
          title="No scenarios yet"
          description="Create a draft to model a change without touching the baseline or any other scenario."
          action={
            <Button variant="secondary" size="sm" onClick={onCreateScenario}>
              <Plus aria-hidden="true" size={12} />
              Create a scenario
            </Button>
          }
        />
      ) : (
        <div className="space-y-2 p-3">
          {scenarios.map((scenario) => {
            const isActive = scenario.id === activeScenarioId
            const status = SCENARIO_STATUS_META[getScenarioStatus(scenario)]
            const changeCount = scenario.changeSet.length

            return (
              <button
                key={scenario.id}
                type="button"
                onClick={() => onOpenScenario(scenario.id)}
                aria-label={`Open ${scenario.name} in Impact Explorer`}
                className={cn(
                  'group flex w-full items-start gap-3 rounded-lg border p-3 text-left transition-colors',
                  isActive
                    ? 'border-brand-line bg-brand-soft/45'
                    : 'border-line bg-white hover:border-brand-line hover:bg-canvas/45',
                )}
              >
                <span
                  className={cn(
                    'mt-0.5 grid size-8 shrink-0 place-items-center rounded-md border',
                    isActive
                      ? 'border-brand-line bg-white text-brand-strong'
                      : 'border-line bg-canvas text-ink-muted group-hover:text-brand-strong',
                  )}
                >
                  <GitBranch aria-hidden="true" size={14} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-start justify-between gap-2">
                    <span className="truncate text-[11.5px] font-semibold text-ink">
                      {scenario.name}
                    </span>
                    {isActive ? <Badge tone="teal">Active</Badge> : null}
                  </span>
                  <span className="mt-1 flex flex-wrap items-center gap-1.5">
                    <Badge tone={status.tone} dot>
                      {status.label}
                    </Badge>
                    <span className="text-[8.5px] text-ink-subtle">rev {scenario.revision}</span>
                    <span aria-hidden="true" className="text-line-strong">·</span>
                    <span className="text-[8.5px] text-ink-subtle">
                      {changeCount} {changeCount === 1 ? 'change' : 'changes'}
                    </span>
                  </span>
                  <span className="mt-2 flex items-center justify-between gap-2">
                    <span className="text-[8.5px] text-ink-subtle">
                      Created {formatDate(scenario.createdAt)}
                    </span>
                    <span className="inline-flex items-center gap-1 text-[8.5px] font-semibold text-brand-strong">
                      Open
                      <ArrowUpRight
                        aria-hidden="true"
                        size={10}
                        className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                      />
                    </span>
                  </span>
                </span>
              </button>
            )
          })}
          <button
            type="button"
            onClick={onCreateScenario}
            className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-line-strong px-3 py-2 text-[9.5px] font-semibold text-ink-muted transition-colors hover:border-brand-line hover:bg-brand-soft/30 hover:text-brand-strong"
          >
            <Plus aria-hidden="true" size={11} />
            New scenario
          </button>
        </div>
      )}
    </Panel>
  )
}
