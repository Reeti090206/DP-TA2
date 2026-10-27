import type { ComponentType, Criticality } from '../types/domain'

interface TypeMeta {
  label: string
  shortLabel: string
}

interface CriticalityMeta {
  label: string
  description: string
  dotClass: string
  badgeClass: string
  barClass: string
}

export const COMPONENT_TYPE_META: Record<ComponentType, TypeMeta> = {
  gateway: { label: 'Gateway', shortLabel: 'Gateway' },
  service: { label: 'Service', shortLabel: 'Service' },
  integration: { label: 'Integration', shortLabel: 'Integration' },
  worker: { label: 'Async worker', shortLabel: 'Worker' },
}

export const CRITICALITY_META: Record<Criticality, CriticalityMeta> = {
  critical: {
    label: 'Critical',
    description: 'Failure or degradation has system-wide customer impact.',
    dotClass: 'bg-risk-critical',
    badgeClass: 'border-risk-critical/20 bg-risk-critical-soft text-risk-critical',
    barClass: 'bg-risk-critical',
  },
  high: {
    label: 'High',
    description: 'Important revenue or fulfillment path with broad downstream use.',
    dotClass: 'bg-risk-high',
    badgeClass: 'border-risk-high/20 bg-risk-high-soft text-risk-high',
    barClass: 'bg-risk-high',
  },
  medium: {
    label: 'Medium',
    description: 'Supports customer communication or operational workflows.',
    dotClass: 'bg-risk-medium',
    badgeClass: 'border-risk-medium/20 bg-risk-medium-soft text-risk-medium',
    barClass: 'bg-risk-medium',
  },
  low: {
    label: 'Low',
    description: 'Insight and reporting path with limited direct customer impact.',
    dotClass: 'bg-risk-low',
    badgeClass: 'border-risk-low/20 bg-risk-low-soft text-risk-low',
    barClass: 'bg-risk-low',
  },
}

export const CRITICALITY_ORDER: Criticality[] = ['critical', 'high', 'medium', 'low']
