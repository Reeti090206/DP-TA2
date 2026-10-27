package com.ripplewhatif.application.dto;

import com.ripplewhatif.core.domain.model.DependencyStrength;
import com.ripplewhatif.core.domain.model.DependencyType;

public record DependencyDto(
        String sourceComponentId,
        String targetComponentId,
        DependencyStrength strength,
        DependencyType type,
        boolean isSynchronous,
        String description
) {
    public static DependencyDto of(String source, String target) {
        return new DependencyDto(source, target, DependencyStrength.STRONG, DependencyType.SYNCHRONOUS_REST, true, "");
    }
}
