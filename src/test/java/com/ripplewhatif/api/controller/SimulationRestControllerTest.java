package com.ripplewhatif.api.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.ripplewhatif.api.RippleWhatIfApplication;
import com.ripplewhatif.application.dto.ChangeRequestDto;
import com.ripplewhatif.application.dto.FrontendAnalysisSettingsDto;
import com.ripplewhatif.application.dto.FrontendScenarioAnalysisRequestDto;
import com.ripplewhatif.application.dto.FrontendScenarioChangeDto;
import com.ripplewhatif.application.dto.SimulationOptionsDto;
import com.ripplewhatif.core.domain.change.ChangeType;
import com.ripplewhatif.core.domain.change.ChangeUnit;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.hamcrest.Matchers.containsInAnyOrder;
import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.hasItem;
import static org.hamcrest.Matchers.is;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(classes = RippleWhatIfApplication.class)
@AutoConfigureMockMvc
class SimulationRestControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    @DisplayName("GET /api/v1/model should return configured system model")
    void shouldReturnSystemModel() throws Exception {
        mockMvc.perform(get("/api/v1/model"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.systemId").value("ecommerce-system"))
                .andExpect(jsonPath("$.componentCount").value(5))
                .andExpect(jsonPath("$.dependencyCount").value(4));
    }

    @Test
    @DisplayName("GET /api/v1/simulations/health should return engine status and design patterns")
    void shouldReturnEngineHealth() throws Exception {
        mockMvc.perform(get("/api/v1/simulations/health"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("UP"))
                .andExpect(jsonPath("$.engine").value("RippleWhatIf Java 21 Core Engine"))
                .andExpect(jsonPath("$.patterns", hasItem("Builder")))
                .andExpect(jsonPath("$.patterns", hasItem("Mediator")))
                .andExpect(jsonPath("$.patterns", hasItem("Strategy")))
                .andExpect(jsonPath("$.patterns", hasItem("Memento")))
                .andExpect(jsonPath("$.patterns", hasItem("Template Method")));
    }

    @Test
    @DisplayName("POST /api/v1/simulations should execute simulation scenario and return structured DTO")
    void shouldExecuteSimulationViaRest() throws Exception {
        ChangeRequestDto changeRequest = new ChangeRequestDto(
                "Rest Payment Slowdown",
                "payment",
                ChangeType.LATENCY_INCREASE,
                50.0,
                ChangeUnit.PERCENT
        );

        SimulationController.SimulationExecutionRequest request = new SimulationController.SimulationExecutionRequest(
                changeRequest,
                SimulationOptionsDto.defaults()
        );

        mockMvc.perform(post("/api/v1/simulations")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.targetComponentId").value("payment"))
                .andExpect(jsonPath("$.directlyAffected", containsInAnyOrder("payment")))
                .andExpect(jsonPath("$.indirectlyAffected", containsInAnyOrder("checkout", "web-gateway")))
                .andExpect(jsonPath("$.baselinePreserved").value(true))
                .andExpect(jsonPath("$.overallRiskScore").isNumber());
    }

    @Test
    @DisplayName("POST /api/v1/simulations/analyze should process frontend scenario and return ScenarioAnalysis format")
    void shouldAnalyzeFrontendScenario() throws Exception {
        FrontendScenarioAnalysisRequestDto frontendRequest = new FrontendScenarioAnalysisRequestDto(
                "scenario-1",
                "Payment Latency Spike",
                1,
                List.of(new FrontendScenarioChangeDto("payment", "latencyMs", 180.0)),
                new FrontendAnalysisSettingsDto("breadth-first", "weighted-risk")
        );

        mockMvc.perform(post("/api/v1/simulations/analyze")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(frontendRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value("scenario-1"))
                .andExpect(jsonPath("$.sourceComponentIds", hasItem("payment")))
                .andExpect(jsonPath("$.overallScore").isNumber())
                .andExpect(jsonPath("$.engineInfo.baselinePreserved", is(true)))
                .andExpect(jsonPath("$.engineInfo.engine", containsString("Java 21 Core Engine")));
    }

    @Test
    @DisplayName("POST /api/v1/simulations with invalid target component should return 404 NOT FOUND")
    void shouldHandleNonExistentComponent() throws Exception {
        ChangeRequestDto invalidRequest = new ChangeRequestDto(
                "Invalid Target",
                "non-existent-comp",
                ChangeType.LATENCY_INCREASE,
                50.0,
                ChangeUnit.PERCENT
        );

        SimulationController.SimulationExecutionRequest request = new SimulationController.SimulationExecutionRequest(
                invalidRequest,
                null
        );

        mockMvc.perform(post("/api/v1/simulations")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.error").value("COMPONENT_NOT_FOUND"))
                .andExpect(jsonPath("$.message", containsString("non-existent-comp")));
    }
}
