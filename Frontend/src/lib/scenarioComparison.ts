import type { BadgeTone } from '../components/ui/Badge'
import {
  ANALYSIS_SEVERITY_META,
  PROPAGATION_LABELS,
  SCORING_LABELS,
} from './analysisPresentation'
import { formatPropertyValue } from './format'
import { getAnalysisStaleness } from './scenarioState'
import type {
  AnalysisSeverity,
  AnalysisSettings,
  ComponentId,
  DemoSystem,
  PropertyKey,
  Scenario,
  ScenarioChange,
} from '../types/domain'

export const MAX_COMPARISON_SCENARIOS = 3

export type ComparisonAvailability = 'ready' | 'missing' | 'stale' | 'incompatible'

export type ComparisonSeverity = AnalysisSeverity | 'none'

export type ComparisonDifference =
  | 'better'
  | 'worse'
  | 'same'
  | 'reference'
  | 'not-available'
  | 'informational'

export interface ScenarioComparisonStatus {
  availability: ComparisonAvailability
  label: string
  tone: BadgeTone
  issues: string[]
}

export interface ComparisonChange {
  key: string
  componentId: ComponentId
  componentName: string
  propertyKey: PropertyKey
  propertyLabel: string
  baselineValue: number
  proposedValue: number
  unit?: string
  changePercent: number
  display: string
}

export interface ComparisonMetrics {
  changeCount: number
  overallScore: number
  affectedCount: number
  directCount: number
  indirectCount: number
  criticalCount: number
  severity: ComparisonSeverity
}

export interface ComparisonMetricValue {
  display: string
  differenceLabel: string
  difference: ComparisonDifference
}

export interface ComparisonMetricRow {
  key:
    | 'changes'
    | 'overall'
    | 'affected'
    | 'direct'
    | 'indirect'
    | 'critical'
    | 'severity'
  label: string
  description: string
  preference: 'lower' | 'informational'
  values: Record<string, ComparisonMetricValue>
}

export interface ScenarioComparisonEntry {
  scenario: Scenario
  status: ScenarioComparisonStatus
  configLabel: string
  analysisLabel: string | null
  metrics: ComparisonMetrics | null
  changes: ComparisonChange[]
}

export interface ComparisonBaseline {
  name: string
  modelVersion: string
  metrics: ComparisonMetrics
  changes: ComparisonChange[]
}

export interface ScenarioComparison {
  baseline: ComparisonBaseline
  entries: ScenarioComparisonEntry[]
  metricRows: ComparisonMetricRow[]
  strategyValues: Record<string, string>
  warnings: string[]
  strategyMismatch: boolean
}

const BASELINE_KEY = 'baseline'

const SEVERITY_RANK: Record<ComparisonSeverity, number> = {
  none: 0,
  low: 1,
  moderate: 2,
  high: 3,
  severe: 4,
}

interface ComparisonMetricDefinition {
  key: ComparisonMetricRow['key']
  label: string
  description: string
  preference: ComparisonMetricRow['preference']
  getValue: (metrics: ComparisonMetrics) => number
  format: (metrics: ComparisonMetrics) => string
}

const COMPARISON_METRICS: ComparisonMetricDefinition[] = [
  {
    key: 'changes',
    label: 'Confirmed changes',
    description:
      'Property overrides in the scenario. More changes are informational, not inherently better or worse.',
    preference: 'informational',
    getValue: (metrics) => metrics.changeCount,
    format: (metrics) => String(metrics.changeCount),
  },
  {
    key: 'overall',
    label: 'Overall impact score',
    description: 'Composite modeled impact score. Lower is preferable.',
    preference: 'lower',
    getValue: (metrics) => metrics.overallScore,
    format: (metrics) => `${metrics.overallScore}/100`,
  },
  {
    key: 'affected',
    label: 'Affected components',
    description: 'Unique downstream components reached by the change. Lower is preferable.',
    preference: 'lower',
    getValue: (metrics) => metrics.affectedCount,
    format: (metrics) => String(metrics.affectedCount),
  },
  {
    key: 'direct',
    label: 'Direct impacts',
    description: 'Affected components one dependency link away. Lower is preferable.',
    preference: 'lower',
    getValue: (metrics) => metrics.directCount,
    format: (metrics) => String(metrics.directCount),
  },
  {
    key: 'indirect',
    label: 'Indirect impacts',
    description: 'Affected components reached through multiple links. Lower is preferable.',
    preference: 'lower',
    getValue: (metrics) => metrics.indirectCount,
    format: (metrics) => String(metrics.indirectCount),
  },
  {
    key: 'critical',
    label: 'Critical components',
    description: 'Critical components among the affected set. Lower is preferable.',
    preference: 'lower',
    getValue: (metrics) => metrics.criticalCount,
    format: (metrics) => String(metrics.criticalCount),
  },
  {
    key: 'severity',
    label: 'Severity',
    description: 'Highest modeled severity band. Lower is preferable.',
    preference: 'lower',
    getValue: (metrics) => SEVERITY_RANK[metrics.severity],
    format: (metrics) =>
      metrics.severity === 'none'
        ? 'None'
        : ANALYSIS_SEVERITY_META[metrics.severity].label,
  },
]

