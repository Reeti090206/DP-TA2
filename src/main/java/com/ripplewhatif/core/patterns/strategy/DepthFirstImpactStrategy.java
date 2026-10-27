package com.ripplewhatif.core.patterns.strategy;

import com.ripplewhatif.core.domain.change.ChangeRequest;
import com.ripplewhatif.core.domain.model.Component;
import com.ripplewhatif.core.domain.model.ComponentProperties;
import com.ripplewhatif.core.domain.model.Dependency;
import com.ripplewhatif.core.domain.model.SystemModel;
import com.ripplewhatif.core.domain.result.ImpactRecord;
import com.ripplewhatif.core.domain.result.ImpactSeverity;
import com.ripplewhatif.core.engine.MetricProjector;

import java.util.ArrayList;
import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * <b>Strategy Implementation:</b> Depth-First Search (DFS) based propagation strategy.
 *
 * <p>Explores deep architectural call paths end-to-end first, tracing cascading dependency
 * impacts along entire call stacks before exploring alternative branches.
 *
 * <p>Guarantees:
 * <ul>
 *   <li>Cycle-safe: Backtracking stack guards against recursive loops.</li>
 *   <li>Worst-case path recording: Computes impacts across full end-to-end cascades.</li>
 *   <li>Configurable threshold: Cuts off search branches once attenuation drops below threshold.</li>
 * </ul>
 */
public class DepthFirstImpactStrategy implements ImpactPropagationStrategy {

    @Override
    public String getName() {
        return "DepthFirstSearch (DFS) Strategy";
    }

    @Override
    public PropagationResult propagate(SystemModel workingModel,
                                       SystemModel baselineModel,
                                       ChangeRequest request,
                                       double threshold) {
        String targetId = request.getTargetComponentId();
        Component targetComponent = workingModel.getComponent(targetId);
        Component baselineTarget = baselineModel.getComponent(targetId);

        // 1. Direct impact on target
        ComponentProperties directProjected = MetricProjector.projectDirectChange(targetComponent, request);
        double directImpactScore = MetricProjector.calculateDirectImpactScore(targetComponent, request);
        targetComponent.setProperties(directProjected);

        Map<String, ImpactRecord> impactRecordMap = new LinkedHashMap<>();
        List<String> directlyAffected = new ArrayList<>();
        List<String> indirectlyAffected = new ArrayList<>();
        List<List<String>> allImpactPaths = new ArrayList<>();

        directlyAffected.add(targetId);
        List<String> rootPath = List.of(targetId);
        allImpactPaths.add(rootPath);

        ImpactRecord directRecord = new ImpactRecord(
                targetId,
                true,
                0,
                directImpactScore,
                ImpactSeverity.fromScore(directImpactScore),
                baselineTarget.getProperties().copy(),
                directProjected.copy(),
                rootPath
        );
        impactRecordMap.put(targetId, directRecord);

        // 2. Recursive DFS
        boolean propagatesUpstream = request.getChangeType().propagatesUpstream();
        dfsTraverse(
                workingModel,
                baselineModel,
                request,
                targetId,
                0,
                directImpactScore,
                directProjected,
                rootPath,
                threshold,
                propagatesUpstream,
                impactRecordMap,
                indirectlyAffected,
                allImpactPaths
        );

        return new PropagationResult(
                Collections.unmodifiableList(directlyAffected),
                Collections.unmodifiableList(indirectlyAffected),
                Collections.unmodifiableMap(impactRecordMap),
                Collections.unmodifiableList(allImpactPaths)
        );
    }

    private void dfsTraverse(SystemModel workingModel,
                             SystemModel baselineModel,
                             ChangeRequest request,
                             String currentId,
                             int currentDepth,
                             double currentImpactScore,
                             ComponentProperties currentProjected,
                             List<String> currentPath,
                             double threshold,
                             boolean propagatesUpstream,
                             Map<String, ImpactRecord> impactRecordMap,
                             List<String> indirectlyAffected,
                             List<List<String>> allImpactPaths) {

        List<Dependency> candidateEdges = propagatesUpstream
                ? workingModel.getDirectCallersOf(currentId)
                : workingModel.getDirectCalleesOf(currentId);

        for (Dependency edge : candidateEdges) {
            String nextId = propagatesUpstream
                    ? edge.getSourceComponentId()
                    : edge.getTargetComponentId();

            // Cycle prevention
            if (currentPath.contains(nextId)) {
                continue;
            }

            Component nextComp = workingModel.getComponent(nextId);
            Component nextBaseline = baselineModel.getComponent(nextId);

            double edgeWeight = edge.getEdgeTransmissionWeight();
            double criticalityFactor = nextComp.getCriticality().getRiskMultiplier() / 1.5;
            double nextImpactScore = currentImpactScore * edgeWeight * criticalityFactor;

            // Threshold cutoff
            if (nextImpactScore < threshold) {
                continue;
            }

            ComponentProperties indirectProjected = MetricProjector.projectIndirectChange(
                    nextComp,
                    edge,
                    currentProjected,
                    baselineModel.getComponent(currentId).getProperties(),
                    request.getChangeType()
            );

            List<String> extendedPath = new ArrayList<>(currentPath);
            extendedPath.add(nextId);
            allImpactPaths.add(extendedPath);

            if (!impactRecordMap.containsKey(nextId)) {
                indirectlyAffected.add(nextId);
                ImpactRecord record = new ImpactRecord(
                        nextId,
                        false,
                        currentDepth + 1,
                        nextImpactScore,
                        ImpactSeverity.fromScore(nextImpactScore),
                        nextBaseline.getProperties().copy(),
                        indirectProjected.copy(),
                        extendedPath
                );
                impactRecordMap.put(nextId, record);
                nextComp.setProperties(indirectProjected);
            } else {
                ImpactRecord existing = impactRecordMap.get(nextId);
                if (nextImpactScore > existing.getImpactScore()) {
                    ImpactRecord updated = new ImpactRecord(
                            nextId,
                            false,
                            Math.min(existing.getPropagationDepth(), currentDepth + 1),
                            nextImpactScore,
                            ImpactSeverity.fromScore(nextImpactScore),
                            existing.getBaselineProperties(),
                            indirectProjected.copy(),
                            extendedPath
                    );
                    impactRecordMap.put(nextId, updated);
                    nextComp.setProperties(indirectProjected);
                }
            }

            // Recurse deeper along this branch
            dfsTraverse(
                    workingModel,
                    baselineModel,
                    request,
                    nextId,
                    currentDepth + 1,
                    nextImpactScore,
                    indirectProjected,
                    extendedPath,
                    threshold,
                    propagatesUpstream,
                    impactRecordMap,
                    indirectlyAffected,
                    allImpactPaths
            );
        }
    }
}
