import { GitCompareArrows, Plus, X } from 'lucide-react'
import { Badge } from '../ui/Badge'
import { Button } from '../ui/Button'
import { EmptyState } from '../ui/EmptyState'
import { Panel, PanelHeader } from '../ui/Panel'
import { cn } from '../../lib/cn'
import {
  buildScenarioComparison,
  getScenarioComparisonStatus,
  MAX_COMPARISON_SCENARIOS,
} from '../../lib/scenarioComparison'
import { SCENARIO_STATUS_META } from '../../lib/scenarioPresentation'
import { getScenarioStatus } from '../../lib/scenarioState'
import { ComparisonResults } from './ComparisonResults'
import type { DemoSystem, Scenario } from '../../types/domain'

interface ComparisonPanelProps {
  system: DemoSystem
  scenarios: Scenario[]
  selectedScenarioIds: string[]
  activeScenarioId: string | null
  onToggleScenario: (scenarioId: string) => void
  onClearSelection: () => void
  onCreateScenario: () => void
  onOpenScenario: (scenarioId: string) => void
}

export function ComparisonPanel({
  system,
  scenarios,
  selectedScenarioIds,
  activeScenarioId,
  onToggleScenario,
  onClearSelection,
  onCreateScenario,
  onOpenScenario,
}: ComparisonPanelProps) {
  const selectedIds = selectedScenarioIds
    .filter((scenarioId) =>
      scenarios.some((scenario) => scenario.id === scenarioId),
    )
    .slice(0, MAX_COMPARISON_SCENARIOS)
  const comparison = buildScenarioComparison(system, scenarios, selectedIds)
  const atLimit = selectedIds.length >= MAX_COMPARISON_SCENARIOS
  const hasSelection = comparison.entries.length > 0

  return (
    <Panel className="overflow-hidden">
      <PanelHeader
        icon={GitCompareArrows}
        title="Comparison"
        description="Baseline versus up to three scenarios, using each scenario’s current analysis."
        action={
          hasSelection ? (
            <Button variant="ghost" size="sm" onClick={onClearSelection}>
              <X aria-hidden="true" size={11} />
              Clear selection
            </Button>
          ) : (
            <Badge tone="neutral" dot>
              {selectedIds.length}/{MAX_COMPARISON_SCENARIOS} selected
            </Badge>
          )
        }
      />

      <div className="border-b border-line bg-canvas/35 px-4 py-3">
        <fieldset>
          <legend className="flex w-full flex-wrap items-center justify-between gap-2">
            <span className="text-[9px] font-bold uppercase tracking-[0.09em] text-ink-subtle">
              Scenarios in comparison
            </span>
            <span className="font-mono text-[8.5px] text-ink-subtle">
              {selectedIds.length}/{MAX_COMPARISON_SCENARIOS}
            </span>
          </legend>

          {scenarios.length === 0 ? (
            <EmptyState
              compact
              icon={GitCompareArrows}
              title="No scenarios to compare"
              description="Create a scenario, run an analysis, and then select it here to compare against the baseline."
              action={
                <Button variant="secondary" size="sm" onClick={onCreateScenario}>
                  <Plus aria-hidden="true" size={12} />
                  Create a scenario
                </Button>
              }
              className="px-0 pb-0 pt-4"
            />
          ) : (
            <>
              <div className="scrollbar-subtle mt-2 max-h-[178px] space-y-1.5 overflow-y-auto pr-1">
                {scenarios.map((scenario) => {
                  const isSelected = selectedIds.includes(scenario.id)
                  const isDisabled = atLimit && !isSelected
                  const comparisonStatus = getScenarioComparisonStatus(system, scenario)
                  const scenarioStatus = SCENARIO_STATUS_META[getScenarioStatus(scenario)]

                  return (
                    <label
                      key={scenario.id}
                      className={cn(
                        'flex items-start gap-2.5 rounded-lg border px-2.5 py-2 transition-colors',
                        isSelected
                          ? 'border-brand-line bg-brand-soft/45'
                          : 'border-line bg-white hover:border-brand-line/80 hover:bg-canvas/40',
                        isDisabled && 'cursor-not-allowed opacity-55 hover:border-line hover:bg-white',
                      )}
                      title={
                        isDisabled
                          ? 'Deselect one scenario before adding another.'
                          : undefined
                      }
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        disabled={isDisabled}
                        onChange={() => onToggleScenario(scenario.id)}
                        aria-label={`Include ${scenario.name} in comparison`}
                        className="mt-0.5 size-3.5 shrink-0 accent-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/20"
                      />
                      <span className="min-w-0 flex-1">
                        <span className="flex flex-wrap items-center gap-1.5">
                          <span className="truncate text-[10px] font-semibold text-ink">
                            {scenario.name}
                          </span>
                          {scenario.id === activeScenarioId ? (
                            <Badge tone="teal">Active</Badge>
                          ) : null}
                          <Badge tone={comparisonStatus.tone}>
                            {comparisonStatus.label}
                          </Badge>
                        </span>
                        <span className="mt-1 flex flex-wrap items-center gap-1.5 text-[8px] text-ink-subtle">
                          <Badge tone={scenarioStatus.tone} dot>
                            {scenarioStatus.label}
                          </Badge>
                          <span>rev {scenario.revision}</span>
                          <span aria-hidden="true">·</span>
                          <span>
                            {scenario.changeSet.length}{' '}
                            {scenario.changeSet.length === 1 ? 'change' : 'changes'}
                          </span>
                          {comparisonStatus.availability === 'ready' &&
                          scenario.analysis ? (
                            <>
                              <span aria-hidden="true">·</span>
                              <span>score {scenario.analysis.overallScore}/100</span>
                            </>
                          ) : null}
                        </span>
                      </span>
                    </label>
                  )
                })}
              </div>
              <p className="mt-2 text-[8.5px] leading-4 text-ink-subtle">
                {atLimit
                  ? `Selection limit reached (${MAX_COMPARISON_SCENARIOS}). Deselect a scenario to add another.`
                  : `Select up to ${MAX_COMPARISON_SCENARIOS} scenarios. Missing, stale, and incompatible analyses will be flagged and excluded from impact metrics.`}
              </p>
            </>
          )}
        </fieldset>
      </div>

      <div className="p-4">
        {hasSelection ? (
          <ComparisonResults
            comparison={comparison}
            onOpenScenario={onOpenScenario}
          />
        ) : (
          <EmptyState
            icon={GitCompareArrows}
            title={scenarios.length === 0 ? 'Nothing to compare yet' : 'Select scenarios to compare'}
            description={
              scenarios.length === 0
                ? 'Create at least one scenario to compare its modeled impact against the read-only baseline.'
                : 'Choose one or more scenarios above. The comparison updates live and will never treat stale or missing analysis results as current.'
            }
          />
        )}

        <div className="mt-1 flex flex-wrap items-center justify-between gap-2 rounded-lg border border-line bg-canvas/45 px-3 py-2.5">
          <div className="min-w-0">
            <div className="text-[8px] font-bold uppercase tracking-[0.09em] text-ink-subtle">
              Comparison rules
            </div>
            <p className="mt-0.5 text-[9px] leading-4 text-ink-muted">
              One read-only baseline · current analyses only · up to {MAX_COMPARISON_SCENARIOS} scenarios
            </p>
          </div>
          <Badge tone={comparison.strategyMismatch ? 'amber' : 'neutral'} dot>
            {comparison.strategyMismatch
              ? 'Mixed strategies'
              : `${selectedIds.length} selected`}
          </Badge>
        </div>
      </div>
    </Panel>
  )
}
