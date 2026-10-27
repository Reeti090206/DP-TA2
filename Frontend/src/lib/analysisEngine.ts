import { formatPropertyValue } from './format'
import type {
  AnalysisFinding,
  AnalysisSeverity,
  AnalysisSettings,
  AnalyzedSourceChange,
  ChangeDirection,
  ComponentId,
  Criticality,
  DemoSystem,
  Dependency,
  ImpactClassification,
  PropertyKey,
  PropagationStrategy,
  Scenario,
  ScenarioAnalysis,
  ScenarioChange,
  ScoringStrategy,
} from '../types/domain'

export const DEFAULT_ANALYSIS_SETTINGS: AnalysisSettings = {
  propagationStrategy: 'breadth-first',
  scoringStrategy: 'weighted-risk',
}

export const BREADTH_FIRST_ATTENUATION = 0.62
export const WEIGHTED_SIGNAL_THRESHOLD = 0.3

const STEP_TOLERANCE = 1e-7
const SEVERITY_ORDER: Record<AnalysisSeverity, number> = {
  low: 0,
  moderate: 1,
  high: 2,
  severe: 3,
}

const CRITICALITY_WORKLOAD: Record<Criticality, number> = {
  critical: 1,
  high: 0.9,
  medium: 0.82,
  low: 0.72,
}

const SCORING_WEIGHTS: Record<ScoringStrategy, Record<Criticality, number>> = {
  'weighted-risk': {
    critical: 1.25,
    high: 1.08,
    medium: 0.95,
    low: 0.82,
  },
  'criticality-first': {
    critical: 1.55,
    high: 1.2,
    medium: 0.82,
    low: 0.55,
  },
}

const SEVERITY_THRESHOLDS: Record<
  ScoringStrategy,
  { severe: number; high: number; moderate: number }
> = {
  'weighted-risk': { severe: 72, high: 54, moderate: 34 },
  'criticality-first': { severe: 68, high: 50, moderate: 30 },
}

const ADVERSE_DIRECTION: Record<PropertyKey, ChangeDirection> = {
  latencyMs: 'increase',
  capacity: 'decrease',
  retryCount: 'increase',
  timeoutMs: 'increase',
  queueDelayMs: 'increase',
}

const PROPERTY_RATIONALE: Record<PropertyKey, string> = {
  latencyMs:
    'Higher latency is modeled as adverse because callers wait longer and timeout risk can compound.',
  capacity:
    'Lower capacity is modeled as adverse because fewer requests can be absorbed before queuing.',
  retryCount:
    'More retries are modeled as adverse because retry amplification can add load; reduced retry resilience is not modeled separately.',
  timeoutMs:
    'Longer timeouts are modeled as adverse because slow calls can hold resources for longer.',
  queueDelayMs:
    'Higher queue delay is modeled as adverse because work waits longer and backlogs can compound.',
}

interface AnalysisReadiness {
  ready: boolean
  errors: string[]
}

interface ShortestRoute {
  node: ComponentId
  path: ComponentId[]
  distance: number
}

interface WeightedRoute {
  node: ComponentId
  path: ComponentId[]
  edges: Dependency[]
  distance: number
  strength: number
}

