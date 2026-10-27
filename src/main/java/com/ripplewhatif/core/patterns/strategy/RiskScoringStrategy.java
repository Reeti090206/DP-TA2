package com.ripplewhatif.core.patterns.strategy;

import com.ripplewhatif.core.domain.change.ChangeRequest;
import com.ripplewhatif.core.domain.model.SystemModel;

public interface RiskScoringStrategy {

    double calculateRiskScore(SystemModel model,
                              ChangeRequest request,
                              ImpactPropagationStrategy.PropagationResult propagationResult);

    String getFormulaDocumentation();

    String getName();
}
