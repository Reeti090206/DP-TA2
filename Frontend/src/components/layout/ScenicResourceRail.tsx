import {
  Activity,
  ArrowUpRight,
  Compass,
  GraduationCap,
  HelpCircle,
  Layers,
  Network,
} from 'lucide-react'
import { cn } from '../../lib/cn'

interface ScenicResourceRailProps {
  className?: string
}

export function ScenicResourceRail({ className }: ScenicResourceRailProps) {
  const resourceLinks = [
    {
      id: 'engine-health',
      icon: Activity,
      title: 'Engine Health & Status',
      description: 'Java 21 Core with Builder, Mediator, Strategy, Memento, & Template Method.',
      url: '/api/v1/simulations/health',
    },
    {
      id: 'model-api',
      icon: Network,
      title: 'System Model API',
      description: 'Inspect graph components and directed links via /api/v1/model.',
      url: '/api/v1/model',
    },
    {
      id: 'simulation-history',
      icon: Compass,
      title: 'Simulation History',
      description: 'Review executed what-if runs and comparisons via /api/v1/simulations.',
      url: '/api/v1/simulations',
    },
    {
      id: 'documentation',
      icon: HelpCircle,
      title: 'Architecture Docs',
      description: 'Explore full system patterns, Maven build, and scenario specs.',
      url: 'https://github.com/Reeti090206/DP-TA2',
    },
  ]

  return (
    <aside className={cn('flex flex-col gap-4 w-full xl:w-[260px] shrink-0', className)}>
      {/* Top 2 Quick Cards: Patterns & Architecture */}
      <div className="grid grid-cols-2 gap-3">
        <a
          href="https://github.com/Reeti090206/DP-TA2"
          target="_blank"
          rel="noreferrer"
          className="bento-card group flex flex-col items-center justify-center gap-2 rounded-[24px] bg-white p-5 border border-black/[0.05] shadow-bento text-center transition-all hover:bg-neutral-50"
        >
          <span className="grid size-10 place-items-center rounded-full bg-canvas text-[#141618] border border-black/5 group-hover:scale-110 transition-transform">
            <Layers size={18} strokeWidth={2} />
          </span>
          <span className="font-display text-xs font-bold text-[#141618]">5 Patterns</span>
        </a>

        <a
          href="https://github.com/Reeti090206/DP-TA2"
          target="_blank"
          rel="noreferrer"
          className="bento-card group flex flex-col items-center justify-center gap-2 rounded-[24px] bg-white p-5 border border-black/[0.05] shadow-bento text-center transition-all hover:bg-neutral-50"
        >
          <span className="grid size-10 place-items-center rounded-full bg-canvas text-[#141618] border border-black/5 group-hover:scale-110 transition-transform">
            <GraduationCap size={18} strokeWidth={2} />
          </span>
          <span className="font-display text-xs font-bold text-[#141618]">Java Core</span>
        </a>
      </div>

      {/* Stack of Resource Cards */}
      <div className="space-y-3">
        {resourceLinks.map((item) => {
          const Icon = item.icon
          return (
            <a
              key={item.id}
              href={item.url}
              target={item.url.startsWith('http') ? '_blank' : undefined}
              rel={item.url.startsWith('http') ? 'noreferrer' : undefined}
              className="bento-card group flex flex-col justify-between rounded-[24px] bg-white p-5 border border-black/[0.05] shadow-bento transition-all hover:bg-neutral-50"
            >
              <div className="flex items-center justify-between">
                <span className="grid size-8 place-items-center rounded-full bg-canvas text-[#141618] border border-black/5">
                  <Icon size={14} strokeWidth={2} />
                </span>
                <span className="text-neutral-400 group-hover:text-black group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all">
                  <ArrowUpRight size={16} strokeWidth={2.2} />
                </span>
              </div>

              <div className="mt-4">
                <h4 className="font-display text-xs font-bold text-[#141618] group-hover:text-black">
                  {item.title}
                </h4>
                <p className="mt-1 text-[11px] leading-[1.4] text-neutral-400 line-clamp-2">
                  {item.description}
                </p>
              </div>
            </a>
          )
        })}
      </div>
    </aside>
  )
}
