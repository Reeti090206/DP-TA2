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
                  'group flex w-full items-start gap-3 rounded-[18px] border p-3.5 text-left transition-all duration-150',
                  isActive
                    ? 'border-black/15 bg-white shadow-xs scale-[1.01]'
                    : 'border-black/[0.06] bg-canvas/40 hover:border-black/15 hover:bg-white hover:scale-[1.01]',
                )}
              >
                <span
                  className={cn(
                    'mt-0.5 grid size-9 shrink-0 place-items-center rounded-lg border transition-all',
                    isActive
                      ? 'border-black/10 bg-[#ebff70] text-black shadow-2xs'
                      : 'border-black/5 bg-white text-ink-muted group-hover:text-black',
                  )}
                >
                  <GitBranch aria-hidden="true" size={15} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-start justify-between gap-2">
                    <span className="truncate text-xs font-bold text-ink">
                      {scenario.name}
                    </span>
                    {isActive ? <Badge tone="lime">Active</Badge> : null}
                  </span>
                  <span className="mt-1 flex flex-wrap items-center gap-1.5">
                    <Badge tone={status.tone} dot>
                      {status.label}
                    </Badge>
                    <span className="text-[9px] text-ink-subtle">rev {scenario.revision}</span>
                    <span aria-hidden="true" className="text-neutral-300">·</span>
                    <span className="text-[9px] text-ink-subtle">
                      {changeCount} {changeCount === 1 ? 'change' : 'changes'}
                    </span>
                  </span>
                  <span className="mt-2.5 flex items-center justify-between gap-2">
                    <span className="text-[9px] text-ink-subtle">
                      Created {formatDate(scenario.createdAt)}
                    </span>
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#141618]">
                      Open
                      <ArrowUpRight
                        aria-hidden="true"
                        size={12}
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
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-black/15 py-3 text-xs font-semibold text-ink-muted transition-all hover:border-black hover:bg-white hover:text-black hover:scale-[1.01] cursor-pointer"
          >
            <Plus aria-hidden="true" size={13} strokeWidth={2.2} />
            New scenario
          </button>
        </div>
      )}
    </Panel>
  )
}
