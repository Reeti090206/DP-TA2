import { useMemo } from 'react'
import {
  Background,
  BackgroundVariant,
  MarkerType,
  Panel as FlowPanel,
  ReactFlow,
  ReactFlowProvider,
  useReactFlow,
  type Edge,
  type Node,
} from '@xyflow/react'
import { Maximize2, Network, RefreshCw, ZoomIn, ZoomOut } from 'lucide-react'
import {
  ComponentNode,
  type ComponentFlowNode,
  type ComponentImpactState,
} from './ComponentNode'
import { CycleEdge } from './CycleEdge'
import { Panel, PanelHeader } from '../ui/Panel'
import { graphLayout } from '../../data/graphLayout'
import { getCyclePathLabel } from '../../lib/systemGraph'
import {
  ANALYSIS_SEVERITY_META,
  getAnalysisPathEdgeKeys,
  getCausalPathEdgeKey,
} from '../../lib/analysisPresentation'
import { cn } from '../../lib/cn'
import type {
  ComponentId,
  DemoSystem,
  ScenarioAnalysis,
} from '../../types/domain'

const NODE_TYPES = { component: ComponentNode }
const EDGE_TYPES = { cycle: CycleEdge }

const EDGE_IDLE = '#c3d0d7'
const EDGE_ACTIVE = '#0f766e'
const EDGE_IMPACT = '#0f766e'
const EDGE_CYCLE = '#b45309'

interface DependencyGraphProps {
  system: DemoSystem
  selectedId: ComponentId
  onSelect: (componentId: ComponentId) => void
  analysis?: ScenarioAnalysis | null
  className?: string
}

function GraphToolbar() {
  const { fitView, zoomIn, zoomOut } = useReactFlow()

  const buttonClass =
    'inline-flex size-6 items-center justify-center rounded text-ink-muted transition-colors hover:bg-canvas hover:text-ink'

  return (
    <FlowPanel
      position="top-right"
      className="!m-2 flex items-center gap-0.5 rounded-lg border border-line bg-white/95 p-0.5 shadow-sm backdrop-blur"
    >
      <button
        type="button"
        onClick={() => void zoomOut()}
        aria-label="Zoom out"
        title="Zoom out"
        className={buttonClass}
      >
        <ZoomOut aria-hidden="true" size={12} />
      </button>
      <button
        type="button"
        onClick={() => void zoomIn()}
        aria-label="Zoom in"
        title="Zoom in"
        className={buttonClass}
      >
        <ZoomIn aria-hidden="true" size={12} />
      </button>
      <span aria-hidden="true" className="mx-0.5 h-3.5 w-px bg-line" />
      <button
        type="button"
        onClick={() => void fitView({ padding: 0.12, duration: 250 })}
        aria-label="Fit graph to view"
        title="Fit graph to view"
        className="inline-flex h-6 items-center gap-1 rounded px-1.5 text-[9px] font-semibold text-ink-muted transition-colors hover:bg-canvas hover:text-ink"
      >
        <Maximize2 aria-hidden="true" size={11} />
        Fit
      </button>
    </FlowPanel>
  )
}

function GraphCanvas({
  system,
  selectedId,
  onSelect,
  analysis,
}: DependencyGraphProps) {
  const findingByComponentId = useMemo(
    () =>
      new Map(
        (analysis?.findings ?? []).map((finding) => [finding.componentId, finding]),
      ),
    [analysis],
  )
  const sourceComponentIds = useMemo(
    () => new Set(analysis?.sourceComponentIds ?? []),
    [analysis],
  )
  const pathEdgeKeys = useMemo(
    () => (analysis ? getAnalysisPathEdgeKeys(analysis) : new Set<string>()),
    [analysis],
  )

  const nodes = useMemo<ComponentFlowNode[]>(
    () =>
      system.components.map((component) => {
        const finding = findingByComponentId.get(component.id)
        const impact: ComponentImpactState | undefined = sourceComponentIds.has(component.id)
          ? { kind: 'source' }
          : finding
            ? {
                kind: finding.impactType,
                severity: finding.severity,
                score: finding.score,
              }
            : undefined
        const impactLabel = impact
          ? impact.kind === 'source'
            ? 'scenario source'
            : `${finding?.impactType} impact, ${finding?.severity} severity, score ${finding?.score}`
          : 'not affected by the latest analysis'

        return {
          id: component.id,
          type: 'component',
          position: graphLayout[component.id],
          data: { component, impact },
          selected: component.id === selectedId,
          draggable: false,
          ariaLabel: `${component.name}, ${component.criticality} criticality, ${impactLabel}`,
        }
      }),
    [findingByComponentId, selectedId, sourceComponentIds, system.components],
  )

  const edges = useMemo<Edge[]>(
    () =>
      system.dependencies.map((dependency) => {
        const isConnected = dependency.source === selectedId || dependency.target === selectedId
        const isImpactEdge =
          Boolean(analysis) &&
          pathEdgeKeys.has(getCausalPathEdgeKey(dependency.source, dependency.target))
        const isDimmed = analysis ? !isImpactEdge : !isConnected
        const color = isImpactEdge
          ? EDGE_IMPACT
          : dependency.inCycle
            ? EDGE_CYCLE
            : isConnected
              ? EDGE_ACTIVE
              : EDGE_IDLE

        return {
          id: dependency.id,
          source: dependency.source,
          target: dependency.target,
          type: dependency.inCycle ? 'cycle' : 'smoothstep',
          sourceHandle: dependency.inCycle ? 'cycle-out' : undefined,
          targetHandle: dependency.inCycle ? 'cycle-in' : undefined,
          data: dependency.inCycle ? { label: 'cycle' } : undefined,
          style: {
            stroke: color,
            strokeWidth: isImpactEdge ? 2.5 : isConnected && !analysis ? 2.1 : 1.35,
            strokeDasharray: dependency.inCycle ? '5 4' : undefined,
            opacity: isDimmed ? (analysis ? 0.18 : 0.42) : 1,
          },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            width: 14,
            height: 14,
            color,
          },
          focusable: false,
        }
      }),
    [analysis, pathEdgeKeys, selectedId, system.dependencies],
  )

  return (
    <div className="relative h-full w-full bg-[#f9fbfb]">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={NODE_TYPES}
        edgeTypes={EDGE_TYPES}
        onNodeClick={(_, node: Node) => onSelect(node.id as ComponentId)}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable
        nodesFocusable
        edgesFocusable={false}
        fitView
        fitViewOptions={{ padding: 0.12, maxZoom: 1.1 }}
        minZoom={0.3}
        maxZoom={1.6}
        proOptions={{ hideAttribution: true }}
        className="ripple-flow"
      >
        <Background variant={BackgroundVariant.Dots} gap={20} size={1.2} color="#d1dce1" />
        <GraphToolbar />
      </ReactFlow>
    </div>
  )
}

