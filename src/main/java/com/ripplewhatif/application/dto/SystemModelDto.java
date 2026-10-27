package com.ripplewhatif.application.dto;

import java.util.List;

public record SystemModelDto(
        String systemId,
        String systemName,
        int componentCount,
        int dependencyCount,
        List<ComponentDto> components,
        List<DependencyDto> dependencies
) {}
