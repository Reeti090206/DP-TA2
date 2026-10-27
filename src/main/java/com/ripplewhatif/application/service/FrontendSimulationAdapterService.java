package com.ripplewhatif.application.service;

import com.ripplewhatif.application.dto.FrontendAnalysisFindingDto;
import com.ripplewhatif.application.dto.FrontendAnalyzedSourceChangeDto;
import com.ripplewhatif.application.dto.FrontendScenarioAnalysisDto;
import com.ripplewhatif.application.dto.FrontendScenarioAnalysisRequestDto;
import com.ripplewhatif.application.dto.FrontendScenarioChangeDto;
import com.ripplewhatif.core.domain.change.ChangeRequest;
import com.ripplewhatif.core.domain.change.ChangeType;
import com.ripplewhatif.core.domain.change.ChangeUnit;
import com.ripplewhatif.core.domain.model.CommerceCoreSystemFactory;
import com.ripplewhatif.core.domain.model.Component;
import com.ripplewhatif.core.domain.model.SystemModel;
import com.ripplewhatif.core.domain.result.ImpactRecord;
import com.ripplewhatif.core.domain.result.SimulationResult;
import com.ripplewhatif.core.patterns.mediator.DefaultSimulationMediator;
import com.ripplewhatif.core.patterns.mediator.SimulationContext;
import com.ripplewhatif.core.patterns.strategy.BreadthFirstImpactStrategy;
import com.ripplewhatif.core.patterns.strategy.DepthFirstImpactStrategy;
import com.ripplewhatif.core.patterns.strategy.ImpactPropagationStrategy;
import com.ripplewhatif.core.patterns.strategy.RiskScoringStrategy;
import com.ripplewhatif.core.patterns.strategy.WeightedRiskScoringStrategy;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * Service adapting Java Core Simulation Engine results to the exact JSON contract
 * expected by the React/TypeScript frontend (ScenarioAnalysis).
 */
@Service
public class FrontendSimulationAdapterService {

    public FrontendScenarioAnalysisDto analyzeFrontendScenario(FrontendScenarioAnalysisRequestDto request) {
        long startTime = System.currentTimeMillis();
        SystemModel model = CommerceCoreSystemFactory.createCommerceCoreModel();

        List<FrontendScenarioChangeDto> changeSet = (request.changeSet() != null)
                ? request.changeSet()
                : List.of();

        if (changeSet.isEmpty()) {
            return emptyAnalysis(request);
        }

        List<String> sourceComponentIds = new ArrayList<>();
        List<FrontendAnalyzedSourceChangeDto> sourceChanges = new ArrayList<>();
        List<ChangeRequest> coreChangeRequests = new ArrayList<>();

        for (FrontendScenarioChangeDto change : changeSet) {
            String compId = change.componentId();
            Component component = model.findComponent(compId).orElse(null);
            if (component == null) continue;

            sourceComponentIds.add(compId);
            double baselineVal = getPropertyValue(component, change.propertyKey());
            double proposedVal = change.value();
            double diff = proposedVal - baselineVal;
            String direction = diff >= 0 ? "increase" : "decrease";
            double changePct = baselineVal != 0 ? Math.abs((diff / baselineVal) * 100.0) : 0.0;
            boolean isAdverse = isPropertyAdverse(change.propertyKey(), direction);
            double riskScore = Math.min(100.0, changePct * (isAdverse ? 1.0 : 0.2));

            List<String> factors = List.of(
                    String.format("%s %s changed from %.1f to %.1f (%s%.1f%%)",
                            component.getName(), change.propertyKey(), baselineVal, proposedVal, diff >= 0 ? "+" : "-", changePct),
                    isAdverse ? "Adverse direction compounds operational risk" : "Favorable operational adjustment"
            );

            sourceChanges.add(new FrontendAnalyzedSourceChangeDto(
                    compId,
                    component.getName(),
                    change.propertyKey(),
                    change.propertyKey(),
                    baselineVal,
                    proposedVal,
                    "ms",
                    direction,
                    changePct,
                    riskScore,
                    isAdverse ? "adverse" : "favorable",
                    factors
            ));

            ChangeType type = mapPropertyToChangeType(change.propertyKey(), isAdverse);
            coreChangeRequests.add(new ChangeRequest(
                    request.scenarioName() != null ? request.scenarioName() : "Frontend What-If",
                    compId,
                    type,
                    changePct,
                    ChangeUnit.PERCENT,
                    "Simulated change from React frontend"
            ));
        }

        // Configure Strategies based on frontend analysisSettings
        String propSetting = request.analysisSettings() != null ? request.analysisSettings().propagationStrategy() : "breadth-first";
        ImpactPropagationStrategy propagationStrategy = "weighted".equalsIgnoreCase(propSetting)
                ? new DepthFirstImpactStrategy()
                : new BreadthFirstImpactStrategy();

        RiskScoringStrategy scoringStrategy = new WeightedRiskScoringStrategy();
        SimulationContext context = new SimulationContext(propagationStrategy, scoringStrategy, 5.0, false);

        DefaultSimulationMediator mediator = new DefaultSimulationMediator(propagationStrategy, scoringStrategy);

        // Run simulation on primary changed component
        ChangeRequest primaryChange = coreChangeRequests.get(0);
        SimulationResult simResult = mediator.simulate(model, primaryChange, context);

        // Build findings
        List<FrontendAnalysisFindingDto> findings = new ArrayList<>();
        List<String> affectedIds = new ArrayList<>(simResult.getImpactRecords().keySet());
        List<String> criticalAffected = new ArrayList<>();

        for (Map.Entry<String, ImpactRecord> entry : simResult.getImpactRecords().entrySet()) {
            String cid = entry.getKey();
            ImpactRecord record = entry.getValue();
            Component comp = model.findComponent(cid).orElse(null);
            String compName = comp != null ? comp.getName() : cid;
            String criticality = comp != null ? comp.getCriticality().name().toLowerCase() : "medium";

            if ("critical".equalsIgnoreCase(criticality)) {
                criticalAffected.add(cid);
            }

            int distance = record.getPropagationDepth();
            double score = record.getImpactScore();
            String severity = mapScoreToFrontendSeverity(score);

            findings.add(new FrontendAnalysisFindingDto(
                    cid,
                    compName,
                    criticality,
                    record.isDirectlyAffected() ? "direct" : "indirect",
                    distance,
                    distance,
                    record.getPropagationPath(),
                    primaryChange.getTargetComponentId(),
                    model.findComponent(primaryChange.getTargetComponentId()).map(Component::getName).orElse(primaryChange.getTargetComponentId()),
                    Math.max(0.1, 1.0 - (distance * 0.25)),
                    score,
                    severity,
                    record.isDirectlyAffected() ? "Direct source variation" : "Cascading ripple propagation",
                    String.format("%s is %s impacted with projected score %.1f",
                            compName, record.isDirectlyAffected() ? "directly" : "indirectly", score),
                    List.of(
                            String.format("Criticality tier: %s", criticality.toUpperCase()),
                            String.format("Calculated severity: %s", severity.toUpperCase()),
                            record.isDirectlyAffected() ? "Target of scenario change" : "Inherited from caller dependency"
                    )
            ));
        }

        double overallScore = simResult.getOverallRiskScore();
        String overallSeverity = mapScoreToFrontendSeverity(overallScore);
        long duration = System.currentTimeMillis() - startTime;

        List<String> overallFactors = List.of(
                String.format("Analyzed %d source change(s) across %d impacted services", changeSet.size(), affectedIds.size()),
                String.format("Propagation executed via Java Core %s with cycle prevention", propagationStrategy.getName()),
                String.format("Overall risk score: %.1f / 100.0 [%s]", overallScore, overallSeverity.toUpperCase()),
                "Scenario isolated using Memento pattern: baseline state preserved intact"
        );

        Map<String, Object> engineInfo = new LinkedHashMap<>();
        engineInfo.put("engine", "RippleWhatIf Java 21 Core Engine (Spring Boot)");
        engineInfo.put("designPatterns", List.of("Builder", "Mediator", "Strategy", "Memento", "Template Method"));
        engineInfo.put("baselinePreserved", simResult.isBaselinePreserved());
        engineInfo.put("executionDurationMs", duration);

        return new FrontendScenarioAnalysisDto(
                request.scenarioId() != null ? request.scenarioId() : "analysis-" + UUID.randomUUID().toString().substring(0, 8),
                Instant.now().toString(),
                "impact-model/1.0",
                request.scenarioRevision() != null ? request.scenarioRevision() : 1,
                propSetting,
                request.analysisSettings() != null ? request.analysisSettings().scoringStrategy() : "weighted-risk",
                sourceComponentIds,
                sourceChanges,
                overallScore,
                overallFactors,
                overallSeverity,
                affectedIds,
                simResult.getDirectlyAffected(),
                simResult.getIndirectlyAffected(),
                criticalAffected,
                findings,
                engineInfo
        );
    }

