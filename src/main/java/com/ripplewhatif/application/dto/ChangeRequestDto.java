package com.ripplewhatif.application.dto;

import com.ripplewhatif.core.domain.change.ChangeType;
import com.ripplewhatif.core.domain.change.ChangeUnit;

/**
 * Data Transfer Object for requesting a hypothetical change simulation.
 */
public record ChangeRequestDto(
        String scenarioName,
        String targetComponentId,
        ChangeType changeType,
        double magnitude,
        ChangeUnit unit,
        String description
) {
    public ChangeRequestDto(String scenarioName, String targetComponentId, ChangeType changeType, double magnitude, ChangeUnit unit) {
        this(scenarioName, targetComponentId, changeType, magnitude, unit, "");
    }
}
