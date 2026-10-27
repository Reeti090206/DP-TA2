import { useId } from 'react'
import {
  ArrowRight,
  ChartNoAxesColumn,
  ChevronDown,
  Info,
  Play,
  ScanSearch,
  TriangleAlert,
} from 'lucide-react'
import { Badge } from '../ui/Badge'
import { Button } from '../ui/Button'
import { EmptyState } from '../ui/EmptyState'
import { Panel, PanelHeader } from '../ui/Panel'
import { StaleAnalysisNotice } from './StaleAnalysisNotice'
import {
  formatDateTime,
  formatPropertyValue,
} from '../../lib/format'
import {
  ANALYSIS_SEVERITY_META,
  IMPACT_TYPE_META,
  PROPAGATION_LABELS,
  PROPAGATION_STRATEGIES,
  SCORING_LABELS,
  SCORING_STRATEGIES,
} from '../../lib/analysisPresentation'
import { getAnalysisReadiness } from '../../lib/analysisEngine'
import { SCENARIO_STATUS_META } from '../../lib/scenarioPresentation'
import { getScenarioStatus } from '../../lib/scenarioState'
import { cn } from '../../lib/cn'
import type {
  AnalysisSettings,
  ComponentId,
  DemoSystem,
  PropagationStrategy,
  Scenario,
  ScoringStrategy,
} from '../../types/domain'

interface AnalysisResultsPanelProps {
  system: DemoSystem
  activeScenario?: Scenario
  selectedComponentId: ComponentId
  onSelectComponent: (componentId: ComponentId) => void
  onUpdateAnalysisSettings: (
    scenarioId: string,
    settings: AnalysisSettings,
  ) => void
  onRunAnalysis: (scenarioId: string) => void
  onOpenScenarioLab: () => void
  className?: string
}

const selectClass =
  'h-8 w-full appearance-none rounded-md border border-line bg-white pl-2 pr-6 text-[10px] font-medium text-ink outline-none transition-colors hover:border-line-strong focus:border-brand disabled:bg-canvas disabled:text-ink-subtle'

