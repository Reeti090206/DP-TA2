package com.ripplewhatif.core.patterns.builder;

import com.ripplewhatif.core.domain.model.Component;
import com.ripplewhatif.core.domain.model.Dependency;
import com.ripplewhatif.core.domain.model.DependencyStrength;
import com.ripplewhatif.core.domain.model.DependencyType;
import com.ripplewhatif.core.domain.model.SystemModel;
import com.ripplewhatif.core.exception.ModelValidationException;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;

public class SystemModelBuilder {

    private String systemId = "sys-default";
    private String systemName = "Software System Model";
    private final Map<String, Component> components = new LinkedHashMap<>();
    private final Set<Dependency> dependencies = new LinkedHashSet<>();
    private final List<String> duplicateComponentAttempts = new ArrayList<>();

    public SystemModelBuilder id(String systemId) {
        this.systemId = systemId;
        return this;
    }

    public SystemModelBuilder name(String systemName) {
        this.systemName = systemName;
        return this;
    }

    public SystemModelBuilder addComponent(Component component) {
        Objects.requireNonNull(component, "Component cannot be null");
        String id = component.getId();
        if (components.containsKey(id)) {
            duplicateComponentAttempts.add("Duplicate component ID detected: '" + id + "'");
        } else {
            components.put(id, component);
        }
        return this;
    }

    public SystemModelBuilder addDependency(Dependency dependency) {
        Objects.requireNonNull(dependency, "Dependency cannot be null");
        dependencies.add(dependency);
        return this;
    }

    public SystemModelBuilder addDependency(String sourceComponentId, String targetComponentId) {
        return addDependency(new Dependency(sourceComponentId, targetComponentId));
    }

    public SystemModelBuilder addDependency(String sourceComponentId,
                                           String targetComponentId,
                                           DependencyStrength strength,
                                           DependencyType type) {
        return addDependency(new Dependency(sourceComponentId, targetComponentId, strength, type, type.isBlocking(), ""));
    }

    public void validate() {
        List<String> errors = new ArrayList<>();

        if (!duplicateComponentAttempts.isEmpty()) {
            errors.addAll(duplicateComponentAttempts);
        }

        if (components.isEmpty()) {
            errors.add("System model must contain at least one component");
        }

        for (Dependency dep : dependencies) {
            String src = dep.getSourceComponentId();
            String tgt = dep.getTargetComponentId();

            if (!components.containsKey(src)) {
                errors.add("Dependency references unregistered source component: '" + src + "'");
            }
            if (!components.containsKey(tgt)) {
                errors.add("Dependency references unregistered target component: '" + tgt + "'");
            }
            if (src.equalsIgnoreCase(tgt)) {
                errors.add("Self-referencing dependency forbidden on component: '" + src + "'");
            }
        }

        if (!errors.isEmpty()) {
            throw new ModelValidationException("SystemModel validation failed", errors);
        }
    }

    public SystemModel build() {
        validate();

        SystemModel model = new SystemModel(systemId, systemName);
        for (Component comp : components.values()) {
            model.addComponent(comp.deepCopy());
        }
        for (Dependency dep : dependencies) {
            model.addDependency(dep);
        }
        return model;
    }
}
