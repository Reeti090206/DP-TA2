package com.ripplewhatif.core.domain.change;

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

    public boolean propagatesUpstream() {
        return propagatesUpstream;
    }
}
