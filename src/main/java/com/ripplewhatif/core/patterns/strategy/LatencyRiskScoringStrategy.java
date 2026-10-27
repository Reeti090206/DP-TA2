package com.ripplewhatif.core.patterns.strategy;

import com.ripplewhatif.core.domain.change.ChangeRequest;
import com.ripplewhatif.core.domain.model.SystemModel;
import com.ripplewhatif.core.domain.result.ImpactRecord;

public class LatencyRiskScoringStrategy implements RiskScoringStrategy {

    @Override
    public String getName() {
        return "Latency-Centric Risk Strategy";
    }

    @Override
    public String getFormulaDocumentation() {
        return "OverallRisk = clamp(MeanPercentageLatencyIncreaseAcrossAllAffected * CriticalityAmplifier, 0.0, 100.0)";
    }

    @Override
    public double calculateRiskScore(SystemModel model,
                                     ChangeRequest request,
                                     ImpactPropagationStrategy.PropagationResult propagationResult) {
        if (propagationResult.impactRecords().isEmpty()) {
            return 0.0;
        }

        double totalPctLatencyIncrease = 0.0;
        double totalWeight = 0.0;

        for (ImpactRecord record : propagationResult.impactRecords().values()) {
            double baseLatency = Math.max(1.0, record.getBaselineProperties().getLatencyMs());
            double projLatency = record.getProjectedProperties().getLatencyMs();
            double pctIncrease = Math.max(0.0, ((projLatency - baseLatency) / baseLatency) * 100.0);

            var compOpt = model.findComponent(record.getComponentId());
            double weight = compOpt.map(c -> c.getCriticality().getRiskMultiplier()).orElse(1.0);

            totalPctLatencyIncrease += pctIncrease * weight;
            totalWeight += weight;
        }

        double weightedMeanIncrease = (totalWeight > 0) ? (totalPctLatencyIncrease / totalWeight) : 0.0;

        double scaledRisk = (weightedMeanIncrease / 1.5);
        return Math.clamp(scaledRisk, 0.0, 100.0);
    }
}