export function getComparisonStrategyLabel(settings: AnalysisSettings) {
  return `${PROPAGATION_LABELS[settings.propagationStrategy]} · ${SCORING_LABELS[settings.scoringStrategy]}`
}

export function getScenarioComparisonStatus(
  system: DemoSystem,
  scenario: Scenario,
): ScenarioComparisonStatus {
  if (!scenario.analysis) {
    return {
      availability: 'missing',
      label: 'Not analyzed',
      tone: 'neutral',
      issues: [
        'No analysis result is available. Run analysis before using impact metrics in a comparison.',
      ],
    }
  }

  const issues: string[] = []
  const modelMismatch = scenario.analysis.modelVersion !== system.modelVersion
  const staleness = getAnalysisStaleness(scenario)

  if (modelMismatch) {
    issues.push(
      `The analysis uses model ${scenario.analysis.modelVersion}, but the current model is ${system.modelVersion}.`,
    )
  }

  if (staleness.revisionChanged) {
    issues.push(
      `The analysis covers revision ${scenario.analysis.scenarioRevision}, but the scenario is now revision ${scenario.revision}.`,
    )
  }

  if (staleness.settingsChanged) {
    issues.push(
      'The analysis settings changed after the last analysis run.',
    )
  }

  if (modelMismatch) {
    return {
      availability: 'incompatible',
      label: 'Incompatible model',
      tone: 'red',
      issues,
    }
  }

  if (staleness.isStale) {
    return {
      availability: 'stale',
      label: 'Stale analysis',
      tone: 'amber',
      issues,
    }
  }

  return {
    availability: 'ready',
    label: 'Current analysis',
    tone: 'green',
    issues: [],
  }
}

export function getComparisonChanges(
  system: DemoSystem,
  scenario: { changeSet: ScenarioChange[] },
): ComparisonChange[] {
  return scenario.changeSet.flatMap((change) => {
    const component = system.components.find((item) => item.id === change.componentId)
    const property = component?.supportedProperties.find(
      (item) => item.key === change.propertyKey,
    )

    if (!component || !property) {
      return []
    }

    const changePercent =
      property.defaultValue === 0
        ? change.value === 0
          ? 0
          : 100
        : ((change.value - property.defaultValue) / property.defaultValue) * 100

    return [
      {
        key: `${change.componentId}:${change.propertyKey}`,
        componentId: change.componentId,
        componentName: component.name,
        propertyKey: change.propertyKey,
        propertyLabel: property.label,
        baselineValue: property.defaultValue,
        proposedValue: change.value,
        unit: property.unit,
        changePercent: Math.round(changePercent * 10) / 10,
        display: `${formatPropertyValue(property.defaultValue, property.unit)} → ${formatPropertyValue(change.value, property.unit)}`,
      },
    ]
  })
}

export function getComparisonMetrics(scenario: Scenario): ComparisonMetrics | null {
  if (!scenario.analysis) {
    return null
  }

  return {
    changeCount: scenario.changeSet.length,
    overallScore: scenario.analysis.overallScore,
    affectedCount: scenario.analysis.affectedComponentIds.length,
    directCount: scenario.analysis.directComponentIds.length,
    indirectCount: scenario.analysis.indirectComponentIds.length,
    criticalCount: scenario.analysis.criticalAffectedComponentIds.length,
    severity: scenario.analysis.severity,
  }
}

function getBaselineMetrics(): ComparisonMetrics {
  return {
    changeCount: 0,
    overallScore: 0,
    affectedCount: 0,
    directCount: 0,
    indirectCount: 0,
    criticalCount: 0,
    severity: 'none',
  }
}

