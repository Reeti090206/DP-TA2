package com.ripplewhatif.application.dto;

import com.ripplewhatif.core.domain.result.RiskLevel;

import java.time.Instant;
import java.util.List;
import java.util.Map;

/**
 * Data Transfer Object representing the completed simulation report.
 */
public record SimulationResultDto(
        String scenarioId,
        String scenarioName,
        String targetComponentId,
        List<String> directlyAffected,
        List<String> indirectlyAffected,
        double overallRiskScore,
        RiskLevel riskLevel,
        List<List<String>> impactPaths,
        boolean baselinePreserved,
        Instant timestamp,
        long executionDurationMs,
        String strategyUsed,
        String disclaimer,
        Map<String, ImpactRecordDto> impactDetails
) {}
