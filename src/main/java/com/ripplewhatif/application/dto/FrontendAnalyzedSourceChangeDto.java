package com.ripplewhatif.application.dto;

import java.util.List;

/**
 * Analyzed source change matching Frontend AnalyzedSourceChange TypeScript interface.
 */
public record FrontendAnalyzedSourceChangeDto(
        String componentId,
        String componentName,
        String propertyKey,
        String propertyLabel,
        double baselineValue,
        double proposedValue,
        String unit,
        String direction,       // "increase" | "decrease"
        double changePercent,
        double riskScore,
        String riskDirection,   // "adverse" | "favorable"
        List<String> factors
) {}
