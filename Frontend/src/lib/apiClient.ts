import type { DemoSystem, Scenario, ScenarioAnalysis } from '../types/domain'

export interface BackendEngineStatus {
  connected: boolean
  status?: string
  engine?: string
  patterns?: string[]
  version?: string
  timestamp?: string
}

export interface BackendComponentDto {
  id: string
  name: string
  type: string
  criticality: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  latencyMs: number
  availability: number
  loadQps: number
  failureProbability: number
}

export interface BackendDependencyDto {
  sourceComponentId: string
  targetComponentId: string
  strength: 'WEAK' | 'MEDIUM' | 'STRONG' | 'CRITICAL'
  type: 'SYNCHRONOUS_REST' | 'SYNCHRONOUS_GRPC' | 'ASYNCHRONOUS_QUEUE' | 'DATABASE_QUERY' | 'CACHE_LOOKUP'
  isSynchronous: boolean
  description: string
}

export interface BackendSystemModelDto {
  systemId: string
  systemName: string
  componentCount: number
  dependencyCount: number
  components: BackendComponentDto[]
  dependencies: BackendDependencyDto[]
}

export interface BackendImpactRecordDto {
  componentId: string
  directlyAffected: boolean
  propagationDepth: number
  impactScore: number
  severity: 'NONE' | 'NEGLIGIBLE' | 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL'
  baselineLatencyMs: number
  projectedLatencyMs: number
  baselineAvailability: number
  projectedAvailability: number
  propagationPath: string[]
}

export interface BackendSimulationResultDto {
  scenarioId: string
  scenarioName: string
  targetComponentId: string
  directlyAffected: string[]
  indirectlyAffected: string[]
  overallRiskScore: number
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  impactPaths: string[][]
  baselinePreserved: boolean
  timestamp: string
  executionDurationMs: number
  strategyUsed: string
  disclaimer: string
  impactDetails: Record<string, BackendImpactRecordDto>
}

export interface BackendScenarioComparisonDto {
  scenarioId: string
  scenarioName: string
  baselineRiskScore: number
  scenarioRiskScore: number
  riskScoreDelta: number
  baselineRiskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  scenarioRiskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  newlyImpactedComponents: string[]
  comparedAt: string
}

const API_BASE = '/api/v1'

export async function checkBackendHealth(): Promise<BackendEngineStatus> {
  try {
    const res = await fetch(`${API_BASE}/simulations/health`, {
      method: 'GET',
      headers: { Accept: 'application/json' },
    })

    if (!res.ok) {
      return { connected: false }
    }

    const data = await res.json()
    return {
      connected: true,
      status: data.status,
      engine: data.engine,
      patterns: data.patterns,
      version: data.version,
      timestamp: data.timestamp,
    }
  } catch {
    return { connected: false }
  }
}

export async function fetchBackendModel(): Promise<BackendSystemModelDto | null> {
  try {
    const res = await fetch(`${API_BASE}/model`, {
      method: 'GET',
      headers: { Accept: 'application/json' },
    })
    if (!res.ok) return null
    return (await res.json()) as BackendSystemModelDto
  } catch {
    return null
  }
}

export async function analyzeScenarioWithBackend(
  _system: DemoSystem,
  scenario: Scenario,
): Promise<ScenarioAnalysis> {
  const payload = {
    scenarioId: scenario.id,
    scenarioName: scenario.name,
    scenarioRevision: scenario.revision,
    changeSet: scenario.changeSet,
    analysisSettings: scenario.analysisSettings,
  }

  const response = await fetch(`${API_BASE}/simulations/analyze`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    const errText = await response.text()
    throw new Error(`Backend simulation failed (${response.status}): ${errText}`)
  }

  const result = await response.json()
  return result as ScenarioAnalysis
}

export async function fetchSimulationHistory(): Promise<BackendSimulationResultDto[]> {
  try {
    const res = await fetch(`${API_BASE}/simulations`, {
      method: 'GET',
      headers: { Accept: 'application/json' },
    })
    if (!res.ok) return []
    return (await res.json()) as BackendSimulationResultDto[]
  } catch {
    return []
  }
}

export async function fetchSimulationById(id: string): Promise<BackendSimulationResultDto | null> {
  try {
    const res = await fetch(`${API_BASE}/simulations/${encodeURIComponent(id)}`, {
      method: 'GET',
      headers: { Accept: 'application/json' },
    })
    if (!res.ok) return null
    return (await res.json()) as BackendSimulationResultDto
  } catch {
    return null
  }
}

export async function compareSimulationWithBaseline(id: string): Promise<BackendScenarioComparisonDto | null> {
  try {
    const res = await fetch(`${API_BASE}/simulations/${encodeURIComponent(id)}/compare-baseline`, {
      method: 'GET',
      headers: { Accept: 'application/json' },
    })
    if (!res.ok) return null
    return (await res.json()) as BackendScenarioComparisonDto
  } catch {
    return null
  }
}

export async function saveBackendBaseline(): Promise<{ ok: boolean; message: string }> {
  try {
    const res = await fetch(`${API_BASE}/model/baseline/save`, {
      method: 'POST',
      headers: { Accept: 'application/json' },
    })
    const data = await res.json()
    return { ok: res.ok, message: data.message ?? 'Baseline saved' }
  } catch (err: unknown) {
    return { ok: false, message: (err as Error).message }
  }
}

export async function restoreBackendBaseline(): Promise<{ ok: boolean; message: string }> {
  try {
    const res = await fetch(`${API_BASE}/model/baseline/restore`, {
      method: 'POST',
      headers: { Accept: 'application/json' },
    })
    const data = await res.json()
    return { ok: res.ok, message: data.message ?? 'Baseline restored' }
  } catch (err: unknown) {
    return { ok: false, message: (err as Error).message }
  }
}
