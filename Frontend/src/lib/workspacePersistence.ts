import {
  SCENARIO_NAME_MAX_LENGTH,
  SNAPSHOT_NAME_MAX_LENGTH,
} from './snapshotState'
import type {
  AnalysisFinding,
  AnalysisSettings,
  AnalysisSeverity,
  AnalyzedSourceChange,
  ChangeDirection,
  ComponentId,
  DemoSystem,
  ImpactClassification,
  PropertyKey,
  PropagationStrategy,
  Scenario,
  ScenarioAnalysis,
  ScenarioChange,
  ScenarioSnapshot,
  ScoringStrategy,
  SupportedProperty,
  SystemComponent,
} from '../types/domain'

export const WORKSPACE_STORAGE_KEY = 'ripplewhatif:workspace'
export const WORKSPACE_STORAGE_SCHEMA = 'ripplewhatif.workspace'
export const WORKSPACE_STORAGE_VERSION = 1

const STEP_TOLERANCE = 1e-7
const PROPAGATION_STRATEGIES: ReadonlySet<PropagationStrategy> = new Set([
  'breadth-first',
  'weighted',
])
const SCORING_STRATEGIES: ReadonlySet<ScoringStrategy> = new Set([
  'weighted-risk',
  'criticality-first',
])
const SEVERITIES: ReadonlySet<AnalysisSeverity> = new Set([
  'low',
  'moderate',
  'high',
  'severe',
])
const CHANGE_DIRECTIONS: ReadonlySet<ChangeDirection> = new Set([
  'increase',
  'decrease',
])
const IMPACT_CLASSIFICATIONS: ReadonlySet<ImpactClassification> = new Set([
  'direct',
  'indirect',
])

export interface WorkspaceState {
  scenarios: Scenario[]
  snapshots: ScenarioSnapshot[]
  activeScenarioId: string | null
}

export interface WorkspaceNotice {
  tone: 'warning' | 'error'
  title: string
  message: string
}

export interface WorkspaceLoadResult {
  state: WorkspaceState
  notice: WorkspaceNotice | null
}

export type WorkspaceSaveResult =
  | { ok: true }
  | { ok: false; error: string }

export interface WorkspaceStorageAdapter {
  read: () => string | null
  write: (value: string) => void
}

interface StoredWorkspace {
  schema: typeof WORKSPACE_STORAGE_SCHEMA
  version: typeof WORKSPACE_STORAGE_VERSION
  savedAt: string
  systemId: string
  systemVersion: string
  modelVersion: string
  activeScenarioId: string | null
  scenarios: Scenario[]
  snapshots: ScenarioSnapshot[]
}

interface WorkspaceSystemIndex {
  modelVersion: string
  componentIds: Set<ComponentId>
  componentById: Map<ComponentId, SystemComponent>
  propertiesByComponent: Map<ComponentId, Map<PropertyKey, SupportedProperty>>
}

type WorkspacePayloadFailure = 'malformed' | 'unsupported-version' | 'system-mismatch'

type WorkspacePayloadParseResult =
  | { ok: true; state: WorkspaceState }
  | { ok: false; reason: WorkspacePayloadFailure }

const EMPTY_WORKSPACE: WorkspaceState = {
  scenarios: [],
  snapshots: [],
  activeScenarioId: null,
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value)
}

function isInteger(value: unknown, minimum = 0): value is number {
  return isFiniteNumber(value) && Number.isInteger(value) && value >= minimum
}

function isNonEmptyText(value: unknown, maximumLength = 240): value is string {
  return (
    typeof value === 'string' &&
    value.trim().length > 0 &&
    value.length <= maximumLength
  )
}

function isTimestamp(value: unknown): value is string {
  return typeof value === 'string' && !Number.isNaN(Date.parse(value))
}

function isArrayOf<T>(
  value: unknown,
  predicate: (item: unknown) => item is T,
): value is T[] {
  return Array.isArray(value) && value.every(predicate)
}

function isStringUnion<T extends string>(
  value: unknown,
  allowed: ReadonlySet<T>,
): value is T {
  return typeof value === 'string' && allowed.has(value as T)
}

function hasUniqueValues(values: readonly string[]) {
  return new Set(values).size === values.length
}

function areEqualSets(left: readonly string[], right: readonly string[]) {
  if (left.length !== right.length) {
    return false
  }

  const rightSet = new Set(right)
  return left.every((value) => rightSet.has(value))
}

