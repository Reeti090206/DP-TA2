import { FlaskConical, Network, type LucideIcon } from 'lucide-react'
import type { PageId } from '../types/navigation'

export interface NavItem {
  id: PageId
  label: string
  description: string
  icon: LucideIcon
}

export const NAV_ITEMS: NavItem[] = [
  {
    id: 'impact',
    label: 'Impact Explorer',
    description: 'Trace downstream effects',
    icon: Network,
  },
  {
    id: 'scenarios',
    label: 'Scenario Lab',
    description: 'Compare what-if models',
    icon: FlaskConical,
  },
]

export const PAGE_LABELS: Record<PageId, string> = {
  impact: 'Impact Explorer',
  scenarios: 'Scenario Lab',
}
