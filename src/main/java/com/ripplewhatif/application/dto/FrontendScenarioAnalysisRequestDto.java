package com.ripplewhatif.application.dto;

import java.util.List;

public record FrontendScenarioAnalysisRequestDto(
        String scenarioId,
        String scenarioName,
        Integer scenarioRevision,
        List<FrontendScenarioChangeDto> changeSet,
        FrontendAnalysisSettingsDto analysisSettings
) {}
