package com.ripplewhatif.core.patterns.strategy;

import com.ripplewhatif.core.domain.change.ChangeRequest;
import com.ripplewhatif.core.domain.model.SystemModel;

/**
 * <b>Strategy Pattern:</b> Strategy interface for calculating the aggregate risk score (0.0 to 100.0)
 * resulting from a change simulation.
 *
 * <p>All implementations must return normalized values bounded strictly between 0.0 and 100.0.
 */
public interface RiskScoringStrategy {

    /**
     * Computes the normalized overall risk score.
     *
     * @param model the simulated system model
     * @param request the applied change request
     * @param propagationResult the propagation analysis containing affected components
     * @return risk score strictly in the range [0.0, 100.0]
     */
    double calculateRiskScore(SystemModel model,
                              ChangeRequest request,
                              ImpactPropagationStrategy.PropagationResult propagationResult);

    /**
     * Explains the mathematical formula and weights utilized by this scoring strategy.
     */
    String getFormulaDocumentation();

    /**
     * Human-readable name of the scoring strategy.
     */
    String getName();
}
