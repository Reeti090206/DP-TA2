package com.ripplewhatif.core.patterns.memento;

import com.ripplewhatif.core.domain.model.Component;
import com.ripplewhatif.core.domain.model.SystemModel;
import com.ripplewhatif.core.exception.RippleSimulationException;

import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Optional;
import java.util.Set;

public class SystemSnapshotManager {

    public static final String BASELINE_TAG = "BASELINE";
    private final Map<String, SystemMemento> snapshotRegistry = new LinkedHashMap<>();

    public SystemMemento saveBaseline(SystemModel model) {
        return saveSnapshot(BASELINE_TAG, model, "Default architectural baseline");
    }

    public SystemMemento saveSnapshot(String tag, SystemModel model, String description) {
        if (tag == null || tag.trim().isEmpty()) {
            throw new IllegalArgumentException("Snapshot tag cannot be null or empty");
        }
        if (model == null) {
            throw new IllegalArgumentException("SystemModel cannot be null");
        }
        String cleanTag = tag.trim().toUpperCase();
        SystemMemento memento = model.createMemento(cleanTag, description);
        snapshotRegistry.put(cleanTag, memento);
        return memento;
    }

    public Optional<SystemMemento> getSnapshot(String tag) {
        if (tag == null) return Optional.empty();
        return Optional.ofNullable(snapshotRegistry.get(tag.trim().toUpperCase()));
    }

    public Optional<SystemMemento> getBaselineSnapshot() {
        return getSnapshot(BASELINE_TAG);
    }

    public boolean hasSnapshot(String tag) {
        if (tag == null) return false;
        return snapshotRegistry.containsKey(tag.trim().toUpperCase());
    }

    public void restoreSnapshot(String tag, SystemModel model) {
        SystemMemento memento = getSnapshot(tag)
                .orElseThrow(() -> new RippleSimulationException("Snapshot tag not found: " + tag));
        model.restore(memento);
    }

    public void restoreBaseline(SystemModel model) {
        restoreSnapshot(BASELINE_TAG, model);
    }

    public Set<String> getAvailableTags() {
        return Collections.unmodifiableSet(snapshotRegistry.keySet());
    }

    public void clearSnapshots() {
        snapshotRegistry.clear();
    }
}
