package com.ripplewhatif.core.exception;

/**
 * Base unchecked exception for all RippleWhatIf simulation and model errors.
 */
public class RippleSimulationException extends RuntimeException {
    public RippleSimulationException(String message) {
        super(message);
    }

    public RippleSimulationException(String message, Throwable cause) {
        super(message, cause);
    }
}
