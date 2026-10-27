package com.ripplewhatif.core.domain.result;

import com.ripplewhatif.core.domain.change.ChangeRequest;

import java.time.Instant;
import java.util.ArrayList;
import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * Immutable simulation report encapsulating change impact analysis,
 * affected components, risk score, and propagation traversal paths.
 */
public class SimulationResult {

    public static final String DISCLAIMER =
            "Simulation estimate based on configured architectural model, not real-world operational prediction.";

    private final String scenarioId;
    private final String scenarioName;
    private final String targetComponentId;
    private final ChangeRequest changeRequest;
    private final List<String> directlyAffected;
    private final List<String> indirectlyAffected;
    private final Map<String, ImpactRecord> impactRecords;
    private final double overallRiskScore; // 0.0 to 100.0
    private final RiskLevel riskLevel;
    private final List<List<String>> impactPaths;
    private final boolean baselinePreserved;
    private final Instant timestamp;
    private final long executionDurationMs;
    private final String strategyName;

    public SimulationResult(String scenarioId,
                            String scenarioName,
                            String targetComponentId,
                            ChangeRequest changeRequest,
                            List<String> directlyAffected,
                            List<String> indirectlyAffected,
                            Map<String, ImpactRecord> impactRecords,
                            double overallRiskScore,
                            RiskLevel riskLevel,
                            List<List<String>> impactPaths,
                            boolean baselinePreserved,
                            Instant timestamp,
                            long executionDurationMs,
                            String strategyName) {
        this.scenarioId = scenarioId;
        this.scenarioName = scenarioName;
        this.targetComponentId = targetComponentId;
        this.changeRequest = changeRequest;
        this.directlyAffected = directlyAffected != null ? List.copyOf(directlyAffected) : Collections.emptyList();
        this.indirectlyAffected = indirectlyAffected != null ? List.copyOf(indirectlyAffected) : Collections.emptyList();
        this.impactRecords = impactRecords != null ? Collections.unmodifiableMap(new LinkedHashMap<>(impactRecords)) : Collections.emptyMap();
        this.overallRiskScore = Math.clamp(overallRiskScore, 0.0, 100.0);
        this.riskLevel = riskLevel != null ? riskLevel : RiskLevel.fromScore(this.overallRiskScore);
        this.impactPaths = impactPaths != null ? List.copyOf(impactPaths) : Collections.emptyList();
        this.baselinePreserved = baselinePreserved;
        this.timestamp = timestamp != null ? timestamp : Instant.now();
        this.executionDurationMs = executionDurationMs;
        this.strategyName = strategyName != null ? strategyName : "Default";
    }

    public String getScenarioId() {
        return scenarioId;
    }

    public String getScenarioName() {
        return scenarioName;
    }

    public String getTargetComponentId() {
        return targetComponentId;
    }

    public ChangeRequest getChangeRequest() {
        return changeRequest;
    }

    public List<String> getDirectlyAffected() {
        return directlyAffected;
    }

    public List<String> getIndirectlyAffected() {
        return indirectlyAffected;
    }

    public Map<String, ImpactRecord> getImpactRecords() {
        return impactRecords;
    }

    public double getOverallRiskScore() {
        return overallRiskScore;
    }

    public RiskLevel getRiskLevel() {
        return riskLevel;
    }

    public List<List<String>> getImpactPaths() {
        return impactPaths;
    }

    public boolean isBaselinePreserved() {
        return baselinePreserved;
    }

    public Instant getTimestamp() {
        return timestamp;
    }

    public long getExecutionDurationMs() {
        return executionDurationMs;
    }

    public String getStrategyName() {
        return strategyName;
    }

    public String getDisclaimer() {
        return DISCLAIMER;
    }

    /**
     * Produces a human-readable, formatted architectural impact summary.
     */
    public String toFormattedSummary() {
        StringBuilder sb = new StringBuilder();
        sb.append("================================================================================\n");
        sb.append(String.format(" RIPPLE WHAT-IF SIMULATION REPORT: %s [%s]\n", scenarioName, scenarioId));
        sb.append("================================================================================\n");
        sb.append(String.format("Target Component       : %s\n", targetComponentId));
        sb.append(String.format("Change Applied         : %s (Magnitude: %.2f %s)\n",
                changeRequest.getChangeType(), changeRequest.getMagnitude(), changeRequest.getUnit()));
        sb.append(String.format("Overall Risk Score     : %.2f / 100.00 [%s]\n", overallRiskScore, riskLevel));
        sb.append(String.format("Propagation Strategy   : %s\n", strategyName));
        sb.append(String.format("Baseline Preserved     : %s\n", baselinePreserved ? "YES (isolated scenario)" : "NO"));
        sb.append(String.format("Simulation Duration    : %d ms\n", executionDurationMs));
        sb.append("--------------------------------------------------------------------------------\n");
        sb.append(String.format("Directly Affected (%d)  : %s\n", directlyAffected.size(), String.join(", ", directlyAffected)));
        sb.append(String.format("Indirectly Affected (%d): %s\n", indirectlyAffected.size(), String.join(", ", indirectlyAffected)));
        sb.append("--------------------------------------------------------------------------------\n");
        sb.append("Propagation Chains:\n");
        if (impactPaths.isEmpty()) {
            sb.append("  (None)\n");
        } else {
            for (List<String> path : impactPaths) {
                sb.append("  * ").append(String.join(" -> ", path)).append("\n");
            }
        }
        sb.append("--------------------------------------------------------------------------------\n");
        sb.append(String.format("%-18s | %-8s | %-5s | %-12s | %-10s | %s\n",
                "Component", "Type", "Depth", "Severity", "Impact Score", "Projected Latency"));
        sb.append("--------------------------------------------------------------------------------\n");
        for (ImpactRecord ir : impactRecords.values()) {
            sb.append(String.format("%-18s | %-8s | %-5d | %-12s | %-12.2f | %.1fms (was %.1fms)\n",
                    ir.getComponentId(),
                    ir.isDirectlyAffected() ? "DIRECT" : "INDIRECT",
                    ir.getPropagationDepth(),
                    ir.getSeverity(),
                    ir.getImpactScore(),
                    ir.getProjectedProperties().getLatencyMs(),
                    ir.getBaselineProperties().getLatencyMs()));
        }
        sb.append("================================================================================\n");
        sb.append("NOTE: ").append(DISCLAIMER).append("\n");
        sb.append("================================================================================\n");
        return sb.toString();
    }
}
