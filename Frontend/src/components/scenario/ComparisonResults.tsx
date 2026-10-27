import { ArrowUpRight, GitBranch, Info, ShieldCheck, TriangleAlert } from 'lucide-react'
import { Badge } from '../ui/Badge'
import { Button } from '../ui/Button'
import { cn } from '../../lib/cn'
import type {
  ComparisonDifference,
  ScenarioComparison,
  ScenarioComparisonEntry,
} from '../../lib/scenarioComparison'

interface ComparisonResultsProps {
  comparison: ScenarioComparison
  onOpenScenario: (scenarioId: string) => void
}

const DIFFERENCE_CLASSES: Record<ComparisonDifference, string> = {
  better: 'text-risk-low',
  worse: 'text-risk-high',
  same: 'text-ink-subtle',
  reference: 'text-ink-subtle',
  'not-available': 'text-ink-subtle',
  informational: 'text-ink-muted',
}

function getInvalidNoticeClass(entry: ScenarioComparisonEntry) {
  if (entry.status.availability === 'incompatible') {
    return 'border-risk-critical/20 bg-risk-critical-soft/65 text-risk-critical'
  }

  if (entry.status.availability === 'stale') {
    return 'border-risk-high/20 bg-risk-high-soft/65 text-risk-high'
  }

  return 'border-line-strong bg-canvas/70 text-ink-muted'
}

function getStatusTone(entry: ScenarioComparisonEntry) {
  return entry.status.tone
}

