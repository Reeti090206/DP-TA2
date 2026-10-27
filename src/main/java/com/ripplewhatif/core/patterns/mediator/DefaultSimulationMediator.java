package com.ripplewhatif.core.patterns.mediator;

import com.ripplewhatif.core.domain.change.ChangeRequest;
import com.ripplewhatif.core.domain.model.SystemModel;
import com.ripplewhatif.core.domain.result.SimulationResult;
import com.ripplewhatif.core.patterns.memento.SystemSnapshotManager;
import com.ripplewhatif.core.patterns.strategy.BreadthFirstImpactStrategy;
import com.ripplewhatif.core.patterns.strategy.ImpactPropagationStrategy;
import com.ripplewhatif.core.patterns.strategy.RiskScoringStrategy;
import com.ripplewhatif.core.patterns.strategy.WeightedRiskScoringStrategy;
import com.ripplewhatif.core.patterns.template.AbstractSimulationWorkflow;
import com.ripplewhatif.core.patterns.template.DefaultSimulationWorkflow;

import java.util.ArrayList;
import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;

public class DefaultSimulationMediator implements SimulationMediator {

    private ImpactPropagationStrategy propagationStrategy;
    private RiskScoringStrategy scoringStrategy;
    private final SystemSnapshotManager snapshotManager;
    private final AbstractSimulationWorkflow workflow;
    private final Map<String, SimulationResult> history = new LinkedHashMap<>();

    public DefaultSimulationMediator() {
        this(new BreadthFirstImpactStrategy(), new WeightedRiskScoringStrategy());
    }

    public DefaultSimulationMediator(ImpactPropagationStrategy propagationStrategy,
                                     RiskScoringStrategy scoringStrategy) {
        this.propagationStrategy = Objects.requireNonNull(propagationStrategy, "PropagationStrategy required");
        this.scoringStrategy = Objects.requireNonNull(scoringStrategy, "RiskScoringStrategy required");
        this.snapshotManager = new SystemSnapshotManager();
        this.workflow = new DefaultSimulationWorkflow();
    }

    @Override
    public SimulationResult simulate(SystemModel model, ChangeRequest request) {
        SimulationContext context = new SimulationContext(propagationStrategy, scoringStrategy, 5.0, false);
        return simulate(model, request, context);
    }

    @Override
    public SimulationResult simulate(SystemModel model, ChangeRequest request, SimulationContext context) {
        Objects.requireNonNull(model, "SystemModel cannot be null");
        Objects.requireNonNull(request, "ChangeRequest cannot be null");
        Objects.requireNonNull(context, "SimulationContext cannot be null");

        SimulationResult result = workflow.executeWorkflow(model, request, context);

        history.put(result.getScenarioId(), result);
        return result;
    }

    @Override
    public void setPropagationStrategy(ImpactPropagationStrategy strategy) {
        this.propagationStrategy = Objects.requireNonNull(strategy, "Strategy cannot be null");
    }

    @Override
    public void setRiskScoringStrategy(RiskScoringStrategy strategy) {
        this.scoringStrategy = Objects.requireNonNull(strategy, "Scoring strategy cannot be null");
    }

    public ImpactPropagationStrategy getPropagationStrategy() {
        return propagationStrategy;
    }

    public RiskScoringStrategy getScoringStrategy() {
        return scoringStrategy;
    }

    public SystemSnapshotManager getSnapshotManager() {
        return snapshotManager;
    }

    @Override
    public List<SimulationResult> getSimulationHistory() {
        return Collections.unmodifiableList(new ArrayList<>(history.values()));
    }

    @Override
    public Optional<SimulationResult> getResultById(String scenarioId) {
        if (scenarioId == null) return Optional.empty();
        return Optional.ofNullable(history.get(scenarioId));
    }
}
