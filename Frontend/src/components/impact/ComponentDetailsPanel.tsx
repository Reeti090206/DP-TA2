import { ArrowLeft, ArrowRight, Boxes, Info, Lock } from 'lucide-react'
import { Badge, type BadgeTone } from '../ui/Badge'
import { Panel, PanelHeader } from '../ui/Panel'
import { ComponentTypeIcon } from '../system/ComponentTypeIcon'
import {
  COMPONENT_TYPE_META,
  CRITICALITY_META,
} from '../../lib/componentPresentation'
import { formatPropertyValue } from '../../lib/format'
import {
  getComponentById,
  getIncomingDependencies,
  getOutgoingDependencies,
} from '../../lib/systemGraph'
import { cn } from '../../lib/cn'
import type {
  ComponentId,
  Criticality,
  DemoSystem,
  Dependency,
  SystemComponent,
} from '../../types/domain'

const CRITICALITY_TONE: Record<Criticality, BadgeTone> = {
  critical: 'red',
  high: 'amber',
  medium: 'blue',
  low: 'green',
}

interface ComponentDetailsPanelProps {
  system: DemoSystem
  component: SystemComponent
  onSelectComponent: (componentId: ComponentId) => void
  className?: string
}

interface DependencyLinkProps {
  dependency: Dependency
  direction: 'incoming' | 'outgoing'
  system: DemoSystem
  onSelectComponent: (componentId: ComponentId) => void
}

function DependencyLink({ dependency, direction, system, onSelectComponent }: DependencyLinkProps) {
  const relatedId = direction === 'incoming' ? dependency.source : dependency.target
  const relatedComponent = getComponentById(system, relatedId)
  const Icon = direction === 'incoming' ? ArrowLeft : ArrowRight

  return (
    <button
      type="button"
      onClick={() => onSelectComponent(relatedId)}
      className="group flex w-full items-start gap-2 rounded-md border border-transparent px-2 py-1.5 text-left transition-colors hover:border-line hover:bg-canvas/70"
    >
      <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded border border-line bg-white text-ink-subtle group-hover:text-brand">
        <Icon aria-hidden="true" size={10} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[10px] font-semibold text-ink">
          {relatedComponent.name}
        </span>
        <span className="mt-0.5 block truncate text-[8.5px] text-ink-subtle">
          {dependency.relationship}
        </span>
      </span>
    </button>
  )
}

