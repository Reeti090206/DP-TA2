import type { BadgeTone } from '../components/ui/Badge'
import type {
  AnalysisSettings,
  DemoSystem,
  Scenario,
  ScenarioAnalysis,
  ScenarioChange,
  ScenarioSnapshot,
} from '../types/domain'

export const SNAPSHOT_NAME_MAX_LENGTH = 48
export const SCENARIO_NAME_MAX_LENGTH = 48

export type SnapshotAnalysisAvailability =
  | 'current'
  | 'missing'
  | 'stale'
  | 'incompatible'

export interface SnapshotAnalysisStatus {
  availability: SnapshotAnalysisAvailability
  label: string
  tone: BadgeTone
  issues: string[]
}

export type SnapshotOperationResult<T> =
  | { ok: true; value: T }
  | { ok: false; error: string }

function cloneChangeSet(changeSet: ScenarioChange[]) {
  return structuredClone(changeSet)
}

function cloneSettings(settings: AnalysisSettings): AnalysisSettings {
  return structuredClone(settings)
}

function cloneAnalysis(analysis: ScenarioAnalysis | null) {
  return analysis ? structuredClone(analysis) : null
}

export function getSnapshotAnalysisStatus(
  snapshot: ScenarioSnapshot,
  currentModelVersion: string,
): SnapshotAnalysisStatus {
  if (!snapshot.analysis) {
    return {
      availability: 'missing',
      label: 'No captured analysis',
      tone: 'neutral',
      issues: [
        'This snapshot was captured without an analysis result. Restoring or branching will not invent one.',
      ],
    }
  }

  const issues: string[] = []
  const contextModelMismatch = snapshot.modelVersion !== currentModelVersion
  const analysisModelMismatch =
    snapshot.analysis.modelVersion !== currentModelVersion

  if (contextModelMismatch) {
    issues.push(
      `The snapshot context uses model ${snapshot.modelVersion}, but the current model is ${currentModelVersion}.`,
    )
  }

  if (analysisModelMismatch) {
    issues.push(
      `The captured analysis uses model ${snapshot.analysis.modelVersion}, but the current model is ${currentModelVersion}.`,
    )
  }

  if (contextModelMismatch || analysisModelMismatch) {
    return {
      availability: 'incompatible',
      label: 'Incompatible model',
      tone: 'red',
      issues,
    }
  }

  if (snapshot.analysis.scenarioRevision !== snapshot.revision) {
    issues.push(
      `The captured analysis covers revision ${snapshot.analysis.scenarioRevision}, but the snapshot is revision ${snapshot.revision}.`,
    )
  }

  const settingsChanged =
    snapshot.analysis.propagationStrategy !==
      snapshot.analysisSettings.propagationStrategy ||
    snapshot.analysis.scoringStrategy !== snapshot.analysisSettings.scoringStrategy

  if (settingsChanged) {
    issues.push(
      'The captured analysis settings do not match the snapshot’s analysis settings.',
    )
  }

  if (issues.length > 0) {
    return {
      availability: 'stale',
      label: 'Stale captured analysis',
      tone: 'amber',
      issues,
    }
  }

  return {
    availability: 'current',
    label: 'Current captured analysis',
    tone: 'green',
    issues: [],
  }
}

export function createSnapshotFromScenario(
  system: DemoSystem,
  scenario: Scenario,
  name: string,
): ScenarioSnapshot {
  return {
    id: crypto.randomUUID(),
    name,
    createdAt: new Date().toISOString(),
    sourceScenarioId: scenario.id,
    sourceScenarioName: scenario.name,
    revision: scenario.revision,
    modelVersion: system.modelVersion,
    changeSet: cloneChangeSet(scenario.changeSet),
    analysisSettings: cloneSettings(scenario.analysisSettings),
    analysis: cloneAnalysis(scenario.analysis),
  }
}

export function restoreSnapshotIntoScenario(
  snapshot: ScenarioSnapshot,
  targetScenario: Scenario,
): Scenario {
  return {
    ...targetScenario,
    revision: targetScenario.revision + 1,
    changeSet: cloneChangeSet(snapshot.changeSet),
    analysisSettings: cloneSettings(snapshot.analysisSettings),
    analysis: cloneAnalysis(snapshot.analysis),
  }
}

export function createScenarioFromSnapshot(
  snapshot: ScenarioSnapshot,
  name: string,
): Scenario {
  return {
    id: crypto.randomUUID(),
    name,
    revision: snapshot.revision,
    createdAt: new Date().toISOString(),
    changeSet: cloneChangeSet(snapshot.changeSet),
    analysisSettings: cloneSettings(snapshot.analysisSettings),
    analysis: cloneAnalysis(snapshot.analysis),
  }
}

export function normalizeSnapshotName(name: string) {
  return name.trim().replace(/\s+/g, ' ')
}

export function isSnapshotNameDuplicate(
  name: string,
  sourceScenarioId: string,
  snapshots: ScenarioSnapshot[],
) {
  const normalizedName = normalizeSnapshotName(name).toLowerCase()

  return snapshots.some(
    (snapshot) =>
      snapshot.sourceScenarioId === sourceScenarioId &&
      snapshot.name.toLowerCase() === normalizedName,
  )
}

export function getUniqueScenarioName(baseName: string, existingNames: string[]) {
  const existing = new Set(existingNames.map((name) => name.toLowerCase()))
  const normalizedBase = normalizeSnapshotName(baseName).slice(0, SCENARIO_NAME_MAX_LENGTH)

  if (!existing.has(normalizedBase.toLowerCase())) {
    return normalizedBase
  }

  for (let suffix = 2; suffix < 1000; suffix += 1) {
    const suffixLabel = ` (${suffix})`
    const candidate = `${normalizedBase.slice(
      0,
      SCENARIO_NAME_MAX_LENGTH - suffixLabel.length,
    )}${suffixLabel}`

    if (!existing.has(candidate.toLowerCase())) {
      return candidate
    }
  }

  return `${normalizedBase.slice(0, SCENARIO_NAME_MAX_LENGTH - 8)}-${Date.now()
    .toString(36)
    .slice(-6)}`
}

export function getDefaultSnapshotName(
  scenario: Scenario,
  snapshots: ScenarioSnapshot[],
) {
  const base = `${scenario.name} · rev ${scenario.revision}`.slice(
    0,
    SNAPSHOT_NAME_MAX_LENGTH,
  )
  const existing = new Set(
    snapshots
      .filter((snapshot) => snapshot.sourceScenarioId === scenario.id)
      .map((snapshot) => snapshot.name.toLowerCase()),
  )

  if (!existing.has(base.toLowerCase())) {
    return base
  }

  for (let suffix = 2; suffix < 1000; suffix += 1) {
    const suffixLabel = ` (${suffix})`
    const candidate = `${base.slice(
      0,
      SNAPSHOT_NAME_MAX_LENGTH - suffixLabel.length,
    )}${suffixLabel}`

    if (!existing.has(candidate.toLowerCase())) {
      return candidate
    }
  }

  return base.slice(0, SNAPSHOT_NAME_MAX_LENGTH)
}
