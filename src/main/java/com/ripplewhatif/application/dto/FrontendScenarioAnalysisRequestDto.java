package com.ripplewhatif.application.dto;

import java.util.List;

/**
 * Full scenario analysis request payload received from the React frontend.
 */
public record FrontendScenarioAnalysisRequestDto(
        String scenarioId,
        String scenarioName,
        Integer scenarioRevision,
        List<FrontendScenarioChangeDto> changeSet,
        FrontendAnalysisSettingsDto analysisSettings
) {}
