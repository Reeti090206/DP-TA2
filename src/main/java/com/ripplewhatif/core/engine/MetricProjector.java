package com.ripplewhatif.core.engine;

import com.ripplewhatif.core.domain.change.ChangeRequest;
import com.ripplewhatif.core.domain.change.ChangeType;
import com.ripplewhatif.core.domain.change.ChangeUnit;
import com.ripplewhatif.core.domain.model.Component;
import com.ripplewhatif.core.domain.model.ComponentProperties;
import com.ripplewhatif.core.domain.model.Dependency;

public final class MetricProjector {

    private MetricProjector() {

    }

    public static ComponentProperties projectDirectChange(Component target, ChangeRequest request) {
        ComponentProperties baseline = target.getProperties();
        ChangeType type = request.getChangeType();
        double mag = request.getMagnitude();
        ChangeUnit unit = request.getUnit();

        return switch (type) {
            case LATENCY_INCREASE -> {
                double delta = (unit == ChangeUnit.PERCENT)
                        ? baseline.getLatencyMs() * (mag / 100.0)
                        : mag;
                yield baseline.withLatencyMs(baseline.getLatencyMs() + delta);
            }
            case AVAILABILITY_DECREASE -> {
                double delta = (unit == ChangeUnit.PERCENT)
                        ? baseline.getAvailability() * (mag / 100.0)
                        : mag;
                yield baseline.withAvailability(Math.max(0.0, baseline.getAvailability() - delta));
            }
            case LOAD_INCREASE -> {
                double delta = (unit == ChangeUnit.PERCENT)
                        ? baseline.getLoadQps() * (mag / 100.0)
                        : mag;
                yield baseline.withLoadQps(baseline.getLoadQps() + delta);
            }
            case FAILURE_PROBABILITY_INCREASE -> {
                double delta = (unit == ChangeUnit.PERCENT)
                        ? baseline.getFailureProbability() * (mag / 100.0)
                        : mag;
                yield baseline.withFailureProbability(Math.min(1.0, baseline.getFailureProbability() + delta));
            }
        };
    }

    public static double calculateDirectImpactScore(Component target, ChangeRequest request) {
        double rawScore = switch (request.getChangeType()) {
            case LATENCY_INCREASE -> (request.getUnit() == ChangeUnit.PERCENT)
                    ? request.getMagnitude()
                    : Math.min(100.0, (request.getMagnitude() / Math.max(10.0, target.getProperties().getLatencyMs())) * 100.0);
            case AVAILABILITY_DECREASE -> (request.getUnit() == ChangeUnit.PERCENT)
                    ? request.getMagnitude() * 1.5
                    : request.getMagnitude() * 20.0;
            case LOAD_INCREASE -> (request.getUnit() == ChangeUnit.PERCENT)
                    ? request.getMagnitude() * 0.8
                    : (request.getMagnitude() / Math.max(1.0, target.getProperties().getLoadQps())) * 100.0;
            case FAILURE_PROBABILITY_INCREASE -> (request.getUnit() == ChangeUnit.PERCENT)
                    ? request.getMagnitude() * 1.2
                    : request.getMagnitude() * 100.0;
        };

        double criticalityMultiplier = target.getCriticality().getRiskMultiplier();
        return Math.clamp(rawScore * (criticalityMultiplier / 1.5), 1.0, 100.0);
    }

    public static ComponentProperties projectIndirectChange(Component dependent,
                                                            Dependency edge,
                                                            ComponentProperties causeProperties,
                                                            ComponentProperties causeBaseline,
                                                            ChangeType changeType) {
        ComponentProperties baseline = dependent.getProperties();
        double transmission = edge.getEdgeTransmissionWeight();

        return switch (changeType) {
            case LATENCY_INCREASE -> {
                double addedLatency = (causeProperties.getLatencyMs() - causeBaseline.getLatencyMs()) * transmission;
                yield baseline.withLatencyMs(baseline.getLatencyMs() + Math.max(0.0, addedLatency));
            }
            case AVAILABILITY_DECREASE -> {
                double lostAvailability = (causeBaseline.getAvailability() - causeProperties.getAvailability()) * transmission * 0.5;
                yield baseline.withAvailability(Math.max(0.0, baseline.getAvailability() - lostAvailability));
            }
            case LOAD_INCREASE -> {
                double addedLoad = (causeProperties.getLoadQps() - causeBaseline.getLoadQps()) * transmission;
                yield baseline.withLoadQps(baseline.getLoadQps() + Math.max(0.0, addedLoad));
            }
            case FAILURE_PROBABILITY_INCREASE -> {
                double addedFailure = (causeProperties.getFailureProbability() - causeBaseline.getFailureProbability()) * transmission * 0.7;
                yield baseline.withFailureProbability(Math.min(1.0, baseline.getFailureProbability() + Math.max(0.0, addedFailure)));
            }
        };
    }
}
