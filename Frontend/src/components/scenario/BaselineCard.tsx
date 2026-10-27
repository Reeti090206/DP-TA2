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
          <div className="flex items-start gap-3.5">
            <span className="grid size-11 shrink-0 place-items-center rounded-full border border-black/10 bg-[#181a1b] text-[#ebff70] shadow-xs">
              <ShieldCheck aria-hidden="true" size={20} />
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-display text-base font-bold tracking-tight text-ink">
                  {system.name}
                </h3>
                <Badge tone="lime">v{system.version}</Badge>
              </div>
              <p className="mt-1 max-w-xl text-xs leading-relaxed text-ink-muted">
                {system.description}
              </p>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-2.5">
            <div className="rounded-[18px] border border-black/[0.06] bg-canvas/60 px-3.5 py-3">
              <div className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-wider text-neutral-400">
                <Boxes aria-hidden="true" size={11} />
                Components
              </div>
              <div className="mt-1 font-display text-xl font-bold text-ink">
                {system.components.length}
              </div>
            </div>
            <div className="rounded-[18px] border border-black/[0.06] bg-canvas/60 px-3.5 py-3">
              <div className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-wider text-neutral-400">
                <GitBranch aria-hidden="true" size={11} />
                Links
              </div>
              <div className="mt-1 font-display text-xl font-bold text-ink">
                {system.dependencies.length}
              </div>
            </div>
            <div className="rounded-[18px] border border-black/[0.06] bg-[#ebff70]/30 px-3.5 py-3">
              <div className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-wider text-ink">
                <RefreshCw aria-hidden="true" size={11} />
                Cycles
              </div>
              <div className="mt-1 font-display text-xl font-bold text-ink">1</div>
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
