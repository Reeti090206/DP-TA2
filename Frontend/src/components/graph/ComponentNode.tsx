import { Handle, Position, type Node, type NodeProps } from '@xyflow/react'
import { ComponentTypeIcon } from '../system/ComponentTypeIcon'
import { CRITICALITY_META, COMPONENT_TYPE_META } from '../../lib/componentPresentation'
import { ANALYSIS_SEVERITY_META } from '../../lib/analysisPresentation'
import { cn } from '../../lib/cn'
import type { AnalysisSeverity, SystemComponent } from '../../types/domain'

export interface ComponentImpactState {
  kind: 'source' | 'direct' | 'indirect'
  severity?: AnalysisSeverity
  score?: number
}

export type ComponentNodeData = {
  component: SystemComponent
  impact?: ComponentImpactState
} & Record<string, unknown>

export type ComponentFlowNode = Node<ComponentNodeData, 'component'>

export function ComponentNode({ data, selected }: NodeProps<ComponentFlowNode>) {
  const { component, impact } = data
  const criticality = CRITICALITY_META[component.criticality]
  const impactMeta = impact?.severity ? ANALYSIS_SEVERITY_META[impact.severity] : null
  const impactLabel = impact
    ? impact.kind === 'source'
      ? 'Scenario source'
      : `${impact.kind === 'direct' ? 'Direct' : 'Indirect'}${impact.severity ? ` · ${impactMeta?.label}` : ''}`
    : null

  return (
    <div
      title={`${component.name} · ${COMPONENT_TYPE_META[component.type].label} · ${criticality.label}${impactLabel ? ` · ${impactLabel}` : ''}`}
      className={cn(
        'w-[176px] overflow-hidden rounded-[20px] border bg-white text-left shadow-bento transition-all duration-200 hover:scale-[1.02]',
        selected
          ? 'border-[#181a1b] ring-2 ring-[#181a1b]/15 shadow-md'
          : impact?.kind === 'source'
            ? 'border-black ring-2 ring-[#ebff70]'
            : impactMeta
              ? impactMeta.borderClass
              : 'border-black/[0.08] hover:border-black/25',
      )}
    >
      <div aria-hidden="true" className={cn('h-[3.5px] w-full', criticality.barClass)} />
      <div className="flex items-start gap-2.5 px-3.5 py-3">
        <span
          className={cn(
            'mt-0.5 grid size-7 shrink-0 place-items-center rounded-xl border',
            selected
              ? 'border-black/10 bg-[#181a1b] text-[#ebff70]'
              : impactMeta
                ? `${impactMeta.borderClass} ${impactMeta.backgroundClass} ${impactMeta.textClass}`
                : 'border-black/5 bg-canvas text-ink',
          )}
        >
          <ComponentTypeIcon type={component.type} size={14} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[13px] font-bold leading-4 tracking-tight text-ink font-display">
            {component.name}
          </span>
          <span className="mt-0.5 block text-[8.5px] font-semibold uppercase tracking-[0.09em] text-ink-subtle">
            {COMPONENT_TYPE_META[component.type].label}
          </span>
        </span>
        {selected ? (
          <span
            aria-hidden="true"
            className="mt-1 size-1.5 shrink-0 rounded-full bg-brand shadow-[0_0_0_3px_rgba(15,118,110,0.12)]"
          />
        ) : null}
      </div>
      <div className="flex items-center justify-between border-t border-black/[0.05] bg-canvas/40 px-3.5 py-1.5">
        <span className="inline-flex items-center gap-1.5 text-[9px] font-semibold text-neutral-500">
          <span aria-hidden="true" className={cn('size-1.5 rounded-full', criticality.dotClass)} />
          {criticality.label}
        </span>
        {impact ? (
          <span
            className={cn(
              'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 font-mono text-[8px] font-semibold',
              impact.kind === 'source'
                ? 'border-lime-strong/30 bg-[#ebff70] text-[#141618]'
                : impactMeta
                  ? `${impactMeta.borderClass} ${impactMeta.backgroundClass} ${impactMeta.textClass}`
                  : 'border-black/5 bg-white text-ink-muted',
            )}
          >
            {impact.kind === 'source' ? 'Source' : impact.kind === 'direct' ? 'Direct' : 'Indirect'}
            {impact.score !== undefined ? ` ${impact.score}` : ''}
          </span>
        ) : (
          <span className="font-mono text-[9px] font-medium text-neutral-400">
            {component.supportedProperties.length} props
          </span>
        )}
      </div>

      <Handle type="target" position={Position.Left} isConnectable={false} />
      <Handle type="source" position={Position.Right} isConnectable={false} />
      <Handle
        id="cycle-in"
        type="target"
        position={Position.Bottom}
        isConnectable={false}
        style={{ left: '28%' }}
        className="!size-1.5 !border-white !bg-cycle/70"
      />
      <Handle
        id="cycle-out"
        type="source"
        position={Position.Bottom}
        isConnectable={false}
        style={{ left: '72%' }}
        className="!size-1.5 !border-white !bg-cycle/70"
      />
    </div>
  )
}