function getDifferenceLabel(
  metric: ComparisonMetricDefinition,
  scenarioMetrics: ComparisonMetrics,
  baselineMetrics: ComparisonMetrics,
) {
  const baselineValue = metric.getValue(baselineMetrics)
  const scenarioValue = metric.getValue(scenarioMetrics)
  const difference = scenarioValue - baselineValue

  if (metric.key === 'severity') {
    if (difference === 0) {
      return {
        label: 'Same as baseline',
        difference: 'same' as const,
      }
    }

    return {
      label: `${difference > 0 ? '+' : ''}${difference} severity ${Math.abs(difference) === 1 ? 'level' : 'levels'} vs baseline`,
      difference: difference > 0 ? ('worse' as const) : ('better' as const),
    }
  }

  if (difference === 0) {
    return {
      label:
        metric.preference === 'informational'
          ? 'Same as baseline'
          : 'No difference from baseline',
      difference: 'same' as const,
    }
  }

  if (metric.preference === 'informational') {
    return {
      label: `${difference > 0 ? '+' : ''}${difference} vs baseline`,
      difference: 'informational' as const,
    }
  }

  return {
    label: `${difference > 0 ? '+' : ''}${difference} vs baseline`,
    difference: difference > 0 ? ('worse' as const) : ('better' as const),
  }
}

function getUnavailableLabel(status: ComparisonAvailability) {
  switch (status) {
    case 'stale':
      return 'Stale analysis'
    case 'incompatible':
      return 'Incompatible model'
    default:
      return 'No analysis'
  }
}

export function buildScenarioComparison(
  system: DemoSystem,
  scenarios: Scenario[],
  selectedScenarioIds: string[],
): ScenarioComparison {
  const uniqueIds = [...new Set(selectedScenarioIds)].slice(0, MAX_COMPARISON_SCENARIOS)
  const selectedScenarios = uniqueIds.flatMap((scenarioId) => {
    const scenario = scenarios.find((item) => item.id === scenarioId)
    return scenario ? [scenario] : []
  })
  const baselineMetrics = getBaselineMetrics()
  const entries: ScenarioComparisonEntry[] = selectedScenarios.map((scenario) => {
    const status = getScenarioComparisonStatus(system, scenario)

    return {
      scenario,
      status,
      configLabel: getComparisonStrategyLabel(scenario.analysisSettings),
      analysisLabel:
        status.availability === 'ready' && scenario.analysis
          ? getComparisonStrategyLabel({
              propagationStrategy: scenario.analysis.propagationStrategy,
              scoringStrategy: scenario.analysis.scoringStrategy,
            })
          : null,
      metrics: status.availability === 'ready' ? getComparisonMetrics(scenario) : null,
      changes: getComparisonChanges(system, scenario),
    }
  })

  const metricRows: ComparisonMetricRow[] = COMPARISON_METRICS.map((metric) => {
    const values: Record<string, ComparisonMetricValue> = {
      [BASELINE_KEY]: {
        display: metric.format(baselineMetrics),
        differenceLabel: 'Read-only reference',
        difference: 'reference',
      },
    }

    for (const entry of entries) {
      if (!entry.metrics) {
        values[entry.scenario.id] = {
          display: metric.key === 'changes' ? String(entry.changes.length) : '—',
          differenceLabel:
            metric.key === 'changes'
              ? entry.changes.length === 0
                ? 'Same as baseline'
                : `+${entry.changes.length} vs baseline`
              : getUnavailableLabel(entry.status.availability),
          difference:
            metric.key === 'changes'
              ? entry.changes.length === 0
                ? 'same'
                : 'informational'
              : 'not-available',
        }
        continue
      }

      const difference = getDifferenceLabel(metric, entry.metrics, baselineMetrics)

      values[entry.scenario.id] = {
        display: metric.format(entry.metrics),
        differenceLabel: difference.label,
        difference: difference.difference,
      }
    }

    return {
      key: metric.key,
      label: metric.label,
      description: metric.description,
      preference: metric.preference,
      values,
    }
  })

  const configLabels = new Set(entries.map((entry) => entry.configLabel))
  const strategyMismatch = configLabels.size > 1
  const unavailableCount = entries.filter(
    (entry) => entry.status.availability !== 'ready',
  ).length
  const warnings: string[] = []

  if (strategyMismatch) {
    warnings.push(
      'Selected scenarios use different propagation or scoring strategies. Results remain local modeled values, but they are not directly like-for-like.',
    )
  }

  if (unavailableCount > 0) {
    warnings.push(
      `${unavailableCount} selected ${unavailableCount === 1 ? 'scenario has' : 'scenarios have'} no current analysis. ${unavailableCount === 1 ? 'Its confirmed changes are' : 'Their confirmed changes are'} shown, but impact metrics are excluded until analysis is rerun.`,
    )
  }

  return {
    baseline: {
      name: system.name,
      modelVersion: system.modelVersion,
      metrics: baselineMetrics,
      changes: [],
    },
    entries,
    metricRows,
    strategyValues: {
      [BASELINE_KEY]: 'No changes · no analysis',
      ...Object.fromEntries(
        entries.map((entry) => [
          entry.scenario.id,
          entry.analysisLabel
            ? entry.analysisLabel
            : `${entry.configLabel} · configured, not compared`,
        ]),
      ),
    },
    warnings,
    strategyMismatch,
  }
}
