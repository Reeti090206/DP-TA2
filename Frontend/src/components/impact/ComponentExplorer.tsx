import { useMemo, useState } from 'react'
import { ChevronDown, ChevronRight, ListFilter, Search, X } from 'lucide-react'
import { Panel, PanelHeader } from '../ui/Panel'
import { EmptyState } from '../ui/EmptyState'
import { ComponentTypeIcon } from '../system/ComponentTypeIcon'
import {
  COMPONENT_TYPE_META,
  CRITICALITY_META,
  CRITICALITY_ORDER,
} from '../../lib/componentPresentation'
import { cn } from '../../lib/cn'
import type {
  ComponentId,
  ComponentType,
  Criticality,
  DemoSystem,
} from '../../types/domain'

type TypeFilter = ComponentType | 'all'
type CriticalityFilter = Criticality | 'all'

interface ComponentExplorerProps {
  system: DemoSystem
  selectedId: ComponentId
  onSelect: (componentId: ComponentId) => void
  className?: string
}

const TYPE_OPTIONS: Array<{ value: TypeFilter; label: string }> = [
  { value: 'all', label: 'All types' },
  { value: 'gateway', label: 'Gateway' },
  { value: 'service', label: 'Service' },
  { value: 'integration', label: 'Integration' },
  { value: 'worker', label: 'Async worker' },
]

const CRITICALITY_OPTIONS: Array<{ value: CriticalityFilter; label: string }> = [
  { value: 'all', label: 'All' },
  ...CRITICALITY_ORDER.map((criticality) => ({
    value: criticality,
    label: CRITICALITY_META[criticality].label,
  })),
]

const selectClass =
  'h-8.5 w-full appearance-none rounded-full border border-black/[0.08] bg-canvas/50 pl-3 pr-7 text-[11px] font-medium text-ink outline-none transition-all hover:border-black/20 focus:border-black focus:bg-white'

