package com.ripplewhatif.core.patterns.strategy;

import com.ripplewhatif.core.domain.change.ChangeRequest;
import com.ripplewhatif.core.domain.change.ChangeType;
import com.ripplewhatif.core.domain.change.ChangeUnit;
import com.ripplewhatif.core.domain.model.Component;
import com.ripplewhatif.core.domain.model.Dependency;
import com.ripplewhatif.core.domain.model.SystemModel;
import com.ripplewhatif.core.patterns.builder.SystemModelBuilder;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class ImpactPropagationStrategyTest {

    private SystemModel baselineModel;

    @BeforeEach
    void setUp() {

        baselineModel = new SystemModelBuilder()
                .addComponent(new Component("gateway", "API Gateway"))
                .addComponent(new Component("checkout", "Checkout Service"))
                .addComponent(new Component("payment", "Payment Service"))
                .addComponent(new Component("inventory", "Inventory Service"))
                .addDependency("checkout", "payment")
                .addDependency("checkout", "inventory")
                .addDependency("gateway", "checkout")
                .build();
    }

    @Test
    @DisplayName("BFS should identify direct and indirect affected components correctly")
    void shouldIdentifyDirectAndIndirectWithBFS() {
        ImpactPropagationStrategy bfs = new BreadthFirstImpactStrategy();
        ChangeRequest request = new ChangeRequest(
                "Payment Slowdown",
                "payment",
                ChangeType.LATENCY_INCREASE,
                50.0,
                ChangeUnit.PERCENT
        );

        SystemModel workingCopy = baselineModel.deepCopy();
        ImpactPropagationStrategy.PropagationResult result = bfs.propagate(workingCopy, baselineModel, request, 5.0);

        assertThat(result.directlyAffected()).containsExactly("payment");
        assertThat(result.indirectlyAffected()).containsExactlyInAnyOrder("checkout", "gateway");
        assertThat(result.indirectlyAffected()).doesNotContain("inventory");

        assertThat(result.impactPaths()).anyMatch(path ->
                path.equals(List.of("payment", "checkout", "gateway")));
    }

    @Test
    @DisplayName("DFS should traverse deep cascading dependency chains")
    void shouldPropagateWithDFS() {
        ImpactPropagationStrategy dfs = new DepthFirstImpactStrategy();
        ChangeRequest request = new ChangeRequest(
                "Payment Failure",
                "payment",
                ChangeType.FAILURE_PROBABILITY_INCREASE,
                0.20,
                ChangeUnit.ABSOLUTE
        );

        SystemModel workingCopy = baselineModel.deepCopy();
        ImpactPropagationStrategy.PropagationResult result = dfs.propagate(workingCopy, baselineModel, request, 2.0);

        assertThat(result.directlyAffected()).containsExactly("payment");
        assertThat(result.indirectlyAffected()).contains("checkout", "gateway");
        assertThat(result.impactRecords().get("checkout").getImpactScore()).isGreaterThan(0.0);
    }

    @Test
    @DisplayName("Should prevent infinite loops and terminate gracefully when graph has dependency cycles")
    void shouldHandleDependencyCyclesWithoutInfiniteLoop() {

        SystemModel cyclicModel = new SystemModelBuilder()
                .addComponent(new Component("comp-a", "Component A"))
                .addComponent(new Component("comp-b", "Component B"))
                .addComponent(new Component("comp-c", "Component C"))
                .addDependency("comp-a", "comp-b")
                .addDependency("comp-b", "comp-c")
                .addDependency("comp-c", "comp-a")
                .build();

        ImpactPropagationStrategy bfs = new BreadthFirstImpactStrategy();
        ChangeRequest request = new ChangeRequest("Cycle test", "comp-c", ChangeType.LATENCY_INCREASE, 40.0, ChangeUnit.PERCENT);

        ImpactPropagationStrategy.PropagationResult result = bfs.propagate(
                cyclicModel.deepCopy(), cyclicModel, request, 1.0);

        assertThat(result.directlyAffected()).containsExactly("comp-c");
        assertThat(result.indirectlyAffected()).contains("comp-b", "comp-a");

        assertThat(result.impactRecords()).hasSize(3);
    }

    @Test
    @DisplayName("Should handle multiple paths reaching the same component without duplicate counting")
    void shouldHandleMultiplePathsReachingSameComponent() {

        SystemModel diamondModel = new SystemModelBuilder()
                .addComponent(new Component("coredb", "Core Database"))
                .addComponent(new Component("service-a", "Service A"))
                .addComponent(new Component("service-b", "Service B"))
                .addComponent(new Component("gateway", "Gateway"))
                .addDependency("service-a", "coredb")
                .addDependency("service-b", "coredb")
                .addDependency("gateway", "service-a")
                .addDependency("gateway", "service-b")
                .build();

        ImpactPropagationStrategy bfs = new BreadthFirstImpactStrategy();
        ChangeRequest request = new ChangeRequest("DB Slowdown", "coredb", ChangeType.LATENCY_INCREASE, 60.0, ChangeUnit.PERCENT);

        ImpactPropagationStrategy.PropagationResult result = bfs.propagate(
                diamondModel.deepCopy(), diamondModel, request, 5.0);

        assertThat(result.directlyAffected()).containsExactly("coredb");

        long gatewayCount = result.indirectlyAffected().stream().filter(id -> id.equals("gateway")).count();
        assertThat(gatewayCount).isEqualTo(1);

        List<List<String>> pathsToGateway = result.impactPaths().stream()
                .filter(p -> p.get(p.size() - 1).equals("gateway"))
                .toList();
        assertThat(pathsToGateway.size()).isGreaterThanOrEqualTo(2);
    }

    @Test
    @DisplayName("Should truncate propagation when impact drops below configurable threshold")
    void shouldRespectConfigurablePropagationThreshold() {
        ImpactPropagationStrategy bfs = new BreadthFirstImpactStrategy();
        ChangeRequest request = new ChangeRequest("Minor Latency", "payment", ChangeType.LATENCY_INCREASE, 10.0, ChangeUnit.PERCENT);

        ImpactPropagationStrategy.PropagationResult strictResult = bfs.propagate(
                baselineModel.deepCopy(), baselineModel, request, 50.0);

        assertThat(strictResult.directlyAffected()).containsExactly("payment");
        assertThat(strictResult.indirectlyAffected()).doesNotContain("gateway");
    }

    @Test
    @DisplayName("Should propagate load spike downstream from caller to callees")
    void shouldPropagateLoadDownstream() {
        ImpactPropagationStrategy bfs = new BreadthFirstImpactStrategy();
        ChangeRequest loadRequest = new ChangeRequest(
                "Gateway Traffic Spike",
                "gateway",
                ChangeType.LOAD_INCREASE,
                100.0,
                ChangeUnit.PERCENT
        );

        ImpactPropagationStrategy.PropagationResult result = bfs.propagate(
                baselineModel.deepCopy(), baselineModel, loadRequest, 5.0);

        assertThat(result.directlyAffected()).containsExactly("gateway");

        assertThat(result.indirectlyAffected()).contains("checkout", "payment", "inventory");
    }
}
