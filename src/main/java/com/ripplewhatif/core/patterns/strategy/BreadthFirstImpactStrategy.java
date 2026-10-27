package com.ripplewhatif.core.patterns.strategy;

import com.ripplewhatif.core.domain.change.ChangeRequest;
import com.ripplewhatif.core.domain.model.Component;
import com.ripplewhatif.core.domain.model.ComponentProperties;
import com.ripplewhatif.core.domain.model.Dependency;
import com.ripplewhatif.core.domain.model.SystemModel;
import com.ripplewhatif.core.domain.result.ImpactRecord;
import com.ripplewhatif.core.domain.result.ImpactSeverity;
import com.ripplewhatif.core.engine.MetricProjector;

import java.util.ArrayDeque;
import java.util.ArrayList;
import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Queue;

public class BreadthFirstImpactStrategy implements ImpactPropagationStrategy {

    @Override
    public String getName() {
        return "BreadthFirstSearch (BFS) Strategy";
    }

    private record TraversalNode(
            String componentId,
            int depth,
            double currentImpactScore,
            List<String> path,
            ComponentProperties projectedProperties
    ) {}

    @Override
    public PropagationResult propagate(SystemModel workingModel,
                                       SystemModel baselineModel,
                                       ChangeRequest request,
                                       double threshold) {
        String targetId = request.getTargetComponentId();
        Component targetComponent = workingModel.getComponent(targetId);
        Component baselineTarget = baselineModel.getComponent(targetId);

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

        Queue<TraversalNode> queue = new ArrayDeque<>();
        queue.add(new TraversalNode(targetId, 0, directImpactScore, rootPath, directProjected));

        boolean propagatesUpstream = request.getChangeType().propagatesUpstream();

        while (!queue.isEmpty()) {
            TraversalNode current = queue.poll();

            List<Dependency> candidateEdges = propagatesUpstream
                    ? workingModel.getDirectCallersOf(current.componentId())
                    : workingModel.getDirectCalleesOf(current.componentId());

            for (Dependency edge : candidateEdges) {
                String nextId = propagatesUpstream
                        ? edge.getSourceComponentId()
                        : edge.getTargetComponentId();

                if (current.path().contains(nextId)) {
                    continue;
                }

                Component nextComp = workingModel.getComponent(nextId);
                Component nextBaseline = baselineModel.getComponent(nextId);

                double edgeWeight = edge.getEdgeTransmissionWeight();
                double criticalityFactor = nextComp.getCriticality().getRiskMultiplier() / 1.5;
                double nextImpactScore = current.currentImpactScore() * edgeWeight * criticalityFactor;

                if (nextImpactScore < threshold) {
                    continue;
                }

                ComponentProperties indirectProjected = MetricProjector.projectIndirectChange(
                        nextComp,
                        edge,
                        current.projectedProperties(),
                        baselineModel.getComponent(current.componentId()).getProperties(),
                        request.getChangeType()
                );

                List<String> extendedPath = new ArrayList<>(current.path());
                extendedPath.add(nextId);
                allImpactPaths.add(extendedPath);

                if (!impactRecordMap.containsKey(nextId)) {
                    indirectlyAffected.add(nextId);
                    ImpactRecord record = new ImpactRecord(
                            nextId,
                            false,
                            current.depth() + 1,
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
                                Math.min(existing.getPropagationDepth(), current.depth() + 1),
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

                queue.add(new TraversalNode(nextId, current.depth() + 1, nextImpactScore, extendedPath, indirectProjected));
            }
        }

        return new PropagationResult(
                Collections.unmodifiableList(directlyAffected),
                Collections.unmodifiableList(indirectlyAffected),
                Collections.unmodifiableMap(impactRecordMap),
                Collections.unmodifiableList(allImpactPaths)
        );
    }
}
