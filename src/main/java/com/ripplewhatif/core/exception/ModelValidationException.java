package com.ripplewhatif.core.exception;

import java.util.Collections;
import java.util.List;

/**
 * Thrown when building or modifying a SystemModel violates architectural integrity constraints.
 */
public class ModelValidationException extends RippleSimulationException {

    private final List<String> validationErrors;

    public ModelValidationException(String message) {
        super(message);
        this.validationErrors = List.of(message);
    }

    public ModelValidationException(String message, List<String> validationErrors) {
        super(message + ": " + String.join(", ", validationErrors));
        this.validationErrors = validationErrors != null ? List.copyOf(validationErrors) : Collections.emptyList();
    }

    public List<String> getValidationErrors() {
        return validationErrors;
    }
}
