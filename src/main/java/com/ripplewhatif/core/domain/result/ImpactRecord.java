package com.ripplewhatif.core.domain.result;

import com.ripplewhatif.core.domain.model.ComponentProperties;

import java.util.Collections;
import java.util.List;

/**
 * Detailed impact profile for a single component affected by a simulation scenario.
 */
public class ImpactRecord {

    private final String componentId;
    private final boolean directlyAffected;
    private final int propagationDepth;
    private final double impactScore;       // 0.0 to 100.0
    private final ImpactSeverity severity;
    private final ComponentProperties baselineProperties;
    private final ComponentProperties projectedProperties;
    private final List<String> propagationPath; // e.g. ["payment", "checkout", "web-gateway"]

    public ImpactRecord(String componentId,
                        boolean directlyAffected,
                        int propagationDepth,
                        double impactScore,
                        ImpactSeverity severity,
                        ComponentProperties baselineProperties,
                        ComponentProperties projectedProperties,
                        List<String> propagationPath) {
        this.componentId = componentId;
        this.directlyAffected = directlyAffected;
        this.propagationDepth = propagationDepth;
        this.impactScore = Math.clamp(impactScore, 0.0, 100.0);
        this.severity = severity != null ? severity : ImpactSeverity.fromScore(this.impactScore);
        this.baselineProperties = baselineProperties;
        this.projectedProperties = projectedProperties;
        this.propagationPath = propagationPath != null ? List.copyOf(propagationPath) : Collections.emptyList();
    }

    public String getComponentId() {
        return componentId;
    }

    public boolean isDirectlyAffected() {
        return directlyAffected;
    }

    public int getPropagationDepth() {
        return propagationDepth;
    }

    public double getImpactScore() {
        return impactScore;
    }

    public ImpactSeverity getSeverity() {
        return severity;
    }

    public ComponentProperties getBaselineProperties() {
        return baselineProperties;
    }

    public ComponentProperties getProjectedProperties() {
        return projectedProperties;
    }

    public List<String> getPropagationPath() {
        return propagationPath;
    }

    @Override
    public String toString() {
        return "ImpactRecord{" +
                "id='" + componentId + '\'' +
                ", direct=" + directlyAffected +
                ", depth=" + propagationDepth +
                ", score=" + String.format("%.2f", impactScore) +
                ", severity=" + severity +
                ", path=" + propagationPath +
                '}';
    }
}
