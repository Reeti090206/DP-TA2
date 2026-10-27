import { ArrowUpRight, Boxes, GitBranch, RefreshCw, ShieldCheck } from 'lucide-react'
import { Badge } from '../ui/Badge'
import { Button } from '../ui/Button'
import { Panel, PanelHeader } from '../ui/Panel'
import type { DemoSystem } from '../../types/domain'

interface BaselineCardProps {
  system: DemoSystem
  onInspectSystem: () => void
}

export function BaselineCard({ system, onInspectSystem }: BaselineCardProps) {
  return (
    <Panel className="overflow-hidden">
      <PanelHeader
        icon={ShieldCheck}
        title="Baseline"
        description="The immutable reference for every comparison."
        action={
          <Badge tone="teal">
            Read-only
          </Badge>
        }
      />

      <div className="relative overflow-hidden px-4 py-4">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-14 -top-16 size-44 rounded-full border-[18px] border-brand-soft/50"
        />
        <div className="relative">
          <div className="flex items-start gap-3">
            <span className="grid size-10 shrink-0 place-items-center rounded-lg border border-brand-line bg-brand-soft text-brand-strong">
              <ShieldCheck aria-hidden="true" size={18} />
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-[15px] font-semibold tracking-[-0.015em] text-navy">
                  {system.name}
                </h3>
                <Badge tone="neutral">v{system.version}</Badge>
              </div>
              <p className="mt-1 max-w-xl text-[10.5px] leading-[1.65] text-ink-muted">
                {system.description}
              </p>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-2">
            <div className="rounded-lg border border-line bg-canvas/45 px-2.5 py-2">
              <div className="flex items-center gap-1 text-[8px] font-bold uppercase tracking-[0.09em] text-ink-subtle">
                <Boxes aria-hidden="true" size={9} />
                Components
              </div>
              <div className="mt-1 font-mono text-[13px] font-semibold text-navy">
                {system.components.length}
              </div>
            </div>
            <div className="rounded-lg border border-line bg-canvas/45 px-2.5 py-2">
              <div className="flex items-center gap-1 text-[8px] font-bold uppercase tracking-[0.09em] text-ink-subtle">
                <GitBranch aria-hidden="true" size={9} />
                Links
              </div>
              <div className="mt-1 font-mono text-[13px] font-semibold text-navy">
                {system.dependencies.length}
              </div>
            </div>
            <div className="rounded-lg border border-cycle/20 bg-cycle-soft/65 px-2.5 py-2">
              <div className="flex items-center gap-1 text-[8px] font-bold uppercase tracking-[0.09em] text-cycle">
                <RefreshCw aria-hidden="true" size={9} />
                Cycles
              </div>
              <div className="mt-1 font-mono text-[13px] font-semibold text-cycle">1</div>
            </div>
          </div>

          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-line pt-3">
            <div className="min-w-0">
              <div className="text-[8px] font-bold uppercase tracking-[0.09em] text-ink-subtle">
                Model version
              </div>
              <div className="mt-0.5 font-mono text-[9px] text-ink-muted">
                {system.modelVersion}
              </div>
            </div>
            <Button variant="secondary" size="sm" onClick={onInspectSystem}>
              Inspect graph
              <ArrowUpRight aria-hidden="true" size={12} />
            </Button>
          </div>
        </div>
      </div>
    </Panel>
  )
}
