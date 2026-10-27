package com.ripplewhatif.core.patterns.mediator;

import com.ripplewhatif.core.patterns.strategy.BreadthFirstImpactStrategy;
import com.ripplewhatif.core.patterns.strategy.ImpactPropagationStrategy;
import com.ripplewhatif.core.patterns.strategy.RiskScoringStrategy;
import com.ripplewhatif.core.patterns.strategy.WeightedRiskScoringStrategy;

/**
 * Context configuration options supplied to the simulation mediator.
 */
public class SimulationContext {

    private final ImpactPropagationStrategy propagationStrategy;
    private final RiskScoringStrategy scoringStrategy;
    private final double propagationThreshold;
    private final boolean commitChangeAfterSimulation;

    public SimulationContext(ImpactPropagationStrategy propagationStrategy,
                             RiskScoringStrategy scoringStrategy,
                             double propagationThreshold,
                             boolean commitChangeAfterSimulation) {
        this.propagationStrategy = (propagationStrategy != null) ? propagationStrategy : new BreadthFirstImpactStrategy();
        this.scoringStrategy = (scoringStrategy != null) ? scoringStrategy : new WeightedRiskScoringStrategy();
        this.propagationThreshold = Math.max(0.0, propagationThreshold);
        this.commitChangeAfterSimulation = commitChangeAfterSimulation;
    }

    public static SimulationContext defaults() {
        return new SimulationContext(new BreadthFirstImpactStrategy(), new WeightedRiskScoringStrategy(), 5.0, false);
    }

    public ImpactPropagationStrategy getPropagationStrategy() {
        return propagationStrategy;
    }

    public RiskScoringStrategy getScoringStrategy() {
        return scoringStrategy;
    }

    public double getPropagationThreshold() {
        return propagationThreshold;
    }

    public boolean isCommitChangeAfterSimulation() {
        return commitChangeAfterSimulation;
    }
}
