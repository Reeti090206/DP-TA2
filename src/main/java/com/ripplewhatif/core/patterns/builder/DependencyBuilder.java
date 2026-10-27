package com.ripplewhatif.core.patterns.builder;

import com.ripplewhatif.core.domain.model.Dependency;
import com.ripplewhatif.core.domain.model.DependencyStrength;
import com.ripplewhatif.core.domain.model.DependencyType;

public class DependencyBuilder {

    private final String sourceComponentId;
    private final String targetComponentId;
    private DependencyStrength strength = DependencyStrength.STRONG;
    private DependencyType type = DependencyType.SYNCHRONOUS_REST;
    private boolean isSynchronous = true;
    private String description = "";

    public DependencyBuilder(String sourceComponentId, String targetComponentId) {
        this.sourceComponentId = sourceComponentId;
        this.targetComponentId = targetComponentId;
    }

    public static DependencyBuilder between(String sourceComponentId, String targetComponentId) {
        return new DependencyBuilder(sourceComponentId, targetComponentId);
    }

    public DependencyBuilder strength(DependencyStrength strength) {
        this.strength = strength;
        return this;
    }

    public DependencyBuilder type(DependencyType type) {
        this.type = type;
        if (type != null) {
            this.isSynchronous = type.isBlocking();
        }
        return this;
    }

    public DependencyBuilder synchronous(boolean isSynchronous) {
        this.isSynchronous = isSynchronous;
        return this;
    }

    public DependencyBuilder description(String description) {
        this.description = description;
        return this;
    }

    public Dependency build() {
        return new Dependency(sourceComponentId, targetComponentId, strength, type, isSynchronous, description);
    }
}
