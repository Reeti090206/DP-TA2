import {
  BookOpen,
  Globe,
  HelpCircle,
  Home,
  Layers,
  Link,
  MoreHorizontal,
  Network,
  Rocket,
  Sparkles,
} from 'lucide-react'
import { cn } from '../../lib/cn'
import type { PageId } from '../../types/navigation'

interface AppSidebarProps {
  currentPage: PageId
  onNavigate: (page: PageId) => void
}

export function AppSidebar({ currentPage, onNavigate }: AppSidebarProps) {
  const topNavItems = [
    {
      id: 'impact',
      label: 'Home / Impact Explorer',
      icon: Home,
      page: 'impact' as PageId,
    },
    {
      id: 'network',
      label: 'Architecture Graph',
      icon: Network,
      page: 'impact' as PageId,
    },
    {
      id: 'layers',
      label: 'Scenario Lab',
      icon: Layers,
      page: 'scenarios' as PageId,
    },
    {
      id: 'links',
      label: 'Dependencies',
      icon: Link,
      page: 'impact' as PageId,
    },
    {
      id: 'globe',
      label: 'System Model',
      icon: Globe,
      page: 'impact' as PageId,
    },
    {
      id: 'more',
      label: 'Workspace Options',
      icon: MoreHorizontal,
      page: 'scenarios' as PageId,
    },
  ]

  const bottomNavItems = [
    {
      id: 'docs',
      label: 'Documentation',
      icon: BookOpen,
      url: 'https://github.com/Reeti090206/DP-TA2',
    },
    {
      id: 'launch',
      label: 'Run Simulations',
      icon: Rocket,
      action: () => onNavigate('impact'),
    },
    {
      id: 'help',
      label: 'Support & Help',
      icon: HelpCircle,
      url: 'https://github.com/Reeti090206/DP-TA2',
    },
  ]

  return (
    <aside className="fixed left-3 top-3 bottom-3 z-40 hidden w-[68px] sm:w-[74px] flex-col items-center justify-between rounded-[30px] bg-[#161718] p-3.5 shadow-2xl lg:flex text-white border border-white/[0.08]">
      {/* Top Logo Mark with Sparkle */}
      <div className="flex flex-col items-center gap-6">
        <button
          type="button"
          onClick={() => onNavigate('impact')}
          title="RippleWhatIf - Change Impact Simulator"
          className="group relative grid size-11 place-items-center rounded-2xl bg-[#24272a] text-[#ebff70] shadow-sm transition-all hover:scale-110 hover:bg-[#2e3236] cursor-pointer"
        >
          <Sparkles size={20} strokeWidth={2.2} className="group-hover:rotate-12 transition-transform" />
        </button>

        {/* Navigation Icons Stack */}
        <nav aria-label="Main navigation" className="flex flex-col items-center gap-2">
          {topNavItems.map((item) => {
            const isActive =
              (item.id === 'impact' && currentPage === 'impact') ||
              (item.id === 'layers' && currentPage === 'scenarios')

            const Icon = item.icon

            return (
              <div key={item.id} className="relative group">
                <button
                  type="button"
                  onClick={() => onNavigate(item.page)}
                  aria-label={item.label}
                  className={cn(
                    'grid size-11 place-items-center rounded-2xl transition-all duration-200 cursor-pointer',
                    isActive
                      ? 'bg-[#292b2e] text-white shadow-sm scale-105'
                      : 'text-neutral-400 hover:bg-white/[0.08] hover:text-white hover:scale-105',
                  )}
                >
                  <Icon size={19} strokeWidth={isActive ? 2.2 : 1.8} />
                </button>

                {/* Tooltip on hover */}
                <div className="pointer-events-none absolute left-full ml-3 top-1/2 -translate-y-1/2 z-50 whitespace-nowrap rounded-full bg-[#181a1b] px-3 py-1.5 text-[11px] font-semibold text-white shadow-xl opacity-0 group-hover:opacity-100 transition-opacity border border-white/10">
                  {item.label}
                </div>
              </div>
            )
          })}
        </nav>
      </div>

      {/* Bottom Icons Stack */}
      <div className="flex flex-col items-center gap-2">
        {bottomNavItems.map((item) => {
          const Icon = item.icon
          return (
            <div key={item.id} className="relative group">
              {item.url ? (
                <a
                  href={item.url}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={item.label}
                  className="grid size-11 place-items-center rounded-2xl text-neutral-400 transition-all hover:bg-white/[0.08] hover:text-white hover:scale-105"
                >
                  <Icon size={19} strokeWidth={1.8} />
                </a>
              ) : (
                <button
                  type="button"
                  onClick={item.action}
                  aria-label={item.label}
                  className="grid size-11 place-items-center rounded-2xl text-neutral-400 transition-all hover:bg-white/[0.08] hover:text-white hover:scale-105 cursor-pointer"
                >
                  <Icon size={19} strokeWidth={1.8} />
                </button>
              )}

              {/* Tooltip on hover */}
              <div className="pointer-events-none absolute left-full ml-3 top-1/2 -translate-y-1/2 z-50 whitespace-nowrap rounded-full bg-[#181a1b] px-3 py-1.5 text-[11px] font-semibold text-white shadow-xl opacity-0 group-hover:opacity-100 transition-opacity border border-white/10">
                {item.label}
              </div>
            </div>
          )
        })}
      </div>
    </aside>
  )
}
