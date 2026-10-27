package com.ripplewhatif.application.dto;

public record FrontendAnalysisSettingsDto(
        String propagationStrategy,
        String scoringStrategy
) {}