function createSystemIndex(system: DemoSystem): WorkspaceSystemIndex {
  return {
    modelVersion: system.modelVersion,
    componentIds: new Set(system.components.map((component) => component.id)),
    componentById: new Map(
      system.components.map((component) => [component.id, component]),
    ),
    propertiesByComponent: new Map(
      system.components.map((component) => [
        component.id,
        new Map(component.supportedProperties.map((property) => [property.key, property])),
      ]),
    ),
  }
}

function isComponentId(value: unknown, index: WorkspaceSystemIndex): value is ComponentId {
  return (
    typeof value === 'string' &&
    index.componentIds.has(value as ComponentId)
  )
}

function isComponentIdList(
  value: unknown,
  index: WorkspaceSystemIndex,
): value is ComponentId[] {
  return isArrayOf(value, (item): item is ComponentId => isComponentId(item, index))
}

function getProperty(
  componentId: unknown,
  propertyKey: unknown,
  index: WorkspaceSystemIndex,
) {
  if (!isComponentId(componentId, index) || typeof propertyKey !== 'string') {
    return null
  }

  return (
    index.propertiesByComponent
      .get(componentId)
      ?.get(propertyKey as PropertyKey) ?? null
  )
}

function isValueWithinProperty(value: number, property: SupportedProperty) {
  if (value < property.min || value > property.max) {
    return false
  }

  if (property.step <= 0) {
    return true
  }

  const stepPosition = (value - property.min) / property.step
  return Math.abs(stepPosition - Math.round(stepPosition)) <= STEP_TOLERANCE
}

function isAnalysisSettings(value: unknown): value is AnalysisSettings {
  return (
    isRecord(value) &&
    isStringUnion(value.propagationStrategy, PROPAGATION_STRATEGIES) &&
    isStringUnion(value.scoringStrategy, SCORING_STRATEGIES)
  )
}

function isScenarioChange(
  value: unknown,
  index: WorkspaceSystemIndex,
): value is ScenarioChange {
  if (!isRecord(value) || !isFiniteNumber(value.value)) {
    return false
  }

  const property = getProperty(value.componentId, value.propertyKey, index)

  return Boolean(
    property &&
      value.value !== property.defaultValue &&
      isValueWithinProperty(value.value, property),
  )
}

function isScenarioChangeSet(value: unknown, index: WorkspaceSystemIndex) {
  if (!isArrayOf(value, (item): item is ScenarioChange => isScenarioChange(item, index))) {
    return false
  }

  const keys = value.map((change) => `${change.componentId}:${change.propertyKey}`)
  return hasUniqueValues(keys)
}

function isAnalyzedSourceChange(
  value: unknown,
  index: WorkspaceSystemIndex,
): value is AnalyzedSourceChange {
  if (!isRecord(value) || !isFiniteNumber(value.proposedValue)) {
    return false
  }

  const component = isComponentId(value.componentId, index)
    ? index.componentById.get(value.componentId)
    : null
  const property = getProperty(value.componentId, value.propertyKey, index)

  if (!component || !property) {
    return false
  }

  const direction =
    value.proposedValue > property.defaultValue ? 'increase' : 'decrease'
  const expectedUnit = property.unit

  return (
    value.componentName === component.name &&
    value.propertyLabel === property.label &&
    value.baselineValue === property.defaultValue &&
    value.proposedValue !== property.defaultValue &&
    isValueWithinProperty(value.proposedValue, property) &&
    value.unit === expectedUnit &&
    value.direction === direction &&
    isStringUnion(value.direction, CHANGE_DIRECTIONS) &&
    isFiniteNumber(value.changePercent) &&
    isFiniteNumber(value.riskScore) &&
    value.riskScore >= 0 &&
    value.riskScore <= 100 &&
    (value.riskDirection === 'adverse' || value.riskDirection === 'favorable') &&
    isArrayOf(value.factors, (item): item is string => isNonEmptyText(item, 600))
  )
}

