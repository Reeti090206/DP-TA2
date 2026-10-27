package com.ripplewhatif.core.exception;

public class ComponentNotFoundException extends RippleSimulationException {
    public ComponentNotFoundException(String componentId) {
        super("Component not found in system model: '" + componentId + "'");
    }
}
