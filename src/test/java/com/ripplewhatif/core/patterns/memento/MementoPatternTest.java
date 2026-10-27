package com.ripplewhatif.core.patterns.memento;

import com.ripplewhatif.core.domain.model.Component;
import com.ripplewhatif.core.domain.model.ComponentProperties;
import com.ripplewhatif.core.domain.model.Dependency;
import com.ripplewhatif.core.domain.model.SystemModel;
import com.ripplewhatif.core.patterns.builder.SystemModelBuilder;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class MementoPatternTest {

    private SystemModel liveModel;
    private SystemSnapshotManager snapshotManager;

    @BeforeEach
    void setUp() {
        liveModel = new SystemModelBuilder()
                .addComponent(new Component("payment", "Payment Service"))
                .addComponent(new Component("checkout", "Checkout Service"))
                .addDependency(new Dependency("checkout", "payment"))
                .build();

        snapshotManager = new SystemSnapshotManager();
    }

    @Test
    @DisplayName("Should capture snapshot and verify snapshot immutability against live system modifications")
    void shouldEnsureSnapshotImmutability() {
        // Save baseline snapshot
        SystemMemento memento = snapshotManager.saveBaseline(liveModel);
        double originalPaymentLatency = liveModel.getComponent("payment").getProperties().getLatencyMs();

        // Mutate live system
        ComponentProperties modifiedProps = liveModel.getComponent("payment").getProperties().withLatencyMs(999.0);
        liveModel.updateComponentProperties("payment", modifiedProps);

        // Verify live model reflects modification
        assertThat(liveModel.getComponent("payment").getProperties().getLatencyMs()).isEqualTo(999.0);

        // Verify memento snapshot remains completely untouched (deep copied)
        Component snapshotPayment = memento.getComponentsState().get("payment");
        assertThat(snapshotPayment.getProperties().getLatencyMs()).isEqualTo(originalPaymentLatency);
    }

    @Test
    @DisplayName("Should restore live system to baseline snapshot accurately")
    void shouldRestoreSystemFromSnapshot() {
        double originalPaymentLatency = liveModel.getComponent("payment").getProperties().getLatencyMs();
        snapshotManager.saveBaseline(liveModel);

        // Mutate live system: modify payment and add new component
        liveModel.updateComponentProperties("payment", liveModel.getComponent("payment").getProperties().withLatencyMs(500.0));
        liveModel.addComponent(new Component("fraud-check", "Fraud Service"));
        assertThat(liveModel.getAllComponents()).hasSize(3);

        // Restore baseline
        snapshotManager.restoreBaseline(liveModel);

        // Check restored state
        assertThat(liveModel.getAllComponents()).hasSize(2);
        assertThat(liveModel.hasComponent("fraud-check")).isFalse();
        assertThat(liveModel.getComponent("payment").getProperties().getLatencyMs()).isEqualTo(originalPaymentLatency);
    }

    @Test
    @DisplayName("Should manage multiple snapshot tags in caretaker")
    void shouldManageMultipleSnapshotsInCaretaker() {
        snapshotManager.saveSnapshot("V1", liveModel, "Initial version");

        liveModel.addComponent(new Component("audit-log", "Audit Log Service"));
        snapshotManager.saveSnapshot("V2", liveModel, "Added audit logging");

        assertThat(snapshotManager.hasSnapshot("V1")).isTrue();
        assertThat(snapshotManager.hasSnapshot("V2")).isTrue();
        assertThat(snapshotManager.getAvailableTags()).contains("V1", "V2");

        // Roll back to V1
        snapshotManager.restoreSnapshot("V1", liveModel);
        assertThat(liveModel.hasComponent("audit-log")).isFalse();
    }
}
