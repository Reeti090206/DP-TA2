import type { DemoSystem, Scenario, ScenarioAnalysis } from '../types/domain'

export interface BackendEngineStatus {
  connected: boolean
  status?: string
  engine?: string
  patterns?: string[]
  version?: string
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
    }
  } catch {
    return { connected: false }
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
