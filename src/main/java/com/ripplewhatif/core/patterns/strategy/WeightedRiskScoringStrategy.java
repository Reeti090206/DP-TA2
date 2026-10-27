package com.ripplewhatif.core.patterns.strategy;

import com.ripplewhatif.core.domain.change.ChangeRequest;
import com.ripplewhatif.core.domain.model.Component;
import com.ripplewhatif.core.domain.model.SystemModel;
import com.ripplewhatif.core.domain.result.ImpactRecord;

/**
 * <b>Strategy Implementation:</b> Weighted multi-factor risk scoring strategy.
 *
 * <p><b>Formula:</b>
 * <pre>
 *   OverallRisk = clamp(
 *       0.40 * DirectImpactScore +
 *       0.35 * MeanIndirectImpactScore +
 *       0.15 * CriticalityExposurePenalty +
 *       0.10 * ArchitectureBlastRadiusPenalty,
 *       0.0, 100.0
 *   )
 * </pre>
 *
 * <p><i>Disclaimer:</i> This is a simulation heuristic estimate based on configured model parameters
 * and not an empirical real-world operational prediction.
 */
public class WeightedRiskScoringStrategy implements RiskScoringStrategy {

    @Override
    public String getName() {
        return "Weighted Multi-Factor Risk Strategy";
    }

    @Override
    public String getFormulaDocumentation() {
        return "OverallRisk = clamp(0.40 * DirectScore + 0.35 * MeanIndirectScore + " +
                "0.15 * CriticalityExposurePenalty + 0.10 * BlastRadiusRatio * 100, 0.0, 100.0)";
    }

    @Override
    public double calculateRiskScore(SystemModel model,
                                     ChangeRequest request,
                                     ImpactPropagationStrategy.PropagationResult propagationResult) {
        String directId = request.getTargetComponentId();
        ImpactRecord directRecord = propagationResult.impactRecords().get(directId);
        double directScore = (directRecord != null) ? directRecord.getImpactScore() : 0.0;

        // Mean indirect score
        double indirectSum = 0.0;
        int indirectCount = propagationResult.indirectlyAffected().size();
        for (String id : propagationResult.indirectlyAffected()) {
            ImpactRecord record = propagationResult.impactRecords().get(id);
            if (record != null) {
                indirectSum += record.getImpactScore();
            }
        }
        double meanIndirectScore = (indirectCount > 0) ? (indirectSum / indirectCount) : 0.0;

        // Criticality exposure penalty
        double totalCriticalityWeight = 0.0;
        for (String id : propagationResult.impactRecords().keySet()) {
            Component c = model.findComponent(id).orElse(null);
            if (c != null) {
                totalCriticalityWeight += c.getCriticality().getRiskMultiplier();
            }
        }
        int totalModelComponents = Math.max(1, model.getAllComponents().size());
        double criticalityPenalty = Math.min(100.0, (totalCriticalityWeight / (totalModelComponents * 3.0)) * 100.0);

        // Blast radius ratio: proportion of architecture affected
        double blastRadiusRatio = (double) propagationResult.impactRecords().size() / totalModelComponents;
        double blastRadiusPenalty = blastRadiusRatio * 100.0;

        double combined = (0.40 * directScore) +
                (0.35 * meanIndirectScore) +
                (0.15 * criticalityPenalty) +
                (0.10 * blastRadiusPenalty);

        return Math.clamp(combined, 0.0, 100.0);
    }
}
