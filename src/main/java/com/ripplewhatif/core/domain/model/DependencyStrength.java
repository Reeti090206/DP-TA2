package com.ripplewhatif.core.domain.model;

/**
 * Quantifies the coupling strength of a dependency.
 * Higher strength yields higher ripple propagation factor.
 */
public enum DependencyStrength {
    WEAK(0.35),
    MEDIUM(0.65),
    STRONG(0.85),
    CRITICAL(1.0);

    private final double propagationMultiplier;

    DependencyStrength(double propagationMultiplier) {
        this.propagationMultiplier = propagationMultiplier;
    }

    public double getPropagationMultiplier() {
        return propagationMultiplier;
    }
}
