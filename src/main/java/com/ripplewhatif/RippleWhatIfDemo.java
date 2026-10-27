package com.ripplewhatif;

import com.ripplewhatif.core.domain.change.ChangeRequest;
import com.ripplewhatif.core.domain.change.ChangeType;
import com.ripplewhatif.core.domain.change.ChangeUnit;
import com.ripplewhatif.core.domain.model.Component;
import com.ripplewhatif.core.domain.model.ComponentCriticality;
import com.ripplewhatif.core.domain.model.DependencyStrength;
import com.ripplewhatif.core.domain.model.DependencyType;
import com.ripplewhatif.core.domain.model.SystemModel;
import com.ripplewhatif.core.domain.result.SimulationResult;
import com.ripplewhatif.core.patterns.builder.ComponentBuilder;
import com.ripplewhatif.core.patterns.builder.SystemModelBuilder;
import com.ripplewhatif.core.patterns.mediator.DefaultSimulationMediator;
import com.ripplewhatif.core.patterns.mediator.SimulationContext;
import com.ripplewhatif.core.patterns.memento.SystemSnapshotManager;
import com.ripplewhatif.core.patterns.strategy.BreadthFirstImpactStrategy;
import com.ripplewhatif.core.patterns.strategy.DepthFirstImpactStrategy;
import com.ripplewhatif.core.patterns.strategy.LatencyRiskScoringStrategy;
import com.ripplewhatif.core.patterns.strategy.WeightedRiskScoringStrategy;

public class RippleWhatIfDemo {

    public static void main(String[] args) {
        System.out.println("================================================================================");
        System.out.println("     RIPPLEWHATIF: CHANGE IMPACT & SCENARIO SIMULATOR (CORE JAVA DEMO)");
        System.out.println("================================================================================\n");

        System.out.println("[Step 1] Constructing Architecture using Builder Pattern...");
        SystemModel system = new SystemModelBuilder()
                .id("ecommerce-production")
                .name("E-Commerce Order Processing Architecture")
                .addComponent(ComponentBuilder.of("web-gateway", "Web API Gateway")
                        .type("GATEWAY")
                        .criticality(ComponentCriticality.CRITICAL)
                        .latencyMs(20.0)
                        .availability(99.99)
                        .build())
                .addComponent(ComponentBuilder.of("checkout", "Checkout Service")
                        .type("SERVICE")
                        .criticality(ComponentCriticality.HIGH)
                        .latencyMs(60.0)
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
                        .latencyMs(35.0)
                        .availability(99.95)
                        .build())
                .addComponent(ComponentBuilder.of("notification", "Notification Service")
                        .type("SERVICE")
                        .criticality(ComponentCriticality.LOW)
                        .latencyMs(45.0)
                        .availability(99.5)
                        .build())

                .addDependency("checkout", "payment", DependencyStrength.STRONG, DependencyType.SYNCHRONOUS_REST)
                .addDependency("checkout", "inventory", DependencyStrength.STRONG, DependencyType.SYNCHRONOUS_REST)
                .addDependency("web-gateway", "checkout", DependencyStrength.CRITICAL, DependencyType.SYNCHRONOUS_REST)
                .addDependency("payment", "notification", DependencyStrength.WEAK, DependencyType.ASYNCHRONOUS_QUEUE)
                .build();

        System.out.printf("System built: %d components, %d dependencies.%n",
                system.getAllComponents().size(), system.getAllDependencies().size());
        double originalPaymentLatency = system.getComponent("payment").getProperties().getLatencyMs();
        double originalCheckoutLatency = system.getComponent("checkout").getProperties().getLatencyMs();
        System.out.printf("Baseline metrics: Payment latency = %.1fms | Checkout latency = %.1fms%n%n",
                originalPaymentLatency, originalCheckoutLatency);

        System.out.println("[Step 2] Capturing Baseline Memento Snapshot...");
        SystemSnapshotManager snapshotManager = new SystemSnapshotManager();
        snapshotManager.saveBaseline(system);
        System.out.println("Baseline snapshot stored in Caretaker.\n");

        System.out.println("[Step 3] Submitting What-If Change Request through Simulation Mediator...");
        DefaultSimulationMediator mediator = new DefaultSimulationMediator();

        ChangeRequest paymentSlowdownRequest = new ChangeRequest(
                "Payment Gateway 50% Degradation Scenario",
                "payment",
                ChangeType.LATENCY_INCREASE,
                50.0,
                ChangeUnit.PERCENT,
                "Simulating external bank partner latency spike"
        );

        SimulationContext bfsContext = new SimulationContext(
                new BreadthFirstImpactStrategy(),
                new WeightedRiskScoringStrategy(),
                5.0,
                false
        );

        SimulationResult resultBfs = mediator.simulate(system, paymentSlowdownRequest, bfsContext);
        System.out.println(resultBfs.toFormattedSummary());

        System.out.println("[Step 4] Strategy Substitution: Rerunning with DFS Traversal and Latency Scoring...");
        SimulationContext dfsContext = new SimulationContext(
                new DepthFirstImpactStrategy(),
                new LatencyRiskScoringStrategy(),
                5.0,
                false
        );

        SimulationResult resultDfs = mediator.simulate(system, paymentSlowdownRequest, dfsContext);
        System.out.printf("DFS Strategy Result: Risk Score = %.2f [%s] (Strategy: %s)%n%n",
                resultDfs.getOverallRiskScore(), resultDfs.getRiskLevel(), resultDfs.getStrategyName());

        System.out.println("[Step 5] Verifying Scenario Isolation & Baseline Immutability...");
        double currentPaymentLatency = system.getComponent("payment").getProperties().getLatencyMs();
        double currentCheckoutLatency = system.getComponent("checkout").getProperties().getLatencyMs();

        System.out.printf("Live System Payment Latency  : %.1fms (Baseline was: %.1fms)%n",
                currentPaymentLatency, originalPaymentLatency);
        System.out.printf("Live System Checkout Latency : %.1fms (Baseline was: %.1fms)%n",
                currentCheckoutLatency, originalCheckoutLatency);

        if (Double.compare(currentPaymentLatency, originalPaymentLatency) == 0 &&
                Double.compare(currentCheckoutLatency, originalCheckoutLatency) == 0) {
            System.out.println("SUCCESS: Live system was NOT mutated. Baseline preserved intact!");
        } else {
            System.err.println("FAILURE: System state leaked from what-if scenario!");
        }

        System.out.println("\n================================================================================");
        System.out.println("     DEMONSTRATION COMPLETED SUCCESSFULLY");
        System.out.println("================================================================================");
    }
}
