package com.ripplewhatif.application.dto;

public record FrontendScenarioChangeDto(
        String componentId,
        String propertyKey,
        double value
) {}
