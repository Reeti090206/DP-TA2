package com.ripplewhatif.core.patterns.memento;

import com.ripplewhatif.core.domain.model.Component;
import com.ripplewhatif.core.domain.model.Dependency;

import java.time.Instant;
import java.util.Collections;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;

public final class SystemMemento {

    private final String snapshotId;
    private final String description;
    private final Instant timestamp;
    private final Map<String, Component> componentsSnapshot;
    private final Set<Dependency> dependenciesSnapshot;

    public SystemMemento(String snapshotId,
                         String description,
                         Map<String, Component> liveComponents,
                         Set<Dependency> liveDependencies) {
        this.snapshotId = snapshotId != null ? snapshotId : "memento-" + System.currentTimeMillis();
        this.description = description != null ? description : "System state snapshot";
        this.timestamp = Instant.now();

        Map<String, Component> deepCopiedMap = new HashMap<>();
        for (Map.Entry<String, Component> entry : liveComponents.entrySet()) {
            deepCopiedMap.put(entry.getKey(), entry.getValue().deepCopy());
        }
        this.componentsSnapshot = Collections.unmodifiableMap(deepCopiedMap);
        this.dependenciesSnapshot = Collections.unmodifiableSet(new HashSet<>(liveDependencies));
    }

    public String getSnapshotId() {
        return snapshotId;
    }

    public String getDescription() {
        return description;
    }

    public Instant getTimestamp() {
        return timestamp;
    }

    public Map<String, Component> getComponentsState() {
        Map<String, Component> copy = new HashMap<>();
        for (Map.Entry<String, Component> entry : componentsSnapshot.entrySet()) {
            copy.put(entry.getKey(), entry.getValue().deepCopy());
        }
        return copy;
    }

    public Set<Dependency> getDependenciesState() {
        return new HashSet<>(dependenciesSnapshot);
    }

    public int getComponentCount() {
        return componentsSnapshot.size();
    }

    public int getDependencyCount() {
        return dependenciesSnapshot.size();
    }

    @Override
    public String toString() {
        return "SystemMemento{" +
                "snapshotId='" + snapshotId + '\'' +
                ", description='" + description + '\'' +
                ", timestamp=" + timestamp +
                ", components=" + componentsSnapshot.size() +
                ", dependencies=" + dependenciesSnapshot.size() +
                '}';
    }
}
