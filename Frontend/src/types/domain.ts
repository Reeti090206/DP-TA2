export type ComponentId =
  | 'web-gateway'
  | 'authentication'
  | 'product-catalog'
  | 'inventory'
  | 'cart'
  | 'checkout'
  | 'payment'
  | 'order-service'
  | 'notification'
  | 'analytics'

export type ComponentType = 'gateway' | 'service' | 'integration' | 'worker'

export type Criticality = 'critical' | 'high' | 'medium' | 'low'

export type PropertyKey = 'latencyMs' | 'capacity' | 'retryCount' | 'timeoutMs' | 'queueDelayMs'

export interface SupportedProperty {
  key: PropertyKey
  label: string
  description: string
  unit?: string
  type: 'number'
  min: number
  max: number
  step: number
  defaultValue: number
}

export interface SystemComponent {
  id: ComponentId
  name: string
  type: ComponentType
  criticality: Criticality
  description: string
  owner: string
  supportedProperties: SupportedProperty[]
}

export interface Dependency {
  id: string
  source: ComponentId
  target: ComponentId
  relationship: string
  protocol: string
  inCycle?: boolean
}

export interface DemoSystem {
  id: string
  name: string
  version: string
  modelVersion: string
  description: string
  components: SystemComponent[]
  dependencies: Dependency[]
  cyclePath: ComponentId[]
}

export type ScenarioStatus = 'draft' | 'analyzed' | 'stale'

export type PropagationStrategy = 'breadth-first' | 'weighted'

export type ScoringStrategy = 'weighted-risk' | 'criticality-first'

export type AnalysisSeverity = 'low' | 'moderate' | 'high' | 'severe'

export type ChangeDirection = 'increase' | 'decrease'

export type ImpactClassification = 'direct' | 'indirect'

export interface AnalysisSettings {
  propagationStrategy: PropagationStrategy
  scoringStrategy: ScoringStrategy
}

export interface ScenarioChange {
  componentId: ComponentId
  propertyKey: PropertyKey
  value: number
}

export interface AnalyzedSourceChange {
  componentId: ComponentId
  componentName: string
  propertyKey: PropertyKey
  propertyLabel: string
  baselineValue: number
  proposedValue: number
  unit?: string
  direction: ChangeDirection
  changePercent: number
  riskScore: number
  riskDirection: 'adverse' | 'favorable'
  factors: string[]
}

export interface AnalysisFinding {
  componentId: ComponentId
  componentName: string
  criticality: Criticality
  impactType: ImpactClassification
  distance: number
  shortestDistance: number
  causalPath: ComponentId[]
  sourceComponentId: ComponentId
  sourceComponentName: string
  propagationSignal: number
  score: number
  severity: AnalysisSeverity
  rule: string
  explanation: string
  factors: string[]
}

export interface ScenarioAnalysis {
  id: string
  analyzedAt: string
  modelVersion: string
  scenarioRevision: number
  propagationStrategy: PropagationStrategy
  scoringStrategy: ScoringStrategy
  sourceComponentIds: ComponentId[]
  sourceChanges: AnalyzedSourceChange[]
  overallScore: number
  overallFactors: string[]
  severity: AnalysisSeverity
  affectedComponentIds: ComponentId[]
  directComponentIds: ComponentId[]
  indirectComponentIds: ComponentId[]
  criticalAffectedComponentIds: ComponentId[]
  findings: AnalysisFinding[]
}

export interface Scenario {
  id: string
  name: string
  revision: number
  createdAt: string
  changeSet: ScenarioChange[]
  analysisSettings: AnalysisSettings
  analysis: ScenarioAnalysis | null
}

export interface ScenarioSnapshot {
  id: string
  name: string
  createdAt: string
  sourceScenarioId: string
  sourceScenarioName: string
  revision: number
  modelVersion: string
  changeSet: ScenarioChange[]
  analysisSettings: AnalysisSettings
  analysis: ScenarioAnalysis | null
}
