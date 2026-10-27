import { TriangleAlert } from 'lucide-react'
import { getAnalysisStaleness } from '../../lib/scenarioState'
import {
  PROPAGATION_LABELS,
  SCORING_LABELS,
} from '../../lib/analysisPresentation'
import { cn } from '../../lib/cn'
import type { Scenario } from '../../types/domain'

interface StaleAnalysisNoticeProps {
  scenario: Scenario
  className?: string
}

export function StaleAnalysisNotice({ scenario, className }: StaleAnalysisNoticeProps) {
  const staleness = getAnalysisStaleness(scenario)

  if (!staleness.isStale || !scenario.analysis) {
    return null
  }

  const reason = staleness.revisionChanged
    ? staleness.settingsChanged
      ? 'The scenario and its analysis settings both changed after this result was calculated.'
      : 'The scenario changed after this result was calculated.'
    : 'The analysis strategy settings changed after this result was calculated.'

  return (
    <div
      role="status"
      className={cn(
        'flex items-start gap-2 rounded-lg border border-risk-high/25 bg-risk-high-soft px-2.5 py-2',
        className,
      )}
    >
      <TriangleAlert aria-hidden="true" size={13} className="mt-0.5 shrink-0 text-risk-high" />
      <div className="min-w-0">
        <p className="text-[9.5px] font-semibold text-risk-high">Analysis is out of date</p>
        <p className="mt-0.5 text-[9px] leading-4 text-risk-high/85">
          {reason} The stored result covers revision {scenario.analysis.scenarioRevision} with{' '}
          {PROPAGATION_LABELS[scenario.analysis.propagationStrategy]} propagation and{' '}
          {SCORING_LABELS[scenario.analysis.scoringStrategy]} scoring; the scenario is now at
          revision {scenario.revision} with{' '}
          {PROPAGATION_LABELS[scenario.analysisSettings.propagationStrategy]} propagation and{' '}
          {SCORING_LABELS[scenario.analysisSettings.scoringStrategy]} scoring. Rerun to refresh
          the results.
        </p>
      </div>
    </div>
  )
}
