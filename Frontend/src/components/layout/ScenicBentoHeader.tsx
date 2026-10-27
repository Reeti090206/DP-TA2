import { useState } from 'react'
import {
  ArrowUpRight,
  MoreVertical,
  Plus,
  RefreshCw,
  Settings,
} from 'lucide-react'
import { cn } from '../../lib/cn'
import type { DemoSystem, Scenario } from '../../types/domain'
import type { PageId } from '../../types/navigation'

interface ScenicBentoHeaderProps {
  currentPage: PageId
  system: DemoSystem
  activeScenario?: Scenario
  scenariosCount: number
  snapshotsCount: number
  backendConnected: boolean
  onNavigate: (page: PageId) => void
  onOpenCreateScenario: () => void
}

export function ScenicBentoHeader({
  currentPage,
  system,
  activeScenario,
  scenariosCount,
  snapshotsCount,
  backendConnected,
  onNavigate,
  onOpenCreateScenario,
}: ScenicBentoHeaderProps) {
  const [activeTab, setActiveTab] = useState<string>(
    currentPage === 'impact' ? 'explorer' : 'scenarios',
  )
  const [settingsOpen, setSettingsOpen] = useState(false)

  const analysis = activeScenario?.analysis

  const tabs = [
    { id: 'explorer', label: 'Impact Explorer', page: 'impact' as PageId },
    { id: 'scenarios', label: `Scenario Lab (${scenariosCount})`, page: 'scenarios' as PageId },
    { id: 'components', label: 'Components', page: 'impact' as PageId },
    { id: 'dependencies', label: 'Dependencies', page: 'impact' as PageId },
    { id: 'propagation', label: 'Propagation', page: 'impact' as PageId },
    { id: 'scoring', label: 'Risk Scoring', page: 'impact' as PageId },
    { id: 'snapshots', label: `Snapshots (${snapshotsCount})`, page: 'scenarios' as PageId },
    { id: 'export', label: 'Workspace Export', page: 'scenarios' as PageId },
  ]

  const handleTabClick = (tabId: string, page: PageId) => {
    setActiveTab(tabId)
    onNavigate(page)
  }

  return (
    <div className="space-y-6">
      {/* Top Header Row: Headline and Action Buttons */}
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between pt-1">
        <div>
          <h1 className="font-display text-[32px] sm:text-[42px] lg:text-[46px] font-bold tracking-[-0.035em] text-[#141618] leading-[1.12]">
            Managing{' '}
            <span className="inline-flex size-8 sm:size-9 items-center justify-center rounded-full bg-white border border-black/[0.07] shadow-xs align-middle mx-1.5 -mt-1 text-sm">
              ⚙️
            </span>{' '}
            Your Architecture
            <br className="hidden sm:inline" />
            {' '}and{' '}
            <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full bg-[#ebff70] text-[#141618] text-xs sm:text-sm font-bold align-middle mx-1.5 -mt-1 border border-[#cbe62e]/40 shadow-xs">
              ✨
            </span>{' '}
            Workflows
          </h1>
        </div>

        <div className="flex items-center gap-3 self-start lg:self-center">
          {/* Settings circular button */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setSettingsOpen(!settingsOpen)}
              title="System & Architecture Settings"
              className="flex size-11 items-center justify-center rounded-full bg-white border border-black/[0.08] text-ink shadow-xs transition-all hover:bg-neutral-50 hover:scale-105 active:scale-95 cursor-pointer"
            >
              <Settings size={18} strokeWidth={1.8} className="text-[#141618]" />
            </button>

            {settingsOpen && (
              <div className="absolute right-0 top-13 z-50 w-72 rounded-[22px] border border-black/10 bg-white p-4 shadow-xl animate-in fade-in zoom-in-95 duration-150">
                <div className="flex items-center justify-between pb-3 border-b border-black/5">
                  <span className="text-xs font-bold text-ink font-display">System Model Info</span>
                  <span className="font-mono text-[10px] text-ink-muted">v{system.version}</span>
                </div>
                <div className="mt-3 space-y-2 text-xs">
                  <div className="flex justify-between text-ink-muted">
                    <span>Model:</span>
                    <span className="font-semibold text-ink">{system.name}</span>
                  </div>
                  <div className="flex justify-between text-ink-muted">
                    <span>Components:</span>
                    <span className="font-semibold text-ink">{system.components.length} nodes</span>
                  </div>
                  <div className="flex justify-between text-ink-muted">
                    <span>Dependencies:</span>
                    <span className="font-semibold text-ink">{system.dependencies.length} links</span>
                  </div>
                  <div className="flex justify-between text-ink-muted">
                    <span>Backend Status:</span>
                    <span className={cn('font-semibold', backendConnected ? 'text-emerald-600' : 'text-neutral-500')}>
                      {backendConnected ? 'Java 21 Live (:8080)' : 'Local Engine'}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* + Create a New Scenario black pill button */}
          <button
            type="button"
            onClick={onOpenCreateScenario}
            className="flex items-center gap-2 rounded-full bg-[#181a1b] px-6 py-3 text-xs sm:text-sm font-semibold text-white shadow-sm transition-all hover:bg-black hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
          >
            <Plus size={16} strokeWidth={2.2} />
            <span>Create a New Scenario</span>
          </button>
        </div>
      </div>

      {/* Pill Navigation Bar (Category Tabs) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-subtle">
        {tabs.map((tab) => {
          const isActive =
            (tab.page === currentPage && activeTab === tab.id) ||
            (tab.id === 'explorer' && currentPage === 'impact' && activeTab === 'explorer') ||
            (tab.id === 'scenarios' && currentPage === 'scenarios' && activeTab === 'scenarios')

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => handleTabClick(tab.id, tab.page)}
              className={cn(
                'shrink-0 rounded-full px-5 py-2 text-xs font-semibold transition-all duration-150 cursor-pointer',
                isActive
                  ? 'bg-[#181a1b] text-white shadow-xs scale-[1.01]'
                  : 'bg-white hover:bg-neutral-50 text-neutral-600 hover:text-black border border-black/[0.06] shadow-2xs hover:scale-[1.01]',
              )}
            >
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Bento Metric Cards Row (3 Cards matching the exact layout) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
        {/* Card 1: "System Architecture" / Live Components & Dependencies */}
        <div className="bento-card rounded-[28px] bg-white p-6 border border-black/[0.05] shadow-bento flex flex-col justify-between min-h-[200px]">
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="grid size-7 place-items-center rounded-full bg-canvas text-ink border border-black/5">
                  <Settings size={14} strokeWidth={2} />
                </span>
                <span className="text-sm font-semibold text-ink font-display">System Architecture</span>
              </div>
              <button
                type="button"
                onClick={() => setSettingsOpen(!settingsOpen)}
                className="text-neutral-400 hover:text-neutral-700 transition-colors p-1"
                aria-label="Options"
              >
                <MoreVertical size={16} />
              </button>
            </div>

            <div className="mt-5 flex items-baseline justify-between">
              <div className="flex items-baseline gap-1.5">
                <span className="font-display text-4xl sm:text-[42px] font-bold tracking-tight text-[#141618]">
                  {system.components.length}
                </span>
                <span className="text-xs font-medium text-neutral-400">
                  / {system.dependencies.length} Links
                </span>
              </div>

              {/* Status Badge */}
              <div className="flex items-center gap-1.5 rounded-full bg-[#ebff70] px-2.5 py-0.5 text-xs font-bold text-[#141618] border border-[#d6ee38]/40 shadow-2xs">
                <span>{backendConnected ? 'Java 21 Live' : 'v' + system.version}</span>
                <span className="size-2 rounded-full border border-black/60 inline-block" />
              </div>
            </div>
          </div>

          {/* Segmented Capsule Progress Bar */}
          <div className="mt-6 flex items-center gap-1.5">
            {[...Array(10)].map((_, idx) => (
              <div
                key={idx}
                className={cn(
                  'h-8 w-full max-w-[24px] rounded-full transition-all duration-300',
                  idx < Math.min(10, Math.max(1, Math.round((system.components.length / 12) * 10)))
                    ? 'bg-[#181a1b]'
                    : 'border-2 border-dashed border-neutral-300 bg-neutral-50/50',
                )}
              />
            ))}
          </div>
        </div>

        {/* Card 2: "Simulated Risk Score" / Live Ripple Impact */}
        <div className="bento-card rounded-[28px] bg-[#ebff70] p-6 shadow-bento flex flex-col justify-between min-h-[200px] border border-[#d5ec3e]/30">
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="grid size-7 place-items-center rounded-full bg-black/10 text-[#141618]">
                  <RefreshCw size={14} strokeWidth={2.2} />
                </span>
                <span className="text-sm font-bold text-[#141618] font-display">Simulated Risk</span>
              </div>
              <button
                type="button"
                className="text-black/40 hover:text-black transition-colors p-1"
                aria-label="Options"
              >
                <MoreVertical size={16} />
              </button>
            </div>

            <div className="mt-5 flex items-baseline justify-between">
              <div className="flex items-baseline gap-1.5">
                <span className="font-display text-4xl sm:text-[42px] font-bold tracking-tight text-[#141618]">
                  {analysis ? Math.round(analysis.overallScore) : 0}
                </span>
                <span className="text-xs font-semibold text-[#141618]/60">
                  / 100 Score
                </span>
              </div>

              {/* Severity Badge */}
              <div className="flex items-center gap-1.5 rounded-full bg-white px-2.5 py-0.5 text-xs font-bold text-[#141618] shadow-xs">
                <span>{analysis ? analysis.severity.toUpperCase() : 'BASELINE'}</span>
                <span className="size-2 rounded-full border border-black/60 inline-block" />
              </div>
            </div>
          </div>

          {/* Segmented Capsule Progress Bar */}
          <div className="mt-6 flex items-center gap-1.5">
            {[...Array(10)].map((_, idx) => (
              <div
                key={idx}
                className={cn(
                  'h-8 w-full max-w-[24px] rounded-full transition-all duration-300',
                  idx < Math.round((analysis ? analysis.overallScore : 0) / 10)
                    ? 'bg-[#181a1b]'
                    : 'border-2 border-dashed border-[#181a1b]/25 bg-transparent',
                )}
              />
            ))}
          </div>
        </div>

        {/* Card 3: "Take Your Automation / Simulation to the Next Level" */}
        <div className="bento-card rounded-[28px] bg-[#181a1b] p-6 text-white shadow-bento flex flex-col justify-between min-h-[200px] relative overflow-hidden group md:col-span-2 lg:col-span-1">
          {/* Subtle background glow */}
          <div
            aria-hidden="true"
            className="absolute -right-10 -bottom-10 size-48 rounded-full bg-[#ebff70]/10 blur-2xl pointer-events-none group-hover:bg-[#ebff70]/18 transition-all duration-500"
          />

          {/* Glowing futuristic avatar / visual artwork on right */}
          <div className="absolute right-4 top-4 bottom-4 w-28 pointer-events-none opacity-85 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500 flex items-center justify-center">
            <div className="relative">
              <div className="size-20 rounded-full bg-gradient-to-tr from-[#ebff70]/30 to-emerald-400/20 blur-md" />
              <div className="absolute inset-0 flex items-center justify-center text-4xl">
                🤖
              </div>
            </div>
          </div>

          <div className="relative z-10 max-w-[62%]">
            <h3 className="font-display text-lg sm:text-xl font-bold leading-tight text-white flex items-center gap-1.5">
              <span>Take Your Automation to the Next Level</span>
              <ArrowUpRight size={18} className="text-[#ebff70] inline shrink-0" />
            </h3>
            <p className="mt-1.5 text-xs text-neutral-400 line-clamp-2">
              Model interconnected dependencies, run BFS/Weighted ripple impact, and preserve checkpoints.
            </p>
          </div>

          <div className="relative z-10 mt-6 flex items-center gap-3">
            <button
              type="button"
              onClick={() => onNavigate(currentPage === 'impact' ? 'scenarios' : 'impact')}
              className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2 text-xs font-bold text-[#141618] shadow-sm transition-all hover:bg-[#ebff70] hover:scale-105 active:scale-95 cursor-pointer"
            >
              <span>{currentPage === 'impact' ? 'Scenario Lab' : 'Impact Explorer'}</span>
              <span className="text-sm">▷</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
