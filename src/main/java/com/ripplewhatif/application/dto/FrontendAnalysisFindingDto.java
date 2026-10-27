package com.ripplewhatif.application.dto;

import java.util.List;

/**
 * Finding item matching Frontend AnalysisFinding TypeScript interface.
 */
public record FrontendAnalysisFindingDto(
        String componentId,
        String componentName,
        String criticality,         // "critical" | "high" | "medium" | "low"
        String impactType,          // "direct" | "indirect"
        int distance,
        int shortestDistance,
        List<String> causalPath,
        String sourceComponentId,
        String sourceComponentName,
        double propagationSignal,
        double score,
        String severity,            // "low" | "moderate" | "high" | "severe"
        String rule,
        String explanation,
        List<String> factors
) {}
