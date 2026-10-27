package com.ripplewhatif.application.service;

import com.ripplewhatif.application.dto.ComponentDto;
import com.ripplewhatif.application.dto.DependencyDto;
import com.ripplewhatif.application.dto.SystemModelDto;
import com.ripplewhatif.application.mapper.ModelMapper;
import com.ripplewhatif.core.domain.model.Component;
import com.ripplewhatif.core.domain.model.Dependency;
import com.ripplewhatif.core.domain.model.SystemModel;
import com.ripplewhatif.core.patterns.builder.ComponentBuilder;
import com.ripplewhatif.core.patterns.builder.SystemModelBuilder;
import com.ripplewhatif.core.patterns.memento.SystemSnapshotManager;
import org.springframework.stereotype.Service;

import java.util.Objects;

/**
 * Implementation of {@link SystemModelingService}.
 * Can be wired as a Spring bean or instantiated directly as a plain POJO.
 */
@Service
public class SystemModelingServiceImpl implements SystemModelingService {

    private final SystemModel systemModel;
    private final SystemSnapshotManager snapshotManager;

    public SystemModelingServiceImpl() {
        this(createDefaultArchitecture());
    }

    public SystemModelingServiceImpl(SystemModel systemModel) {
        this.systemModel = Objects.requireNonNull(systemModel, "SystemModel cannot be null");
        this.snapshotManager = new SystemSnapshotManager();
        this.snapshotManager.saveBaseline(this.systemModel);
    }

    private static SystemModel createDefaultArchitecture() {
        return new SystemModelBuilder()
                .id("ecommerce-system")
                .name("E-Commerce Microservices Architecture")
                .addComponent(ComponentBuilder.of("web-gateway", "Web API Gateway")
                        .type("GATEWAY")
                        .latencyMs(25.0)
                        .availability(99.99)
                        .loadQps(500.0)
                        .build())
                .addComponent(ComponentBuilder.of("checkout", "Checkout Service")
                        .type("SERVICE")
                        .latencyMs(65.0)
                        .availability(99.95)
                        .loadQps(250.0)
                        .build())
                .addComponent(ComponentBuilder.of("payment", "Payment Service")
                        .type("SERVICE")
                        .latencyMs(120.0)
                        .availability(99.9)
                        .loadQps(150.0)
                        .build())
                .addComponent(ComponentBuilder.of("inventory", "Inventory Service")
                        .type("SERVICE")
                        .latencyMs(40.0)
                        .availability(99.95)
                        .loadQps(200.0)
                        .build())
                .addComponent(ComponentBuilder.of("notification", "Notification Service")
                        .type("SERVICE")
                        .latencyMs(30.0)
                        .availability(99.5)
                        .loadQps(80.0)
                        .build())
                .addDependency("checkout", "payment")
                .addDependency("checkout", "inventory")
                .addDependency("web-gateway", "checkout")
                .addDependency("payment", "notification")
                .build();
    }

    @Override
    public SystemModelDto getSystemModel() {
        return ModelMapper.toDto(systemModel);
    }

    @Override
    public ComponentDto addComponent(ComponentDto dto) {
        Component comp = ModelMapper.toDomain(dto);
        systemModel.addComponent(comp);
        return ModelMapper.toDto(comp);
    }

    @Override
    public ComponentDto updateComponent(String componentId, ComponentDto dto) {
        Component comp = ModelMapper.toDomain(dto);
        systemModel.updateComponentProperties(componentId, comp.getProperties());
        return ModelMapper.toDto(systemModel.getComponent(componentId));
    }

    @Override
    public boolean removeComponent(String componentId) {
        return systemModel.removeComponent(componentId);
    }

    @Override
    public DependencyDto addDependency(DependencyDto dto) {
        Dependency dep = ModelMapper.toDomain(dto);
        systemModel.addDependency(dep);
        return ModelMapper.toDto(dep);
    }

    @Override
    public boolean removeDependency(String sourceId, String targetId) {
        return systemModel.removeDependency(sourceId, targetId);
    }

    @Override
    public void saveBaselineSnapshot() {
        snapshotManager.saveBaseline(systemModel);
    }

    @Override
    public void restoreBaselineSnapshot() {
        snapshotManager.restoreBaseline(systemModel);
    }

    @Override
    public SystemModel getUnderlyingModel() {
        return systemModel;
    }
}