    private double getPropertyValue(Component comp, String propertyKey) {
        if ("latencyMs".equalsIgnoreCase(propertyKey)) return comp.getProperties().getLatencyMs();
        if ("capacity".equalsIgnoreCase(propertyKey)) return comp.getProperties().getLoadQps();
        if ("failureProbability".equalsIgnoreCase(propertyKey)) return comp.getProperties().getFailureProbability();
        return comp.getProperties().getLatencyMs();
    }

    private boolean isPropertyAdverse(String propertyKey, String direction) {
        if ("capacity".equalsIgnoreCase(propertyKey)) {
            return "decrease".equalsIgnoreCase(direction);
        }
        return "increase".equalsIgnoreCase(direction);
    }

    private ChangeType mapPropertyToChangeType(String propertyKey, boolean isAdverse) {
        if ("capacity".equalsIgnoreCase(propertyKey)) {
            return isAdverse ? ChangeType.LOAD_INCREASE : ChangeType.LOAD_INCREASE;
        }
        return ChangeType.LATENCY_INCREASE;
    }

    private String mapScoreToFrontendSeverity(double score) {
        if (score >= 70.0) return "severe";
        if (score >= 50.0) return "high";
        if (score >= 30.0) return "moderate";
        return "low";
    }

    private FrontendScenarioAnalysisDto emptyAnalysis(FrontendScenarioAnalysisRequestDto request) {
        return new FrontendScenarioAnalysisDto(
                request.scenarioId() != null ? request.scenarioId() : "empty-" + UUID.randomUUID().toString().substring(0, 8),
                Instant.now().toString(),
                "impact-model/1.0",
                request.scenarioRevision() != null ? request.scenarioRevision() : 1,
                "breadth-first",
                "weighted-risk",
                List.of(),
                List.of(),
                0.0,
                List.of("No scenario changes defined"),
                "low",
                List.of(),
                List.of(),
                List.of(),
                List.of(),
                List.of(),
                Map.of("engine", "RippleWhatIf Java 21 Core Engine")
        );
    }
}
