package com.ripplewhatif.core.patterns.strategy;

import com.ripplewhatif.core.domain.change.ChangeRequest;
import com.ripplewhatif.core.domain.model.SystemModel;
import com.ripplewhatif.core.domain.result.ImpactRecord;

/**
 * <b>Strategy Implementation:</b> Availability-focused risk scoring strategy.
 *
 * <p>Penalizes availability drops aggressively, as high availability degradation directly impairs SLA guarantees.
 */
public class AvailabilityRiskScoringStrategy implements RiskScoringStrategy {

    @Override
    public String getName() {
        return "Availability-Centric Risk Strategy";
    }

    @Override
    public String getFormulaDocumentation() {
        return "OverallRisk = clamp(Sum(Max(0, BaselineAvailability - ProjectedAvailability) * 10 * CriticalityWeight), 0.0, 100.0)";
    }

    @Override
    public double calculateRiskScore(SystemModel model,
                                     ChangeRequest request,
                                     ImpactPropagationStrategy.PropagationResult propagationResult) {
        if (propagationResult.impactRecords().isEmpty()) {
            return 0.0;
        }

        double totalAvailabilityPenalty = 0.0;

        for (ImpactRecord record : propagationResult.impactRecords().values()) {
            double baseAvail = record.getBaselineProperties().getAvailability();
            double projAvail = record.getProjectedProperties().getAvailability();
            double drop = Math.max(0.0, baseAvail - projAvail);

            var compOpt = model.findComponent(record.getComponentId());
            double critMultiplier = compOpt.map(c -> c.getCriticality().getRiskMultiplier()).orElse(1.0);

            // A 1% availability drop on a high criticality service is a major incident
            totalAvailabilityPenalty += drop * 12.0 * critMultiplier;
        }

        return Math.clamp(totalAvailabilityPenalty, 0.0, 100.0);
    }
}
