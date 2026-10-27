import { Boxes, GitBranch, Waypoints, Workflow, type LucideIcon } from 'lucide-react'
import { cn } from '../../lib/cn'
import type { ComponentType } from '../../types/domain'

const TYPE_ICONS: Record<ComponentType, LucideIcon> = {
  gateway: Waypoints,
  service: Boxes,
  integration: GitBranch,
  worker: Workflow,
}

interface ComponentTypeIconProps {
  type: ComponentType
  size?: number
  className?: string
}

export function ComponentTypeIcon({ type, size = 15, className }: ComponentTypeIconProps) {
  const Icon = TYPE_ICONS[type]

  return <Icon aria-hidden="true" size={size} strokeWidth={1.8} className={cn(className)} />
}