interface RouteCandidate {
  targetId: ComponentId
  sourceChange: AnalyzedSourceChange
  shortestDistance: number
  causalPath: ComponentId[]
  causalEdges: Dependency[]
  propagationSignal: number
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

function round(value: number, places = 2) {
  const factor = 10 ** places
  return Math.round(value * factor) / factor
}

function getSeverity(
  score: number,
  scoringStrategy: ScoringStrategy,
): AnalysisSeverity {
  const thresholds = SEVERITY_THRESHOLDS[scoringStrategy]

  if (score >= thresholds.severe) {
    return 'severe'
  }

  if (score >= thresholds.high) {
    return 'high'
  }

  if (score >= thresholds.moderate) {
    return 'moderate'
  }

  return 'low'
}

function getProtocolAttenuation(protocol: string) {
  switch (protocol.toLowerCase()) {
    case 'events':
      return 0.84
    case 'grpc':
      return 0.78
    case 'rest':
      return 0.7
    case 'https':
      return 0.66
    default:
      return 0.74
  }
}

function getEdgeStrength(dependency: Dependency, targetCriticality: Criticality) {
  return getProtocolAttenuation(dependency.protocol) * CRITICALITY_WORKLOAD[targetCriticality]
}

function comparePaths(left: ComponentId[], right: ComponentId[]) {
  return left.join('>').localeCompare(right.join('>'))
}

function getAdjacency(system: DemoSystem) {
  const adjacency = new Map<
    ComponentId,
    Array<{ dependency: Dependency; targetId: ComponentId }>
  >()

  for (const component of system.components) {
    adjacency.set(component.id, [])
  }

  for (const dependency of system.dependencies) {
    const links = adjacency.get(dependency.source)

    if (links) {
      links.push({ dependency, targetId: dependency.target })
    }
  }

  return adjacency
}

function getShortestRoutes(
  adjacency: ReturnType<typeof getAdjacency>,
  sourceId: ComponentId,
) {
  const routes = new Map<ComponentId, ShortestRoute>([
    [sourceId, { node: sourceId, path: [sourceId], distance: 0 }],
  ])
  const queue: ShortestRoute[] = [routes.get(sourceId)!]

  for (let index = 0; index < queue.length; index += 1) {
    const current = queue[index]

    for (const link of adjacency.get(current.node) ?? []) {
      if (routes.has(link.targetId)) {
        continue
      }

      const nextRoute: ShortestRoute = {
        node: link.targetId,
        path: [...current.path, link.targetId],
        distance: current.distance + 1,
      }

      routes.set(link.targetId, nextRoute)
      queue.push(nextRoute)
    }
  }

  return routes
}

function getWeightedRoutes(
  system: DemoSystem,
  adjacency: ReturnType<typeof getAdjacency>,
  sourceId: ComponentId,
) {
  const componentById = new Map(
    system.components.map((component) => [component.id, component]),
  )
  const routes = new Map<ComponentId, WeightedRoute>([
    [
      sourceId,
      {
        node: sourceId,
        path: [sourceId],
        edges: [],
        distance: 0,
        strength: 1,
      },
    ],
  ])
  const finalized = new Set<ComponentId>()
  const queue: WeightedRoute[] = [routes.get(sourceId)!]

  while (queue.length > 0) {
    queue.sort(
      (left, right) =>
        right.strength - left.strength ||
        left.distance - right.distance ||
        comparePaths(left.path, right.path),
    )

    const current = queue.shift()!

    if (finalized.has(current.node)) {
      continue
    }

    finalized.add(current.node)

    for (const link of adjacency.get(current.node) ?? []) {
      if (
        finalized.has(link.targetId) ||
        current.path.includes(link.targetId)
      ) {
        continue
      }

      const targetComponent = componentById.get(link.targetId)

      if (!targetComponent) {
        continue
      }

      const strength =
        current.strength * getEdgeStrength(link.dependency, targetComponent.criticality)
      const existing = routes.get(link.targetId)

      if (existing && strength <= existing.strength + 1e-12) {
        continue
      }

      const route: WeightedRoute = {
        node: link.targetId,
        path: [...current.path, link.targetId],
        edges: [...current.edges, link.dependency],
        distance: current.distance + 1,
        strength,
      }

      routes.set(link.targetId, route)
      queue.push(route)
    }
  }

  return routes
}

function getChangePercent(baseline: number, proposed: number) {
  if (baseline === 0) {
    return proposed === 0 ? 0 : 100
  }

  return ((proposed - baseline) / baseline) * 100
}

function getSourceChange(
  system: DemoSystem,
  change: ScenarioChange,
): AnalyzedSourceChange {
  const component = system.components.find((item) => item.id === change.componentId)

  if (!component) {
    throw new Error(`Unknown component: ${change.componentId}`)
  }

  const property = component.supportedProperties.find(
    (item) => item.key === change.propertyKey,
  )

  if (!property) {
    throw new Error(`Unsupported property: ${change.propertyKey}`)
  }

  const baseline = property.defaultValue
  const proposed = change.value
  const direction: ChangeDirection = proposed > baseline ? 'increase' : 'decrease'
  const riskDirection =
    direction === ADVERSE_DIRECTION[property.key] ? 'adverse' : 'favorable'
  const changePercent = getChangePercent(baseline, proposed)
  const magnitude = Math.min(100, Math.abs(changePercent) * 0.85)
  const riskScore =
    riskDirection === 'adverse'
      ? Math.round(clamp(24 + magnitude * 0.78, 18, 96))
      : Math.round(clamp(7 + magnitude * 0.24, 5, 38))
  const deltaLabel = `${changePercent >= 0 ? '+' : ''}${changePercent.toFixed(1)}%`
  const directionLabel = direction === 'increase' ? 'increased' : 'decreased'
  const rationale =
    riskDirection === 'adverse'
      ? PROPERTY_RATIONALE[property.key]
      : 'This direction is modeled as favorable for the local property; downstream effects are still evaluated.'

  return {
    componentId: component.id,
    componentName: component.name,
    propertyKey: property.key,
    propertyLabel: property.label,
    baselineValue: baseline,
    proposedValue: proposed,
    unit: property.unit,
    direction,
    changePercent: round(changePercent, 1),
    riskScore,
    riskDirection,
    factors: [
      `${property.label}: ${formatPropertyValue(baseline, property.unit)} → ${formatPropertyValue(proposed, property.unit)} (${deltaLabel}).`,
      `${component.name} ${property.label.toLowerCase()} ${directionLabel}. ${rationale}`,
      `Local modeled concern is ${riskScore}/100 before propagation.`,
    ],
  }
}

function buildCandidates(
  system: DemoSystem,
  sourceChange: AnalyzedSourceChange,
  adjacency: ReturnType<typeof getAdjacency>,
  propagationStrategy: PropagationStrategy,
): RouteCandidate[] {
  const sourceId = sourceChange.componentId
  const sourceSignal = sourceChange.riskScore / 100
  const shortestRoutes = getShortestRoutes(adjacency, sourceId)
  const candidates: RouteCandidate[] = []

  if (propagationStrategy === 'breadth-first') {
    for (const route of shortestRoutes.values()) {
      if (route.node === sourceId) {
        continue
      }

      candidates.push({
        targetId: route.node,
        sourceChange,
        shortestDistance: route.distance,
        causalPath: route.path,
        causalEdges: [],
        propagationSignal:
          sourceSignal * BREADTH_FIRST_ATTENUATION ** route.distance,
      })
    }

    return candidates
  }

  const weightedRoutes = getWeightedRoutes(system, adjacency, sourceId)

  for (const route of weightedRoutes.values()) {
    if (route.node === sourceId) {
      continue
    }

    const shortestRoute = shortestRoutes.get(route.node)

    if (!shortestRoute) {
      continue
    }

    const isDirect = shortestRoute.distance === 1
    const directDependency = isDirect
      ? system.dependencies.find(
          (dependency) =>
            dependency.source === sourceId && dependency.target === route.node,
        )
      : undefined
    const targetComponent = system.components.find(
      (component) => component.id === route.node,
    )
    const propagationSignal =
      directDependency && targetComponent
        ? sourceSignal *
          getEdgeStrength(directDependency, targetComponent.criticality)
        : sourceSignal * route.strength

    if (!isDirect && propagationSignal < WEIGHTED_SIGNAL_THRESHOLD) {
      continue
    }

    candidates.push({
      targetId: route.node,
      sourceChange,
      shortestDistance: shortestRoute.distance,
      causalPath: isDirect ? shortestRoute.path : route.path,
      causalEdges: directDependency ? [directDependency] : route.edges,
      propagationSignal,
    })
  }

  return candidates
}

function compareCandidates(
  left: RouteCandidate,
  right: RouteCandidate,
  propagationStrategy: PropagationStrategy,
) {
  const leftDirect = left.shortestDistance === 1 ? 0 : 1
  const rightDirect = right.shortestDistance === 1 ? 0 : 1

  if (leftDirect !== rightDirect) {
    return leftDirect - rightDirect
  }

  if (propagationStrategy === 'weighted') {
    if (right.propagationSignal !== left.propagationSignal) {
      return right.propagationSignal - left.propagationSignal
    }
  } else if (left.shortestDistance !== right.shortestDistance) {
    return left.shortestDistance - right.shortestDistance
  }

  if (right.sourceChange.riskScore !== left.sourceChange.riskScore) {
    return right.sourceChange.riskScore - left.sourceChange.riskScore
  }

  const sourceComparison = left.sourceChange.componentName.localeCompare(
    right.sourceChange.componentName,
  )

  if (sourceComparison !== 0) {
    return sourceComparison
  }

  return comparePaths(left.causalPath, right.causalPath)
}

function touchesCycle(system: DemoSystem, path: ComponentId[]) {
  const cycleComponents = new Set(system.cyclePath)
  return path.filter((componentId) => cycleComponents.has(componentId)).length >= 2
}

function getPathLabel(system: DemoSystem, path: ComponentId[]) {
  return path
    .map(
      (componentId) =>
        system.components.find((component) => component.id === componentId)?.name ??
        componentId,
    )
    .join(' → ')
}

function getCausalEdges(
  system: DemoSystem,
  candidate: RouteCandidate,
): Dependency[] {
  if (candidate.causalEdges.length > 0) {
    return candidate.causalEdges
  }

  return candidate.causalPath.slice(0, -1).flatMap((sourceId, index) => {
    const targetId = candidate.causalPath[index + 1]
    const dependency = system.dependencies.find(
      (item) => item.source === sourceId && item.target === targetId,
    )

    return dependency ? [dependency] : []
  })
}

function buildFinding(
  system: DemoSystem,
  candidate: RouteCandidate,
  settings: AnalysisSettings,
): AnalysisFinding {
  const component = system.components.find(
    (item) => item.id === candidate.targetId,
  )

  if (!component) {
    throw new Error(`Unknown component: ${candidate.targetId}`)
  }

  const impactType: ImpactClassification =
    candidate.shortestDistance === 1 ? 'direct' : 'indirect'
  const causalDistance = candidate.causalPath.length - 1
  const criticalityWeight = SCORING_WEIGHTS[settings.scoringStrategy][component.criticality]
  const score = Math.round(
    clamp(candidate.propagationSignal * criticalityWeight * 100, 0, 100),
  )
  const severity = getSeverity(score, settings.scoringStrategy)
  const source = candidate.sourceChange
  const pathLabel = getPathLabel(system, candidate.causalPath)
  const cycleLabel = getPathLabel(system, system.cyclePath)
  const routeLabel =
    impactType === 'direct'
      ? 'a direct dependency'
      : `${causalDistance} dependency links`
  const cycleNote = touchesCycle(system, candidate.causalPath)
    ? ` The route touches the modeled ${cycleLabel} cycle; traversal is bounded and each component is evaluated once.`
    : ''
  const weightedNote =
    settings.propagationStrategy === 'weighted' &&
    candidate.shortestDistance < causalDistance
      ? ` This strongest weighted route uses ${causalDistance} links; the shortest possible route is ${candidate.shortestDistance}.`
      : ''
  const strategyRule =
    settings.propagationStrategy === 'weighted'
      ? impactType === 'direct'
        ? 'Direct dependency · weighted path'
        : 'Weighted continuous path'
      : impactType === 'direct'
        ? 'Direct dependency · breadth-first'
        : 'Shortest dependency path · breadth-first'
  const causalEdges = getCausalEdges(system, candidate)
  const edgeFactors = causalEdges.map((edge) => {
    const target = system.components.find((item) => item.id === edge.target)
    const targetName = target?.name ?? edge.target
    const targetCriticality = target?.criticality ?? 'medium'
    return `${edge.protocol} → ${targetName} ×${getEdgeStrength(edge, targetCriticality).toFixed(2)}`
  })
  const factors = [
    `${source.componentName} changed ${source.propertyLabel.toLowerCase()} by ${source.changePercent >= 0 ? '+' : ''}${source.changePercent.toFixed(1)}% with local risk ${source.riskScore}/100.`,
    impactType === 'direct'
      ? `Direct link ${pathLabel}.`
      : `Shortest distance is ${candidate.shortestDistance}; causal route is ${pathLabel}.`,
    settings.propagationStrategy === 'weighted'
      ? `Weighted route strength is ${round(candidate.propagationSignal / Math.max(source.riskScore / 100, 1e-9), 3)} across ${edgeFactors.join(' · ')}.`
      : `Breadth-first attenuation is ×${BREADTH_FIRST_ATTENUATION} per hop.`,
    settings.propagationStrategy === 'weighted'
      ? impactType === 'direct'
        ? 'Direct dependencies are always reported and bypass the indirect-signal threshold.'
        : `${component.name} passed the indirect-signal threshold of ${WEIGHTED_SIGNAL_THRESHOLD.toFixed(2)}.`
      : 'No signal threshold is applied; every reachable component is reported.',
    `Criticality multiplier for ${component.name} is ×${criticalityWeight} (${component.criticality}).`,
    `Score = propagation signal ${round(candidate.propagationSignal, 3)} × criticality ${criticalityWeight} × 100 = ${score}.`,
  ]

  if (weightedNote) {
    factors.push(weightedNote.trim())
  }

  if (cycleNote) {
    factors.push(cycleNote.trim())
  }

  return {
    componentId: component.id,
    componentName: component.name,
    criticality: component.criticality,
    impactType,
    distance: causalDistance,
    shortestDistance: candidate.shortestDistance,
    causalPath: candidate.causalPath,
    sourceComponentId: source.componentId,
    sourceComponentName: source.componentName,
    propagationSignal: round(candidate.propagationSignal, 3),
    score,
    severity,
    rule: strategyRule,
    explanation: `${component.name} is affected through ${routeLabel} from ${source.componentName}: ${pathLabel}. The ${source.propertyLabel.toLowerCase()} change is modeled at ${source.riskScore}/100 local risk, then carried through the graph with ${settings.propagationStrategy === 'weighted' ? 'weighted path attenuation' : 'breadth-first hop attenuation'}. The resulting modeled impact is ${score}/100 (${severity} severity).${weightedNote}${cycleNote}`,
    factors,
  }
}

function getPropagationLabel(propagationStrategy: PropagationStrategy) {
  return propagationStrategy === 'weighted' ? 'Weighted propagation' : 'Breadth-first propagation'
}

function getScoringLabel(scoringStrategy: ScoringStrategy) {
  return scoringStrategy === 'criticality-first'
    ? 'criticality-first scoring'
    : 'weighted-risk scoring'
}

export function getAnalysisReadiness(
  system: DemoSystem,
  scenario: Scenario,
): AnalysisReadiness {
  const errors: string[] = []

  if (scenario.changeSet.length === 0) {
    errors.push('Add at least one proposed change before running an analysis.')
  }

  const seenChanges = new Set<string>()

  for (const change of scenario.changeSet) {
    const component = system.components.find(
      (item) => item.id === change.componentId,
    )
    const property = component?.supportedProperties.find(
      (item) => item.key === change.propertyKey,
    )
    const changeKey = `${change.componentId}:${change.propertyKey}`

    if (!component) {
      errors.push(`Unknown component in change set: ${change.componentId}.`)
      continue
    }

    if (!property) {
      errors.push(
        `Unsupported property on ${component.name}: ${change.propertyKey}.`,
      )
      continue
    }

    if (seenChanges.has(changeKey)) {
      errors.push(`Duplicate change for ${component.name} ${property.label}.`)
    }

    seenChanges.add(changeKey)

    if (!Number.isFinite(change.value)) {
      errors.push(`Enter a valid numeric value for ${component.name} ${property.label}.`)
      continue
    }

    if (change.value < property.min || change.value > property.max) {
      errors.push(
        `${component.name} ${property.label} must be between ${formatPropertyValue(property.min, property.unit)} and ${formatPropertyValue(property.max, property.unit)}.`,
      )
    }

    if (property.step > 0) {
      const stepPosition = (change.value - property.min) / property.step

      if (Math.abs(stepPosition - Math.round(stepPosition)) > STEP_TOLERANCE) {
        errors.push(
          `${component.name} ${property.label} must use increments of ${property.step}.`,
        )
      }
    }

    if (change.value === property.defaultValue) {
      errors.push(
        `${component.name} ${property.label} still matches the baseline; remove the override or choose a different value.`,
      )
    }
  }

  return { ready: errors.length === 0, errors }
}

export function analyzeScenario(
  system: DemoSystem,
  scenario: Scenario,
): ScenarioAnalysis {
  const readiness = getAnalysisReadiness(system, scenario)

  if (!readiness.ready) {
    throw new Error(readiness.errors.join(' '))
  }

  const settings = scenario.analysisSettings
  const sourceChanges = scenario.changeSet.map((change) =>
    getSourceChange(system, change),
  )
  const sourceIds = new Set(sourceChanges.map((change) => change.componentId))
  const adjacency = getAdjacency(system)
  const candidatesByTarget = new Map<ComponentId, RouteCandidate[]>()

  for (const sourceChange of sourceChanges) {
    for (const candidate of buildCandidates(
      system,
      sourceChange,
      adjacency,
      settings.propagationStrategy,
    )) {
      if (sourceIds.has(candidate.targetId)) {
        continue
      }

      const current = candidatesByTarget.get(candidate.targetId) ?? []
      current.push(candidate)
      candidatesByTarget.set(candidate.targetId, current)
    }
  }

  const findings: AnalysisFinding[] = []

  for (const candidates of candidatesByTarget.values()) {
    candidates.sort((left, right) =>
      compareCandidates(left, right, settings.propagationStrategy),
    )

    const selected = candidates[0]

    if (selected) {
      findings.push(buildFinding(system, selected, settings))
    }
  }

  findings.sort(
    (left, right) =>
      right.score - left.score ||
      SEVERITY_ORDER[right.severity] - SEVERITY_ORDER[left.severity] ||
      left.shortestDistance - right.shortestDistance ||
      left.componentName.localeCompare(right.componentName),
  )

  const affectedComponentIds = findings.map((finding) => finding.componentId)
  const directComponentIds = findings
    .filter((finding) => finding.impactType === 'direct')
    .map((finding) => finding.componentId)
  const indirectComponentIds = findings
    .filter((finding) => finding.impactType === 'indirect')
    .map((finding) => finding.componentId)
  const criticalAffectedComponentIds = findings
    .filter((finding) => finding.criticality === 'critical')
    .map((finding) => finding.componentId)
  const peakSourceRisk = Math.max(
    ...sourceChanges.map((change) => change.riskScore),
  )
  const peakFindingScore = findings[0]?.score ?? 0
  const criticalConcentration =
    findings.length === 0
      ? 0
      : (criticalAffectedComponentIds.length / findings.length) * 100
  const breadth = Math.min(100, findings.length * 10)
  const overallScore = Math.round(
    clamp(
      peakSourceRisk * 0.45 +
        peakFindingScore * 0.35 +
        criticalConcentration * 0.15 +
        breadth * 0.05,
      0,
      100,
    ),
  )
  const favorableCount = sourceChanges.filter(
    (change) => change.riskDirection === 'favorable',
  ).length
  const overallFactors = [
    `${sourceChanges.length} ${sourceChanges.length === 1 ? 'source change creates' : 'source changes create'} a peak local modeled risk of ${peakSourceRisk}/100.`,
    `${findings.length} unique downstream ${findings.length === 1 ? 'component is' : 'components are'} affected: ${directComponentIds.length} direct and ${indirectComponentIds.length} indirect.`,
    `${criticalAffectedComponentIds.length} affected ${criticalAffectedComponentIds.length === 1 ? 'component is' : 'components are'} critical.`,
    `${getPropagationLabel(settings.propagationStrategy)} with ${getScoringLabel(settings.scoringStrategy)}.`,
    settings.propagationStrategy === 'weighted'
      ? `Indirect routes must keep a signal of at least ${WEIGHTED_SIGNAL_THRESHOLD.toFixed(2)}; direct dependencies are always reported.`
      : 'Every reachable dependency is included, with stronger attenuation at each hop.',
    'Cycle-safe traversal visits each component once, so a node cannot be counted twice.',
    'Overall score = 45% peak source risk + 35% peak finding score + 15% critical concentration + 5% breadth.',
  ]

  if (favorableCount > 0) {
    overallFactors.push(
      `${favorableCount} source ${favorableCount === 1 ? 'change is' : 'changes are'} locally favorable, which lowers modeled concern but does not guarantee a positive downstream effect.`,
    )
  }

  return {
    id: `analysis-${scenario.id}-r${scenario.revision}-${Date.now()}`,
    analyzedAt: new Date().toISOString(),
    modelVersion: system.modelVersion,
    scenarioRevision: scenario.revision,
    propagationStrategy: settings.propagationStrategy,
    scoringStrategy: settings.scoringStrategy,
    sourceComponentIds: [...new Set(sourceChanges.map((change) => change.componentId))],
    sourceChanges,
    overallScore,
    overallFactors,
    severity: getSeverity(overallScore, settings.scoringStrategy),
    affectedComponentIds,
    directComponentIds,
    indirectComponentIds,
    criticalAffectedComponentIds,
    findings,
  }
}