export function ComponentDetailsPanel({
  system,
  component,
  onSelectComponent,
  className,
}: ComponentDetailsPanelProps) {
  const criticality = CRITICALITY_META[component.criticality]
  const incoming = getIncomingDependencies(system, component.id)
  const outgoing = getOutgoingDependencies(system, component.id)

  return (
    <Panel className={cn('overflow-hidden', className)}>
      <PanelHeader
        icon={Boxes}
        title="Component details"
        action={
          <Badge tone="neutral" className="gap-1">
            <Lock aria-hidden="true" size={9} />
            Baseline
          </Badge>
        }
      />

      <div className="space-y-4 p-4">
        <div className="flex items-start gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-lg border border-brand-line bg-brand-soft text-brand-strong">
            <ComponentTypeIcon type={component.type} size={18} />
          </span>
          <div className="min-w-0 flex-1">
            <h3 className="text-[15px] font-semibold tracking-[-0.015em] text-navy">
              {component.name}
            </h3>
            <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
              <Badge tone="neutral">{COMPONENT_TYPE_META[component.type].label}</Badge>
              <Badge tone={CRITICALITY_TONE[component.criticality]}>
                <span aria-hidden="true" className={cn('size-1.5 rounded-full', criticality.dotClass)} />
                {criticality.label}
              </Badge>
            </div>
          </div>
        </div>

        <p className="text-[10.5px] leading-[1.65] text-ink-muted">{component.description}</p>

        <dl className="grid grid-cols-2 gap-2">
          <div className="rounded-lg border border-line bg-canvas/55 px-2.5 py-2">
            <dt className="text-[8px] font-bold uppercase tracking-[0.11em] text-ink-subtle">
              Owner
            </dt>
            <dd className="mt-0.5 truncate text-[10.5px] font-semibold text-ink">{component.owner}</dd>
          </div>
          <div className="rounded-lg border border-line bg-canvas/55 px-2.5 py-2">
            <dt className="text-[8px] font-bold uppercase tracking-[0.11em] text-ink-subtle">
              Dependency links
            </dt>
            <dd className="mt-0.5 text-[10.5px] font-semibold text-ink">
              {incoming.length} in · {outgoing.length} out
            </dd>
          </div>
        </dl>

        <div>
          <div className="flex items-center justify-between">
            <h4 className="text-[9px] font-bold uppercase tracking-[0.12em] text-ink-subtle">
              Dependencies
            </h4>
            <span className="text-[8.5px] text-ink-subtle">Select to inspect</span>
          </div>
          <div className="mt-2 grid gap-3">
            <div>
              <div className="mb-1 flex items-center justify-between px-2">
                <span className="text-[9px] font-semibold text-ink-muted">Incoming</span>
                <span className="font-mono text-[8.5px] text-ink-subtle">{incoming.length}</span>
              </div>
              {incoming.length > 0 ? (
                <div className="space-y-0.5">
                  {incoming.map((dependency) => (
                    <DependencyLink
                      key={dependency.id}
                      dependency={dependency}
                      direction="incoming"
                      system={system}
                      onSelectComponent={onSelectComponent}
                    />
                  ))}
                </div>
              ) : (
                <p className="px-2 text-[9px] italic text-ink-subtle">No incoming dependencies.</p>
              )}
            </div>

            <div>
              <div className="mb-1 flex items-center justify-between px-2">
                <span className="text-[9px] font-semibold text-ink-muted">Outgoing</span>
                <span className="font-mono text-[8.5px] text-ink-subtle">{outgoing.length}</span>
              </div>
              {outgoing.length > 0 ? (
                <div className="space-y-0.5">
                  {outgoing.map((dependency) => (
                    <DependencyLink
                      key={dependency.id}
                      dependency={dependency}
                      direction="outgoing"
                      system={system}
                      onSelectComponent={onSelectComponent}
                    />
                  ))}
                </div>
              ) : (
                <p className="px-2 text-[9px] italic text-ink-subtle">No outgoing dependencies.</p>
              )}
            </div>
          </div>
        </div>

        <div>
          <h4 className="text-[9px] font-bold uppercase tracking-[0.12em] text-ink-subtle">
            Supported properties
          </h4>
          <div className="mt-2 overflow-hidden rounded-lg border border-line">
            {component.supportedProperties.map((property, index) => (
              <div
                key={property.key}
                title={property.description}
                className={cn(
                  'flex items-center justify-between gap-3 px-2.5 py-2',
                  index > 0 ? 'border-t border-line' : '',
                )}
              >
                <div className="min-w-0">
                  <div className="truncate text-[10px] font-semibold text-ink">{property.label}</div>
                  <div className="mt-0.5 font-mono text-[8px] text-ink-subtle">
                    {property.key} · {property.min}–{property.max}
                  </div>
                </div>
                <div className="shrink-0 text-right">
                  <div className="text-[10px] font-semibold text-navy">
                    {formatPropertyValue(property.defaultValue, property.unit)}
                  </div>
                  <div className="text-[8px] uppercase tracking-[0.08em] text-ink-subtle">baseline</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-2 rounded-lg border border-line bg-canvas/55 px-2.5 py-2 text-[9px] leading-4 text-ink-muted">
          <Info aria-hidden="true" size={12} className="mt-0.5 shrink-0 text-ink-subtle" />
          <p>
            Edits are scoped to a scenario. The baseline component model stays read-only.
          </p>
        </div>
      </div>
    </Panel>
  )
}
