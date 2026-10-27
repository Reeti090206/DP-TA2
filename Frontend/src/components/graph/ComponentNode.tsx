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
        'w-[170px] overflow-hidden rounded-[10px] border bg-white text-left shadow-[0_2px_8px_-3px_rgba(11,34,54,0.18)] transition-[border-color,box-shadow]',
        selected
          ? 'border-brand shadow-[0_0_0_3px_rgba(15,118,110,0.13),0_8px_22px_-12px_rgba(11,34,54,0.4)]'
          : impact?.kind === 'source'
            ? 'border-brand'
            : impactMeta
              ? impactMeta.borderClass
              : 'border-line-strong hover:border-brand-line',
      )}
    >
      <div aria-hidden="true" className={cn('h-[3px] w-full', criticality.barClass)} />
      <div className="flex items-start gap-2.5 px-3 py-2.5">
        <span
          className={cn(
            'mt-0.5 grid size-7 shrink-0 place-items-center rounded-md border',
            selected
              ? 'border-brand-line bg-brand-soft text-brand-strong'
              : impactMeta
                ? `${impactMeta.borderClass} ${impactMeta.backgroundClass} ${impactMeta.textClass}`
                : 'border-line bg-canvas text-ink-muted',
          )}
        >
          <ComponentTypeIcon type={component.type} size={14} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[13px] font-semibold leading-4 tracking-[-0.01em] text-navy">
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
      <div className="flex items-center justify-between border-t border-line/70 bg-canvas/55 px-3 py-1.5">
        <span className="inline-flex items-center gap-1.5 text-[8.5px] font-medium text-ink-muted">
          <span aria-hidden="true" className={cn('size-1.5 rounded-full', criticality.dotClass)} />
          {criticality.label}
        </span>
        {impact ? (
          <span
            className={cn(
              'inline-flex items-center gap-1 rounded border px-1 py-px font-mono text-[7.5px] font-semibold',
              impact.kind === 'source'
                ? 'border-brand-line bg-brand-soft text-brand-strong'
                : impactMeta
                  ? `${impactMeta.borderClass} ${impactMeta.backgroundClass} ${impactMeta.textClass}`
                  : 'border-line bg-canvas text-ink-muted',
            )}
          >
            {impact.kind === 'source' ? 'Source' : impact.kind === 'direct' ? 'Direct' : 'Indirect'}
            {impact.score !== undefined ? ` ${impact.score}` : ''}
          </span>
        ) : (
          <span className="font-mono text-[8.5px] text-ink-subtle">
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
