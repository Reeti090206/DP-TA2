# RippleWhatIf

RippleWhatIf is a local-first change-impact and what-if analysis tool for interconnected software systems. It lets you explore how a change to one component can propagate through downstream dependencies, build independent scenarios, compare their modeled impact, and preserve checkpoints for later review.

The demo runs entirely in the browser. There is no backend, account system, or external data service.

## Features

- **Impact Explorer** - inspect the bundled system graph, adjust supported component properties, and run a deterministic impact analysis for the active scenario.
- **Independent scenarios** - every scenario keeps its own changes, analysis settings, and latest analysis result without altering the shared baseline.
- **Ripple analysis** - trace downstream propagation with breadth-first or weighted traversal and score impact with weighted-risk or criticality-first strategies.
- **Staleness tracking** - analyses are marked stale when a scenario revision or its analysis settings change after the last run.
- **Scenario comparison** - compare up to three scenarios against the unchanged baseline, including changes, scores, affected components, severity, and compatibility warnings.
- **Snapshots** - save immutable checkpoints, restore one into an existing scenario, or branch a snapshot into a new scenario.
- **Browser persistence** - scenarios, snapshots, and the active scenario are saved to versioned browser storage and restored on reload.
- **JSON export** - download a versioned workspace document containing metadata, confirmed changes, analysis settings and results, and snapshots.

## Tech stack

- React 19 and TypeScript
- Vite 8
- Tailwind CSS 4
- React Flow for the dependency graph
- Lucide icons
- Oxlint

## Getting started

Node.js `^20.19.0` or `>=22.12.0` is required.

```bash
npm install
npm run dev
```

Open the URL printed by Vite, usually `http://localhost:5173`.

## Available scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Vite development server. |
| `npm run build` | Type-check and create a production build in `dist/`. |
| `npm run preview` | Preview the production build locally. |
| `npm run lint` | Run Oxlint across the project. |
| `npm run typecheck` | Run the TypeScript project build without emitting files. |

## Using the app

### Impact Explorer

1. Open or create a scenario from the Scenario Lab.
2. Select a supported property on a component and enter a value different from the baseline.
3. Choose propagation and scoring settings, then run analysis.
4. Review the affected components, causal paths, scores, and contributing factors.

The baseline system is read-only. Scenario changes are independent, and changing a value or removing a change increments that scenario's revision.

### Scenario Lab

- Create scenarios and open them in the Impact Explorer.
- Select up to three scenarios to compare against the baseline.
- Save a snapshot to preserve the current change set, settings, and captured analysis.
- Restore a snapshot into a chosen scenario. The target scenario keeps its identity and receives a new revision.
- Branch a snapshot into a new scenario when you want a separate line of exploration.

Snapshots with a deleted source scenario remain available for branching. Restoring requires another existing target scenario.

## Persistence and export

### Browser persistence

Workspace state is written to `localStorage` under `ripplewhatif:workspace` and includes a schema version, saved timestamp, current system/model identifiers, scenarios, snapshots, and the active scenario.

- State is loaded synchronously at startup.
- Invalid, incomplete, unsupported, or model-mismatched saved data is ignored rather than partially loaded.
- A visible notice explains when saved data could not be restored or when a save fails.
- When saved data is rejected, the untouched browser copy remains until you create or edit a scenario, at which point the current workspace replaces it.
- Browser storage is scoped to the current origin and browser profile.

### JSON export

Choose **Export JSON** in the Scenario Lab header to download a file named like `ripplewhatif-commerce-core-2026-10-27T12-34-56-789Z.json`.

The export uses the `ripplewhatif.workspace-export` schema with version `1`. It includes:

- export timestamp and system/model metadata
- active scenario reference and workspace totals
- scenario names, revisions, timestamps, settings, confirmed changes, and stored analyses
- snapshot metadata, source references, captured changes, and captured analyses
- snapshot compatibility and scenario freshness status

Empty workspaces can also be exported. Exporting does not change stored workspace data.

## Project structure

```text
src/
  components/      Shared UI, layout, graph, scenario, and analysis components
  data/            Bundled demo system graph
  hooks/           Navigation and UI hooks
  lib/             Analysis engine, state rules, validation, persistence, and export
  pages/           Impact Explorer and Scenario Lab
  types/           Domain and navigation types
  App.tsx          Workspace state ownership and page wiring
  main.tsx         React entry point
```

## Modeling notes

- The bundled model contains 10 components and a modeled dependency cycle; graph traversal is bounded and evaluates each component once.
- Breadth-first propagation attenuates signal by dependency distance. Weighted propagation also considers protocol and target criticality, with a minimum signal threshold for indirect impacts.
- The overall score is a deterministic local estimate, not a production risk rating. It combines source risk, propagation breadth, affected criticality, and cycle exposure.
- Changing analysis settings does not increment a scenario revision, but it does make the existing analysis stale.

## Limitations

- This is a frontend demo with a single bundled system model.
- There is no authentication, collaboration, server persistence, or live integration with production architecture data.
- Results model the included graph and heuristics only; they are not a substitute for operational risk assessment.
- Workspace data is limited to the browser and is not synchronized across devices.