export function ComparisonResults({
  comparison,
  onOpenScenario,
}: ComparisonResultsProps) {
  const invalidEntries = comparison.entries.filter(
    (entry) => entry.status.availability !== 'ready',
  )
  const currentCount = comparison.entries.length - invalidEntries.length

  return (
    <div className="space-y-4">
      {comparison.warnings.length > 0 ? (
        <div
          role="status"
          className="rounded-lg border border-risk-high/20 bg-risk-high-soft/55 px-3 py-2.5"
        >
          <div className="flex items-start gap-2">
            <TriangleAlert
              aria-hidden="true"
              size={13}
              className="mt-0.5 shrink-0 text-risk-high"
            />
            <div className="min-w-0">
              <div className="text-[9.5px] font-semibold text-risk-high">
                Comparison caveats
              </div>
              <ul className="mt-1 space-y-0.5 text-[9px] leading-4 text-ink-muted">
                {comparison.warnings.map((warning) => (
                  <li key={warning}>{warning}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      ) : null}

      {invalidEntries.length > 0 ? (
        <div className="grid gap-2 sm:grid-cols-2">
          {invalidEntries.map((entry) => (
            <div
              key={entry.scenario.id}
              className={cn(
                'rounded-lg border px-3 py-2.5',
                getInvalidNoticeClass(entry),
              )}
            >
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[10.5px] font-semibold text-ink">
                  {entry.scenario.name}
                </span>
                <Badge tone={getStatusTone(entry)}>{entry.status.label}</Badge>
              </div>
              <ul className="mt-1.5 space-y-1 text-[8.5px] leading-4 text-ink-muted">
                {entry.status.issues.map((issue) => (
                  <li key={issue}>{issue}</li>
                ))}
              </ul>
              <Button
                variant="ghost"
                size="sm"
                className="mt-1.5 h-7 px-1.5 text-[9px]"
                onClick={() => onOpenScenario(entry.scenario.id)}
              >
                Open to rerun
                <ArrowUpRight aria-hidden="true" size={10} />
              </Button>
            </div>
          ))}
        </div>
      ) : null}

      {currentCount === 0 ? (
        <div className="flex items-start gap-2 rounded-lg border border-line bg-canvas/45 px-3 py-2.5">
          <Info aria-hidden="true" size={12} className="mt-0.5 shrink-0 text-ink-subtle" />
          <p className="text-[9px] leading-4 text-ink-muted">
            No current analyses are available in this selection. Confirmed changes and
            strategies are still shown; rerun an analysis to compare modeled impact metrics.
          </p>
        </div>
      ) : null}

      <div className="overflow-hidden rounded-lg border border-line">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[660px] border-collapse text-left">
            <caption className="sr-only">
              Baseline and selected scenario comparison metrics
            </caption>
            <thead>
              <tr className="bg-canvas/70">
                <th
                  scope="col"
                  className="w-[175px] border-b border-line px-3 py-2.5 text-[8px] font-bold uppercase tracking-[0.09em] text-ink-subtle"
                >
                  Metric
                </th>
                <th
                  scope="col"
                  className="min-w-[120px] border-b border-l border-line px-3 py-2.5 align-top"
                >
                  <div className="text-[10.5px] font-semibold text-navy">
                    {comparison.baseline.name}
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-1">
                    <Badge tone="teal">Baseline</Badge>
                    <span className="font-mono text-[8px] text-ink-subtle">
                      {comparison.baseline.modelVersion}
                    </span>
                  </div>
                  <div className="mt-1 text-[8px] leading-3 text-ink-subtle">
                    Read-only, no proposed changes
                  </div>
                </th>
                {comparison.entries.map((entry) => (
                  <th
                    key={entry.scenario.id}
                    scope="col"
                    className="min-w-[130px] border-b border-l border-line px-3 py-2.5 align-top"
                  >
                    <div className="max-w-[190px] truncate text-[10.5px] font-semibold text-navy">
                      {entry.scenario.name}
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-1">
                      <Badge tone={getStatusTone(entry)}>{entry.status.label}</Badge>
                    </div>
                    <div className="mt-1 text-[8px] leading-3 text-ink-subtle">
                      Revision {entry.scenario.revision}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {comparison.metricRows.map((row, rowIndex) => (
                <tr
                  key={row.key}
                  className={cn(
                    'align-top',
                    rowIndex % 2 === 1 ? 'bg-canvas/20' : 'bg-white',
                  )}
                >
                  <th scope="row" className="border-b border-line px-3 py-2.5">
                    <div className="text-[9.5px] font-semibold text-ink">{row.label}</div>
                    <div className="mt-0.5 text-[8px] font-medium uppercase tracking-[0.05em] text-ink-subtle">
                      {row.preference === 'lower' ? 'Lower is preferable' : 'Informational'}
                    </div>
                    <div className="mt-1 text-[8px] font-normal leading-3 text-ink-muted">
                      {row.description}
                    </div>
                  </th>
                  <td className="border-b border-l border-line px-3 py-2.5">
                    <MetricCell value={comparison.metricRows[rowIndex].values.baseline} />
                  </td>
                  {comparison.entries.map((entry) => {
                    const value = row.values[entry.scenario.id]

                    return (
                      <td
                        key={entry.scenario.id}
                        className="border-b border-l border-line px-3 py-2.5"
                      >
                        <MetricCell value={value} />
                      </td>
                    )
                  })}
                </tr>
              ))}
              <tr className="bg-white align-top">
                <th scope="row" className="px-3 py-2.5">
                  <div className="text-[9.5px] font-semibold text-ink">
                    Analysis strategy
                  </div>
                  <div className="mt-0.5 text-[8px] font-medium uppercase tracking-[0.05em] text-ink-subtle">
                    Configuration
                  </div>
                  <div className="mt-1 text-[8px] font-normal leading-3 text-ink-muted">
                    Strategies affect calculations. Different strategies are flagged above.
                  </div>
                </th>
                <td className="border-l border-line px-3 py-2.5">
                  <span className="text-[8.5px] leading-4 text-ink-muted">
                    {comparison.strategyValues.baseline}
                  </span>
                </td>
                {comparison.entries.map((entry) => (
                  <td
                    key={entry.scenario.id}
                    className="border-l border-line px-3 py-2.5"
                  >
                    <span className="text-[8.5px] leading-4 text-ink-muted">
                      {comparison.strategyValues[entry.scenario.id]}
                    </span>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div>
        <div className="mb-2 flex flex-wrap items-end justify-between gap-2">
          <div>
            <h3 className="text-[10.5px] font-semibold text-navy">Confirmed changes</h3>
            <p className="mt-0.5 text-[8.5px] text-ink-muted">
              Current proposed values compared with read-only baseline defaults.
            </p>
          </div>
          <span className="text-[8px] text-ink-subtle">
            {comparison.entries.length} selected
          </span>
        </div>

        <div className="grid gap-2 sm:grid-cols-2">
          <div className="rounded-lg border border-line bg-canvas/35 p-2.5">
            <div className="flex items-center gap-1.5">
              <ShieldCheck aria-hidden="true" size={11} className="text-brand" />
              <span className="text-[9.5px] font-semibold text-ink">
                {comparison.baseline.name} baseline
              </span>
              <Badge tone="teal">Read-only</Badge>
            </div>
            <p className="mt-2 text-[8.5px] leading-4 text-ink-muted">
              No proposed changes. All comparison differences are measured from this
              unchanged reference.
            </p>
          </div>

          {comparison.entries.map((entry) => (
            <div
              key={entry.scenario.id}
              className="rounded-lg border border-line bg-canvas/35 p-2.5"
            >
              <div className="flex flex-wrap items-center gap-1.5">
                <GitBranch aria-hidden="true" size={11} className="text-brand" />
                <span className="min-w-0 truncate text-[9.5px] font-semibold text-ink">
                  {entry.scenario.name}
                </span>
                <Badge tone={getStatusTone(entry)}>{entry.status.label}</Badge>
              </div>

              {entry.changes.length === 0 ? (
                <p className="mt-2 text-[8.5px] leading-4 text-ink-muted">
                  No confirmed property changes.
                </p>
              ) : (
                <div className="mt-2 space-y-1.5">
                  {entry.changes.map((change) => (
                    <div
                      key={change.key}
                      className="rounded-md border border-line bg-white px-2 py-1.5"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="truncate text-[8.5px] font-semibold text-ink">
                            {change.componentName} · {change.propertyLabel}
                          </div>
                          <div className="mt-0.5 font-mono text-[8.5px] text-ink-muted">
                            {change.display}
                          </div>
                        </div>
                        <span className="shrink-0 font-mono text-[8px] font-semibold text-ink-muted">
                          {change.changePercent > 0 ? '+' : ''}
                          {change.changePercent.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

interface MetricCellProps {
  value: {
    display: string
    differenceLabel: string
    difference: ComparisonDifference
  }
}

function MetricCell({ value }: MetricCellProps) {
  return (
    <>
      <div className="font-mono text-[12px] font-semibold text-navy">{value.display}</div>
      <div
        className={cn(
          'mt-0.5 text-[8px] font-medium leading-3',
          DIFFERENCE_CLASSES[value.difference],
        )}
      >
        {value.differenceLabel}
      </div>
    </>
  )
}
