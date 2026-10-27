package com.ripplewhatif.application.dto;

/**
 * Optional execution flags and algorithm overrides for simulation requests.
 */
public record SimulationOptionsDto(
        String propagationStrategy, // "BFS" or "DFS"
        String scoringStrategy,      // "WEIGHTED", "LATENCY", "AVAILABILITY"
        Double propagationThreshold, // e.g. 5.0
        Boolean commitChangeAfterSimulation
) {
    public static SimulationOptionsDto defaults() {
        return new SimulationOptionsDto("BFS", "WEIGHTED", 5.0, false);
    }
}
