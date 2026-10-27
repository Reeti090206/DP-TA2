package com.ripplewhatif.application.dto;

import java.util.List;
import java.util.Map;

/**
 * Result payload matching Frontend ScenarioAnalysis TypeScript interface.
 */
public record FrontendScenarioAnalysisDto(
        String id,
        String analyzedAt,
        String modelVersion,
        int scenarioRevision,
        String propagationStrategy,
        String scoringStrategy,
        List<String> sourceComponentIds,
        List<FrontendAnalyzedSourceChangeDto> sourceChanges,
        double overallScore,
        List<String> overallFactors,
        String severity,
        List<String> affectedComponentIds,
        List<String> directComponentIds,
        List<String> indirectComponentIds,
        List<String> criticalAffectedComponentIds,
        List<FrontendAnalysisFindingDto> findings,
        Map<String, Object> engineInfo
) {}
