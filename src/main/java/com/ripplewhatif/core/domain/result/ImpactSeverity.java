package com.ripplewhatif.core.domain.result;

public enum ImpactSeverity {
    NONE(0.0),
    NEGLIGIBLE(15.0),
    LOW(35.0),
    MODERATE(60.0),
    HIGH(80.0),
    CRITICAL(100.0);

    private final double maxBound;

    ImpactSeverity(double maxBound) {
        this.maxBound = maxBound;
    }

    public static ImpactSeverity fromScore(double score) {
        if (score <= 5.0) return NONE;
        if (score <= 20.0) return NEGLIGIBLE;
        if (score <= 45.0) return LOW;
        if (score <= 70.0) return MODERATE;
        if (score <= 88.0) return HIGH;
        return CRITICAL;
    }

    public double getMaxBound() {
        return maxBound;
    }
}
