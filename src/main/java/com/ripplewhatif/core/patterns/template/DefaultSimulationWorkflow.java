package com.ripplewhatif.core.patterns.template;

import com.ripplewhatif.core.domain.result.SimulationResult;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

public class DefaultSimulationWorkflow extends AbstractSimulationWorkflow {

    private final List<SimulationResult> executedScenarios = new ArrayList<>();

    @Override
    protected void onSimulationCompleted(SimulationResult result) {
        executedScenarios.add(result);
    }

    public List<SimulationResult> getExecutedScenarios() {
        return Collections.unmodifiableList(executedScenarios);
    }
}
