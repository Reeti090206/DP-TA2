package com.ripplewhatif.core.exception;

/**
 * Thrown when an operation references a component ID not present in the SystemModel.
 */
public class ComponentNotFoundException extends RippleSimulationException {
    public ComponentNotFoundException(String componentId) {
        super("Component not found in system model: '" + componentId + "'");
    }
}
