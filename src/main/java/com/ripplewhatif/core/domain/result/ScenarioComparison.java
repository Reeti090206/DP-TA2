package com.ripplewhatif.core.domain.result;

import java.time.Instant;
import java.util.Collections;
import java.util.List;

public class ScenarioComparison {

    private final String scenarioId;
    private final String scenarioName;
    private final double baselineRiskScore;
    private final double scenarioRiskScore;
    private final double riskScoreDelta;
    private final RiskLevel baselineRiskLevel;
    private final RiskLevel scenarioRiskLevel;
    private final List<String> newlyImpactedComponents;
    private final Instant comparedAt;

    public ScenarioComparison(String scenarioId,
                              String scenarioName,
                              double baselineRiskScore,
                              double scenarioRiskScore,
                              RiskLevel baselineRiskLevel,
                              RiskLevel scenarioRiskLevel,
                              List<String> newlyImpactedComponents) {
        this.scenarioId = scenarioId;
        this.scenarioName = scenarioName;
        this.baselineRiskScore = baselineRiskScore;
        this.scenarioRiskScore = scenarioRiskScore;
        this.riskScoreDelta = scenarioRiskScore - baselineRiskScore;
        this.baselineRiskLevel = baselineRiskLevel;
        this.scenarioRiskLevel = scenarioRiskLevel;
        this.newlyImpactedComponents = newlyImpactedComponents != null ? List.copyOf(newlyImpactedComponents) : Collections.emptyList();
        this.comparedAt = Instant.now();
    }

    public String getScenarioId() {
        return scenarioId;
    }

    public String getScenarioName() {
        return scenarioName;
    }

    public double getBaselineRiskScore() {
        return baselineRiskScore;
    }

    public double getScenarioRiskScore() {
        return scenarioRiskScore;
    }

    public double getRiskScoreDelta() {
        return riskScoreDelta;
    }

    public RiskLevel getBaselineRiskLevel() {
        return baselineRiskLevel;
    }

    public RiskLevel getScenarioRiskLevel() {
        return scenarioRiskLevel;
    }

    public List<String> getNewlyImpactedComponents() {
        return newlyImpactedComponents;
    }

    public Instant getComparedAt() {
        return comparedAt;
    }
}
