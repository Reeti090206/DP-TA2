import { useEffect, useState } from 'react'
import {
  Activity,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  CircleDot,
  Cpu,
  ExternalLink,
  FlaskConical,
  Layers,
  Network,
  Server,
  X,
} from 'lucide-react'
import { BrandMark } from '../brand/BrandMark'
import { Badge } from '../ui/Badge'
import { Button } from '../ui/Button'
import { cn } from '../../lib/cn'
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
  const [modelModalOpen, setModelModalOpen] = useState(false)
  const [healthModalOpen, setHealthModalOpen] = useState(false)

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setModelModalOpen(false)
        setHealthModalOpen(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-black/[0.08] bg-[#edf1ea]/95 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-[1700px] items-center justify-between gap-3 px-3 sm:px-5 lg:px-7">
          {/* Left section: Brand & Primary Navigation */}
          <div className="flex min-w-0 items-center gap-2 sm:gap-4">
            <button
              type="button"
              onClick={() => onNavigate('impact')}
              className="flex shrink-0 items-center gap-2.5 text-left transition-opacity hover:opacity-90 cursor-pointer"
              title="RippleWhatIf - Deterministic Change Impact Simulator"
            >
              <div className="grid size-8.5 place-items-center rounded-lg bg-[#181a1b] text-[#ebff70] shadow-xs">
                <BrandMark className="size-[18px]" />
              </div>
              <div className="flex flex-col">
                <span className="font-display text-[15px] font-bold tracking-tight text-[#141618] leading-none">
                  Ripple<span className="text-lime-strong">WhatIf</span>
                </span>
                <span className="mt-0.5 text-[9px] font-mono font-medium text-neutral-500 uppercase tracking-wider leading-none hidden xs:inline">
                  Simulation Core
                </span>
              </div>
            </button>

            <div className="hidden h-5 w-px bg-black/10 sm:block" />

            {/* Primary Navigation Tabs */}
            <nav aria-label="Primary navigation" className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => onNavigate('impact')}
                aria-current={currentPage === 'impact' ? 'page' : undefined}
                className={cn(
                  'inline-flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-all cursor-pointer',
                  currentPage === 'impact'
                    ? 'bg-[#181a1b] text-white shadow-xs'
                    : 'text-neutral-600 hover:bg-black/[0.05] hover:text-black',
                )}
              >
                <Activity size={14} strokeWidth={2.2} />
                <span>Impact Explorer</span>
              </button>

              <button
                type="button"
                onClick={() => onNavigate('scenarios')}
                aria-current={currentPage === 'scenarios' ? 'page' : undefined}
                className={cn(
                  'inline-flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-all cursor-pointer',
                  currentPage === 'scenarios'
                    ? 'bg-[#181a1b] text-white shadow-xs'
                    : 'text-neutral-600 hover:bg-black/[0.05] hover:text-black',
                )}
              >
                <FlaskConical size={14} strokeWidth={2.2} />
                <span>Scenario Lab</span>
              </button>
            </nav>
          </div>

          {/* Right section: System Model info, Engine Health, Active Scenario, Docs */}
          <div className="flex min-w-0 items-center gap-2">
            {/* Added Item 1: Architecture Model Modal Trigger */}
            <button
              type="button"
              onClick={() => setModelModalOpen(true)}
              title="Inspect System Model (Topology & GoF Patterns)"
              className="hidden lg:inline-flex items-center gap-2 rounded-lg border border-black/[0.08] bg-white px-2.5 py-1 text-xs font-medium text-neutral-700 shadow-2xs transition-all hover:bg-neutral-50 hover:border-black/20 cursor-pointer"
            >
              <Network size={13} className="text-neutral-600" />
              <span>{system.components.length} Components</span>
              <span className="text-neutral-300">·</span>
              <span className="text-neutral-500 font-mono text-[11px]">{system.dependencies.length} Links</span>
            </button>

            {/* Added Item 2: Engine Health Status Button */}
            <button
              type="button"
              onClick={() => setHealthModalOpen(true)}
              title={
                backendConnected
                  ? 'Connected to RippleWhatIf Java 21 Spring Boot Engine (5 GoF Patterns Active)'
                  : 'Backend not detected on :8080. Operating in deterministic local simulation mode.'
              }
              className={cn(
                'inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-semibold shadow-2xs transition-all cursor-pointer',
                backendConnected
                  ? 'border-emerald-300/80 bg-emerald-50 text-emerald-900 hover:bg-emerald-100/70'
                  : 'border-black/[0.08] bg-white text-neutral-700 hover:bg-neutral-50',
              )}
            >
              {backendConnected ? (
                <>
                  <span className="relative flex size-2 shrink-0">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
                  </span>
                  <Server size={12} className="text-emerald-700 shrink-0" />
                  <span className="hidden sm:inline font-mono text-[11px]">Java 21 Live</span>
                  <span className="sm:hidden font-mono text-[11px]">Live</span>
                </>
              ) : (
                <>
                  <span className="size-2 rounded-full bg-neutral-400 shrink-0" />
                  <Cpu size={12} className="text-neutral-500 shrink-0" />
                  <span className="hidden sm:inline font-mono text-[11px]">Local Engine</span>
                  <span className="sm:hidden font-mono text-[11px]">Local</span>
                </>
              )}
            </button>

            {/* Active Scenario Quick Switcher */}
            <button
              type="button"
              onClick={() => onNavigate('scenarios')}
              aria-label={`Open Scenario Lab. Active scenario: ${activeScenario?.name ?? 'none selected'}`}
              className="group flex min-w-0 items-center gap-1.5 rounded-lg border border-black/[0.08] bg-white px-2.5 py-1 text-left shadow-2xs transition-all hover:bg-neutral-50 hover:border-black/20 cursor-pointer"
            >
              <CircleDot
                aria-hidden="true"
                size={12}
                className={activeScenario ? 'text-emerald-600' : 'text-neutral-400'}
              />
              <span className="hidden text-[10px] font-bold uppercase tracking-wider text-neutral-400 md:inline">
                Scenario:
              </span>
              <span
                className={cn(
                  'max-w-[110px] truncate text-xs font-medium sm:max-w-[150px]',
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

            {/* GitHub Documentation Link */}
            <a
              href="https://github.com/Reeti090206/DP-TA2"
              target="_blank"
              rel="noreferrer"
              title="View Source Code & Documentation on GitHub"
              aria-label="Documentation and GitHub repository"
              className="grid size-8 place-items-center rounded-lg border border-black/[0.08] bg-white text-neutral-600 shadow-2xs transition-all hover:bg-neutral-50 hover:text-black hover:border-black/20"
            >
              <BookOpen size={14} strokeWidth={2} />
            </a>
          </div>
        </div>
      </header>

      {/* Architecture Model Modal */}
      {modelModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/45 backdrop-blur-xs modal-backdrop"
            onClick={() => setModelModalOpen(false)}
          />
          <div className="relative z-10 w-full max-w-2xl rounded-2xl border border-black/10 bg-white p-6 shadow-2xl dialog-panel">
            <div className="flex items-start justify-between gap-4 border-b border-black/[0.06] pb-4">
              <div className="flex items-center gap-3">
                <div className="grid size-10 place-items-center rounded-xl bg-[#181a1b] text-[#ebff70]">
                  <Layers size={20} />
                </div>
                <div>
                  <h2 className="font-display text-base font-bold text-ink">
                    System Architecture & Model
                  </h2>
                  <p className="text-xs text-neutral-500">
                    {system.name} v{system.version} · Registered Topology
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setModelModalOpen(false)}
                className="grid size-7 place-items-center rounded-lg text-neutral-400 hover:bg-neutral-100 hover:text-black cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="mt-4 space-y-4 max-h-[65vh] overflow-y-auto pr-1">
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div className="rounded-xl border border-black/[0.06] bg-canvas/50 p-3 text-center">
                  <div className="font-mono text-lg font-bold text-ink">1</div>
                  <div className="text-[10px] font-semibold text-neutral-500 uppercase tracking-wider">Gateway</div>
                </div>
                <div className="rounded-xl border border-black/[0.06] bg-canvas/50 p-3 text-center">
                  <div className="font-mono text-lg font-bold text-ink">5</div>
                  <div className="text-[10px] font-semibold text-neutral-500 uppercase tracking-wider">Microservices</div>
                </div>
                <div className="rounded-xl border border-black/[0.06] bg-canvas/50 p-3 text-center">
                  <div className="font-mono text-lg font-bold text-ink">2</div>
                  <div className="text-[10px] font-semibold text-neutral-500 uppercase tracking-wider">Integrations</div>
                </div>
                <div className="rounded-xl border border-black/[0.06] bg-canvas/50 p-3 text-center">
                  <div className="font-mono text-lg font-bold text-ink">2</div>
                  <div className="text-[10px] font-semibold text-neutral-500 uppercase tracking-wider">Workers</div>
                </div>
              </div>

              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-500 mb-2">
                  Active GoF Design Patterns
                </h3>
                <div className="grid gap-2 sm:grid-cols-2">
                  <div className="rounded-xl border border-black/[0.06] bg-canvas/40 p-3">
                    <div className="flex items-center gap-1.5 font-semibold text-xs text-ink">
                      <CheckCircle2 size={13} className="text-emerald-600" />
                      Builder Pattern
                    </div>
                    <p className="mt-1 text-[11px] text-neutral-600">
                      <code>GraphModelBuilder</code> constructs deterministic immutable system topology with verified dependency links.
                    </p>
                  </div>

                  <div className="rounded-xl border border-black/[0.06] bg-canvas/40 p-3">
                    <div className="flex items-center gap-1.5 font-semibold text-xs text-ink">
                      <CheckCircle2 size={13} className="text-emerald-600" />
                      Mediator Pattern
                    </div>
                    <p className="mt-1 text-[11px] text-neutral-600">
                      <code>SimulationMediator</code> decouples components and manages cascading propagation signals across the network.
                    </p>
                  </div>

                  <div className="rounded-xl border border-black/[0.06] bg-canvas/40 p-3">
                    <div className="flex items-center gap-1.5 font-semibold text-xs text-ink">
                      <CheckCircle2 size={13} className="text-emerald-600" />
                      Strategy Pattern
                    </div>
                    <p className="mt-1 text-[11px] text-neutral-600">
                      Interchangeable propagation algorithms (Breadth-first vs. Weighted) and scoring policies.
                    </p>
                  </div>

                  <div className="rounded-xl border border-black/[0.06] bg-canvas/40 p-3">
                    <div className="flex items-center gap-1.5 font-semibold text-xs text-ink">
                      <CheckCircle2 size={13} className="text-emerald-600" />
                      Memento Pattern
                    </div>
                    <p className="mt-1 text-[11px] text-neutral-600">
                      <code>SystemSnapshotManager</code> captures baseline states and allows deterministic rollback of simulation runs.
                    </p>
                  </div>

                  <div className="rounded-xl border border-black/[0.06] bg-canvas/40 p-3 sm:col-span-2">
                    <div className="flex items-center gap-1.5 font-semibold text-xs text-ink">
                      <CheckCircle2 size={13} className="text-emerald-600" />
                      Template Method Pattern
                    </div>
                    <p className="mt-1 text-[11px] text-neutral-600">
                      <code>BaseImpactAnalyzer</code> standardizes the 5-step simulation pipeline (validate, snapshot, propagate, score, rollback).
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-5 flex justify-end gap-2 border-t border-black/[0.06] pt-4">
              <Button variant="secondary" size="sm" onClick={() => setModelModalOpen(false)}>
                Close
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  setModelModalOpen(false)
                  onNavigate('impact')
                }}
              >
                Explore Components in Graph
              </Button>
            </div>
          </div>
        </div>
      ) : null}

      {/* Engine Health Modal */}
      {healthModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/45 backdrop-blur-xs modal-backdrop"
            onClick={() => setHealthModalOpen(false)}
          />
          <div className="relative z-10 w-full max-w-lg rounded-2xl border border-black/10 bg-white p-6 shadow-2xl dialog-panel">
            <div className="flex items-start justify-between gap-4 border-b border-black/[0.06] pb-4">
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    'grid size-10 place-items-center rounded-xl',
                    backendConnected
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-neutral-100 text-neutral-700 border border-neutral-200',
                  )}
                >
                  <Server size={20} />
                </div>
                <div>
                  <h2 className="font-display text-base font-bold text-ink">
                    Simulation Engine Runtime
                  </h2>
                  <p className="text-xs text-neutral-500">
                    {backendConnected ? 'Java 21 Spring Boot Backend Connected' : 'Deterministic Local Engine Active'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setHealthModalOpen(false)}
                className="grid size-7 place-items-center rounded-lg text-neutral-400 hover:bg-neutral-100 hover:text-black cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="mt-4 space-y-3.5">
              <div className="flex items-center justify-between rounded-xl border border-black/[0.06] bg-canvas/40 px-3.5 py-2.5">
                <span className="text-xs font-medium text-neutral-600">Runtime Status</span>
                <Badge tone={backendConnected ? 'teal' : 'neutral'} dot>
                  {backendConnected ? 'Spring Boot 3.4.0 (Live)' : 'Local Fallback'}
                </Badge>
              </div>

              <div className="flex items-center justify-between rounded-xl border border-black/[0.06] bg-canvas/40 px-3.5 py-2.5">
                <span className="text-xs font-medium text-neutral-600">Backend Port / Base URL</span>
                <span className="font-mono text-xs font-semibold text-neutral-800">
                  {backendConnected ? 'http://localhost:8080/api/v1' : 'In-memory (Client)'}
                </span>
              </div>

              <div className="flex items-center justify-between rounded-xl border border-black/[0.06] bg-canvas/40 px-3.5 py-2.5">
                <span className="text-xs font-medium text-neutral-600">Language & Architecture</span>
                <span className="font-mono text-xs font-semibold text-neutral-800">
                  Java 21 LTS · Virtual Threads Ready
                </span>
              </div>

              <div className="rounded-xl border border-black/[0.06] bg-canvas/30 p-3">
                <div className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 mb-1.5">
                  Connected Endpoints
                </div>
                <div className="space-y-1 font-mono text-[11px] text-neutral-700">
                  <div className="flex items-center justify-between">
                    <span>POST /api/v1/simulations/analyze</span>
                    <Badge tone="teal">Ready</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>GET /api/v1/simulations/health</span>
                    <Badge tone="teal">Ready</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>GET /api/v1/model</span>
                    <Badge tone="teal">Ready</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>POST /api/v1/model/baseline/save</span>
                    <Badge tone="teal">Ready</Badge>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-5 flex items-center justify-between border-t border-black/[0.06] pt-4">
              <a
                href="https://github.com/Reeti090206/DP-TA2"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-600 hover:text-black"
              >
                GitHub Repo <ExternalLink size={12} />
              </a>
              <Button variant="secondary" size="sm" onClick={() => setHealthModalOpen(false)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  )
}
