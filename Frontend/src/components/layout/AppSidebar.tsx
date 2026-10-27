import { Boxes, GitBranch, LockKeyhole } from 'lucide-react'
import { BrandMark } from '../brand/BrandMark'
import { cn } from '../../lib/cn'
import { NAV_ITEMS } from '../../lib/navigation'
import { demoSystem } from '../../data/demoSystem'
import type { PageId } from '../../types/navigation'

interface AppSidebarProps {
  currentPage: PageId
  onNavigate: (page: PageId) => void
}

export function AppSidebar({ currentPage, onNavigate }: AppSidebarProps) {
  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-[248px] flex-col overflow-hidden border-r border-white/10 bg-navy lg:flex">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_0%_0%,rgba(45,212,191,0.12),transparent_45%)]"
      />

      <div className="relative flex min-h-0 flex-1 flex-col">
        <div className="px-5 pb-5 pt-5">
          <div className="flex items-center gap-3">
            <div className="grid size-9 shrink-0 place-items-center rounded-xl border border-brand-light/20 bg-brand-light/10 text-brand-light">
              <BrandMark className="size-[21px]" />
            </div>
            <div className="min-w-0">
              <div className="text-[15px] font-semibold tracking-[-0.02em] text-white">
                Ripple<span className="text-brand-light">WhatIf</span>
              </div>
              <div className="mt-0.5 text-[9.5px] font-medium uppercase tracking-[0.14em] text-white/35">
                Change impact studio
              </div>
            </div>
          </div>
        </div>

        <div className="px-3">
          <div className="rounded-xl border border-white/10 bg-white/[0.045] p-3.5">
            <div className="text-[9px] font-bold uppercase tracking-[0.16em] text-white/35">
              Current system
            </div>
            <div className="mt-1.5 flex items-center justify-between gap-2">
              <span className="truncate text-[12.5px] font-semibold text-white">{demoSystem.name}</span>
              <span className="rounded border border-brand-light/20 bg-brand-light/10 px-1.5 py-0.5 font-mono text-[9px] font-semibold text-brand-light">
                v{demoSystem.version}
              </span>
            </div>
            <div className="mt-2.5 flex items-center gap-3 text-[9.5px] text-white/40">
              <span className="inline-flex items-center gap-1">
                <Boxes aria-hidden="true" size={11} />
                {demoSystem.components.length} components
              </span>
              <span className="inline-flex items-center gap-1">
                <GitBranch aria-hidden="true" size={11} />
                {demoSystem.dependencies.length} links
              </span>
            </div>
          </div>
        </div>

        <div className="mt-6 px-3">
          <div className="px-2.5 pb-2 text-[9px] font-bold uppercase tracking-[0.16em] text-white/30">
            Workspace
          </div>
          <nav aria-label="Primary" className="space-y-1">
            {NAV_ITEMS.map((item) => {
              const isActive = currentPage === item.id
              const Icon = item.icon

              return (
                <button
                  key={item.id}
                  type="button"
                  aria-current={isActive ? 'page' : undefined}
                  onClick={() => onNavigate(item.id)}
                  className={cn(
                    'group relative flex w-full items-center gap-3 rounded-lg px-2.5 py-2.5 text-left transition-colors',
                    isActive
                      ? 'bg-white/[0.08] text-white'
                      : 'text-white/65 hover:bg-white/[0.05] hover:text-white',
                  )}
                >
                  {isActive ? (
                    <span
                      aria-hidden="true"
                      className="absolute inset-y-2.5 left-0 w-0.5 rounded-r-full bg-brand-light"
                    />
                  ) : null}
                  <span
                    className={cn(
                      'grid size-7 shrink-0 place-items-center rounded-md border transition-colors',
                      isActive
                        ? 'border-brand-light/15 bg-brand-light/10 text-brand-light'
                        : 'border-white/[0.06] bg-white/[0.04] text-white/45 group-hover:text-white/70',
                    )}
                  >
                    <Icon aria-hidden="true" size={14} strokeWidth={1.8} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[12.5px] font-medium tracking-[-0.005em]">
                      {item.label}
                    </span>
                    <span className="mt-0.5 block truncate text-[9.5px] text-white/35">
                      {item.description}
                    </span>
                  </span>
                  {isActive ? (
                    <span aria-hidden="true" className="size-1.5 shrink-0 rounded-full bg-brand-light" />
                  ) : null}
                </button>
              )
            })}
          </nav>
        </div>

        <div className="mt-auto px-3 pb-4 pt-6">
          <div className="rounded-xl border border-brand-light/15 bg-brand-light/[0.06] p-3.5">
            <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.11em] text-brand-light">
              <LockKeyhole aria-hidden="true" size={12} />
              Local demo mode
            </div>
            <p className="mt-1.5 text-[9.5px] leading-[1.65] text-white/40">
              Deterministic data stays in this browser. No backend is connected.
            </p>
          </div>
          <div className="mt-4 flex items-center justify-between px-1 text-[8.5px] uppercase tracking-[0.12em] text-white/25">
            <span>Prototype 0.1</span>
            <span className="font-mono normal-case tracking-normal">
              model {demoSystem.modelVersion.split('/')[1]}
            </span>
          </div>
        </div>
      </div>
    </aside>
  )
}
