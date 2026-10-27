package com.ripplewhatif.core.domain.model;

import java.util.Objects;

/**
 * Immutable value object capturing quantitative operating metrics of a component:
 * latency (ms), availability (percentage 0.0 - 100.0), load (QPS), and failure probability (0.0 - 1.0).
 */
public final class ComponentProperties {

    private final double latencyMs;
    private final double availability;        // e.g., 99.9 (%)
    private final double loadQps;             // queries per second
    private final double failureProbability;  // 0.0 to 1.0

    public ComponentProperties(double latencyMs, double availability, double loadQps, double failureProbability) {
        if (latencyMs < 0) {
            throw new IllegalArgumentException("Latency cannot be negative: " + latencyMs);
        }
        if (availability < 0.0 || availability > 100.0) {
            throw new IllegalArgumentException("Availability must be between 0.0 and 100.0%: " + availability);
        }
        if (loadQps < 0) {
            throw new IllegalArgumentException("Load QPS cannot be negative: " + loadQps);
        }
        if (failureProbability < 0.0 || failureProbability > 1.0) {
            throw new IllegalArgumentException("Failure probability must be between 0.0 and 1.0: " + failureProbability);
        }
        this.latencyMs = latencyMs;
        this.availability = availability;
        this.loadQps = loadQps;
        this.failureProbability = failureProbability;
    }

    public static ComponentProperties defaults() {
        return new ComponentProperties(50.0, 99.9, 100.0, 0.001);
    }

    public double getLatencyMs() {
        return latencyMs;
    }

    public double getAvailability() {
        return availability;
    }

    public double getLoadQps() {
        return loadQps;
    }

    public double getFailureProbability() {
        return failureProbability;
    }

    public ComponentProperties withLatencyMs(double newLatencyMs) {
        return new ComponentProperties(newLatencyMs, this.availability, this.loadQps, this.failureProbability);
    }

    public ComponentProperties withAvailability(double newAvailability) {
        return new ComponentProperties(this.latencyMs, newAvailability, this.loadQps, this.failureProbability);
    }

    public ComponentProperties withLoadQps(double newLoadQps) {
        return new ComponentProperties(this.latencyMs, this.availability, newLoadQps, this.failureProbability);
    }

    public ComponentProperties withFailureProbability(double newFailureProb) {
        return new ComponentProperties(this.latencyMs, this.availability, this.loadQps, newFailureProb);
    }

    public ComponentProperties copy() {
        return new ComponentProperties(this.latencyMs, this.availability, this.loadQps, this.failureProbability);
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof ComponentProperties that)) return false;
        return Double.compare(that.latencyMs, latencyMs) == 0 &&
                Double.compare(that.availability, availability) == 0 &&
                Double.compare(that.loadQps, loadQps) == 0 &&
                Double.compare(that.failureProbability, failureProbability) == 0;
    }

    @Override
    public int hashCode() {
        return Objects.hash(latencyMs, availability, loadQps, failureProbability);
    }

    @Override
    public String toString() {
        return "ComponentProperties{" +
                "latencyMs=" + latencyMs +
                ", availability=" + availability + "%" +
                ", loadQps=" + loadQps +
                ", failureProbability=" + failureProbability +
                '}';
    }
}
