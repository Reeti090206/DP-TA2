package com.ripplewhatif.application.service;

import com.ripplewhatif.application.dto.ComponentDto;
import com.ripplewhatif.application.dto.DependencyDto;
import com.ripplewhatif.application.dto.SystemModelDto;
import com.ripplewhatif.core.domain.model.SystemModel;

/**
 * Application service managing system model configuration and persistence state.
 */
public interface SystemModelingService {

    SystemModelDto getSystemModel();

    ComponentDto addComponent(ComponentDto componentDto);

    ComponentDto updateComponent(String componentId, ComponentDto componentDto);

    boolean removeComponent(String componentId);

    DependencyDto addDependency(DependencyDto dependencyDto);

    boolean removeDependency(String sourceId, String targetId);

    void saveBaselineSnapshot();

    void restoreBaselineSnapshot();

    SystemModel getUnderlyingModel();
}
