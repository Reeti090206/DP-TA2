import type {
  AnalysisSettings,
  ComponentId,
  PropertyKey,
  Scenario,
  ScenarioAnalysis,
  ScenarioChange,
  ScenarioStatus,
} from '../types/domain'

export interface AnalysisStaleness {
  isStale: boolean
  revisionChanged: boolean
  settingsChanged: boolean
}

export function getAnalysisStaleness(scenario: Scenario): AnalysisStaleness {
  if (!scenario.analysis) {
    return {
      isStale: false,
      revisionChanged: false,
      settingsChanged: false,
    }
  }

  const revisionChanged = scenario.analysis.scenarioRevision !== scenario.revision
  const settingsChanged =
    scenario.analysis.propagationStrategy !==
      scenario.analysisSettings.propagationStrategy ||
    scenario.analysis.scoringStrategy !== scenario.analysisSettings.scoringStrategy

  return {
    isStale: revisionChanged || settingsChanged,
    revisionChanged,
    settingsChanged,
  }
}

export function getScenarioStatus(scenario: Scenario): ScenarioStatus {
  if (!scenario.analysis) {
    return 'draft'
  }

  return getAnalysisStaleness(scenario).isStale ? 'stale' : 'analyzed'
}

export function setScenarioAnalysisSettings(
  scenario: Scenario,
  settings: AnalysisSettings,
): Scenario {
  if (
    scenario.analysisSettings.propagationStrategy === settings.propagationStrategy &&
    scenario.analysisSettings.scoringStrategy === settings.scoringStrategy
  ) {
    return scenario
  }

  return {
    ...scenario,
    analysisSettings: settings,
  }
}

export function setScenarioAnalysis(
  scenario: Scenario,
  analysis: ScenarioAnalysis,
): Scenario {
  return {
    ...scenario,
    analysis,
  }
}

export function getScenarioChange(
  scenario: Scenario,
  componentId: ComponentId,
  propertyKey: PropertyKey,
) {
  return scenario.changeSet.find(
    (change) => change.componentId === componentId && change.propertyKey === propertyKey,
  )
}

export function setScenarioChange(scenario: Scenario, change: ScenarioChange): Scenario {
  const existingChange = getScenarioChange(scenario, change.componentId, change.propertyKey)

  if (existingChange?.value === change.value) {
    return scenario
  }

  const changeSet = existingChange
    ? scenario.changeSet.map((currentChange) =>
        currentChange.componentId === change.componentId &&
        currentChange.propertyKey === change.propertyKey
          ? change
          : currentChange,
      )
    : [...scenario.changeSet, change]

  return {
    ...scenario,
    revision: scenario.revision + 1,
    changeSet,
  }
}

export function clearScenarioChange(
  scenario: Scenario,
  componentId: ComponentId,
  propertyKey: PropertyKey,
): Scenario {
  const existingChange = getScenarioChange(scenario, componentId, propertyKey)

  if (!existingChange) {
    return scenario
  }

  return {
    ...scenario,
    revision: scenario.revision + 1,
    changeSet: scenario.changeSet.filter(
      (change) => change.componentId !== componentId || change.propertyKey !== propertyKey,
    ),
  }
}
