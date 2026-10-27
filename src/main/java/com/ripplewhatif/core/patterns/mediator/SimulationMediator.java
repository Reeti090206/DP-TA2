package com.ripplewhatif.core.patterns.mediator;

import com.ripplewhatif.core.domain.change.ChangeRequest;
import com.ripplewhatif.core.domain.model.SystemModel;
import com.ripplewhatif.core.domain.result.SimulationResult;
import com.ripplewhatif.core.patterns.strategy.ImpactPropagationStrategy;
import com.ripplewhatif.core.patterns.strategy.RiskScoringStrategy;

import java.util.List;
import java.util.Optional;

public interface SimulationMediator {

    SimulationResult simulate(SystemModel model, ChangeRequest request);

    SimulationResult simulate(SystemModel model, ChangeRequest request, SimulationContext context);

    void setPropagationStrategy(ImpactPropagationStrategy strategy);

    void setRiskScoringStrategy(RiskScoringStrategy strategy);

    List<SimulationResult> getSimulationHistory();

    Optional<SimulationResult> getResultById(String scenarioId);
}
