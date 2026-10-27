package com.ripplewhatif.application.dto;

import com.ripplewhatif.core.domain.result.ImpactSeverity;

import java.util.List;

/**
 * DTO representing impact details on an affected component.
 */
public record ImpactRecordDto(
        String componentId,
        boolean directlyAffected,
        int propagationDepth,
        double impactScore,
        ImpactSeverity severity,
        double baselineLatencyMs,
        double projectedLatencyMs,
        double baselineAvailability,
        double projectedAvailability,
        List<String> propagationPath
) {}