function isAnalysisFinding(
  value: unknown,
  index: WorkspaceSystemIndex,
): value is AnalysisFinding {
  if (!isRecord(value) || !isComponentId(value.componentId, index)) {
    return false
  }

  const component = index.componentById.get(value.componentId)

  if (
    !component ||
    !isComponentId(value.sourceComponentId, index) ||
    !isStringUnion(value.impactType, IMPACT_CLASSIFICATIONS) ||
    !isFiniteNumber(value.distance) ||
    !Number.isInteger(value.distance) ||
    value.distance < 1 ||
    !isFiniteNumber(value.shortestDistance) ||
    !Number.isInteger(value.shortestDistance) ||
    value.shortestDistance < 1 ||
    !isComponentIdList(value.causalPath, index) ||
    value.causalPath.length < 2 ||
    !isFiniteNumber(value.propagationSignal) ||
    value.propagationSignal < 0 ||
    !isFiniteNumber(value.score) ||
    value.score < 0 ||
    value.score > 100 ||
    !isStringUnion(value.severity, SEVERITIES) ||
    !isNonEmptyText(value.rule, 600) ||
    !isNonEmptyText(value.explanation, 2400) ||
    !isArrayOf(value.factors, (item): item is string => isNonEmptyText(item, 600))
  ) {
    return false
  }

  const path = value.causalPath

  return (
    value.componentName === component.name &&
    value.criticality === component.criticality &&
    isNonEmptyText(value.sourceComponentName, 120) &&
    path[0] === value.sourceComponentId &&
    path[path.length - 1] === value.componentId &&
    value.distance === path.length - 1 &&
    value.distance >= value.shortestDistance &&
    (value.impactType === 'direct'
      ? value.shortestDistance === 1
      : value.shortestDistance >= 2)
  )
}

function isScenarioAnalysis(
  value: unknown,
  index: WorkspaceSystemIndex,
  expectedModelVersion?: string,
): value is ScenarioAnalysis {
  if (
    !isRecord(value) ||
    !isNonEmptyText(value.id) ||
    !isTimestamp(value.analyzedAt) ||
    !isNonEmptyText(value.modelVersion) ||
    (expectedModelVersion !== undefined &&
      value.modelVersion !== expectedModelVersion) ||
    !isInteger(value.scenarioRevision, 1) ||
    !isStringUnion(value.propagationStrategy, PROPAGATION_STRATEGIES) ||
    !isStringUnion(value.scoringStrategy, SCORING_STRATEGIES) ||
    !isComponentIdList(value.sourceComponentIds, index) ||
    !Array.isArray(value.sourceChanges) ||
    value.sourceChanges.length === 0 ||
    !isArrayOf(
      value.sourceChanges,
      (item): item is AnalyzedSourceChange => isAnalyzedSourceChange(item, index),
    ) ||
    !isFiniteNumber(value.overallScore) ||
    value.overallScore < 0 ||
    value.overallScore > 100 ||
    !isArrayOf(
      value.overallFactors,
      (item): item is string => isNonEmptyText(item, 600),
    ) ||
    !isStringUnion(value.severity, SEVERITIES) ||
    !isComponentIdList(value.affectedComponentIds, index) ||
    !isComponentIdList(value.directComponentIds, index) ||
    !isComponentIdList(value.indirectComponentIds, index) ||
    !isComponentIdList(value.criticalAffectedComponentIds, index) ||
    !isArrayOf(
      value.findings,
      (item): item is AnalysisFinding => isAnalysisFinding(item, index),
    )
  ) {
    return false
  }

  const sourceChanges = value.sourceChanges
  const findings = value.findings
  const sourceKeys = sourceChanges.map(
    (change) => `${change.componentId}:${change.propertyKey}`,
  )
  const findingIds = findings.map((finding) => finding.componentId)
  const expectedDirectIds = findings
    .filter((finding) => finding.impactType === 'direct')
    .map((finding) => finding.componentId)
  const expectedIndirectIds = findings
    .filter((finding) => finding.impactType === 'indirect')
    .map((finding) => finding.componentId)
  const expectedCriticalIds = findings
    .filter((finding) => finding.criticality === 'critical')
    .map((finding) => finding.componentId)
  const expectedSourceIds = [
    ...new Set(sourceChanges.map((change) => change.componentId)),
  ]

  return (
    hasUniqueValues(sourceKeys) &&
    hasUniqueValues(findingIds) &&
    hasUniqueValues(value.sourceComponentIds) &&
    hasUniqueValues(value.affectedComponentIds) &&
    hasUniqueValues(value.directComponentIds) &&
    hasUniqueValues(value.indirectComponentIds) &&
    hasUniqueValues(value.criticalAffectedComponentIds) &&
    areEqualSets(value.sourceComponentIds, expectedSourceIds) &&
    areEqualSets(value.affectedComponentIds, findingIds) &&
    areEqualSets(value.directComponentIds, expectedDirectIds) &&
    areEqualSets(value.indirectComponentIds, expectedIndirectIds) &&
    areEqualSets(value.criticalAffectedComponentIds, expectedCriticalIds)
  )
}

