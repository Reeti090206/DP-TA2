package com.ripplewhatif.core.exception;

public class RippleSimulationException extends RuntimeException {
    public RippleSimulationException(String message) {
        super(message);
    }

    public RippleSimulationException(String message, Throwable cause) {
        super(message, cause);
    }
}
