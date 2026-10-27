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

public abstract class AbstractSimulationWorkflow {

    public final SimulationResult executeWorkflow(SystemModel baselineModel,
                                                  ChangeRequest request,
                                                  SimulationContext context) {
        long startTime = System.currentTimeMillis();

        validate(baselineModel, request);

        SystemMemento baselineMemento = captureBaselineSnapshot(baselineModel);

        SystemModel workingModel = createWorkingCopy(baselineModel);

        ImpactPropagationStrategy.PropagationResult propResult =
                executePropagation(workingModel, baselineModel, request, context);

        double riskScore = calculateRisk(workingModel, request, propResult, context);

        long duration = System.currentTimeMillis() - startTime;
        String scenarioId = "scn-" + UUID.randomUUID().toString().substring(0, 8);

        SimulationResult result = assembleResult(
                scenarioId,
                request,
                propResult,
                riskScore,
                duration,
                context,
                !context.isCommitChangeAfterSimulation()
        );

        finalizeState(baselineModel, workingModel, baselineMemento, context);

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

            baselineModel.restore(workingModel.createMemento("COMMITTED", "Simulated state committed"));
        } else {

            baselineModel.restore(baselineMemento);
        }
    }

    protected void onSimulationCompleted(SimulationResult result) {

    }
}
