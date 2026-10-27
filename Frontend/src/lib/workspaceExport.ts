import { getComparisonChanges, getComparisonStrategyLabel } from './scenarioComparison'
import { getScenarioStatus } from './scenarioState'
import {
  getSnapshotAnalysisStatus,
  type SnapshotAnalysisAvailability,
} from './snapshotState'
import type {
  AnalysisSettings,
  DemoSystem,
  Scenario,
  ScenarioAnalysis,
  ScenarioSnapshot,
  ScenarioStatus,
} from '../types/domain'

export const WORKSPACE_EXPORT_SCHEMA = 'ripplewhatif.workspace-export'
export const WORKSPACE_EXPORT_VERSION = 1

export interface ExportedChange {
  key: string
  componentId: string
  componentName: string
  propertyKey: string
  propertyLabel: string
  baselineValue: number
  proposedValue: number
  unit?: string
  changePercent: number
  display: string
}

export interface ExportedScenario {
  id: string
  name: string
  revision: number
  createdAt: string
  analysisStatus: ScenarioStatus
  analysisSettings: AnalysisSettings
  analysisStrategy: string
  snapshotCount: number
  confirmedChanges: ExportedChange[]
  analysis: ScenarioAnalysis | null
}

export interface ExportedSnapshot {
  id: string
  name: string
  createdAt: string
  sourceScenarioId: string
  sourceScenarioName: string
  sourceScenarioExists: boolean
  revision: number
  modelVersion: string
  analysisStatus: SnapshotAnalysisAvailability
  analysisStrategy: string
  confirmedChanges: ExportedChange[]
  analysis: ScenarioAnalysis | null
}

export interface WorkspaceExport {
  schema: typeof WORKSPACE_EXPORT_SCHEMA
  version: number
  exportedAt: string
  system: {
    id: string
    name: string
    version: string
    modelVersion: string
    componentCount: number
    dependencyCount: number
  }
  activeScenarioId: string | null
  activeScenarioName: string | null
  totals: {
    scenarios: number
    analyzedScenarios: number
    staleScenarios: number
    draftScenarios: number
    snapshots: number
    confirmedChanges: number
  }
  notes: string[]
  scenarios: ExportedScenario[]
  snapshots: ExportedSnapshot[]
}

export type DownloadWorkspaceExportResult =
  | { ok: true; filename: string }
  | { ok: false; error: string }

export function buildWorkspaceExport(
  system: DemoSystem,
  scenarios: Scenario[],
  snapshots: ScenarioSnapshot[],
  activeScenarioId: string | null,
  exportedAt = new Date().toISOString(),
): WorkspaceExport {
  const activeScenario = scenarios.find((scenario) => scenario.id === activeScenarioId)
  const statuses = new Map(
    scenarios.map((scenario) => [scenario.id, getScenarioStatus(scenario)]),
  )

  return {
    schema: WORKSPACE_EXPORT_SCHEMA,
    version: WORKSPACE_EXPORT_VERSION,
    exportedAt,
    system: {
      id: system.id,
      name: system.name,
      version: system.version,
      modelVersion: system.modelVersion,
      componentCount: system.components.length,
      dependencyCount: system.dependencies.length,
    },
    activeScenarioId: activeScenario?.id ?? null,
    activeScenarioName: activeScenario?.name ?? null,
    totals: {
      scenarios: scenarios.length,
      analyzedScenarios: scenarios.filter(
        (scenario) => statuses.get(scenario.id) === 'analyzed',
      ).length,
      staleScenarios: scenarios.filter(
        (scenario) => statuses.get(scenario.id) === 'stale',
      ).length,
      draftScenarios: scenarios.filter(
        (scenario) => statuses.get(scenario.id) === 'draft',
      ).length,
      snapshots: snapshots.length,
      confirmedChanges: scenarios.reduce(
        (total, scenario) => total + scenario.changeSet.length,
        0,
      ),
    },
    notes: [
      'Analysis values are deterministic local demo estimates for the bundled system model.',
      'Snapshots preserve immutable change sets and captured analysis results.',
      'Stored analysis results remain attached to the revision and settings used when they were generated.',
    ],
    scenarios: scenarios.map((scenario) => ({
      id: scenario.id,
      name: scenario.name,
      revision: scenario.revision,
      createdAt: scenario.createdAt,
      analysisStatus: statuses.get(scenario.id) ?? 'draft',
      analysisSettings: { ...scenario.analysisSettings },
      analysisStrategy: getComparisonStrategyLabel(scenario.analysisSettings),
      snapshotCount: snapshots.filter(
        (snapshot) => snapshot.sourceScenarioId === scenario.id,
      ).length,
      confirmedChanges: getComparisonChanges(system, scenario),
      analysis: scenario.analysis,
    })),
    snapshots: snapshots.map((snapshot) => ({
      id: snapshot.id,
      name: snapshot.name,
      createdAt: snapshot.createdAt,
      sourceScenarioId: snapshot.sourceScenarioId,
      sourceScenarioName: snapshot.sourceScenarioName,
      sourceScenarioExists: scenarios.some(
        (scenario) => scenario.id === snapshot.sourceScenarioId,
      ),
      revision: snapshot.revision,
      modelVersion: snapshot.modelVersion,
      analysisStatus: getSnapshotAnalysisStatus(
        snapshot,
        system.modelVersion,
      ).availability,
      analysisStrategy: getComparisonStrategyLabel(snapshot.analysisSettings),
      confirmedChanges: getComparisonChanges(system, snapshot),
      analysis: snapshot.analysis,
    })),
  }
}

export function serializeWorkspaceExport(workspaceExport: WorkspaceExport) {
  return `${JSON.stringify(workspaceExport, null, 2)}\n`
}

export function createWorkspaceExportFilename(
  system: DemoSystem,
  exportedAt: string,
) {
  const parsedDate = new Date(exportedAt)
  const timestampSource = Number.isNaN(parsedDate.getTime())
    ? new Date().toISOString()
    : parsedDate.toISOString()
  const timestamp = timestampSource.replace(/[:.]/g, '-')
  const systemSlug =
    system.name
      .normalize('NFKD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 48) || 'workspace'

  return `ripplewhatif-${systemSlug}-${timestamp}.json`
}

export function downloadWorkspaceExport(
  workspaceExport: WorkspaceExport,
  system: DemoSystem,
): DownloadWorkspaceExportResult {
  if (
    typeof document === 'undefined' ||
    typeof URL.createObjectURL !== 'function'
  ) {
    return {
      ok: false,
      error: 'This browser cannot create a downloadable workspace file.',
    }
  }

  const filename = createWorkspaceExportFilename(system, workspaceExport.exportedAt)
  let objectUrl: string | null = null

  try {
    const content = serializeWorkspaceExport(workspaceExport)
    const blob = new Blob([content], { type: 'application/json' })
    objectUrl = URL.createObjectURL(blob)

    const link = document.createElement('a')
    link.href = objectUrl
    link.download = filename
    link.rel = 'noopener'
    link.style.display = 'none'
    document.body.append(link)
    link.click()
    link.remove()

    return { ok: true, filename }
  } catch {
    return {
      ok: false,
      error: 'The workspace file could not be prepared for download.',
    }
  } finally {
    const urlToRevoke = objectUrl

    if (urlToRevoke) {
      window.setTimeout(() => URL.revokeObjectURL(urlToRevoke), 0)
    }
  }
}
