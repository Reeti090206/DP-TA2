package com.ripplewhatif.core.domain.change;

/**
 * Types of architectural changes and failure modes supported by the simulator.
 */
public enum ChangeType {
    LATENCY_INCREASE("Latency Degradation", true),
    AVAILABILITY_DECREASE("Availability Outage", true),
    LOAD_INCREASE("Traffic / Load Spike", false),
    FAILURE_PROBABILITY_INCREASE("Failure Rate Rise", true);

    private final String displayName;
    private final boolean propagatesUpstream;

    ChangeType(String displayName, boolean propagatesUpstream) {
        this.displayName = displayName;
        this.propagatesUpstream = propagatesUpstream;
    }

    public String getDisplayName() {
        return displayName;
    }

    /**
     * Faults (slowdown, outage, error rate) propagate upstream to calling components.
     * Load surges propagate downstream to callees.
     */
    public boolean propagatesUpstream() {
        return propagatesUpstream;
    }
}
