import { useState } from 'react'
import { Lock, RefreshCw } from 'lucide-react'
import { PageHeader } from '../components/layout/PageHeader'
import { Badge } from '../components/ui/Badge'
import { ComponentExplorer } from '../components/impact/ComponentExplorer'
import { ComponentDetailsPanel } from '../components/impact/ComponentDetailsPanel'
import { DependencyGraph } from '../components/graph/DependencyGraph'
import { ProposedChangePanel } from '../components/impact/ProposedChangePanel'
import { AnalysisResultsPanel } from '../components/impact/AnalysisResultsPanel'
import { getComponentById } from '../lib/systemGraph'
import type {
  AnalysisSettings,
  ComponentId,
  DemoSystem,
  PropertyKey,
  Scenario,
  ScenarioChange,
} from '../types/domain'

interface ImpactExplorerPageProps {
  system: DemoSystem
  activeScenario?: Scenario
  onApplyChange: (scenarioId: string, change: ScenarioChange) => void
  onResetChange: (
    scenarioId: string,
    componentId: ComponentId,
    propertyKey: PropertyKey,
  ) => void
  onUpdateAnalysisSettings: (
    scenarioId: string,
    settings: AnalysisSettings,
  ) => void
  onRunAnalysis: (scenarioId: string) => void
  onOpenScenarioLab: () => void
}

export function ImpactExplorerPage({
  system,
  activeScenario,
  onApplyChange,
  onResetChange,
  onUpdateAnalysisSettings,
  onRunAnalysis,
  onOpenScenarioLab,
}: ImpactExplorerPageProps) {
  const [selectedId, setSelectedId] = useState<ComponentId>('inventory')
  const selectedComponent = getComponentById(system, selectedId)

  return (
    <>
      <PageHeader
        eyebrow={`${system.name} · Read-only baseline`}
        title="Impact Explorer"
        description="Inspect the system graph, select a component, and understand which paths could carry change downstream."
        actions={
          <>
            <Badge tone="amber" className="h-7 gap-1.5 px-2.5">
              <RefreshCw aria-hidden="true" size={10} />
              Cycle modeled
            </Badge>
            <Badge tone="neutral" className="h-7 gap-1.5 px-2.5">
              <Lock aria-hidden="true" size={10} />
              Baseline is read-only
            </Badge>
          </>
        }
      />

      <div className="grid gap-4 xl:grid-cols-[272px_minmax(0,1fr)] xl:items-start">
        <div className="space-y-4">
          <ComponentExplorer
            system={system}
            selectedId={selectedId}
            onSelect={setSelectedId}
            className="h-[420px]"
          />
          <ComponentDetailsPanel
            system={system}
            component={selectedComponent}
            onSelectComponent={setSelectedId}
          />
        </div>

        <div className="min-w-0 space-y-4">
          <DependencyGraph
            system={system}
            selectedId={selectedId}
            onSelect={setSelectedId}
            analysis={activeScenario?.analysis ?? null}
            className="h-[540px] sm:h-[590px]"
          />

          <div className="grid gap-4 lg:grid-cols-2">
            <ProposedChangePanel
              activeScenario={activeScenario}
              component={selectedComponent}
              onApplyChange={onApplyChange}
              onResetChange={onResetChange}
              onOpenScenarioLab={onOpenScenarioLab}
            />
            <AnalysisResultsPanel
              system={system}
              activeScenario={activeScenario}
              selectedComponentId={selectedId}
              onSelectComponent={setSelectedId}
              onUpdateAnalysisSettings={onUpdateAnalysisSettings}
              onRunAnalysis={onRunAnalysis}
              onOpenScenarioLab={onOpenScenarioLab}
            />
          </div>
        </div>
      </div>
    </>
  )
}
