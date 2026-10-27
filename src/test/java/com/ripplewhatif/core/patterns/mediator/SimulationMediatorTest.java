package com.ripplewhatif.core.patterns.mediator;

import com.ripplewhatif.core.domain.change.ChangeRequest;
import com.ripplewhatif.core.domain.change.ChangeType;
import com.ripplewhatif.core.domain.change.ChangeUnit;
import com.ripplewhatif.core.domain.model.Component;
import com.ripplewhatif.core.domain.model.Dependency;
import com.ripplewhatif.core.domain.model.SystemModel;
import com.ripplewhatif.core.domain.result.SimulationResult;
import com.ripplewhatif.core.exception.ComponentNotFoundException;
import com.ripplewhatif.core.patterns.builder.SystemModelBuilder;
import com.ripplewhatif.core.patterns.strategy.DepthFirstImpactStrategy;
import com.ripplewhatif.core.patterns.strategy.LatencyRiskScoringStrategy;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class SimulationMediatorTest {

    private SystemModel model;
    private DefaultSimulationMediator mediator;

    @BeforeEach
    void setUp() {
        model = new SystemModelBuilder()
                .addComponent(new Component("gateway", "API Gateway"))
                .addComponent(new Component("checkout", "Checkout Service"))
                .addComponent(new Component("payment", "Payment Service"))
                .addDependency(new Dependency("checkout", "payment"))
                .addDependency(new Dependency("gateway", "checkout"))
                .build();

        mediator = new DefaultSimulationMediator();
    }

    @Test
    @DisplayName("Should coordinate change simulation and preserve baseline state intact")
    void shouldCoordinateSimulationAndPreserveBaseline() {
        double originalPaymentLatency = model.getComponent("payment").getProperties().getLatencyMs();
        double originalCheckoutLatency = model.getComponent("checkout").getProperties().getLatencyMs();

        ChangeRequest request = new ChangeRequest(
                "Payment Latency Hike",
                "payment",
                ChangeType.LATENCY_INCREASE,
                50.0,
                ChangeUnit.PERCENT
        );

        SimulationResult result = mediator.simulate(model, request);

        assertThat(result).isNotNull();
        assertThat(result.getScenarioId()).isNotBlank();
        assertThat(result.getDirectlyAffected()).containsExactly("payment");
        assertThat(result.getIndirectlyAffected()).contains("checkout", "gateway");
        assertThat(result.getOverallRiskScore()).isGreaterThan(0.0);
        assertThat(result.isBaselinePreserved()).isTrue();

        // Verify baseline model remained untouched
        double currentPaymentLatency = model.getComponent("payment").getProperties().getLatencyMs();
        double currentCheckoutLatency = model.getComponent("checkout").getProperties().getLatencyMs();

        assertThat(currentPaymentLatency).isEqualTo(originalPaymentLatency);
        assertThat(currentCheckoutLatency).isEqualTo(originalCheckoutLatency);
    }

    @Test
    @DisplayName("Should reject change request targeting unregistered component")
    void shouldRejectUnregisteredTargetComponent() {
        ChangeRequest request = new ChangeRequest("Bad Target", "ghost-service", ChangeType.LATENCY_INCREASE, 50.0, ChangeUnit.PERCENT);

        assertThatThrownBy(() -> mediator.simulate(model, request))
                .isInstanceOf(ComponentNotFoundException.class)
                .hasMessageContaining("ghost-service");
    }

    @Test
    @DisplayName("Should store simulation history and retrieve scenario by ID")
    void shouldStoreAndRetrieveSimulationHistory() {
        ChangeRequest r1 = new ChangeRequest("Scenario 1", "payment", ChangeType.LATENCY_INCREASE, 25.0, ChangeUnit.PERCENT);
        ChangeRequest r2 = new ChangeRequest("Scenario 2", "checkout", ChangeType.LATENCY_INCREASE, 30.0, ChangeUnit.PERCENT);

        SimulationResult res1 = mediator.simulate(model, r1);
        SimulationResult res2 = mediator.simulate(model, r2);

        assertThat(mediator.getSimulationHistory()).hasSize(2);
        assertThat(mediator.getResultById(res1.getScenarioId())).isPresent();
        assertThat(mediator.getResultById(res2.getScenarioId())).isPresent();
    }

    @Test
    @DisplayName("Should switch strategies via mediator setters without breaking workflow")
    void shouldSwitchStrategiesViaMediator() {
        mediator.setPropagationStrategy(new DepthFirstImpactStrategy());
        mediator.setRiskScoringStrategy(new LatencyRiskScoringStrategy());

        ChangeRequest request = new ChangeRequest("Switch Test", "payment", ChangeType.LATENCY_INCREASE, 40.0, ChangeUnit.PERCENT);
        SimulationResult result = mediator.simulate(model, request);

        assertThat(result.getStrategyName()).isEqualTo("DepthFirstSearch (DFS) Strategy");
        assertThat(result.getOverallRiskScore()).isBetween(0.0, 100.0);
    }
}
