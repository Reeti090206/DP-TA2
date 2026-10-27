package com.ripplewhatif.application.service;

import com.ripplewhatif.application.dto.ChangeRequestDto;
import com.ripplewhatif.application.dto.ScenarioComparisonDto;
import com.ripplewhatif.application.dto.SimulationOptionsDto;
import com.ripplewhatif.application.dto.SimulationResultDto;

import java.util.List;

/**
 * Application service orchestrating what-if scenarios, risk analyses, and comparisons.
 */
public interface SimulationService {

    SimulationResultDto runSimulation(ChangeRequestDto requestDto);

    SimulationResultDto runSimulation(ChangeRequestDto requestDto, SimulationOptionsDto optionsDto);

    List<SimulationResultDto> getSimulationHistory();

    SimulationResultDto getSimulationById(String scenarioId);

    ScenarioComparisonDto compareWithBaseline(String scenarioId);
}
