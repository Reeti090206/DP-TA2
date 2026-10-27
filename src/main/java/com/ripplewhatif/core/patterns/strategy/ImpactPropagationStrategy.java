package com.ripplewhatif.core.patterns.strategy;

import com.ripplewhatif.core.domain.change.ChangeRequest;
import com.ripplewhatif.core.domain.model.SystemModel;
import com.ripplewhatif.core.domain.result.ImpactRecord;

import java.util.List;
import java.util.Map;

/**
 * <b>Strategy Pattern:</b> Strategy interface defining how a localized architectural change
 * propagates through the dependency graph.
 */
public interface ImpactPropagationStrategy {

    /**
     * Executes propagation analysis across the system model.
     *
     * @param workingModel the mutable or isolated working system model
     * @param baselineModel the original baseline system model before change
     * @param request the hypothetical change request
     * @param threshold minimum impact score (0.0 to 100.0) required to continue propagation
     * @return propagation analysis outcome containing affected components and traversal paths
     */
    PropagationResult propagate(SystemModel workingModel,
                                SystemModel baselineModel,
                                ChangeRequest request,
                                double threshold);

    /**
     * Human-readable identifier of this strategy algorithm.
     */
    String getName();

    /**
     * Value container for propagation strategy output.
     */
    record PropagationResult(
            List<String> directlyAffected,
            List<String> indirectlyAffected,
            Map<String, ImpactRecord> impactRecords,
            List<List<String>> impactPaths
    ) {}
}
