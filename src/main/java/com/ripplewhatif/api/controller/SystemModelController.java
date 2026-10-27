package com.ripplewhatif.api.controller;

import com.ripplewhatif.application.dto.ComponentDto;
import com.ripplewhatif.application.dto.DependencyDto;
import com.ripplewhatif.application.dto.SystemModelDto;
import com.ripplewhatif.application.service.SystemModelingService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

/**
 * <b>MVC Controller:</b> REST controller managing architectural system model components and dependencies.
 *
 * <p>Contains NO graph traversal or risk math; strictly delegates to {@link SystemModelingService}.
 */
@RestController
@RequestMapping("/api/v1/model")
public class SystemModelController {

    private final SystemModelingService modelingService;

    public SystemModelController(SystemModelingService modelingService) {
        this.modelingService = modelingService;
    }

    @GetMapping
    public ResponseEntity<SystemModelDto> getSystemModel() {
        return ResponseEntity.ok(modelingService.getSystemModel());
    }

    @PostMapping("/components")
    public ResponseEntity<ComponentDto> addComponent(@RequestBody ComponentDto dto) {
        ComponentDto created = modelingService.addComponent(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/components/{id}")
    public ResponseEntity<ComponentDto> updateComponent(@PathVariable String id, @RequestBody ComponentDto dto) {
        return ResponseEntity.ok(modelingService.updateComponent(id, dto));
    }

    @DeleteMapping("/components/{id}")
    public ResponseEntity<Map<String, Object>> removeComponent(@PathVariable String id) {
        boolean removed = modelingService.removeComponent(id);
        return ResponseEntity.ok(Map.of("componentId", id, "removed", removed));
    }

    @PostMapping("/dependencies")
    public ResponseEntity<DependencyDto> addDependency(@RequestBody DependencyDto dto) {
        DependencyDto created = modelingService.addDependency(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @DeleteMapping("/dependencies")
    public ResponseEntity<Map<String, Object>> removeDependency(@RequestParam String source, @RequestParam String target) {
        boolean removed = modelingService.removeDependency(source, target);
        return ResponseEntity.ok(Map.of("source", source, "target", target, "removed", removed));
    }

    @PostMapping("/baseline/save")
    public ResponseEntity<Map<String, String>> saveBaseline() {
        modelingService.saveBaselineSnapshot();
        return ResponseEntity.ok(Map.of("message", "Baseline snapshot saved successfully"));
    }

    @PostMapping("/baseline/restore")
    public ResponseEntity<Map<String, String>> restoreBaseline() {
        modelingService.restoreBaselineSnapshot();
        return ResponseEntity.ok(Map.of("message", "System restored to baseline snapshot successfully"));
    }
}