function isScenario(value: unknown, index: WorkspaceSystemIndex): value is Scenario {
  if (
    !isRecord(value) ||
    !isNonEmptyText(value.id) ||
    !isNonEmptyText(value.name, SCENARIO_NAME_MAX_LENGTH) ||
    !isInteger(value.revision, 1) ||
    !isTimestamp(value.createdAt) ||
    !isScenarioChangeSet(value.changeSet, index) ||
    !isAnalysisSettings(value.analysisSettings)
  ) {
    return false
  }

  if (value.analysis === null) {
    return true
  }

  return (
    isScenarioAnalysis(value.analysis, index, index.modelVersion) &&
    value.analysis.scenarioRevision <= value.revision
  )
}

function isSnapshot(
  value: unknown,
  index: WorkspaceSystemIndex,
): value is ScenarioSnapshot {
  if (
    !isRecord(value) ||
    !isNonEmptyText(value.id) ||
    !isNonEmptyText(value.name, SNAPSHOT_NAME_MAX_LENGTH) ||
    !isTimestamp(value.createdAt) ||
    !isNonEmptyText(value.sourceScenarioId) ||
    !isNonEmptyText(value.sourceScenarioName, SCENARIO_NAME_MAX_LENGTH) ||
    !isInteger(value.revision, 1) ||
    !isNonEmptyText(value.modelVersion) ||
    !isScenarioChangeSet(value.changeSet, index) ||
    !isAnalysisSettings(value.analysisSettings)
  ) {
    return false
  }

  if (value.analysis === null) {
    return true
  }

  return (
    isScenarioAnalysis(value.analysis, index) &&
    value.analysis.scenarioRevision <= value.revision
  )
}

function parseWorkspacePayload(
  value: unknown,
  system: DemoSystem,
): WorkspacePayloadParseResult {
  if (
    !isRecord(value) ||
    value.schema !== WORKSPACE_STORAGE_SCHEMA ||
    !isInteger(value.version, 1)
  ) {
    return { ok: false, reason: 'malformed' }
  }

  if (value.version !== WORKSPACE_STORAGE_VERSION) {
    return { ok: false, reason: 'unsupported-version' }
  }

  if (
    !isTimestamp(value.savedAt) ||
    !isNonEmptyText(value.systemId) ||
    !isNonEmptyText(value.systemVersion) ||
    !isNonEmptyText(value.modelVersion)
  ) {
    return { ok: false, reason: 'malformed' }
  }

  if (
    value.systemId !== system.id ||
    value.systemVersion !== system.version ||
    value.modelVersion !== system.modelVersion
  ) {
    return { ok: false, reason: 'system-mismatch' }
  }

  if (
    (value.activeScenarioId !== null &&
      typeof value.activeScenarioId !== 'string') ||
    !Array.isArray(value.scenarios) ||
    !Array.isArray(value.snapshots)
  ) {
    return { ok: false, reason: 'malformed' }
  }

  const index = createSystemIndex(system)

  if (
    !isArrayOf(value.scenarios, (item): item is Scenario => isScenario(item, index)) ||
    !isArrayOf(value.snapshots, (item): item is ScenarioSnapshot =>
      isSnapshot(item, index),
    )
  ) {
    return { ok: false, reason: 'malformed' }
  }

  const scenarioIds = value.scenarios.map((scenario) => scenario.id)
  const scenarioNames = value.scenarios.map((scenario) =>
    scenario.name.toLowerCase(),
  )
  const snapshotIds = value.snapshots.map((snapshot) => snapshot.id)
  const snapshotNames = value.snapshots.map(
    (snapshot) => `${snapshot.sourceScenarioId}:${snapshot.name.toLowerCase()}`,
  )

  if (
    !hasUniqueValues(scenarioIds) ||
    !hasUniqueValues(scenarioNames) ||
    !hasUniqueValues(snapshotIds) ||
    !hasUniqueValues(snapshotNames)
  ) {
    return { ok: false, reason: 'malformed' }
  }

  const activeScenarioId =
    typeof value.activeScenarioId === 'string' &&
    value.scenarios.some((scenario) => scenario.id === value.activeScenarioId)
      ? value.activeScenarioId
      : null

  return {
    ok: true,
    state: {
      scenarios: value.scenarios,
      snapshots: value.snapshots,
      activeScenarioId,
    },
  }
}

