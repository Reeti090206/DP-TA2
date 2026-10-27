package com.ripplewhatif.application.dto;

/**
 * Settings chosen in the frontend (breadth-first / weighted, weighted-risk / criticality-first).
 */
public record FrontendAnalysisSettingsDto(
        String propagationStrategy,
        String scoringStrategy
) {}
