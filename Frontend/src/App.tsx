import {
  lazy,
  Suspense,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react'
import { AppSidebar } from './components/layout/AppSidebar'
import { TopBar } from './components/layout/TopBar'
import { PageLoading } from './components/layout/PageLoading'
import { WorkspaceNotice } from './components/layout/WorkspaceNotice'
import { usePageNavigation } from './hooks/usePageNavigation'
import { demoSystem } from './data/demoSystem'
import {
  analyzeScenario,
  DEFAULT_ANALYSIS_SETTINGS,
  getAnalysisReadiness,
} from './lib/analysisEngine'
import {
  analyzeScenarioWithBackend,
  checkBackendHealth,
} from './lib/apiClient'
import {
  clearScenarioChange,
  setScenarioAnalysis,
  setScenarioAnalysisSettings,
  setScenarioChange,
} from './lib/scenarioState'
import {
  createScenarioFromSnapshot,
  createSnapshotFromScenario,
  isSnapshotNameDuplicate,
  normalizeSnapshotName,
  restoreSnapshotIntoScenario,
  SCENARIO_NAME_MAX_LENGTH,
  SNAPSHOT_NAME_MAX_LENGTH,
  type SnapshotOperationResult,
} from './lib/snapshotState'
import {
  createLocalStorageAdapter,
  loadWorkspaceState,
  saveWorkspaceState,
} from './lib/workspacePersistence'
import { createWorkspaceNoticeStore } from './lib/workspaceNoticeStore'
import type {
  AnalysisSettings,
  ComponentId,
  PropertyKey,
  Scenario,
  ScenarioChange,
  ScenarioSnapshot,
} from './types/domain'

const ImpactExplorerPage = lazy(async () => {
  const module = await import('./pages/ImpactExplorerPage')
  return { default: module.ImpactExplorerPage }
})

const ScenarioLabPage = lazy(async () => {
  const module = await import('./pages/ScenarioLabPage')
  return { default: module.ScenarioLabPage }
})

export default function App() {
  const { page, navigate } = usePageNavigation()
  const [workspaceStorage] = useState(() => createLocalStorageAdapter())
  const [initialWorkspace] = useState(() =>
    loadWorkspaceState(workspaceStorage, demoSystem),
  )
  const [scenarios, setScenarios] = useState<Scenario[]>(
    initialWorkspace.state.scenarios,
  )
  const [snapshots, setSnapshots] = useState<ScenarioSnapshot[]>(
    initialWorkspace.state.snapshots,
  )
  const [activeScenarioId, setActiveScenarioId] = useState<string | null>(
    initialWorkspace.state.activeScenarioId,
  )
  const [backendConnected, setBackendConnected] = useState(false)
  const [workspaceNoticeStore] = useState(() =>
    createWorkspaceNoticeStore(initialWorkspace.notice),
  )
  const workspaceNotice = useSyncExternalStore(
    workspaceNoticeStore.subscribe,
    workspaceNoticeStore.getSnapshot,
    workspaceNoticeStore.getSnapshot,
  )
  const savedWorkspaceSignature = useRef(
    JSON.stringify(initialWorkspace.state),
  )
  const activeScenario = scenarios.find((scenario) => scenario.id === activeScenarioId)

  useEffect(() => {
    let mounted = true
    const checkConnection = async () => {
      const status = await checkBackendHealth()
      if (mounted) {
        setBackendConnected(status.connected)
      }
    }

    checkConnection()
    const timer = setInterval(checkConnection, 8000)
    return () => {
      mounted = false
      clearInterval(timer)
    }
  }, [])

  useEffect(() => {
    document.title =
      page === 'impact'
        ? 'Impact Explorer · RippleWhatIf'
        : 'Scenario Lab · RippleWhatIf'
    window.scrollTo({ top: 0 })
  }, [page])

  useEffect(() => {
    const workspace = { scenarios, snapshots, activeScenarioId }
    const signature = JSON.stringify(workspace)

    if (signature === savedWorkspaceSignature.current) {
      return
    }

    const result = saveWorkspaceState(workspaceStorage, demoSystem, workspace)

    if (result.ok) {
      savedWorkspaceSignature.current = signature
      workspaceNoticeStore.set(null)
      return
    }

    workspaceNoticeStore.set({
      tone: 'error',
      title: 'Workspace not saved',
      message: `${result.error} Changes remain available in this tab.`,
    })
  }, [activeScenarioId, scenarios, snapshots, workspaceNoticeStore, workspaceStorage])

  const createScenario = (name: string) => {
    const scenario: Scenario = {
      id: crypto.randomUUID(),
      name,
      revision: 1,
      createdAt: new Date().toISOString(),
      changeSet: [],
      analysisSettings: { ...DEFAULT_ANALYSIS_SETTINGS },
      analysis: null,
    }

    setScenarios((current) => [...current, scenario])
    setActiveScenarioId(scenario.id)

    return scenario
  }

  const openScenario = (scenarioId: string) => {
    setActiveScenarioId(scenarioId)
    navigate('impact')
  }

  const applyChange = (scenarioId: string, change: ScenarioChange) => {
    setScenarios((current) =>
      current.map((scenario) =>
        scenario.id === scenarioId ? setScenarioChange(scenario, change) : scenario,
      ),
    )
  }

  const resetChange = (
    scenarioId: string,
    componentId: ComponentId,
    propertyKey: PropertyKey,
  ) => {
    setScenarios((current) =>
      current.map((scenario) =>
        scenario.id === scenarioId
          ? clearScenarioChange(scenario, componentId, propertyKey)
          : scenario,
      ),
    )
  }

  const updateAnalysisSettings = (
    scenarioId: string,
    settings: AnalysisSettings,
  ) => {
    setScenarios((current) =>
      current.map((scenario) =>
        scenario.id === scenarioId
          ? setScenarioAnalysisSettings(scenario, settings)
          : scenario,
      ),
    )
  }

  const runAnalysis = async (scenarioId: string) => {
    const scenario = scenarios.find((item) => item.id === scenarioId)

    if (!scenario || !getAnalysisReadiness(demoSystem, scenario).ready) {
      return
    }

    try {
      const backendAnalysis = await analyzeScenarioWithBackend(demoSystem, scenario)
      setBackendConnected(true)
      setScenarios((current) =>
        current.map((item) =>
          item.id === scenarioId ? setScenarioAnalysis(item, backendAnalysis) : item,
        ),
      )
    } catch (error) {
      console.warn('Backend unavailable, using local simulation fallback:', error)
      setBackendConnected(false)
      const localAnalysis = analyzeScenario(demoSystem, scenario)
      setScenarios((current) =>
        current.map((item) =>
          item.id === scenarioId ? setScenarioAnalysis(item, localAnalysis) : item,
        ),
      )
    }
  }

  const saveSnapshot = (
    scenarioId: string,
    name: string,
  ): SnapshotOperationResult<ScenarioSnapshot> => {
    const scenario = scenarios.find((item) => item.id === scenarioId)

    if (!scenario) {
      return { ok: false, error: 'The selected scenario no longer exists.' }
    }

    const normalizedName = normalizeSnapshotName(name)

    if (!normalizedName) {
      return { ok: false, error: 'Enter a name for the snapshot.' }
    }

    if (normalizedName.length > SNAPSHOT_NAME_MAX_LENGTH) {
      return {
        ok: false,
        error: `Snapshot names must be ${SNAPSHOT_NAME_MAX_LENGTH} characters or fewer.`,
      }
    }

    if (isSnapshotNameDuplicate(normalizedName, scenario.id, snapshots)) {
      return {
        ok: false,
        error: 'A snapshot with this name already exists in this workspace.',
      }
    }

    const snapshot = createSnapshotFromScenario(demoSystem, scenario, normalizedName)

    setSnapshots((current) => [...current, snapshot])

    return { ok: true, value: snapshot }
  }

  const restoreSnapshot = (
    snapshotId: string,
    targetScenarioId: string,
  ): SnapshotOperationResult<Scenario> => {
    const snapshot = snapshots.find((item) => item.id === snapshotId)

    if (!snapshot) {
      return { ok: false, error: 'The selected snapshot no longer exists.' }
    }

    const targetScenario = scenarios.find((item) => item.id === targetScenarioId)

    if (!targetScenario) {
      return { ok: false, error: 'Choose an existing scenario to restore into.' }
    }

    const updatedScenario = restoreSnapshotIntoScenario(snapshot, targetScenario)

    setScenarios((current) =>
      current.map((item) =>
        item.id === targetScenarioId ? updatedScenario : item,
      ),
    )
    setActiveScenarioId(targetScenarioId)

    return { ok: true, value: updatedScenario }
  }

  const branchSnapshot = (
    snapshotId: string,
    scenarioName: string,
  ): SnapshotOperationResult<Scenario> => {
    const snapshot = snapshots.find((item) => item.id === snapshotId)

    if (!snapshot) {
      return { ok: false, error: 'The selected snapshot no longer exists.' }
    }

    const normalizedName = scenarioName.trim()

    if (!normalizedName) {
      return { ok: false, error: 'Enter a name for the new scenario.' }
    }

    if (normalizedName.length > SCENARIO_NAME_MAX_LENGTH) {
      return {
        ok: false,
        error: `Scenario names must be ${SCENARIO_NAME_MAX_LENGTH} characters or fewer.`,
      }
    }

    const scenario = createScenarioFromSnapshot(snapshot, normalizedName)

    setScenarios((current) => [...current, scenario])
    setActiveScenarioId(scenario.id)

    return { ok: true, value: scenario }
  }

  return (
    <div className="min-h-screen bg-canvas">
      <AppSidebar currentPage={page} onNavigate={navigate} />

      <div className="min-h-screen lg:pl-[248px]">
        <TopBar
          currentPage={page}
          system={demoSystem}
          activeScenario={activeScenario}
          backendConnected={backendConnected}
          onNavigate={navigate}
        />

        <main className="mx-auto w-full max-w-[1600px] px-4 pb-10 pt-5 sm:px-6 lg:px-7 lg:pt-6">
          {workspaceNotice ? (
            <WorkspaceNotice
              notice={workspaceNotice}
              onDismiss={() => workspaceNoticeStore.set(null)}
            />
          ) : null}

          <Suspense fallback={<PageLoading />}>
            {page === 'impact' ? (
              <ImpactExplorerPage
                system={demoSystem}
                activeScenario={activeScenario}
                onApplyChange={applyChange}
                onResetChange={resetChange}
                onUpdateAnalysisSettings={updateAnalysisSettings}
                onRunAnalysis={runAnalysis}
                onOpenScenarioLab={() => navigate('scenarios')}
              />
            ) : (
              <ScenarioLabPage
                system={demoSystem}
                scenarios={scenarios}
                snapshots={snapshots}
                activeScenarioId={activeScenarioId}
                onCreateScenario={createScenario}
                onOpenScenario={openScenario}
                onInspectSystem={() => navigate('impact')}
                onSaveSnapshot={saveSnapshot}
                onRestoreSnapshot={restoreSnapshot}
                onBranchFromSnapshot={branchSnapshot}
              />
            )}
          </Suspense>
        </main>
      </div>
    </div>
  )
}