function getPayloadFailureNotice(reason: WorkspacePayloadFailure): WorkspaceNotice {
  switch (reason) {
    case 'unsupported-version':
      return {
        tone: 'warning',
        title: 'Saved workspace was not loaded',
        message:
          'The saved workspace uses an unsupported storage version. It was ignored for safety; creating or editing a scenario will replace it.',
      }
    case 'system-mismatch':
      return {
        tone: 'warning',
        title: 'Saved workspace was not loaded',
        message:
          'The saved workspace belongs to a different system model. It was ignored for safety; creating or editing a scenario will replace it.',
      }
    default:
      return {
        tone: 'warning',
        title: 'Saved workspace was not loaded',
        message:
          'The saved workspace is incomplete or malformed. It was ignored for safety; creating or editing a scenario will replace it.',
      }
  }
}

function getBrowserStorage(): Storage | null {
  if (typeof window === 'undefined') {
    return null
  }

  try {
    return window.localStorage
  } catch {
    return null
  }
}

export function createLocalStorageAdapter(
  storage: Storage | null = getBrowserStorage(),
): WorkspaceStorageAdapter {
  return {
    read() {
      if (!storage) {
        throw new Error('Browser storage is unavailable.')
      }

      return storage.getItem(WORKSPACE_STORAGE_KEY)
    },
    write(value) {
      if (!storage) {
        throw new Error('Browser storage is unavailable.')
      }

      storage.setItem(WORKSPACE_STORAGE_KEY, value)
    },
  }
}

function describeStorageError(error: unknown) {
  const errorName =
    typeof error === 'object' &&
    error !== null &&
    'name' in error &&
    typeof error.name === 'string'
      ? error.name
      : ''

  if (
    errorName === 'QuotaExceededError' ||
    errorName === 'NS_ERROR_DOM_QUOTA_REACHED'
  ) {
    return 'Browser storage is full. Clear browser storage for this site and try again.'
  }

  return 'Browser storage is unavailable or blocked for this site.'
}

export function loadWorkspaceState(
  adapter: WorkspaceStorageAdapter,
  system: DemoSystem,
): WorkspaceLoadResult {
  let serialized: string | null

  try {
    serialized = adapter.read()
  } catch {
    return {
      state: EMPTY_WORKSPACE,
      notice: {
        tone: 'warning',
        title: 'Browser storage is unavailable',
        message:
          'Changes in this tab will remain in memory but may not survive a refresh.',
      },
    }
  }

  if (serialized === null) {
    return { state: EMPTY_WORKSPACE, notice: null }
  }

  let parsed: unknown

  try {
    parsed = JSON.parse(serialized)
  } catch {
    return {
      state: EMPTY_WORKSPACE,
      notice: getPayloadFailureNotice('malformed'),
    }
  }

  const result = parseWorkspacePayload(parsed, system)

  if (!result.ok) {
    return {
      state: EMPTY_WORKSPACE,
      notice: getPayloadFailureNotice(result.reason),
    }
  }

  return { state: result.state, notice: null }
}

export function saveWorkspaceState(
  adapter: WorkspaceStorageAdapter,
  system: DemoSystem,
  state: WorkspaceState,
): WorkspaceSaveResult {
  const payload: StoredWorkspace = {
    schema: WORKSPACE_STORAGE_SCHEMA,
    version: WORKSPACE_STORAGE_VERSION,
    savedAt: new Date().toISOString(),
    systemId: system.id,
    systemVersion: system.version,
    modelVersion: system.modelVersion,
    activeScenarioId: state.activeScenarioId,
    scenarios: state.scenarios,
    snapshots: state.snapshots,
  }

  if (!parseWorkspacePayload(payload, system).ok) {
    return {
      ok: false,
      error: 'Workspace data failed safety validation and was not saved.',
    }
  }

  try {
    adapter.write(JSON.stringify(payload))
    return { ok: true }
  } catch (error) {
    return { ok: false, error: describeStorageError(error) }
  }
}
