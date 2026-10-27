import {
  Activity,
  BookOpen,
  FlaskConical,
  Sparkles,
} from 'lucide-react'
import { cn } from '../../lib/cn'
import type { PageId } from '../../types/navigation'

interface AppSidebarProps {
  currentPage: PageId
  onNavigate: (page: PageId) => void
}

export function AppSidebar({ currentPage, onNavigate }: AppSidebarProps) {
  const navItems = [
    {
      id: 'impact',
      label: 'Impact Explorer',
      icon: Activity,
      page: 'impact' as PageId,
    },
    {
      id: 'scenarios',
      label: 'Scenario Lab',
      icon: FlaskConical,
      page: 'scenarios' as PageId,
    },
  ]

  return (
    <aside className="fixed left-3 top-3 bottom-3 z-40 hidden w-[64px] flex-col items-center justify-between rounded-[28px] bg-[#161718] p-3 shadow-2xl lg:flex text-white border border-white/[0.08]">
      {/* Top Logo Mark */}
      <div className="flex flex-col items-center gap-6">
        <button
          type="button"
          onClick={() => onNavigate('impact')}
          title="RippleWhatIf - Change Impact Simulator"
          className="group relative grid size-10 place-items-center rounded-2xl bg-[#24272a] text-[#ebff70] shadow-sm transition-all hover:scale-105 hover:bg-[#2e3236] cursor-pointer"
        >
          <Sparkles size={18} strokeWidth={2.2} className="group-hover:rotate-12 transition-transform" />
        </button>

        {/* Primary Navigation Icons */}
        <nav aria-label="Main navigation" className="flex flex-col items-center gap-2.5">
          {navItems.map((item) => {
            const isActive = item.page === currentPage
            const Icon = item.icon

            return (
              <div key={item.id} className="relative group">
                <button
                  type="button"
                  onClick={() => onNavigate(item.page)}
                  aria-label={item.label}
                  className={cn(
                    'grid size-10 place-items-center rounded-2xl transition-all duration-200 cursor-pointer',
                    isActive
                      ? 'bg-[#292b2e] text-[#ebff70] shadow-sm scale-105'
                      : 'text-neutral-400 hover:bg-white/[0.08] hover:text-white hover:scale-105',
                  )}
                >
                  <Icon size={18} strokeWidth={isActive ? 2.2 : 1.8} />
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

      {/* Bottom Documentation Link */}
      <div className="flex flex-col items-center">
        <div className="relative group">
          <a
            href="https://github.com/Reeti090206/DP-TA2"
            target="_blank"
            rel="noreferrer"
            aria-label="Documentation and GitHub repository"
            className="grid size-10 place-items-center rounded-2xl text-neutral-400 transition-all hover:bg-white/[0.08] hover:text-white hover:scale-105"
          >
            <BookOpen size={17} strokeWidth={1.8} />
          </a>

          {/* Tooltip on hover */}
          <div className="pointer-events-none absolute left-full ml-3 top-1/2 -translate-y-1/2 z-50 whitespace-nowrap rounded-full bg-[#181a1b] px-3 py-1.5 text-[11px] font-semibold text-white shadow-xl opacity-0 group-hover:opacity-100 transition-opacity border border-white/10">
            Documentation & Source
          </div>
        </div>
      </div>
    </aside>
  )
}
