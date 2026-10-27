package com.ripplewhatif.application.service;

import com.ripplewhatif.application.dto.ChangeRequestDto;
import com.ripplewhatif.application.dto.ScenarioComparisonDto;
import com.ripplewhatif.application.dto.SimulationOptionsDto;
import com.ripplewhatif.application.dto.SimulationResultDto;
import com.ripplewhatif.application.mapper.ModelMapper;
import com.ripplewhatif.core.domain.change.ChangeRequest;
import com.ripplewhatif.core.domain.model.SystemModel;
import com.ripplewhatif.core.domain.result.RiskLevel;
import com.ripplewhatif.core.domain.result.ScenarioComparison;
import com.ripplewhatif.core.domain.result.SimulationResult;
import com.ripplewhatif.core.exception.RippleSimulationException;
import com.ripplewhatif.core.patterns.mediator.DefaultSimulationMediator;
import com.ripplewhatif.core.patterns.mediator.SimulationContext;
import com.ripplewhatif.core.patterns.mediator.SimulationMediator;
import com.ripplewhatif.core.patterns.strategy.AvailabilityRiskScoringStrategy;
import com.ripplewhatif.core.patterns.strategy.BreadthFirstImpactStrategy;
import com.ripplewhatif.core.patterns.strategy.DepthFirstImpactStrategy;
import com.ripplewhatif.core.patterns.strategy.ImpactPropagationStrategy;
import com.ripplewhatif.core.patterns.strategy.LatencyRiskScoringStrategy;
import com.ripplewhatif.core.patterns.strategy.RiskScoringStrategy;
import com.ripplewhatif.core.patterns.strategy.WeightedRiskScoringStrategy;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

@Service
public class SimulationServiceImpl implements SimulationService {

    private final SystemModelingService modelingService;
    private final SimulationMediator mediator;

    @org.springframework.beans.factory.annotation.Autowired
    public SimulationServiceImpl(SystemModelingService modelingService) {
        this(modelingService, new DefaultSimulationMediator());
    }

    public SimulationServiceImpl(SystemModelingService modelingService, SimulationMediator mediator) {
        this.modelingService = Objects.requireNonNull(modelingService, "SystemModelingService cannot be null");
        this.mediator = Objects.requireNonNull(mediator, "SimulationMediator cannot be null");
    }

    @Override
    public SimulationResultDto runSimulation(ChangeRequestDto requestDto) {
        return runSimulation(requestDto, SimulationOptionsDto.defaults());
    }

    @Override
    public SimulationResultDto runSimulation(ChangeRequestDto requestDto, SimulationOptionsDto optionsDto) {
        Objects.requireNonNull(requestDto, "ChangeRequestDto cannot be null");
        SimulationOptionsDto options = (optionsDto != null) ? optionsDto : SimulationOptionsDto.defaults();

        ChangeRequest changeRequest = ModelMapper.toDomain(requestDto);
        SystemModel liveModel = modelingService.getUnderlyingModel();

        ImpactPropagationStrategy propStrategy = resolvePropagationStrategy(options.propagationStrategy());
        RiskScoringStrategy scoringStrategy = resolveScoringStrategy(options.scoringStrategy());
        double threshold = (options.propagationThreshold() != null) ? options.propagationThreshold() : 5.0;
        boolean commit = Boolean.TRUE.equals(options.commitChangeAfterSimulation());

        SimulationContext context = new SimulationContext(propStrategy, scoringStrategy, threshold, commit);

        SimulationResult result = mediator.simulate(liveModel, changeRequest, context);
        return ModelMapper.toDto(result);
    }

    @Override
    public List<SimulationResultDto> getSimulationHistory() {
        return mediator.getSimulationHistory().stream()
                .map(ModelMapper::toDto)
                .toList();
    }

    @Override
    public SimulationResultDto getSimulationById(String scenarioId) {
        SimulationResult result = mediator.getResultById(scenarioId)
                .orElseThrow(() -> new RippleSimulationException("Scenario not found: " + scenarioId));
        return ModelMapper.toDto(result);
    }

    @Override
    public ScenarioComparisonDto compareWithBaseline(String scenarioId) {
        SimulationResult scenario = mediator.getResultById(scenarioId)
                .orElseThrow(() -> new RippleSimulationException("Scenario not found: " + scenarioId));

        double baselineRisk = 0.0;
        List<String> affected = new ArrayList<>();
        affected.addAll(scenario.getDirectlyAffected());
        affected.addAll(scenario.getIndirectlyAffected());

        ScenarioComparison comparison = new ScenarioComparison(
                scenario.getScenarioId(),
                scenario.getScenarioName(),
                baselineRisk,
                scenario.getOverallRiskScore(),
                RiskLevel.LOW,
                scenario.getRiskLevel(),
                affected
        );

        return ModelMapper.toDto(comparison);
    }

    private ImpactPropagationStrategy resolvePropagationStrategy(String name) {
        if (name == null) return new BreadthFirstImpactStrategy();
        return switch (name.trim().toUpperCase()) {
            case "DFS", "DEPTH_FIRST" -> new DepthFirstImpactStrategy();
            default -> new BreadthFirstImpactStrategy();
        };
    }

    private RiskScoringStrategy resolveScoringStrategy(String name) {
        if (name == null) return new WeightedRiskScoringStrategy();
        return switch (name.trim().toUpperCase()) {
            case "LATENCY" -> new LatencyRiskScoringStrategy();
            case "AVAILABILITY" -> new AvailabilityRiskScoringStrategy();
            default -> new WeightedRiskScoringStrategy();
        };
    }
}
