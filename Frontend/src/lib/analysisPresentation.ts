import type { BadgeTone } from '../components/ui/Badge'
import type {
  AnalysisSeverity,
  ComponentId,
  ImpactClassification,
  PropagationStrategy,
  ScenarioAnalysis,
  ScoringStrategy,
} from '../types/domain'

interface StrategyOption<T extends string> {
  value: T
  label: string
  description: string
}

export const PROPAGATION_STRATEGIES: Array<StrategyOption<PropagationStrategy>> = [
  {
    value: 'breadth-first',
    label: 'Breadth-first',
    description:
      'Uses each component’s shortest dependency route and applies fixed attenuation per hop.',
  },
  {
    value: 'weighted',
    label: 'Weighted path',
    description:
      'Uses the strongest continuous route, weighting protocol and target criticality, and drops weak indirect signals.',
  },
]

export const SCORING_STRATEGIES: Array<StrategyOption<ScoringStrategy>> = [
  {
    value: 'weighted-risk',
    label: 'Weighted risk',
    description:
      'Balances source risk and propagation signal with a moderate criticality multiplier.',
  },
  {
    value: 'criticality-first',
    label: 'Criticality first',
    description:
      'Raises the multiplier for critical and high components so important paths surface sooner.',
  },
]

export const PROPAGATION_LABELS: Record<PropagationStrategy, string> = {
  'breadth-first': 'Breadth-first',
  weighted: 'Weighted path',
}

export const SCORING_LABELS: Record<ScoringStrategy, string> = {
  'weighted-risk': 'Weighted risk',
  'criticality-first': 'Criticality first',
}

interface SeverityMeta {
  label: string
  tone: BadgeTone
  description: string
  textClass: string
  borderClass: string
  backgroundClass: string
  dotClass: string
}

export const ANALYSIS_SEVERITY_META: Record<AnalysisSeverity, SeverityMeta> = {
  low: {
    label: 'Low',
    tone: 'green',
    description: 'Limited modeled downstream concern.',
    textClass: 'text-risk-low',
    borderClass: 'border-risk-low/45',
    backgroundClass: 'bg-risk-low-soft',
    dotClass: 'bg-risk-low',
  },
  moderate: {
    label: 'Moderate',
    tone: 'blue',
    description: 'Noticeable modeled downstream concern that should be reviewed.',
    textClass: 'text-risk-medium',
    borderClass: 'border-risk-medium/45',
    backgroundClass: 'bg-risk-medium-soft',
    dotClass: 'bg-risk-medium',
  },
  high: {
    label: 'High',
    tone: 'amber',
    description: 'Substantial modeled concern across one or more important paths.',
    textClass: 'text-risk-high',
    borderClass: 'border-risk-high/50',
    backgroundClass: 'bg-risk-high-soft',
    dotClass: 'bg-risk-high',
  },
  severe: {
    label: 'Severe',
    tone: 'red',
    description: 'Highest modeled concern in the local deterministic model.',
    textClass: 'text-risk-critical',
    borderClass: 'border-risk-critical/50',
    backgroundClass: 'bg-risk-critical-soft',
    dotClass: 'bg-risk-critical',
  },
}

interface ImpactTypeMeta {
  label: string
  tone: BadgeTone
  description: string
}

export const IMPACT_TYPE_META: Record<ImpactClassification, ImpactTypeMeta> = {
  direct: {
    label: 'Direct',
    tone: 'teal',
    description: 'The changed component has a direct dependency on the affected component.',
  },
  indirect: {
    label: 'Indirect',
    tone: 'blue',
    description: 'The affected component is reached through one or more downstream links.',
  },
}

export function getCausalPathEdgeKey(source: ComponentId, target: ComponentId) {
  return `${source}:${target}`
}

export function getAnalysisPathEdgeKeys(analysis: ScenarioAnalysis) {
  const keys = new Set<string>()

  for (const finding of analysis.findings) {
    for (let index = 0; index < finding.causalPath.length - 1; index += 1) {
      keys.add(getCausalPathEdgeKey(finding.causalPath[index], finding.causalPath[index + 1]))
    }
  }

  return keys
}
