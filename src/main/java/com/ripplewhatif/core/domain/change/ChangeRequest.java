package com.ripplewhatif.core.domain.change;

import com.ripplewhatif.core.exception.InvalidChangeException;

import java.util.Objects;

public class ChangeRequest {

    private final String scenarioName;
    private final String targetComponentId;
    private final ChangeType changeType;
    private final double magnitude;
    private final ChangeUnit unit;
    private final String description;

    public ChangeRequest(String scenarioName,
                         String targetComponentId,
                         ChangeType changeType,
                         double magnitude,
                         ChangeUnit unit) {
        this(scenarioName, targetComponentId, changeType, magnitude, unit, "");
    }

    public ChangeRequest(String scenarioName,
                         String targetComponentId,
                         ChangeType changeType,
                         double magnitude,
                         ChangeUnit unit,
                         String description) {
        if (targetComponentId == null || targetComponentId.trim().isEmpty()) {
            throw new InvalidChangeException("Target component ID cannot be null or empty");
        }
        if (changeType == null) {
            throw new InvalidChangeException("ChangeType cannot be null");
        }
        if (magnitude < 0) {
            throw new InvalidChangeException("Change magnitude cannot be negative: " + magnitude);
        }
        if (unit == null) {
            throw new InvalidChangeException("ChangeUnit cannot be null");
        }
        if (unit == ChangeUnit.PERCENT && changeType == ChangeType.AVAILABILITY_DECREASE && magnitude > 100.0) {
            throw new InvalidChangeException("Availability decrease percentage cannot exceed 100%: " + magnitude);
        }

        this.scenarioName = (scenarioName != null && !scenarioName.trim().isEmpty())
                ? scenarioName.trim()
                : "Scenario for " + targetComponentId;
        this.targetComponentId = targetComponentId.trim().toLowerCase();
        this.changeType = changeType;
        this.magnitude = magnitude;
        this.unit = unit;
        this.description = description != null ? description : "";
    }

    public static ChangeRequest of(String scenarioName, String targetComponentId, ChangeType changeType, double magnitude) {
        return new ChangeRequest(scenarioName, targetComponentId, changeType, magnitude, ChangeUnit.PERCENT);
    }

    public String getScenarioName() {
        return scenarioName;
    }

    public String getTargetComponentId() {
        return targetComponentId;
    }

    public ChangeType getChangeType() {
        return changeType;
    }

    public double getMagnitude() {
        return magnitude;
    }

    public ChangeUnit getUnit() {
        return unit;
    }

    public String getDescription() {
        return description;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof ChangeRequest that)) return false;
        return Double.compare(that.magnitude, magnitude) == 0 &&
                Objects.equals(scenarioName, that.scenarioName) &&
                Objects.equals(targetComponentId, that.targetComponentId) &&
                changeType == that.changeType &&
                unit == that.unit;
    }

    @Override
    public int hashCode() {
        return Objects.hash(scenarioName, targetComponentId, changeType, magnitude, unit);
    }

    @Override
    public String toString() {
        return "ChangeRequest{" +
                "scenario='" + scenarioName + '\'' +
                ", target='" + targetComponentId + '\'' +
                ", type=" + changeType +
                ", magnitude=" + magnitude + " " + unit +
                '}';
    }
}
