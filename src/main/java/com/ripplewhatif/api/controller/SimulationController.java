package com.ripplewhatif.api.controller;

import com.ripplewhatif.application.dto.ChangeRequestDto;
import com.ripplewhatif.application.dto.FrontendScenarioAnalysisDto;
import com.ripplewhatif.application.dto.FrontendScenarioAnalysisRequestDto;
import com.ripplewhatif.application.dto.ScenarioComparisonDto;
import com.ripplewhatif.application.dto.SimulationOptionsDto;
import com.ripplewhatif.application.dto.SimulationResultDto;
import com.ripplewhatif.application.service.FrontendSimulationAdapterService;
import com.ripplewhatif.application.service.SimulationService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/simulations")
@CrossOrigin(originPatterns = "*")
public class SimulationController {

    private final SimulationService simulationService;
    private final FrontendSimulationAdapterService frontendAdapterService;

    public SimulationController(SimulationService simulationService,
                                FrontendSimulationAdapterService frontendAdapterService) {
        this.simulationService = simulationService;
        this.frontendAdapterService = frontendAdapterService;
    }

    public record SimulationExecutionRequest(
            ChangeRequestDto changeRequest,
            SimulationOptionsDto options
    ) {}

    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> getEngineHealth() {
        return ResponseEntity.ok(Map.of(
                "status", "UP",
                "engine", "RippleWhatIf Java 21 Core Engine",
                "patterns", List.of("Builder", "Mediator", "Strategy", "Memento", "Template Method"),
                "timestamp", Instant.now().toString(),
                "version", "1.0.0"
        ));
    }

    @PostMapping("/analyze")
    public ResponseEntity<FrontendScenarioAnalysisDto> analyzeFrontendScenario(
            @RequestBody FrontendScenarioAnalysisRequestDto request) {
        FrontendScenarioAnalysisDto result = frontendAdapterService.analyzeFrontendScenario(request);
        return ResponseEntity.ok(result);
    }

    @PostMapping
    public ResponseEntity<SimulationResultDto> executeSimulation(@RequestBody SimulationExecutionRequest request) {
        SimulationResultDto result = (request.options() != null)
                ? simulationService.runSimulation(request.changeRequest(), request.options())
                : simulationService.runSimulation(request.changeRequest());

        return ResponseEntity.status(HttpStatus.CREATED).body(result);
    }

    @GetMapping
    public ResponseEntity<List<SimulationResultDto>> getSimulationHistory() {
        return ResponseEntity.ok(simulationService.getSimulationHistory());
    }

    @GetMapping("/{id}")
    public ResponseEntity<SimulationResultDto> getSimulationById(@PathVariable String id) {
        return ResponseEntity.ok(simulationService.getSimulationById(id));
    }

    @GetMapping("/{id}/compare-baseline")
    public ResponseEntity<ScenarioComparisonDto> compareWithBaseline(@PathVariable String id) {
        return ResponseEntity.ok(simulationService.compareWithBaseline(id));
    }
}
