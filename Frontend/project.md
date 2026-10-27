# RippleWhatIf — Project Requirements

## 1. Project Overview
**Project name:** RippleWhatIf  
**Tagline:** Change one thing. Discover everything it affects.

RippleWhatIf is a frontend for a change-impact and what-if scenario simulator. Users explore an interconnected software system, propose hypothetical changes to a component, inspect possible downstream effects, and compare alternative scenarios.

**Purpose of this file:** This is the compact project brief and source of truth for ongoing frontend work. Detailed implementation tasks will be provided separately through prompts. Follow those prompts while preserving the requirements in this file.

## 2. Scope
- Build the **frontend only** in the current project folder.
- The application must run without a backend by using deterministic local demo data and frontend-side simulation.
- Keep the structure ready to connect to a future Java/Spring Boot REST API.
- Do not build the Java backend, database, authentication, or external integrations unless explicitly requested in a later task.
- Do not add more than the two primary pages below. Use drawers, tabs, dialogs, and expandable panels for secondary interactions.

## 3. Primary Pages

### Page A — Impact Explorer
Purpose: explore the system graph, select a component, propose changes, run a simulation, and understand the resulting impact.

Required sections:
- Shared top navigation with product name, current system, page navigation, and selected scenario.
- Component explorer with search, type/criticality filters, and a status legend.
- Interactive dependency graph with directed edges, selectable nodes, pan/zoom, fit-to-view, and highlighted impact paths.
- Component details panel showing description, type, criticality, incoming/outgoing dependencies, and supported editable properties.
- Proposed-change editor showing original and proposed values with validation.
- Analysis results showing overall modeled impact score, unique affected count, direct and indirect counts, critical components affected, severity, and findings.
- “Why affected?” explanations showing the causal path and the rule that triggered the finding.
- Analysis status, including stale results after edits.

### Page B — Scenario Lab
Purpose: manage alternative scenarios, compare results, and preserve/restore scenario state.

Required sections:
- Read-only baseline and a list of named scenarios.
- Create, open, duplicate/branch, rename, and delete draft scenarios.
- Compare baseline with up to three scenarios using consistent metrics.
- Show absolute values and differences from baseline; explain whether higher or lower is preferable.
- Save immutable snapshots, list them, restore a snapshot, and create a scenario from a snapshot.
- Export scenario/analysis data as JSON; CSV is optional.
- Confirm destructive actions.

## 4. Core User Flow
1. Open Impact Explorer and inspect the sample system.
2. Select a component such as Inventory.
3. Create or select a scenario.
4. Edit a supported property, such as latency.
5. Run analysis.
6. Inspect affected components, causal paths, scores, and explanations.
7. Create a second scenario with a different change or strategy.
8. Compare scenarios in Scenario Lab.
9. Save a snapshot, make another change, and restore the snapshot.
10. Verify that the baseline and other scenarios remain unchanged.

## 5. Demo System and Graph
Use a fictional e-commerce system with approximately 10 components:
- Web Gateway
- Authentication
- Product Catalog
- Inventory
- Cart
- Checkout
- Payment
- Order Service
- Notification
- Analytics

Use meaningful directed dependencies, including:
- Web Gateway → Authentication
- Web Gateway → Product Catalog
- Product Catalog → Cart
- Inventory → Cart
- Cart → Checkout
- Checkout → Payment
- Checkout → Inventory
- Payment → Order Service
- Inventory → Order Service
- Order Service → Notification
- Order Service → Analytics

**Edge meaning:** `A → B` means a change in A may affect B. Include the cycle created by Inventory → Cart → Checkout → Inventory to demonstrate safe cycle handling.

Supported example properties may include `latencyMs`, `capacity`, `retryCount`, `timeoutMs`, and `queueDelayMs`. Assign sensible types, units, and validation ranges. Only allow properties supported by the selected component/model.

## 6. Analysis and Explainability
- Use deterministic, rule-based demo calculations that respond to user changes; do not display arbitrary numbers unrelated to the current scenario.
- Find direct and indirect downstream impacts and avoid counting a component more than once.
- Track shortest dependency distance and a causal path.
- Handle graph cycles without infinite traversal.
- Include at least two meaningfully different propagation strategies (for example BFS and weighted propagation) and two scoring strategies (for example weighted risk and criticality-first), when implementing the analysis workflow.
- Explain the rules, score factors, and assumptions in plain language.
- Scores are **modeled impact scores**, not probabilities or certainties of real production failure.
- Clearly state when the app is using local demo simulation rather than a real backend.

## 7. State and Safety Rules
- Baseline is read-only.
- Every scenario has its own ID, change set, and revision.
- Creating or duplicating a scenario creates independent state.
- Editing a scenario marks its previous analysis stale until analysis is run again.
- Analysis results record the model version, scenario revision, and selected strategies.
- Snapshots are immutable.
- Restoring a snapshot affects only the selected scenario.
- Editing, restoring, or deleting one scenario must not corrupt the baseline or other scenarios.
- Warn when comparisons use incompatible model versions or strategy configurations.
- Validate input and show clear, actionable errors.

## 8. Frontend Technology
Preferred stack:
- React + TypeScript + Vite
- Tailwind CSS
- React Flow (`@xyflow/react`) for the dependency graph
- Lucide React for icons
- Recharts only if useful for scenario comparison

Use compatible package versions and avoid unnecessary dependencies. If the project already contains working code, inspect it before replacing anything. Keep graph rendering, scenario state, analysis calculations, and UI components separated. Use a typed local data/service layer that can later be replaced or supplemented by a REST API adapter.

## 9. UI/UX Requirements
- Professional technical/SaaS dashboard, not a marketing landing page.
- Neutral background, navy text, restrained teal accent, consistent semantic status colors.
- Graph is the main visual focus on Impact Explorer.
- Responsive on common laptop and tablet widths.
- Use readable labels, clear hierarchy, restrained borders/shadows, and accessible contrast.
- Do not rely on color alone to communicate status.
- Provide loading, empty, validation, error, success, stale-result, and demo-mode states.
- No dead buttons, fake links, or controls that appear functional but do nothing.
- Destructive actions require confirmation.
- Use plain-language explanations for technical findings.

## 10. Quality and Completion Criteria
A frontend feature is complete only when its interaction works, its state updates correctly, and errors are handled.

The application should ultimately support:
- Both primary pages and navigation.
- Interactive, data-driven dependency graph.
- Component selection and scenario-only property editing.
- Analysis with direct/indirect impacts and causal explanations.
- Strategy switching that meaningfully changes results.
- Independent scenarios and comparison.
- Snapshot save/restore without baseline corruption.
- Working JSON export.
- Responsive and accessible UI states.
- A README with prerequisites, setup/run commands, features, demo limitations, and future API integration notes.
- Successful build/type-check, with any remaining issues reported honestly.

## 11. Working Agreement for the Coding LLM
- Read this file before every substantial task.
- Follow the user's latest prompt for the immediate task without silently removing requirements elsewhere in this brief.
- Implement changes directly in the project; do not return only a plan or snippets when asked to build.
- Inspect the existing files before editing and preserve working functionality.
- Avoid unrelated refactors, unnecessary dependencies, and scope expansion.
- After each change, run the relevant checks and fix regressions.
- Report files changed, what works, commands/checks run, and any unresolved limitations.
- If a requirement is ambiguous, make a reasonable minimal decision and document it rather than inventing large new features.
