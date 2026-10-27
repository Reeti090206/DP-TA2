package com.ripplewhatif.core.patterns.builder;

import com.ripplewhatif.core.domain.model.Component;
import com.ripplewhatif.core.domain.model.ComponentCriticality;
import com.ripplewhatif.core.domain.model.ComponentProperties;

public class ComponentBuilder {

    private final String id;
    private final String name;
    private String type = "SERVICE";
    private ComponentCriticality criticality = ComponentCriticality.MEDIUM;
    private double latencyMs = 50.0;
    private double availability = 99.9;
    private double loadQps = 100.0;
    private double failureProbability = 0.001;

    public ComponentBuilder(String id, String name) {
        this.id = id;
        this.name = name;
    }

    public static ComponentBuilder of(String id, String name) {
        return new ComponentBuilder(id, name);
    }

    public ComponentBuilder type(String type) {
        this.type = type;
        return this;
    }

    public ComponentBuilder criticality(ComponentCriticality criticality) {
        this.criticality = criticality;
        return this;
    }

    public ComponentBuilder latencyMs(double latencyMs) {
        this.latencyMs = latencyMs;
        return this;
    }

    public ComponentBuilder availability(double availability) {
        this.availability = availability;
        return this;
    }

    public ComponentBuilder loadQps(double loadQps) {
        this.loadQps = loadQps;
        return this;
    }

    public ComponentBuilder failureProbability(double failureProbability) {
        this.failureProbability = failureProbability;
        return this;
    }

    public Component build() {
        ComponentProperties properties = new ComponentProperties(latencyMs, availability, loadQps, failureProbability);
        return new Component(id, name, type, criticality, properties);
    }
}
