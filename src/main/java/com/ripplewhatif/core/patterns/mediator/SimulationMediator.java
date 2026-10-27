package com.ripplewhatif.core.patterns.mediator;

import com.ripplewhatif.core.domain.change.ChangeRequest;
import com.ripplewhatif.core.domain.model.SystemModel;
import com.ripplewhatif.core.domain.result.SimulationResult;
import com.ripplewhatif.core.patterns.strategy.ImpactPropagationStrategy;
import com.ripplewhatif.core.patterns.strategy.RiskScoringStrategy;

import java.util.List;
import java.util.Optional;

/**
 * <b>Mediator Pattern:</b> Central coordinator interface that orchestrates the change impact simulation.
 *
 * <p>Decouples domain components, graph traversal strategies, risk algorithms, and snapshot caretakers.
 */
public interface SimulationMediator {

    /**
     * Executes a simulation scenario against a system model.
     *
     * @param model the baseline system model
     * @param request the change request to evaluate
     * @return structured simulation result
     */
    SimulationResult simulate(SystemModel model, ChangeRequest request);

    /**
     * Executes a simulation scenario with custom context strategies and thresholds.
     */
    SimulationResult simulate(SystemModel model, ChangeRequest request, SimulationContext context);

    /**
     * Configures the active propagation strategy.
     */
    void setPropagationStrategy(ImpactPropagationStrategy strategy);

    /**
     * Configures the active risk scoring strategy.
     */
    void setRiskScoringStrategy(RiskScoringStrategy strategy);

    /**
     * Retrieves historical simulation results run through this mediator.
     */
    List<SimulationResult> getSimulationHistory();

    /**
     * Retrieves a simulation result by scenario ID.
     */
    Optional<SimulationResult> getResultById(String scenarioId);
}
