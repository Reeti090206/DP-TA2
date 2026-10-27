package com.ripplewhatif.application.dto;

public record SimulationOptionsDto(
        String propagationStrategy,
        String scoringStrategy,
        Double propagationThreshold,
        Boolean commitChangeAfterSimulation
) {
    public static SimulationOptionsDto defaults() {
        return new SimulationOptionsDto("BFS", "WEIGHTED", 5.0, false);
    }
}
