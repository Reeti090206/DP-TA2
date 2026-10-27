package com.ripplewhatif.application.dto;

/**
 * Change item sent by the React frontend.
 */
public record FrontendScenarioChangeDto(
        String componentId,
        String propertyKey,
        double value
) {}
