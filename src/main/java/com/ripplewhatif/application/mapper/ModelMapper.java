package com.ripplewhatif.application.mapper;

import com.ripplewhatif.application.dto.ChangeRequestDto;
import com.ripplewhatif.application.dto.ComponentDto;
import com.ripplewhatif.application.dto.DependencyDto;
import com.ripplewhatif.application.dto.ImpactRecordDto;
import com.ripplewhatif.application.dto.ScenarioComparisonDto;
import com.ripplewhatif.application.dto.SimulationResultDto;
import com.ripplewhatif.application.dto.SystemModelDto;
import com.ripplewhatif.core.domain.change.ChangeRequest;
import com.ripplewhatif.core.domain.model.Component;
import com.ripplewhatif.core.domain.model.ComponentProperties;
import com.ripplewhatif.core.domain.model.Dependency;
import com.ripplewhatif.core.domain.model.SystemModel;
import com.ripplewhatif.core.domain.result.ImpactRecord;
import com.ripplewhatif.core.domain.result.ScenarioComparison;
import com.ripplewhatif.core.domain.result.SimulationResult;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * Maps between domain entities and application boundary DTOs.
 */
public final class ModelMapper {

    private ModelMapper() {}

    public static Component toDomain(ComponentDto dto) {
        ComponentProperties props = new ComponentProperties(
                dto.latencyMs(),
                dto.availability(),
                dto.loadQps(),
                dto.failureProbability()
        );
        return new Component(dto.id(), dto.name(), dto.type(), dto.criticality(), props);
    }

    public static ComponentDto toDto(Component component) {
        ComponentProperties props = component.getProperties();
        return new ComponentDto(
                component.getId(),
                component.getName(),
                component.getType(),
                component.getCriticality(),
                props.getLatencyMs(),
                props.getAvailability(),
                props.getLoadQps(),
                props.getFailureProbability()
        );
    }

    public static Dependency toDomain(DependencyDto dto) {
        return new Dependency(
                dto.sourceComponentId(),
                dto.targetComponentId(),
                dto.strength(),
                dto.type(),
                dto.isSynchronous(),
                dto.description()
        );
    }

    public static DependencyDto toDto(Dependency dep) {
        return new DependencyDto(
                dep.getSourceComponentId(),
                dep.getTargetComponentId(),
                dep.getStrength(),
                dep.getType(),
                dep.isSynchronous(),
                dep.getDescription()
        );
    }

    public static SystemModelDto toDto(SystemModel model) {
        List<ComponentDto> comps = model.getAllComponents().values().stream()
                .map(ModelMapper::toDto)
                .toList();
        List<DependencyDto> deps = model.getAllDependencies().stream()
                .map(ModelMapper::toDto)
                .toList();

        return new SystemModelDto(
                model.getSystemId(),
                model.getSystemName(),
                comps.size(),
                deps.size(),
                comps,
                deps
        );
    }

    public static ChangeRequest toDomain(ChangeRequestDto dto) {
        return new ChangeRequest(
                dto.scenarioName(),
                dto.targetComponentId(),
                dto.changeType(),
                dto.magnitude(),
                dto.unit(),
                dto.description()
        );
    }

    public static ImpactRecordDto toDto(ImpactRecord record) {
        return new ImpactRecordDto(
                record.getComponentId(),
                record.isDirectlyAffected(),
                record.getPropagationDepth(),
                record.getImpactScore(),
                record.getSeverity(),
                record.getBaselineProperties().getLatencyMs(),
                record.getProjectedProperties().getLatencyMs(),
                record.getBaselineProperties().getAvailability(),
                record.getProjectedProperties().getAvailability(),
                record.getPropagationPath()
        );
    }

    public static SimulationResultDto toDto(SimulationResult result) {
        Map<String, ImpactRecordDto> details = new LinkedHashMap<>();
        for (Map.Entry<String, ImpactRecord> entry : result.getImpactRecords().entrySet()) {
            details.put(entry.getKey(), toDto(entry.getValue()));
        }

        return new SimulationResultDto(
                result.getScenarioId(),
                result.getScenarioName(),
                result.getTargetComponentId(),
                result.getDirectlyAffected(),
                result.getIndirectlyAffected(),
                result.getOverallRiskScore(),
                result.getRiskLevel(),
                result.getImpactPaths(),
                result.isBaselinePreserved(),
                result.getTimestamp(),
                result.getExecutionDurationMs(),
                result.getStrategyName(),
                result.getDisclaimer(),
                details
        );
    }

    public static ScenarioComparisonDto toDto(ScenarioComparison comparison) {
        return new ScenarioComparisonDto(
                comparison.getScenarioId(),
                comparison.getScenarioName(),
                comparison.getBaselineRiskScore(),
                comparison.getScenarioRiskScore(),
                comparison.getRiskScoreDelta(),
                comparison.getBaselineRiskLevel(),
                comparison.getScenarioRiskLevel(),
                comparison.getNewlyImpactedComponents(),
                comparison.getComparedAt()
        );
    }
}
