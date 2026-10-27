package com.ripplewhatif.application.dto;

import java.util.List;

public record FrontendAnalysisFindingDto(
        String componentId,
        String componentName,
        String criticality,
        String impactType,
        int distance,
        int shortestDistance,
        List<String> causalPath,
        String sourceComponentId,
        String sourceComponentName,
        double propagationSignal,
        double score,
        String severity,
        String rule,
        String explanation,
        List<String> factors
) {}
