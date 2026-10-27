package com.ripplewhatif.core.exception;

/**
 * Thrown when a ChangeRequest has invalid targets, metrics, or bounds.
 */
public class InvalidChangeException extends RippleSimulationException {
    public InvalidChangeException(String message) {
        super(message);
    }
}
