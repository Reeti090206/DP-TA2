import { Activity, ChevronRight, CircleDot, Server } from 'lucide-react'
import { BrandMark } from '../brand/BrandMark'
import { cn } from '../../lib/cn'
import { NAV_ITEMS, PAGE_LABELS } from '../../lib/navigation'
import type { DemoSystem, Scenario } from '../../types/domain'
import type { PageId } from '../../types/navigation'

interface TopBarProps {
  currentPage: PageId
  system: DemoSystem
  activeScenario?: Scenario
  backendConnected?: boolean
  onNavigate: (page: PageId) => void
}

export function TopBar({
  currentPage,
  system,
  activeScenario,
  backendConnected = false,
  onNavigate,
}: TopBarProps) {
  return (
    <header className="sticky top-0 z-30 border-b border-line bg-white/95 backdrop-blur-md">
      <div className="flex h-16 items-center gap-3 px-4 sm:px-6 lg:px-7">
        <div className="flex items-center gap-2.5 lg:hidden">
          <div className="grid size-8 place-items-center rounded-lg bg-navy text-brand-light">
            <BrandMark className="size-[18px]" />
          </div>
          <span className="text-[13px] font-semibold tracking-[-0.02em] text-navy">
            Ripple<span className="text-brand">WhatIf</span>
          </span>
        </div>

        <div className="hidden items-center gap-2 text-[10px] lg:flex">
          <span className="font-semibold uppercase tracking-[0.13em] text-ink-subtle">Workspace</span>
          <ChevronRight aria-hidden="true" size={12} className="text-line-strong" />
          <span className="font-medium text-ink">{PAGE_LABELS[currentPage]}</span>
        </div>

        <div className="ml-auto flex min-w-0 items-center gap-2">
          <div className="hidden items-center gap-1.5 rounded-lg border border-line bg-canvas/60 px-2.5 py-1.5 md:flex">
            <span className="text-[8.5px] font-bold uppercase tracking-[0.12em] text-ink-subtle">
              System
            </span>
            <span className="text-[10.5px] font-semibold text-ink">{system.name}</span>
            <span className="rounded border border-line bg-white px-1 py-0.5 font-mono text-[8.5px] text-ink-muted">
              v{system.version}
            </span>
          </div>

          <button
            type="button"
            onClick={() => onNavigate('scenarios')}
            aria-label={`Open Scenario Lab. Active scenario: ${activeScenario?.name ?? 'none selected'}`}
            className="group flex h-8 min-w-0 items-center gap-1.5 rounded-lg border border-line bg-white px-2.5 text-left shadow-sm transition-colors hover:border-brand-line hover:bg-brand-soft/40"
          >
            <CircleDot
              aria-hidden="true"
              size={12}
              className={activeScenario ? 'text-brand' : 'text-line-strong'}
            />
            <span className="hidden text-[8.5px] font-bold uppercase tracking-[0.1em] text-ink-subtle sm:inline">
              Scenario
            </span>
            <span
              className={cn(
                'max-w-[104px] truncate text-[10.5px] font-semibold',
                activeScenario ? 'text-ink' : 'text-ink-muted',
              )}
            >
              {activeScenario?.name ?? 'None selected'}
            </span>
            <ChevronRight
              aria-hidden="true"
              size={11}
              className="text-ink-subtle transition-transform group-hover:translate-x-0.5"
            />
          </button>

          {backendConnected ? (
            <span
              title="Connected to RippleWhatIf Java 21 Core Engine (Spring Boot: Builder, Mediator, Strategy, Memento, Template Method active)."
              className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 text-[8.5px] font-bold uppercase tracking-[0.12em] text-emerald-800 shadow-sm"
            >
              <span className="relative flex size-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex size-2 rounded-full bg-emerald-500"></span>
              </span>
              <Server aria-hidden="true" size={11} className="text-emerald-700" />
              <span className="hidden sm:inline">Java Engine Live</span>
              <span className="sm:hidden">Java Live</span>
            </span>
          ) : (
            <span
              title="Backend not detected on :8080. Running in local browser simulation fallback mode."
              className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-full border border-brand-line bg-brand-soft px-2.5 text-[8.5px] font-bold uppercase tracking-[0.12em] text-brand-strong"
            >
              <Activity aria-hidden="true" size={11} strokeWidth={2} />
              <span className="hidden sm:inline">Local Engine</span>
              <span className="sm:hidden">Local</span>
            </span>
          )}
        </div>
      </div>

      <nav
        aria-label="Primary"
        className="flex items-center gap-1 overflow-x-auto border-t border-line px-3 py-1.5 sm:px-4 lg:hidden"
      >
        <div className="mr-auto hidden items-center gap-1.5 pl-1 text-[9.5px] text-ink-muted sm:flex">
          <span className="font-semibold text-ink">{system.name}</span>
          <span aria-hidden="true" className="text-line-strong">/</span>
          <span className="font-mono">v{system.version}</span>
        </div>
        {NAV_ITEMS.map((item) => {
          const isActive = item.id === currentPage
          const Icon = item.icon

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onNavigate(item.id)}
              aria-current={isActive ? 'page' : undefined}
              className={cn(
                'inline-flex shrink-0 items-center gap-1.5 rounded-md px-2.5 py-1.5 text-[10.5px] font-medium transition-colors',
                isActive
                  ? 'bg-brand-soft text-brand-strong'
                  : 'text-ink-muted hover:bg-canvas hover:text-ink',
              )}
            >
              <Icon aria-hidden="true" size={13} strokeWidth={1.9} />
              {item.label}
            </button>
          )
        })}
      </nav>
    </header>
  )
}
