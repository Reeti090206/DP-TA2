package com.ripplewhatif.core.domain.model;

import java.util.Objects;

/**
 * Directed relationship between two components.
 *
 * <p><b>SEMANTIC CONVENTION:</b>
 * In {@code Dependency(source, target)}, {@code source} depends upon {@code target}.
 * E.g., {@code Dependency("checkout", "payment")} means the Checkout Service calls and depends
 * on the Payment Service.
 *
 * <p>When {@code payment} experiences latency or availability degradation, the impact ripples
 * <i>upstream</i> to {@code checkout}.
 */
public class Dependency {

    private final String sourceComponentId; // The dependent caller (e.g. checkout)
    private final String targetComponentId; // The provider callee (e.g. payment)
    private final DependencyStrength strength;
    private final DependencyType type;
    private final boolean isSynchronous;
    private final String description;

    public Dependency(String sourceComponentId, String targetComponentId) {
        this(sourceComponentId, targetComponentId, DependencyStrength.STRONG, DependencyType.SYNCHRONOUS_REST, true, "");
    }

    public Dependency(String sourceComponentId,
                      String targetComponentId,
                      DependencyStrength strength,
                      DependencyType type,
                      boolean isSynchronous,
                      String description) {
        if (sourceComponentId == null || sourceComponentId.trim().isEmpty()) {
            throw new IllegalArgumentException("Source component ID cannot be null or empty");
        }
        if (targetComponentId == null || targetComponentId.trim().isEmpty()) {
            throw new IllegalArgumentException("Target component ID cannot be null or empty");
        }
        String cleanSource = sourceComponentId.trim().toLowerCase();
        String cleanTarget = targetComponentId.trim().toLowerCase();
        if (cleanSource.equalsIgnoreCase(cleanTarget)) {
            throw new IllegalArgumentException("Self-dependency is not permitted: " + cleanSource);
        }

        this.sourceComponentId = cleanSource;
        this.targetComponentId = cleanTarget;
        this.strength = (strength != null) ? strength : DependencyStrength.STRONG;
        this.type = (type != null) ? type : DependencyType.SYNCHRONOUS_REST;
        this.isSynchronous = isSynchronous;
        this.description = (description != null) ? description : "";
    }

    public String getSourceComponentId() {
        return sourceComponentId;
    }

    public String getTargetComponentId() {
        return targetComponentId;
    }

    public DependencyStrength getStrength() {
        return strength;
    }

    public DependencyType getType() {
        return type;
    }

    public boolean isSynchronous() {
        return isSynchronous;
    }

    public String getDescription() {
        return description;
    }

    /**
     * Calculates the attenuation factor of propagation across this edge.
     * Combines coupling strength, dependency type, and synchronous nature.
     */
    public double getEdgeTransmissionWeight() {
        double base = strength.getPropagationMultiplier() * type.getImpactFactor();
        return isSynchronous ? base : base * 0.5;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof Dependency that)) return false;
        return Objects.equals(sourceComponentId, that.sourceComponentId) &&
                Objects.equals(targetComponentId, that.targetComponentId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(sourceComponentId, targetComponentId);
    }

    @Override
    public String toString() {
        return "Dependency{" +
                sourceComponentId + " -> " + targetComponentId +
                ", strength=" + strength +
                ", type=" + type +
                ", sync=" + isSynchronous +
                '}';
    }
}
