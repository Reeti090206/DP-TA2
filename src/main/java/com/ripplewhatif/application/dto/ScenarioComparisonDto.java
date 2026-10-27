package com.ripplewhatif.application.dto;

import com.ripplewhatif.core.domain.result.RiskLevel;

import java.time.Instant;
import java.util.List;

public record ScenarioComparisonDto(
        String scenarioId,
        String scenarioName,
        double baselineRiskScore,
        double scenarioRiskScore,
        double riskScoreDelta,
        RiskLevel baselineRiskLevel,
        RiskLevel scenarioRiskLevel,
        List<String> newlyImpactedComponents,
        Instant comparedAt
) {}