export function AnalysisResultsPanel({
  system,
  activeScenario,
  selectedComponentId,
  onSelectComponent,
  onUpdateAnalysisSettings,
  onRunAnalysis,
  onOpenScenarioLab,
  className,
}: AnalysisResultsPanelProps) {
  const propagationId = useId()
  const scoringId = useId()
  const scenarioStatus = activeScenario ? getScenarioStatus(activeScenario) : null
  const statusMeta = scenarioStatus ? SCENARIO_STATUS_META[scenarioStatus] : null
  const analysis = activeScenario?.analysis
  const settings = activeScenario?.analysisSettings
  const readiness = activeScenario
    ? getAnalysisReadiness(system, activeScenario)
    : null
  const canRun = Boolean(activeScenario && readiness?.ready)
  const selectedFinding =
    analysis?.findings.find(
      (finding) => finding.componentId === selectedComponentId,
    ) ?? analysis?.findings[0]
  const severityMeta = analysis
    ? ANALYSIS_SEVERITY_META[analysis.severity]
    : null
  const selectedSeverityMeta = selectedFinding
    ? ANALYSIS_SEVERITY_META[selectedFinding.severity]
    : null
  const runLabel = analysis ? 'Rerun analysis' : 'Run analysis'
  const runTitle = !activeScenario
    ? 'Select a scenario first'
    : readiness?.ready
      ? analysis
        ? 'Recalculate with the current changes and strategy settings'
        : 'Run the local deterministic impact model'
      : readiness?.errors[0]

  const updateSettings = (patch: Partial<AnalysisSettings>) => {
    if (!activeScenario) {
      return
    }

    onUpdateAnalysisSettings(activeScenario.id, {
      ...activeScenario.analysisSettings,
      ...patch,
    })
  }

  const getComponentName = (componentId: ComponentId) =>
    system.components.find((component) => component.id === componentId)?.name ??
    componentId

  const metrics = analysis
    ? [
        { label: 'Impact / 100', value: String(analysis.overallScore) },
        { label: 'Affected', value: String(analysis.affectedComponentIds.length) },
        { label: 'Critical', value: String(analysis.criticalAffectedComponentIds.length) },
        { label: 'Direct', value: String(analysis.directComponentIds.length) },
        { label: 'Indirect', value: String(analysis.indirectComponentIds.length) },
        { label: 'Severity', value: severityMeta?.label ?? '—' },
      ]
    : [
        { label: 'Impact / 100', value: '—' },
        { label: 'Affected', value: '—' },
        { label: 'Critical', value: '—' },
        { label: 'Direct', value: '—' },
        { label: 'Indirect', value: '—' },
        { label: 'Severity', value: '—' },
      ]

  return (
    <Panel className={cn('flex flex-col', className)}>
      <PanelHeader
        icon={ScanSearch}
        title="Analysis results"
        description={
          activeScenario
            ? `Impact state for ${activeScenario.name} at revision ${activeScenario.revision}.`
            : 'Downstream effects appear here after an analysis.'
        }
        action={
          statusMeta ? (
            <Badge tone={statusMeta.tone} dot>
              {statusMeta.label}
            </Badge>
          ) : (
            <Badge tone="neutral" dot>
              No scenario
            </Badge>
          )
        }
      />

      <div className="flex flex-1 flex-col p-4">
        {activeScenario ? (
          <StaleAnalysisNotice scenario={activeScenario} className="mb-3" />
        ) : null}

        {activeScenario && settings ? (
          <div className="rounded-lg border border-line bg-canvas/40 p-2.5">
            <div className="grid grid-cols-2 gap-2">
              <label className="block" htmlFor={propagationId}>
                <span className="mb-1 block text-[8px] font-bold uppercase tracking-[0.1em] text-ink-subtle">
                  Propagation
                </span>
                <span className="relative block">
                  <select
                    id={propagationId}
                    value={settings.propagationStrategy}
                    onChange={(event) =>
                      updateSettings({
                        propagationStrategy: event.target
                          .value as PropagationStrategy,
                      })
                    }
                    className={selectClass}
                  >
                    {PROPAGATION_STRATEGIES.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    aria-hidden="true"
                    size={10}
                    className="pointer-events-none absolute right-1.5 top-1/2 -translate-y-1/2 text-ink-subtle"
                  />
                </span>
              </label>

              <label className="block" htmlFor={scoringId}>
                <span className="mb-1 block text-[8px] font-bold uppercase tracking-[0.1em] text-ink-subtle">
                  Scoring
                </span>
                <span className="relative block">
                  <select
                    id={scoringId}
                    value={settings.scoringStrategy}
                    onChange={(event) =>
                      updateSettings({
                        scoringStrategy: event.target.value as ScoringStrategy,
                      })
                    }
                    className={selectClass}
                  >
                    {SCORING_STRATEGIES.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    aria-hidden="true"
                    size={10}
                    className="pointer-events-none absolute right-1.5 top-1/2 -translate-y-1/2 text-ink-subtle"
                  />
                </span>
              </label>
            </div>

            <div className="mt-2 space-y-1">
              {PROPAGATION_STRATEGIES.filter(
                (strategy) => strategy.value === settings.propagationStrategy,
              ).map((strategy) => (
                <p key={strategy.value} className="text-[8.5px] leading-3.5 text-ink-muted">
                  <span className="font-semibold text-ink">{strategy.label}:</span>{' '}
                  {strategy.description}
                </p>
              ))}
              {SCORING_STRATEGIES.filter(
                (strategy) => strategy.value === settings.scoringStrategy,
              ).map((strategy) => (
                <p key={strategy.value} className="text-[8.5px] leading-3.5 text-ink-muted">
                  <span className="font-semibold text-ink">{strategy.label}:</span>{' '}
                  {strategy.description}
                </p>
              ))}
            </div>

            <div className="mt-2.5 flex items-center justify-between gap-2 border-t border-line/70 pt-2">
              <span className="text-[8.5px] leading-3.5 text-ink-subtle">
                {analysis
                  ? `Last run: revision ${analysis.scenarioRevision} · ${PROPAGATION_LABELS[analysis.propagationStrategy]} / ${SCORING_LABELS[analysis.scoringStrategy]}`
                  : 'Runs locally with deterministic demo rules.'}
              </span>
              <Button
                size="sm"
                className="h-7 px-2.5 text-[9.5px]"
                disabled={!canRun}
                title={runTitle}
                onClick={() => {
                  if (activeScenario) {
                    onRunAnalysis(activeScenario.id)
                  }
                }}
              >
                <Play aria-hidden="true" size={10} />
                {runLabel}
              </Button>
            </div>
          </div>
        ) : null}

        {activeScenario && readiness && !readiness.ready ? (
          <div
            role="status"
            className="mt-2 rounded-lg border border-risk-high/25 bg-risk-high-soft px-2.5 py-2"
          >
            <div className="flex items-start gap-1.5 text-[9px] leading-4 text-risk-high">
              <TriangleAlert aria-hidden="true" size={11} className="mt-0.5 shrink-0" />
              <div>
                <p className="font-semibold">Analysis cannot run yet</p>
                <ul className="mt-0.5 list-inside list-disc space-y-0.5">
                  {readiness.errors.map((error) => (
                    <li key={error}>{error}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ) : null}

        <div className="mt-3 grid grid-cols-3 gap-1.5">
          {metrics.map((metric) => (
            <div
              key={metric.label}
              className="rounded-lg border border-line bg-canvas/45 px-2 py-2 text-center"
            >
              <div
                className={cn(
                  'font-mono text-[14px] font-semibold leading-5 text-ink',
                  metric.label === 'Severity' && 'font-sans text-[11px]',
                  metric.label === 'Severity' && severityMeta?.textClass,
                )}
              >
                {metric.value}
              </div>
              <div className="mt-0.5 truncate text-[7.5px] font-semibold uppercase tracking-[0.06em] text-ink-subtle">
                {metric.label}
              </div>
            </div>
          ))}
        </div>

        {analysis ? (
          <>
            <div className="mt-3 flex flex-wrap items-center gap-1.5 rounded-lg border border-line bg-canvas/45 px-2.5 py-2">
              <Badge tone="neutral">rev {analysis.scenarioRevision}</Badge>
              <span className="font-mono text-[8px] text-ink-subtle">{analysis.modelVersion}</span>
              <span aria-hidden="true" className="text-line-strong">·</span>
              <span className="text-[8px] text-ink-subtle">
                {formatDateTime(analysis.analyzedAt)} · {analysis.findings.length}{' '}
                {analysis.findings.length === 1 ? 'finding' : 'findings'}
              </span>
            </div>

            <div className="mt-3">
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-[9px] font-bold uppercase tracking-[0.12em] text-ink-subtle">
                  Source changes
                </h3>
                <span className="font-mono text-[8.5px] text-ink-subtle">
                  {analysis.sourceChanges.length}
                </span>
              </div>
              <div className="mt-1.5 space-y-1.5">
                {analysis.sourceChanges.map((source) => (
                  <div
                    key={`${source.componentId}:${source.propertyKey}`}
                    className="rounded-lg border border-line bg-white px-2.5 py-2"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="truncate text-[10px] font-semibold text-ink">
                          {source.componentName}
                        </div>
                        <div className="mt-0.5 text-[8.5px] text-ink-subtle">
                          {source.propertyLabel}
                        </div>
                      </div>
                      <Badge tone={source.riskDirection === 'adverse' ? 'amber' : 'green'}>
                        {source.riskDirection === 'adverse' ? 'Adverse' : 'Favorable'}{' '}
                        {source.riskScore}
                      </Badge>
                    </div>
                    <div className="mt-1 flex items-center justify-between gap-2 font-mono text-[8.5px] text-ink-muted">
                      <span>
                        {formatPropertyValue(source.baselineValue, source.unit)}
                        <ArrowRight
                          aria-hidden="true"
                          size={9}
                          className="mx-1 inline text-ink-subtle"
                        />
                        <span className="font-semibold text-ink">
                          {formatPropertyValue(source.proposedValue, source.unit)}
                        </span>
                      </span>
                      <span
                        className={
                          source.riskDirection === 'adverse'
                            ? 'text-risk-high'
                            : 'text-risk-low'
                        }
                      >
                        {source.changePercent >= 0 ? '+' : ''}
                        {source.changePercent.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-3">
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-[9px] font-bold uppercase tracking-[0.12em] text-ink-subtle">
                  Findings
                </h3>
                <span className="font-mono text-[8.5px] text-ink-subtle">
                  {analysis.findings.length}
                </span>
              </div>

              {analysis.findings.length === 0 ? (
                <div className="mt-1.5 rounded-lg border border-line bg-canvas/45 px-2.5 py-2 text-[9px] leading-4 text-ink-muted">
                  No downstream components are reachable from the changed component. The local
                  source risk is still included in the overall score.
                </div>
              ) : (
                <ul className="mt-1.5 max-h-[252px] space-y-1.5 overflow-y-auto pr-1 scrollbar-subtle">
                  {analysis.findings.map((finding) => {
                    const findingSeverity = ANALYSIS_SEVERITY_META[finding.severity]
                    const impactMeta = IMPACT_TYPE_META[finding.impactType]
                    const isSelected = finding.componentId === selectedFinding?.componentId

                    return (
                      <li key={finding.componentId}>
                        <button
                          type="button"
                          onClick={() => onSelectComponent(finding.componentId)}
                          aria-pressed={isSelected}
                          className={cn(
                            'group flex w-full items-start gap-2 rounded-lg border px-2.5 py-2 text-left transition-colors',
                            isSelected
                              ? 'border-brand-line bg-brand-soft/55'
                              : 'border-line bg-white hover:border-brand-line hover:bg-canvas/45',
                          )}
                        >
                          <span
                            aria-hidden="true"
                            className={cn(
                              'mt-1 size-2 shrink-0 rounded-full',
                              findingSeverity.dotClass,
                            )}
                          />
                          <span className="min-w-0 flex-1">
                            <span className="flex items-center justify-between gap-2">
                              <span className="truncate text-[10.5px] font-semibold text-ink">
                                {finding.componentName}
                              </span>
                              <span
                                className={cn(
                                  'font-mono text-[11px] font-semibold',
                                  findingSeverity.textClass,
                                )}
                              >
                                {finding.score}
                              </span>
                            </span>
                            <span className="mt-1 flex flex-wrap items-center gap-1.5">
                              <Badge tone={impactMeta.tone}>{impactMeta.label}</Badge>
                              <Badge tone={findingSeverity.tone}>
                                {findingSeverity.label}
                              </Badge>
                              <span className="text-[8px] text-ink-subtle">
                                {finding.distance}{' '}
                                {finding.distance === 1 ? 'link' : 'links'} from{' '}
                                {finding.sourceComponentName}
                              </span>
                            </span>
                          </span>
                        </button>
                      </li>
                    )
                  })}
                </ul>
              )}
            </div>

            {selectedFinding ? (
              <div className="mt-3 rounded-lg border border-line bg-white">
                <div className="flex items-start justify-between gap-2 border-b border-line px-2.5 py-2">
                  <div>
                    <h3 className="text-[9px] font-bold uppercase tracking-[0.12em] text-ink-subtle">
                      Why affected?
                    </h3>
                    <p className="mt-0.5 text-[10.5px] font-semibold text-ink">
                      {selectedFinding.componentName}
                    </p>
                  </div>
                  <div className="text-right">
                    <div
                      className={cn(
                        'font-mono text-[13px] font-semibold',
                        selectedSeverityMeta?.textClass,
                      )}
                    >
                      {selectedFinding.score}/100
                    </div>
                    <div className="text-[8px] text-ink-subtle">
                      {selectedSeverityMeta?.label} severity
                    </div>
                  </div>
                </div>

                <div className="space-y-2.5 px-2.5 py-2.5">
                  <div>
                    <div className="text-[8px] font-bold uppercase tracking-[0.09em] text-ink-subtle">
                      Causal path
                    </div>
                    <div
                      className="mt-1 flex flex-wrap items-center gap-1"
                      aria-label={`Causal path: ${selectedFinding.causalPath.map(getComponentName).join(' to ')}`}
                    >
                      {selectedFinding.causalPath.map((componentId, index) => (
                        <span key={`${componentId}:${index}`} className="inline-flex items-center gap-1">
                          <span
                            className={cn(
                              'rounded border px-1.5 py-0.5 text-[8.5px] font-medium',
                              componentId === selectedFinding.sourceComponentId
                                ? 'border-brand-line bg-brand-soft text-brand-strong'
                                : componentId === selectedFinding.componentId
                                  ? cn(
                                      selectedSeverityMeta?.borderClass,
                                      selectedSeverityMeta?.backgroundClass,
                                      selectedSeverityMeta?.textClass,
                                    )
                                  : 'border-line bg-canvas text-ink-muted',
                            )}
                          >
                            {getComponentName(componentId)}
                          </span>
                          {index < selectedFinding.causalPath.length - 1 ? (
                            <ArrowRight
                              aria-hidden="true"
                              size={9}
                              className="shrink-0 text-ink-subtle"
                            />
                          ) : null}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5">
                    <Badge tone={IMPACT_TYPE_META[selectedFinding.impactType].tone}>
                      {IMPACT_TYPE_META[selectedFinding.impactType].label}
                    </Badge>
                    <Badge tone="neutral">
                      {selectedFinding.distance}{' '}
                      {selectedFinding.distance === 1 ? 'link' : 'links'}
                    </Badge>
                    {selectedFinding.shortestDistance !== selectedFinding.distance ? (
                      <Badge tone="neutral">
                        shortest {selectedFinding.shortestDistance}
                      </Badge>
                    ) : null}
                    <span className="text-[8.5px] text-ink-subtle">
                      from {selectedFinding.sourceComponentName}
                    </span>
                  </div>

                  <div className="rounded-md border border-line bg-canvas/45 px-2 py-1.5">
                    <div className="text-[8px] font-bold uppercase tracking-[0.09em] text-ink-subtle">
                      Triggered rule
                    </div>
                    <div className="mt-0.5 text-[9.5px] font-semibold text-ink">
                      {selectedFinding.rule}
                    </div>
                  </div>

                  <p className="text-[9px] leading-4 text-ink-muted">
                    {selectedFinding.explanation}
                  </p>

                  <details open className="rounded-md border border-line bg-canvas/45">
                    <summary className="cursor-pointer px-2 py-1.5 text-[8.5px] font-semibold text-ink marker:text-ink-subtle">
                      Score factors and assumptions
                    </summary>
                    <ul className="space-y-1 border-t border-line px-3 py-2 text-[8.5px] leading-3.5 text-ink-muted">
                      {selectedFinding.factors.map((factor) => (
                        <li key={factor} className="flex gap-1.5">
                          <span aria-hidden="true" className="mt-1 size-1 shrink-0 rounded-full bg-brand" />
                          <span>{factor}</span>
                        </li>
                      ))}
                    </ul>
                  </details>
                </div>
              </div>
            ) : null}

            <details className="mt-2 rounded-lg border border-line bg-canvas/45">
              <summary className="cursor-pointer px-2.5 py-2 text-[9px] font-semibold text-ink marker:text-ink-subtle">
                How the overall score was calculated
              </summary>
              <ul className="space-y-1 border-t border-line px-3 py-2 text-[8.5px] leading-3.5 text-ink-muted">
                {analysis.overallFactors.map((factor) => (
                  <li key={factor} className="flex gap-1.5">
                    <span aria-hidden="true" className="mt-1 size-1 shrink-0 rounded-full bg-ink-subtle" />
                    <span>{factor}</span>
                  </li>
                ))}
              </ul>
            </details>
          </>
        ) : activeScenario && settings ? (
          <EmptyState
            compact
            className="flex-1"
            icon={ChartNoAxesColumn}
            title={readiness?.ready ? 'Ready to analyze' : 'No confirmed changes'}
            description={
              readiness?.ready
                ? `${activeScenario.changeSet.length} confirmed ${activeScenario.changeSet.length === 1 ? 'change is' : 'changes are'} stored at revision ${activeScenario.revision}. Run the local model to calculate affected components, causal paths, and severity.`
                : 'Propose and confirm a supported property change in the active scenario. Run analysis stays disabled until the change set is valid.'
            }
          />
        ) : (
          <EmptyState
            compact
            className="flex-1"
            icon={ChartNoAxesColumn}
            title="Start with a scenario"
            description="Impact analysis runs inside a scenario so results stay tied to a revision and a pair of strategy settings."
            action={
              <Button variant="secondary" size="sm" onClick={onOpenScenarioLab}>
                Open Scenario Lab
                <ArrowRight aria-hidden="true" size={12} />
              </Button>
            }
          />
        )}

        <div className="mt-2 flex gap-2 rounded-lg border border-line bg-canvas/55 px-2.5 py-2 text-[8.5px] leading-4 text-ink-muted">
          <Info aria-hidden="true" size={11} className="mt-0.5 shrink-0 text-ink-subtle" />
          <p>
            Scores are deterministic modeled impact from local demo data, not probabilities or
            predictions of production failure. The baseline remains the comparison point.
          </p>
        </div>
      </div>
    </Panel>
  )
}
