package com.ripplewhatif.application.dto;

import com.ripplewhatif.core.domain.model.ComponentCriticality;

public record ComponentDto(
        String id,
        String name,
        String type,
        ComponentCriticality criticality,
        double latencyMs,
        double availability,
        double loadQps,
        double failureProbability
) {
    public static ComponentDto of(String id, String name) {
        return new ComponentDto(id, name, "SERVICE", ComponentCriticality.MEDIUM, 50.0, 99.9, 100.0, 0.001);
    }
}