export function DependencyGraph({ className, ...props }: DependencyGraphProps) {
  const selectedComponent = props.system.components.find(
    (component) => component.id === props.selectedId,
  )
  const analysis = props.analysis
  const severityMeta = analysis ? ANALYSIS_SEVERITY_META[analysis.severity] : null

  return (
    <Panel className={cn('flex min-h-[470px] flex-col overflow-hidden', className)}>
      <PanelHeader
        icon={Network}
        title="Dependency map"
        description={
          analysis
            ? 'The last analysis highlights causal routes and affected components. Select any node to inspect it.'
            : 'A → B means a change in A can affect B. Select a node to trace its links.'
        }
        action={
          analysis ? (
            <div className="flex flex-wrap items-center justify-end gap-2 text-[9px] font-medium text-ink-subtle">
              <span className="font-semibold text-ink">{analysis.affectedComponentIds.length} affected</span>
              <span aria-hidden="true">·</span>
              <span className={severityMeta?.textClass}>{severityMeta?.label}</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-[9px] font-medium text-ink-subtle">
              <span>{props.system.components.length} nodes</span>
              <span aria-hidden="true">·</span>
              <span>{props.system.dependencies.length} links</span>
            </div>
          )
        }
      />
      <div className="min-h-0 flex-1">
        <ReactFlowProvider>
          <GraphCanvas {...props} />
        </ReactFlowProvider>
      </div>
      <footer className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-t border-line bg-white px-4 py-2.5">
        <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1">
          <span className="inline-flex items-center gap-1.5">
            <span className="grid size-5 shrink-0 place-items-center rounded border border-cycle/20 bg-cycle-soft text-cycle">
              <RefreshCw aria-hidden="true" size={10} />
            </span>
            <span className="text-[9.5px] font-semibold text-ink">Cycle modeled</span>
          </span>
          <span
            className="truncate text-[9px] text-ink-muted"
            title={getCyclePathLabel(props.system)}
          >
            {getCyclePathLabel(props.system)}
          </span>
          {analysis ? (
            <>
              <span aria-hidden="true" className="h-3.5 w-px bg-line" />
              <span className="inline-flex items-center gap-1.5 text-[8.5px] text-ink-muted">
                <span aria-hidden="true" className="h-0.5 w-3 rounded-full bg-brand" />
                Causal path
              </span>
              <span className="text-[8.5px] text-ink-muted">
                Direct {analysis.directComponentIds.length}
              </span>
              <span className="text-[8.5px] text-ink-muted">
                Indirect {analysis.indirectComponentIds.length}
              </span>
              <span className="inline-flex items-center gap-1.5 text-[8.5px] text-ink-muted">
                <span aria-hidden="true" className="size-1.5 rounded-full bg-brand" />
                {analysis.sourceComponentIds.length}{' '}
                {analysis.sourceComponentIds.length === 1 ? 'source' : 'sources'}
              </span>
            </>
          ) : null}
        </div>
        <span className="font-mono text-[8.5px] uppercase tracking-[0.08em] text-ink-subtle">
          {selectedComponent?.name ?? props.system.name} ·{' '}
          {analysis ? 'latest analysis' : 'baseline'}
        </span>
      </footer>
    </Panel>
  )
}
