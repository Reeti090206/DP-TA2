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
    <header className="sticky top-0 z-30 border-b border-black/[0.05] bg-[#edf1ea]/90 backdrop-blur-md">
      <div className="flex h-14 items-center gap-3 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2.5 lg:hidden">
          <div className="grid size-8 place-items-center rounded-xl bg-[#181a1b] text-[#ebff70]">
            <BrandMark className="size-[18px]" />
          </div>
          <span className="text-[14px] font-bold tracking-tight text-[#141618] font-display">
            Ripple<span className="text-lime-strong">WhatIf</span>
          </span>
        </div>

        <div className="hidden items-center gap-2 text-xs lg:flex">
          <span className="font-semibold text-neutral-400">Workspace</span>
          <ChevronRight aria-hidden="true" size={13} className="text-neutral-300" />
          <span className="font-semibold text-ink font-display">{PAGE_LABELS[currentPage]}</span>
        </div>

        <div className="ml-auto flex min-w-0 items-center gap-2.5">
          <div className="hidden items-center gap-2 rounded-full border border-black/[0.06] bg-white px-3 py-1 shadow-2xs md:flex">
            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
              System
            </span>
            <span className="text-xs font-semibold text-ink">{system.name}</span>
            <span className="rounded-full bg-neutral-100 px-1.5 py-0.5 font-mono text-[9px] font-semibold text-neutral-600">
              v{system.version}
            </span>
          </div>

          <button
            type="button"
            onClick={() => onNavigate('scenarios')}
            aria-label={`Open Scenario Lab. Active scenario: ${activeScenario?.name ?? 'none selected'}`}
            className="group flex h-8 min-w-0 items-center gap-2 rounded-full border border-black/[0.06] bg-white px-3 text-left shadow-2xs transition-all hover:bg-neutral-50 hover:scale-[1.02] cursor-pointer"
          >
            <CircleDot
              aria-hidden="true"
              size={12}
              className={activeScenario ? 'text-emerald-500' : 'text-neutral-300'}
            />
            <span className="hidden text-[10px] font-bold uppercase tracking-wider text-neutral-400 sm:inline">
              Scenario:
            </span>
            <span
              className={cn(
                'max-w-[120px] truncate text-xs font-semibold',
                activeScenario ? 'text-ink' : 'text-neutral-400',
              )}
            >
              {activeScenario?.name ?? 'None selected'}
            </span>
            <ChevronRight
              aria-hidden="true"
              size={12}
              className="text-neutral-400 transition-transform group-hover:translate-x-0.5"
            />
          </button>

          {backendConnected ? (
            <span
              title="Connected to RippleWhatIf Java 21 Core Engine (Spring Boot: Builder, Mediator, Strategy, Memento, Template Method active)."
              className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 text-[10px] font-bold uppercase tracking-wider text-emerald-800 shadow-2xs"
            >
              <span className="relative flex size-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex size-2 rounded-full bg-emerald-500"></span>
              </span>
              <Server aria-hidden="true" size={12} className="text-emerald-700" />
              <span className="hidden sm:inline">Java Engine Live</span>
              <span className="sm:hidden">Live</span>
            </span>
          ) : (
            <span
              title="Backend not detected on :8080. Running in local browser simulation fallback mode."
              className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-full border border-black/[0.06] bg-white px-3 text-[10px] font-bold uppercase tracking-wider text-neutral-600 shadow-2xs"
            >
              <Activity aria-hidden="true" size={12} strokeWidth={2.2} className="text-emerald-600" />
              <span className="hidden sm:inline">Local Engine</span>
              <span className="sm:hidden">Local</span>
            </span>
          )}
        </div>
      </div>

      <nav
        aria-label="Primary"
        className="flex items-center gap-1.5 overflow-x-auto border-t border-black/[0.05] px-3 py-2 sm:px-4 lg:hidden"
      >
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
                'inline-flex shrink-0 items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all cursor-pointer',
                isActive
                  ? 'bg-[#181a1b] text-white shadow-xs'
                  : 'bg-white text-neutral-600 hover:bg-neutral-50 hover:text-black border border-black/[0.05]',
              )}
            >
              <Icon aria-hidden="true" size={13} strokeWidth={2} />
              {item.label}
            </button>
          )
        })}
      </nav>
    </header>
  )
}
