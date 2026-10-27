package com.ripplewhatif.core.domain.model;

import com.ripplewhatif.core.exception.ComponentNotFoundException;
import com.ripplewhatif.core.patterns.memento.SystemMemento;

import java.util.Collections;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

public class SystemModel {

    private final String systemId;
    private final String systemName;
    private final Map<String, Component> components = new HashMap<>();
    private final Set<Dependency> dependencies = new HashSet<>();

    public SystemModel(String systemId, String systemName) {
        this.systemId = systemId != null ? systemId : "sys-default";
        this.systemName = systemName != null ? systemName : "Default Architecture";
    }

    public String getSystemId() {
        return systemId;
    }

    public String getSystemName() {
        return systemName;
    }

    public boolean hasComponent(String componentId) {
        if (componentId == null) return false;
        return components.containsKey(componentId.trim().toLowerCase());
    }

    public Component getComponent(String componentId) {
        if (componentId == null) {
            throw new IllegalArgumentException("Component ID cannot be null");
        }
        Component comp = components.get(componentId.trim().toLowerCase());
        if (comp == null) {
            throw new ComponentNotFoundException(componentId);
        }
        return comp;
    }

    public Optional<Component> findComponent(String componentId) {
        if (componentId == null) return Optional.empty();
        return Optional.ofNullable(components.get(componentId.trim().toLowerCase()));
    }

    public Map<String, Component> getAllComponents() {
        return Collections.unmodifiableMap(components);
    }

    public void addComponent(Component component) {
        Objects.requireNonNull(component, "Component cannot be null");
        components.put(component.getId(), component);
    }

    public void updateComponentProperties(String componentId, ComponentProperties properties) {
        Component comp = getComponent(componentId);
        comp.setProperties(properties);
    }

    public boolean removeComponent(String componentId) {
        if (componentId == null) return false;
        String id = componentId.trim().toLowerCase();
        Component removed = components.remove(id);
        if (removed != null) {

            dependencies.removeIf(d -> d.getSourceComponentId().equals(id) || d.getTargetComponentId().equals(id));
            return true;
        }
        return false;
    }

    public Set<Dependency> getAllDependencies() {
        return Collections.unmodifiableSet(dependencies);
    }

    public void addDependency(Dependency dependency) {
        Objects.requireNonNull(dependency, "Dependency cannot be null");
        if (!hasComponent(dependency.getSourceComponentId())) {
            throw new ComponentNotFoundException(dependency.getSourceComponentId());
        }
        if (!hasComponent(dependency.getTargetComponentId())) {
            throw new ComponentNotFoundException(dependency.getTargetComponentId());
        }
        dependencies.add(dependency);
    }

    public boolean removeDependency(String sourceId, String targetId) {
        if (sourceId == null || targetId == null) return false;
        String s = sourceId.trim().toLowerCase();
        String t = targetId.trim().toLowerCase();
        return dependencies.removeIf(d -> d.getSourceComponentId().equals(s) && d.getTargetComponentId().equals(t));
    }

    public List<Dependency> getDirectCallersOf(String targetId) {
        String clean = targetId.trim().toLowerCase();
        return dependencies.stream()
                .filter(d -> d.getTargetComponentId().equals(clean))
                .collect(Collectors.toList());
    }

    public List<Dependency> getDirectCalleesOf(String sourceId) {
        String clean = sourceId.trim().toLowerCase();
        return dependencies.stream()
                .filter(d -> d.getSourceComponentId().equals(clean))
                .collect(Collectors.toList());
    }

    public SystemMemento createMemento(String snapshotId, String description) {
        return new SystemMemento(snapshotId, description, this.components, this.dependencies);
    }

    public void restore(SystemMemento memento) {
        Objects.requireNonNull(memento, "Memento cannot be null for restoration");
        this.components.clear();
        this.components.putAll(memento.getComponentsState());
        this.dependencies.clear();
        this.dependencies.addAll(memento.getDependenciesState());
    }

    public SystemModel deepCopy() {
        SystemModel clone = new SystemModel(this.systemId, this.systemName);
        for (Component comp : this.components.values()) {
            clone.addComponent(comp.deepCopy());
        }
        for (Dependency dep : this.dependencies) {
            clone.addDependency(new Dependency(
                    dep.getSourceComponentId(),
                    dep.getTargetComponentId(),
                    dep.getStrength(),
                    dep.getType(),
                    dep.isSynchronous(),
                    dep.getDescription()
            ));
        }
        return clone;
    }

    @Override
    public String toString() {
        return "SystemModel{" +
                "systemId='" + systemId + '\'' +
                ", name='" + systemName + '\'' +
                ", components=" + components.size() +
                ", dependencies=" + dependencies.size() +
                '}';
    }
}
