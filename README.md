# RippleWhatIf — Change Impact & Scenario Simulator

> **Core Simulation Engine and REST Integration Layer** built with modern **Java 21/23**, **Maven**, and **Gang of Four (GoF) Design Patterns**.

---

## 1. Architectural Overview & Design Pattern Roles

RippleWhatIf simulates how localized architectural modifications (latency degradation, availability outages, load spikes, failure rate surges) cascade through interconnected software components. The business domain and simulation engine are 100% decoupled from any web framework or UI technology.

```
       +-----------------------------------------------------------+
       |                  REST Controller Layer                    |
       |  (Spring Web: SystemModelController, SimulationController) |
       +-----------------------------+-----------------------------+
                                     | DTOs
                                     v
       +-----------------------------------------------------------+
       |                 Application Service Layer                 |
       |     (SystemModelingService, SimulationService, Mappers)    |
       +-----------------------------+-----------------------------+
                                     |
                                     v
+-------------------------------------------------------------------------+
|                  CORE SIMULATION & DOMAIN ENGINE                        |
|                                                                         |
|  [Builder Pattern]       [Memento Pattern]     [Mediator Pattern]       |
|  SystemModelBuilder      SystemMemento         SimulationMediator       |
|  ComponentBuilder        SnapshotManager       DefaultSimulationMediator|
|                                                                         |
|  [Strategy Pattern]                            [Template Method Pattern]|
|  - ImpactPropagationStrategy                   AbstractSimulationWorkflow|
|    * BreadthFirstImpactStrategy (BFS)                                   |
|    * DepthFirstImpactStrategy (DFS)                                     |
|  - RiskScoringStrategy                                                  |
|    * WeightedRiskScoringStrategy                                        |
|    * LatencyRiskScoringStrategy                                         |
|    * AvailabilityRiskScoringStrategy                                    |
+-------------------------------------------------------------------------+
```

### Roles of Each Design Pattern

