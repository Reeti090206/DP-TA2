package com.ripplewhatif.core.patterns.template;

import com.ripplewhatif.core.domain.change.ChangeRequest;
import com.ripplewhatif.core.domain.model.SystemModel;
import com.ripplewhatif.core.domain.result.RiskLevel;
import com.ripplewhatif.core.domain.result.SimulationResult;
import com.ripplewhatif.core.exception.ComponentNotFoundException;
import com.ripplewhatif.core.exception.InvalidChangeException;
import com.ripplewhatif.core.patterns.mediator.SimulationContext;
import com.ripplewhatif.core.patterns.memento.SystemMemento;
import com.ripplewhatif.core.patterns.strategy.ImpactPropagationStrategy;

import java.time.Instant;
import java.util.UUID;

/**
 * <b>Template Method Pattern:</b> Defines the invariant skeleton of the simulation workflow
 * while delegating specific algorithmic steps and hook points to subclasses and strategy collaborators.
 */
public abstract class AbstractSimulationWorkflow {

    /**
     * The template method defining the immutable algorithmic sequence.
     */
    public final SimulationResult executeWorkflow(SystemModel baselineModel,
                                                  ChangeRequest request,
                                                  SimulationContext context) {
        long startTime = System.currentTimeMillis();

        // 1. Validation step
        validate(baselineModel, request);

        // 2. Memento snapshot of baseline
        SystemMemento baselineMemento = captureBaselineSnapshot(baselineModel);

        // 3. Isolated working state instantiation
        SystemModel workingModel = createWorkingCopy(baselineModel);

        // 4. Execution of propagation strategy
        ImpactPropagationStrategy.PropagationResult propResult =
                executePropagation(workingModel, baselineModel, request, context);

        // 5. Execution of risk calculation strategy
        double riskScore = calculateRisk(workingModel, request, propResult, context);

        long duration = System.currentTimeMillis() - startTime;
        String scenarioId = "scn-" + UUID.randomUUID().toString().substring(0, 8);

        // 6. Report assembly
        SimulationResult result = assembleResult(
                scenarioId,
                request,
                propResult,
                riskScore,
                duration,
                context,
                !context.isCommitChangeAfterSimulation()
        );

        // 7. Cleanup or conditional commit
        finalizeState(baselineModel, workingModel, baselineMemento, context);

        // 8. Completion hook
        onSimulationCompleted(result);

        return result;
    }

    protected void validate(SystemModel model, ChangeRequest request) {
        if (model == null) {
            throw new InvalidChangeException("SystemModel cannot be null");
        }
        if (request == null) {
            throw new InvalidChangeException("ChangeRequest cannot be null");
        }
        if (!model.hasComponent(request.getTargetComponentId())) {
            throw new ComponentNotFoundException(request.getTargetComponentId());
        }
    }

    protected SystemMemento captureBaselineSnapshot(SystemModel model) {
        return model.createMemento("AUTO-BASELINE-" + System.currentTimeMillis(), "Pre-simulation snapshot");
    }

    protected SystemModel createWorkingCopy(SystemModel baselineModel) {
        return baselineModel.deepCopy();
    }

    protected ImpactPropagationStrategy.PropagationResult executePropagation(SystemModel workingModel,
                                                                             SystemModel baselineModel,
                                                                             ChangeRequest request,
                                                                             SimulationContext context) {
        return context.getPropagationStrategy().propagate(
                workingModel,
                baselineModel,
                request,
                context.getPropagationThreshold()
        );
    }

    protected double calculateRisk(SystemModel workingModel,
                                   ChangeRequest request,
                                   ImpactPropagationStrategy.PropagationResult propResult,
                                   SimulationContext context) {
        return context.getScoringStrategy().calculateRiskScore(workingModel, request, propResult);
    }

    protected SimulationResult assembleResult(String scenarioId,
                                              ChangeRequest request,
                                              ImpactPropagationStrategy.PropagationResult propResult,
                                              double riskScore,
                                              long durationMs,
                                              SimulationContext context,
                                              boolean baselinePreserved) {
        return new SimulationResult(
                scenarioId,
                request.getScenarioName(),
                request.getTargetComponentId(),
                request,
                propResult.directlyAffected(),
                propResult.indirectlyAffected(),
                propResult.impactRecords(),
                riskScore,
                RiskLevel.fromScore(riskScore),
                propResult.impactPaths(),
                baselinePreserved,
                Instant.now(),
                durationMs,
                context.getPropagationStrategy().getName()
        );
    }

    protected void finalizeState(SystemModel baselineModel,
                                 SystemModel workingModel,
                                 SystemMemento baselineMemento,
                                 SimulationContext context) {
        if (context.isCommitChangeAfterSimulation()) {
            // Explicit user commit: copy working model state into baseline
            baselineModel.restore(workingModel.createMemento("COMMITTED", "Simulated state committed"));
        } else {
            // Restore snapshot to ensure strict baseline isolation
            baselineModel.restore(baselineMemento);
        }
    }

    /**
     * Hook method invoked upon simulation completion. Subclasses can override.
     */
    protected void onSimulationCompleted(SimulationResult result) {
        // Default no-op hook
    }
}
