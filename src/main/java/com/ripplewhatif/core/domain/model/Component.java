package com.ripplewhatif.core.domain.model;

import java.util.Objects;

/**
 * Domain entity representing an architectural component (service, gateway, database, queue, etc.).
 */
public class Component {

    private final String id;
    private final String name;
    private final String type; // e.g. "GATEWAY", "SERVICE", "DATABASE", "QUEUE"
    private final ComponentCriticality criticality;
    private ComponentProperties properties;

    public Component(String id, String name) {
        this(id, name, "SERVICE", ComponentCriticality.MEDIUM, ComponentProperties.defaults());
    }

    public Component(String id, String name, String type, ComponentCriticality criticality, ComponentProperties properties) {
        if (id == null || id.trim().isEmpty()) {
            throw new IllegalArgumentException("Component id cannot be null or empty");
        }
        if (name == null || name.trim().isEmpty()) {
            throw new IllegalArgumentException("Component name cannot be null or empty");
        }
        this.id = id.trim().toLowerCase();
        this.name = name.trim();
        this.type = (type != null && !type.trim().isEmpty()) ? type.trim().toUpperCase() : "SERVICE";
        this.criticality = (criticality != null) ? criticality : ComponentCriticality.MEDIUM;
        this.properties = (properties != null) ? properties : ComponentProperties.defaults();
    }

    public String getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public String getType() {
        return type;
    }

    public ComponentCriticality getCriticality() {
        return criticality;
    }

    public ComponentProperties getProperties() {
        return properties;
    }

    public void setProperties(ComponentProperties properties) {
        if (properties == null) {
            throw new IllegalArgumentException("Component properties cannot be null");
        }
        this.properties = properties;
    }

    /**
     * Creates a deep copy of this component with isolated properties.
     */
    public Component deepCopy() {
        return new Component(this.id, this.name, this.type, this.criticality, this.properties.copy());
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof Component that)) return false;
        return Objects.equals(id, that.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }

    @Override
    public String toString() {
        return "Component{" +
                "id='" + id + '\'' +
                ", name='" + name + '\'' +
                ", type='" + type + '\'' +
                ", criticality=" + criticality +
                ", properties=" + properties +
                '}';
    }
}
