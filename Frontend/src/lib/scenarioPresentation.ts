import type { BadgeTone } from '../components/ui/Badge'
import type { ScenarioStatus } from '../types/domain'

interface ScenarioStatusMeta {
  label: string
  tone: BadgeTone
  description: string
}

export const SCENARIO_STATUS_META: Record<ScenarioStatus, ScenarioStatusMeta> = {
  draft: {
    label: 'Draft',
    tone: 'neutral',
    description: 'No analysis has been run for this revision.',
  },
  analyzed: {
    label: 'Analyzed',
    tone: 'green',
    description: 'Analysis matches the current scenario revision.',
  },
  stale: {
    label: 'Stale',
    tone: 'amber',
    description: 'The scenario changed after its last analysis.',
  },
}
