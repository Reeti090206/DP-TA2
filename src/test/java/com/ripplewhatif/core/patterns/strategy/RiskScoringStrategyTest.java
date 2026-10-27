package com.ripplewhatif.core.patterns.strategy;

import com.ripplewhatif.core.domain.change.ChangeRequest;
import com.ripplewhatif.core.domain.change.ChangeType;
import com.ripplewhatif.core.domain.change.ChangeUnit;
import com.ripplewhatif.core.domain.model.Component;
import com.ripplewhatif.core.domain.model.ComponentCriticality;
import com.ripplewhatif.core.domain.model.SystemModel;
import com.ripplewhatif.core.patterns.builder.ComponentBuilder;
import com.ripplewhatif.core.patterns.builder.SystemModelBuilder;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class RiskScoringStrategyTest {

    private SystemModel systemModel;
    private ImpactPropagationStrategy propagationStrategy;

    @BeforeEach
    void setUp() {
        systemModel = new SystemModelBuilder()
                .addComponent(ComponentBuilder.of("gateway", "Gateway").criticality(ComponentCriticality.CRITICAL).build())
                .addComponent(ComponentBuilder.of("checkout", "Checkout").criticality(ComponentCriticality.HIGH).build())
                .addComponent(ComponentBuilder.of("payment", "Payment").criticality(ComponentCriticality.CRITICAL).build())
                .addDependency("checkout", "payment")
                .addDependency("gateway", "checkout")
                .build();

        propagationStrategy = new BreadthFirstImpactStrategy();
    }

    @Test
    @DisplayName("WeightedRiskScoringStrategy should strictly bound scores between 0.0 and 100.0")
    void shouldBoundWeightedRiskScore() {
        RiskScoringStrategy strategy = new WeightedRiskScoringStrategy();

        // Moderate change
        ChangeRequest modRequest = new ChangeRequest("Mod", "payment", ChangeType.LATENCY_INCREASE, 50.0, ChangeUnit.PERCENT);
        var propResult = propagationStrategy.propagate(systemModel.deepCopy(), systemModel, modRequest, 5.0);
        double score = strategy.calculateRiskScore(systemModel, modRequest, propResult);

        assertThat(score).isBetween(0.0, 100.0);

        // Extreme change
        ChangeRequest extremeRequest = new ChangeRequest("Extreme", "payment", ChangeType.LATENCY_INCREASE, 10000.0, ChangeUnit.PERCENT);
        var extremeProp = propagationStrategy.propagate(systemModel.deepCopy(), systemModel, extremeRequest, 5.0);
        double extremeScore = strategy.calculateRiskScore(systemModel, extremeRequest, extremeProp);

        assertThat(extremeScore).isBetween(0.0, 100.0);
        assertThat(extremeScore).isGreaterThan(95.0);
    }

    @Test
    @DisplayName("LatencyRiskScoringStrategy should evaluate latency degradation properly")
    void shouldEvaluateLatencyRiskScore() {
        RiskScoringStrategy strategy = new LatencyRiskScoringStrategy();
        ChangeRequest request = new ChangeRequest("Latency", "payment", ChangeType.LATENCY_INCREASE, 80.0, ChangeUnit.PERCENT);

        var propResult = propagationStrategy.propagate(systemModel.deepCopy(), systemModel, request, 5.0);
        double score = strategy.calculateRiskScore(systemModel, request, propResult);

        assertThat(score).isGreaterThan(0.0);
        assertThat(score).isLessThanOrEqualTo(100.0);
    }

    @Test
    @DisplayName("AvailabilityRiskScoringStrategy should score availability drops heavily")
    void shouldEvaluateAvailabilityRiskScore() {
        RiskScoringStrategy strategy = new AvailabilityRiskScoringStrategy();
        ChangeRequest request = new ChangeRequest("Outage", "payment", ChangeType.AVAILABILITY_DECREASE, 10.0, ChangeUnit.PERCENT);

        var propResult = propagationStrategy.propagate(systemModel.deepCopy(), systemModel, request, 5.0);
        double score = strategy.calculateRiskScore(systemModel, request, propResult);

        assertThat(score).isGreaterThan(0.0);
        assertThat(score).isLessThanOrEqualTo(100.0);
    }

    @Test
    @DisplayName("Strategy substitution: Different strategies should calculate distinct risk perspectives")
    void shouldSupportStrategySubstitution() {
        ChangeRequest request = new ChangeRequest("Payment Failure", "payment", ChangeType.LATENCY_INCREASE, 60.0, ChangeUnit.PERCENT);
        var propResult = propagationStrategy.propagate(systemModel.deepCopy(), systemModel, request, 5.0);

        RiskScoringStrategy weighted = new WeightedRiskScoringStrategy();
        RiskScoringStrategy latency = new LatencyRiskScoringStrategy();

        double weightedScore = weighted.calculateRiskScore(systemModel, request, propResult);
        double latencyScore = latency.calculateRiskScore(systemModel, request, propResult);

        assertThat(weightedScore).isBetween(0.0, 100.0);
        assertThat(latencyScore).isBetween(0.0, 100.0);
        // Both strategy names should be distinguishable
        assertThat(weighted.getName()).isNotEqualTo(latency.getName());
    }
}
