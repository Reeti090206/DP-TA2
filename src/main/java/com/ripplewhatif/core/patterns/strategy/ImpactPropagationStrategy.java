package com.ripplewhatif.core.patterns.strategy;

import com.ripplewhatif.core.domain.change.ChangeRequest;
import com.ripplewhatif.core.domain.model.SystemModel;
import com.ripplewhatif.core.domain.result.ImpactRecord;

import java.util.List;
import java.util.Map;

public interface ImpactPropagationStrategy {

    PropagationResult propagate(SystemModel workingModel,
                                SystemModel baselineModel,
                                ChangeRequest request,
                                double threshold);

    String getName();

    record PropagationResult(
            List<String> directlyAffected,
            List<String> indirectlyAffected,
            Map<String, ImpactRecord> impactRecords,
            List<List<String>> impactPaths
    ) {}
}
