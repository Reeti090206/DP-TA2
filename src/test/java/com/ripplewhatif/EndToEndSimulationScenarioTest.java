package com.ripplewhatif;

import com.ripplewhatif.core.domain.change.ChangeRequest;
import com.ripplewhatif.core.domain.change.ChangeType;
import com.ripplewhatif.core.domain.change.ChangeUnit;
import com.ripplewhatif.core.domain.model.Component;
import com.ripplewhatif.core.domain.model.ComponentCriticality;
import com.ripplewhatif.core.domain.model.ComponentProperties;
import com.ripplewhatif.core.domain.model.DependencyStrength;
import com.ripplewhatif.core.domain.model.DependencyType;
import com.ripplewhatif.core.domain.model.SystemModel;
import com.ripplewhatif.core.domain.result.RiskLevel;
import com.ripplewhatif.core.domain.result.SimulationResult;
import com.ripplewhatif.core.patterns.builder.ComponentBuilder;
import com.ripplewhatif.core.patterns.builder.SystemModelBuilder;
import com.ripplewhatif.core.patterns.mediator.DefaultSimulationMediator;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Full End-to-End simulation scenario test verifying:
 *  1. Architecture creation with Builder pattern
 *  2. Change propagation through directed dependency graph
 *  3. Calculation of risk scores
 *  4. Preservation of baseline state (Scenario Isolation via Memento)
 */
class EndToEndSimulationScenarioTest {

    @Test
    @DisplayName("End-to-End Simulation: Payment Service 50% slowdown propagation and baseline preservation")
    void testEndToEndPaymentSlowdownScenario() {
        // Step 1: Build the enterprise system architecture
        // Web Gateway -> Checkout Service -> Payment Service
        // Checkout Service -> Inventory Service
        // Payment Service -> Notification Service
        SystemModel system = new SystemModelBuilder()
                .id("enterprise-ecommerce")
                .name("Production Order Flow")
                .addComponent(ComponentBuilder.of("web-gateway", "Web Gateway")
                        .type("GATEWAY")
                        .criticality(ComponentCriticality.CRITICAL)
                        .latencyMs(20.0)
                        .availability(99.99)
                        .build())
                .addComponent(ComponentBuilder.of("checkout", "Checkout Service")
                        .type("SERVICE")
                        .criticality(ComponentCriticality.HIGH)
                        .latencyMs(65.0)
                        .availability(99.95)
                        .build())
                .addComponent(ComponentBuilder.of("payment", "Payment Service")
                        .type("SERVICE")
                        .criticality(ComponentCriticality.HIGH)
                        .latencyMs(120.0)
                        .availability(99.9)
                        .build())
                .addComponent(ComponentBuilder.of("inventory", "Inventory Service")
                        .type("SERVICE")
                        .criticality(ComponentCriticality.MEDIUM)
                        .latencyMs(40.0)
                        .availability(99.95)
                        .build())
                .addComponent(ComponentBuilder.of("notification", "Notification Service")
                        .type("SERVICE")
                        .criticality(ComponentCriticality.LOW)
                        .latencyMs(30.0)
                        .availability(99.5)
                        .build())
                .addDependency("checkout", "payment", DependencyStrength.STRONG, DependencyType.SYNCHRONOUS_REST)
                .addDependency("checkout", "inventory", DependencyStrength.STRONG, DependencyType.SYNCHRONOUS_REST)
                .addDependency("web-gateway", "checkout", DependencyStrength.CRITICAL, DependencyType.SYNCHRONOUS_REST)
                .addDependency("payment", "notification", DependencyStrength.WEAK, DependencyType.ASYNCHRONOUS_QUEUE)
                .build();

        // Capture initial properties to assert baseline preservation
        ComponentProperties initialPaymentProps = system.getComponent("payment").getProperties().copy();
        ComponentProperties initialCheckoutProps = system.getComponent("checkout").getProperties().copy();
        ComponentProperties initialGatewayProps = system.getComponent("web-gateway").getProperties().copy();

        // Step 2: Formulate what-if change request
        ChangeRequest paymentSlowdown = new ChangeRequest(
                "Payment Service 50% Slowdown",
                "payment",
                ChangeType.LATENCY_INCREASE,
                50.0,
                ChangeUnit.PERCENT,
                "Bank gateway throttling simulation"
        );

        // Step 3: Run simulation through mediator
        DefaultSimulationMediator mediator = new DefaultSimulationMediator();
        SimulationResult result = mediator.simulate(system, paymentSlowdown);

        // Step 4: Print the simulation report to stdout
        System.out.println(result.toFormattedSummary());

        // Step 5: Verify simulation outcomes
        // 5a. Direct impact
        assertThat(result.getDirectlyAffected()).containsExactly("payment");

        // 5b. Indirect upstream impact: Checkout and Web Gateway
        assertThat(result.getIndirectlyAffected()).containsExactlyInAnyOrder("checkout", "web-gateway");

        // 5c. Sibling and downstream services are unaffected by payment latency surge
        assertThat(result.getIndirectlyAffected()).doesNotContain("inventory", "notification");

        // 5d. Verification of propagation path
        assertThat(result.getImpactPaths()).contains(List.of("payment", "checkout", "web-gateway"));

        // 5e. Risk score is computed and within boundaries
        assertThat(result.getOverallRiskScore()).isBetween(0.0, 100.0);
        assertThat(result.getRiskLevel()).isNotEqualTo(RiskLevel.LOW);

        // 5f. Verify isolated projected latencies
        double projectedPaymentLatency = result.getImpactRecords().get("payment").getProjectedProperties().getLatencyMs();
        assertThat(projectedPaymentLatency).isEqualTo(180.0); // 120 + 50% of 120 = 180

        double projectedCheckoutLatency = result.getImpactRecords().get("checkout").getProjectedProperties().getLatencyMs();
        assertThat(projectedCheckoutLatency).isGreaterThan(initialCheckoutProps.getLatencyMs());

        // Step 6: Verify baseline model remained untouched (Scenario Isolation / Memento pattern)
        assertThat(result.isBaselinePreserved()).isTrue();
        assertThat(system.getComponent("payment").getProperties()).isEqualTo(initialPaymentProps);
        assertThat(system.getComponent("checkout").getProperties()).isEqualTo(initialCheckoutProps);
        assertThat(system.getComponent("web-gateway").getProperties()).isEqualTo(initialGatewayProps);
    }
}