| Pattern | Classes | Concrete Architectural Responsibility |
|---|---|---|
| **Builder Pattern** | [`SystemModelBuilder`](file:///d:/PROJECTS/RippleWhatIf/src/main/java/com/ripplewhatif/core/patterns/builder/SystemModelBuilder.java), [`ComponentBuilder`](file:///d:/PROJECTS/RippleWhatIf/src/main/java/com/ripplewhatif/core/patterns/builder/ComponentBuilder.java), [`DependencyBuilder`](file:///d:/PROJECTS/RippleWhatIf/src/main/java/com/ripplewhatif/core/patterns/builder/DependencyBuilder.java) | Fluent configuration of components and dependencies. Validates graph integrity (enforces non-null identifiers, rejects duplicate component IDs, self-dependencies, and references to unregistered endpoints) before instantiating the immutable graph. |
| **Memento Pattern** | [`SystemMemento`](file:///d:/PROJECTS/RippleWhatIf/src/main/java/com/ripplewhatif/core/patterns/memento/SystemMemento.java), [`SystemSnapshotManager`](file:///d:/PROJECTS/RippleWhatIf/src/main/java/com/ripplewhatif/core/patterns/memento/SystemSnapshotManager.java), [`SystemModel`](file:///d:/PROJECTS/RippleWhatIf/src/main/java/com/ripplewhatif/core/domain/model/SystemModel.java) | Captures deep-copied, immutable snapshots of system metrics and dependencies. Guarantees **Scenario Isolation**: what-if simulations mutate an isolated working copy and restore the baseline state upon completion unless explicitly committed. |
| **Strategy Pattern** | [`ImpactPropagationStrategy`](file:///d:/PROJECTS/RippleWhatIf/src/main/java/com/ripplewhatif/core/patterns/strategy/ImpactPropagationStrategy.java), [`RiskScoringStrategy`](file:///d:/PROJECTS/RippleWhatIf/src/main/java/com/ripplewhatif/core/patterns/strategy/RiskScoringStrategy.java), [`BreadthFirstImpactStrategy`](file:///d:/PROJECTS/RippleWhatIf/src/main/java/com/ripplewhatif/core/patterns/strategy/BreadthFirstImpactStrategy.java), [`DepthFirstImpactStrategy`](file:///d:/PROJECTS/RippleWhatIf/src/main/java/com/ripplewhatif/core/patterns/strategy/DepthFirstImpactStrategy.java), [`WeightedRiskScoringStrategy`](file:///d:/PROJECTS/RippleWhatIf/src/main/java/com/ripplewhatif/core/patterns/strategy/WeightedRiskScoringStrategy.java), [`LatencyRiskScoringStrategy`](file:///d:/PROJECTS/RippleWhatIf/src/main/java/com/ripplewhatif/core/patterns/strategy/LatencyRiskScoringStrategy.java), [`AvailabilityRiskScoringStrategy`](file:///d:/PROJECTS/RippleWhatIf/src/main/java/com/ripplewhatif/core/patterns/strategy/AvailabilityRiskScoringStrategy.java) | Encapsulates interchangeable graph traversal algorithms (BFS level-by-level exploration vs. DFS cascading chain tracing) and risk scoring formulas (multi-factor weighted risk, latency-centric penalty, or availability drop penalty). Strategies are hot-swappable at runtime. |
| **Mediator Pattern** | [`SimulationMediator`](file:///d:/PROJECTS/RippleWhatIf/src/main/java/com/ripplewhatif/core/patterns/mediator/SimulationMediator.java), [`DefaultSimulationMediator`](file:///d:/PROJECTS/RippleWhatIf/src/main/java/com/ripplewhatif/core/patterns/mediator/DefaultSimulationMediator.java), [`SimulationContext`](file:///d:/PROJECTS/RippleWhatIf/src/main/java/com/ripplewhatif/core/patterns/mediator/SimulationContext.java) | Central coordinator that decouples components, graph traversal strategies, scoring models, and snapshot caretakers. Components do not communicate directly; the mediator validates requests, coordinates the working copy, triggers propagation, calculates risk, and preserves history. |
| **Template Method Pattern** | [`AbstractSimulationWorkflow`](file:///d:/PROJECTS/RippleWhatIf/src/main/java/com/ripplewhatif/core/patterns/template/AbstractSimulationWorkflow.java), [`DefaultSimulationWorkflow`](file:///d:/PROJECTS/RippleWhatIf/src/main/java/com/ripplewhatif/core/patterns/template/DefaultSimulationWorkflow.java) | Defines the invariant 8-step simulation algorithm skeleton (validation -> baseline snapshot -> isolated clone -> propagation strategy -> scoring strategy -> result assembly -> rollback/commit -> completion hook). |
| **MVC Architecture** | Model: Domain entities; Controller: [`SystemModelController`](file:///d:/PROJECTS/RippleWhatIf/src/main/java/com/ripplewhatif/api/controller/SystemModelController.java), [`SimulationController`](file:///d:/PROJECTS/RippleWhatIf/src/main/java/com/ripplewhatif/api/controller/SimulationController.java); View/Boundary: DTO records in [`com.ripplewhatif.application.dto`](file:///d:/PROJECTS/RippleWhatIf/src/main/java/com/ripplewhatif/application/dto). | REST controllers strictly serialize/deserialize DTOs and call application services; they contain zero graph traversal or risk math. |

---

## 2. Dependency Direction & Traversal Semantics

In `Dependency(source, target)`, the **source depends upon the target** (e.g., `checkout -> payment` means `checkout` calls and relies on `payment`).

1. **Fault Propagation (Latency Increase, Outage, Error Rate)**:
   - When `payment` degrades, the impact propagates **upstream** to calling services (`checkout`), and subsequently to higher-tier callers (`web-gateway`).
   - Traversal follows inverted incoming dependency edges (`targetComponentId == currentComponentId`).
2. **Traffic / Load Propagation (Load Increase)**:
   - When traffic surges at `web-gateway`, additional load propagates **downstream** to callee dependencies (`checkout`, `payment`, `inventory`).
   - Traversal follows outgoing dependency edges (`sourceComponentId == currentComponentId`).
3. **Cycle Safety & Multi-Path Aggregation**:
   - Backtracking path tracking prevents infinite loops when cycles occur (e.g. `A -> B -> C -> A`).
   - If multiple paths reach a service (e.g. in a diamond dependency), each propagation path is recorded while the component's impact is aggregated to worst-case without duplicate counting.
4. **Configurable Threshold**:
   - Attenuation factor on edges $W = \text{strength} \times \text{type.impactFactor} \times (\text{sync ? } 1.0 : 0.5)$.
   - Propagation along a branch terminates when projected impact falls below `propagationThreshold` (default: 5.0).

---

## 3. Risk Scoring Mathematical Formulas

All risk scores are bounded strictly between **0.0 and 100.0**.

### Weighted Multi-Factor Risk Strategy
$$\text{OverallRisk} = \text{clamp}\left(0.40 \cdot S_{\text{direct}} + 0.35 \cdot \bar{S}_{\text{indirect}} + 0.15 \cdot \text{CritPenalty} + 0.10 \cdot \text{BlastRadiusPenalty}, 0.0, 100.0\right)$$
Where:
- $S_{\text{direct}}$: Direct impact score of modified component.
- $\bar{S}_{\text{indirect}}$: Mean impact score across all indirectly affected upstream/downstream components.
- $\text{CritPenalty} = \min\left(100.0, \frac{\sum \text{CriticalityWeights}}{3 \times N_{\text{total}}} \times 100\right)$
- $\text{BlastRadiusPenalty} = \frac{N_{\text{affected}}}{N_{\text{total}}} \times 100$

> **Simulation Disclaimer:** The risk score is a heuristic simulation estimate based on configured model parameters and does not constitute an empirical real-world operational prediction.

---

## 4. How to Compile, Test, and Run

### Run Full Test Suite (JUnit 5 - 28 Tests)
```bash
# Using Maven Wrapper (Windows PowerShell / CMD):
.\mvnw.cmd clean test

# Or using standard Maven:
mvn clean test
```

### Run Standalone Console Demonstration (No HTTP/Spring required)
```bash
# Compile and run RippleWhatIfDemo:
.\mvnw.cmd test-compile
java -cp "target/classes;target/test-classes" com.ripplewhatif.RippleWhatIfDemo
```

### Run Spring Boot REST API
```bash
.\mvnw.cmd spring-boot:run
# Server starts on port 8080 (http://localhost:8080)
```

---

## 5. REST API Specifications

### A. View Current System Architecture
- **Endpoint**: `GET /api/v1/model`
- **Response**: `200 OK`
```json
{
  "systemId": "ecommerce-system",
  "systemName": "E-Commerce Microservices Architecture",
  "componentCount": 5,
  "dependencyCount": 4,
  "components": [
    {
      "id": "web-gateway",
      "name": "Web API Gateway",
      "type": "GATEWAY",
      "criticality": "MEDIUM",
      "latencyMs": 25.0,
      "availability": 99.99,
      "loadQps": 500.0,
      "failureProbability": 0.001
    },
    {
      "id": "checkout",
      "name": "Checkout Service",
      "type": "SERVICE",
      "criticality": "MEDIUM",
      "latencyMs": 65.0,
      "availability": 99.95,
      "loadQps": 250.0,
      "failureProbability": 0.001
    },
    {
      "id": "payment",
      "name": "Payment Service",
      "type": "SERVICE",
      "criticality": "MEDIUM",
      "latencyMs": 120.0,
      "availability": 99.9,
      "loadQps": 150.0,
      "failureProbability": 0.001
    }
  ]
}
```

### B. Execute What-If Scenario
- **Endpoint**: `POST /api/v1/simulations`
- **Request Payload**:
```json
{
  "changeRequest": {
    "scenarioName": "Payment Gateway 50% Degradation",
    "targetComponentId": "payment",
    "changeType": "LATENCY_INCREASE",
    "magnitude": 50,
    "unit": "PERCENT",
    "description": "Simulating external acquirer throttling"
  },
  "options": {
    "propagationStrategy": "BFS",
    "scoringStrategy": "WEIGHTED",
    "propagationThreshold": 5.0,
    "commitChangeAfterSimulation": false
  }
}
```
- **Response**: `201 CREATED`
```json
{
  "scenarioId": "scn-e3a06925",
  "scenarioName": "Payment Gateway 50% Degradation",
  "targetComponentId": "payment",
  "directlyAffected": [
    "payment"
  ],
  "indirectlyAffected": [
    "checkout",
    "web-gateway"
  ],
  "overallRiskScore": 70.39,
  "riskLevel": "HIGH",
  "impactPaths": [
    ["payment"],
    ["payment", "checkout"],
    ["payment", "checkout", "web-gateway"]
  ],
  "baselinePreserved": true,
  "strategyUsed": "BreadthFirstSearch (BFS) Strategy",
  "disclaimer": "Simulation estimate based on configured architectural model, not real-world operational prediction."
}
```

### C. Compare Scenario with Baseline
- **Endpoint**: `GET /api/v1/simulations/{scenarioId}/compare-baseline`
- **Response**: `200 OK`
```json
{
  "scenarioId": "scn-e3a06925",
  "scenarioName": "Payment Gateway 50% Degradation",
  "baselineRiskScore": 0.0,
  "scenarioRiskScore": 70.39,
  "riskScoreDelta": 70.39,
  "baselineRiskLevel": "LOW",
  "scenarioRiskLevel": "HIGH",
  "newlyImpactedComponents": [
    "payment",
    "checkout",
    "web-gateway"
  ]
}
```
