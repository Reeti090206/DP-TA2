package com.ripplewhatif.api.controller;

import com.ripplewhatif.core.exception.ComponentNotFoundException;
import com.ripplewhatif.core.exception.InvalidChangeException;
import com.ripplewhatif.core.exception.ModelValidationException;
import com.ripplewhatif.core.exception.RippleSimulationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.Instant;
import java.util.List;
import java.util.Map;

/**
 * Maps simulation and domain exceptions to standard HTTP error responses.
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ModelValidationException.class)
    public ResponseEntity<Map<String, Object>> handleModelValidation(ModelValidationException ex) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of(
                "timestamp", Instant.now(),
                "error", "MODEL_VALIDATION_ERROR",
                "message", ex.getMessage(),
                "details", ex.getValidationErrors()
        ));
    }

    @ExceptionHandler(ComponentNotFoundException.class)
    public ResponseEntity<Map<String, Object>> handleNotFound(ComponentNotFoundException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of(
                "timestamp", Instant.now(),
                "error", "COMPONENT_NOT_FOUND",
                "message", ex.getMessage()
        ));
    }

    @ExceptionHandler(InvalidChangeException.class)
    public ResponseEntity<Map<String, Object>> handleInvalidChange(InvalidChangeException ex) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of(
                "timestamp", Instant.now(),
                "error", "INVALID_CHANGE_REQUEST",
                "message", ex.getMessage()
        ));
    }

    @ExceptionHandler(RippleSimulationException.class)
    public ResponseEntity<Map<String, Object>> handleGenericSimulation(RippleSimulationException ex) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of(
                "timestamp", Instant.now(),
                "error", "SIMULATION_ERROR",
                "message", ex.getMessage()
        ));
    }
}
