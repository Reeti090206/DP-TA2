package com.ripplewhatif.core.domain.result;

/**
 * Categorical risk tier based on normalized risk score (0.0 to 100.0).
 */
public enum RiskLevel {
    LOW(0.0, 39.99),
    MEDIUM(40.0, 69.99),
    HIGH(70.0, 89.99),
    CRITICAL(90.0, 100.0);

    private final double minScore;
    private final double maxScore;

    RiskLevel(double minScore, double maxScore) {
        this.minScore = minScore;
        this.maxScore = maxScore;
    }

    public static RiskLevel fromScore(double score) {
        double clamped = Math.clamp(score, 0.0, 100.0);
        for (RiskLevel level : values()) {
            if (clamped >= level.minScore && clamped <= level.maxScore) {
                return level;
            }
        }
        return score >= 90.0 ? CRITICAL : LOW;
    }

    public double getMinScore() {
        return minScore;
    }

    public double getMaxScore() {
        return maxScore;
    }
}
