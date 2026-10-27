package com.ripplewhatif.application.dto;

import java.util.List;

public record FrontendAnalyzedSourceChangeDto(
        String componentId,
        String componentName,
        String propertyKey,
        String propertyLabel,
        double baselineValue,
        double proposedValue,
        String unit,
        String direction,
        double changePercent,
        double riskScore,
        String riskDirection,
        List<String> factors
) {}
