package com.ripplewhatif.core.domain.model;

public enum ComponentCriticality {
    LOW(1.0),
    MEDIUM(1.5),
    HIGH(2.0),
    CRITICAL(3.0);

    private final double riskMultiplier;

    ComponentCriticality(double riskMultiplier) {
        this.riskMultiplier = riskMultiplier;
    }

    public double getRiskMultiplier() {
        return riskMultiplier;
    }
}