export function ComponentExplorer({
  system,
  selectedId,
  onSelect,
  className,
}: ComponentExplorerProps) {
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all')
  const [criticalityFilter, setCriticalityFilter] = useState<CriticalityFilter>('all')

  const filteredComponents = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase()

    return system.components.filter((component) => {
      const matchesSearch =
        normalizedSearch.length === 0 ||
        component.name.toLowerCase().includes(normalizedSearch) ||
        component.description.toLowerCase().includes(normalizedSearch)
      const matchesType = typeFilter === 'all' || component.type === typeFilter
      const matchesCriticality =
        criticalityFilter === 'all' || component.criticality === criticalityFilter

      return matchesSearch && matchesType && matchesCriticality
    })
  }, [criticalityFilter, search, system.components, typeFilter])

  const hasFilters = search.length > 0 || typeFilter !== 'all' || criticalityFilter !== 'all'

  const clearFilters = () => {
    setSearch('')
    setTypeFilter('all')
    setCriticalityFilter('all')
  }

  return (
    <Panel className={cn('flex flex-col overflow-hidden', className)}>
      <PanelHeader
        icon={ListFilter}
        title="Component explorer"
        description={`Browse ${system.components.length} nodes in ${system.name}.`}
        action={
          hasFilters ? (
            <button
              type="button"
              onClick={clearFilters}
              className="text-[9px] font-semibold text-brand transition-colors hover:text-brand-strong hover:underline"
            >
              Reset
            </button>
          ) : (
            <span className="rounded border border-line bg-canvas px-1.5 py-0.5 font-mono text-[8.5px] text-ink-muted">
              {system.components.length}
            </span>
          )
        }
      />

      <div className="space-y-2.5 border-b border-line px-3 py-3">
        <div className="relative">
          <Search
            aria-hidden="true"
            size={13}
            className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-ink-subtle"
          />
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search components..."
            aria-label="Search components"
            className="h-8.5 w-full rounded-full border border-black/[0.08] bg-canvas/50 pl-8 pr-7 text-[11px] text-ink outline-none transition-all placeholder:text-ink-subtle hover:border-black/20 focus:border-black focus:bg-white [&::-webkit-search-cancel-button]:hidden"
          />
          {search.length > 0 ? (
            <button
              type="button"
              onClick={() => setSearch('')}
              aria-label="Clear search"
              className="absolute right-1.5 top-1/2 grid size-5 -translate-y-1/2 place-items-center rounded text-ink-subtle transition-colors hover:bg-line/60 hover:text-ink"
            >
              <X aria-hidden="true" size={11} />
            </button>
          ) : null}
        </div>

        <div className="grid grid-cols-2 gap-2">
          <label className="block">
            <span className="mb-1 block text-[8.5px] font-bold uppercase tracking-[0.1em] text-ink-subtle">
              Type
            </span>
            <span className="relative block">
              <select
                value={typeFilter}
                onChange={(event) => setTypeFilter(event.target.value as TypeFilter)}
                className={selectClass}
              >
                {TYPE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <ChevronDown
                aria-hidden="true"
                size={10}
                className="pointer-events-none absolute right-1.5 top-1/2 -translate-y-1/2 text-ink-subtle"
              />
            </span>
          </label>

          <label className="block">
            <span className="mb-1 block text-[8.5px] font-bold uppercase tracking-[0.1em] text-ink-subtle">
              Criticality
            </span>
            <span className="relative block">
              <select
                value={criticalityFilter}
                onChange={(event) =>
                  setCriticalityFilter(event.target.value as CriticalityFilter)
                }
                className={selectClass}
              >
                {CRITICALITY_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <ChevronDown
                aria-hidden="true"
                size={10}
                className="pointer-events-none absolute right-1.5 top-1/2 -translate-y-1/2 text-ink-subtle"
              />
            </span>
          </label>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-2 scrollbar-subtle">
        <span role="status" className="sr-only">
          {filteredComponents.length} components shown
        </span>
        {filteredComponents.length === 0 ? (
          <EmptyState
            compact
            icon={Search}
            title="No matching components"
            description="Try a different name or loosen the type and criticality filters."
            action={
              <button
                type="button"
                onClick={clearFilters}
                className="text-[10px] font-semibold text-brand hover:underline"
              >
                Clear filters
              </button>
            }
          />
        ) : (
          <div className="space-y-0.5">
            {filteredComponents.map((component) => {
              const isSelected = component.id === selectedId
              const criticality = CRITICALITY_META[component.criticality]

              return (
                <button
                  key={component.id}
                  type="button"
                  onClick={() => onSelect(component.id)}
                  aria-pressed={isSelected}
                  className={cn(
                    'group flex w-full items-center gap-2.5 rounded-[16px] border px-3 py-2 text-left transition-all duration-150',
                    isSelected
                      ? 'border-black/15 bg-white shadow-xs scale-[1.01]'
                      : 'border-transparent hover:border-black/5 hover:bg-canvas/80',
                  )}
                >
                  <span
                    className={cn(
                      'grid size-8 shrink-0 place-items-center rounded-full border transition-all',
                      isSelected
                        ? 'border-black/10 bg-[#ebff70] text-black shadow-2xs'
                        : 'border-black/5 bg-white text-ink-muted group-hover:text-ink',
                    )}
                  >
                    <ComponentTypeIcon type={component.type} size={14} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[11.5px] font-semibold text-ink">
                      {component.name}
                    </span>
                    <span className="mt-0.5 flex items-center gap-1.5 text-[8.5px] text-ink-subtle">
                      <span>{COMPONENT_TYPE_META[component.type].shortLabel}</span>
                      <span aria-hidden="true">·</span>
                      <span className="inline-flex items-center gap-1">
                        <span aria-hidden="true" className={cn('size-1 rounded-full', criticality.dotClass)} />
                        {criticality.label}
                      </span>
                    </span>
                  </span>
                  <ChevronRight
                    aria-hidden="true"
                    size={11}
                    className={cn(
                      'shrink-0 transition-colors',
                      isSelected ? 'text-brand' : 'text-line-strong group-hover:text-ink-subtle',
                    )}
                  />
                </button>
              )
            })}
          </div>
        )}
      </div>

      <div className="border-t border-line bg-canvas/35 px-3 py-2.5">
        <div className="flex items-center justify-between">
          <span className="text-[8.5px] font-bold uppercase tracking-[0.1em] text-ink-subtle">
            Criticality legend
          </span>
          <span className="font-mono text-[8.5px] text-ink-subtle">
            {filteredComponents.length}/{system.components.length}
          </span>
        </div>
        <div className="mt-2 grid grid-cols-2 gap-x-2 gap-y-1.5">
          {CRITICALITY_ORDER.map((criticality) => {
            const meta = CRITICALITY_META[criticality]

            return (
              <span
                key={criticality}
                className="inline-flex items-center gap-1.5 text-[8.5px] text-ink-muted"
                title={meta.description}
              >
                <span aria-hidden="true" className={cn('size-1.5 rounded-full', meta.dotClass)} />
                {meta.label}
              </span>
            )
          })}
        </div>
      </div>
    </Panel>
  )
}
