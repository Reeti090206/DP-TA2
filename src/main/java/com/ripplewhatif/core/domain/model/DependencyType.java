package com.ripplewhatif.core.domain.model;

/**
 * Categorizes the communication mode between dependent components.
 */
public enum DependencyType {
    SYNCHRONOUS_REST(1.0, true),
    SYNCHRONOUS_GRPC(0.9, true),
    ASYNCHRONOUS_QUEUE(0.4, false),
    DATABASE_QUERY(0.95, true),
    CACHE_LOOKUP(0.5, true);

    private final double impactFactor;
    private final boolean blocking;

    DependencyType(double impactFactor, boolean blocking) {
        this.impactFactor = impactFactor;
        this.blocking = blocking;
    }

    public double getImpactFactor() {
        return impactFactor;
    }

    public boolean isBlocking() {
        return blocking;
    }
}
