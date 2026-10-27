package com.ripplewhatif.core.patterns.builder;

import com.ripplewhatif.core.domain.model.Component;
import com.ripplewhatif.core.domain.model.ComponentCriticality;
import com.ripplewhatif.core.domain.model.Dependency;
import com.ripplewhatif.core.domain.model.SystemModel;
import com.ripplewhatif.core.exception.ModelValidationException;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class SystemModelBuilderTest {

    @Test
    @DisplayName("Should successfully build a valid SystemModel")
    void shouldBuildValidSystem() {
        SystemModel model = new SystemModelBuilder()
                .id("test-system")
                .name("Order System")
                .addComponent(new Component("payment", "Payment Service"))
                .addComponent(new Component("checkout", "Checkout Service"))
                .addDependency(new Dependency("checkout", "payment"))
                .build();

        assertThat(model).isNotNull();
        assertThat(model.getSystemId()).isEqualTo("test-system");
        assertThat(model.getAllComponents()).hasSize(2);
        assertThat(model.getAllDependencies()).hasSize(1);
        assertThat(model.hasComponent("payment")).isTrue();
        assertThat(model.hasComponent("checkout")).isTrue();
    }

    @Test
    @DisplayName("Should detect and reject duplicate component IDs")
    void shouldRejectDuplicateComponentId() {
        SystemModelBuilder builder = new SystemModelBuilder()
                .addComponent(new Component("payment", "Payment Service v1"))
                .addComponent(new Component("payment", "Payment Service v2"));

        assertThatThrownBy(builder::build)
                .isInstanceOf(ModelValidationException.class)
                .hasMessageContaining("Duplicate component ID detected: 'payment'");
    }

    @Test
    @DisplayName("Should reject dependency referencing non-existent source component")
    void shouldRejectInvalidSourceDependency() {
        SystemModelBuilder builder = new SystemModelBuilder()
                .addComponent(new Component("payment", "Payment Service"))
                .addDependency(new Dependency("nonexistent-source", "payment"));

        assertThatThrownBy(builder::build)
                .isInstanceOf(ModelValidationException.class)
                .hasMessageContaining("unregistered source component");
    }

    @Test
    @DisplayName("Should reject dependency referencing non-existent target component")
    void shouldRejectInvalidTargetDependency() {
        SystemModelBuilder builder = new SystemModelBuilder()
                .addComponent(new Component("checkout", "Checkout Service"))
                .addDependency(new Dependency("checkout", "nonexistent-target"));

        assertThatThrownBy(builder::build)
                .isInstanceOf(ModelValidationException.class)
                .hasMessageContaining("unregistered target component");
    }

    @Test
    @DisplayName("Should reject self-referencing dependency")
    void shouldRejectSelfDependency() {
        assertThatThrownBy(() -> new Dependency("payment", "payment"))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Self-dependency is not permitted");
    }

    @Test
    @DisplayName("Should reject empty system with zero components")
    void shouldRejectEmptySystem() {
        SystemModelBuilder builder = new SystemModelBuilder();

        assertThatThrownBy(builder::build)
                .isInstanceOf(ModelValidationException.class)
                .hasMessageContaining("must contain at least one component");
    }

    @Test
    @DisplayName("Should configure custom component properties via ComponentBuilder")
    void shouldBuildComponentWithCustomProperties() {
        Component comp = ComponentBuilder.of("auth", "Auth Service")
                .type("SECURITY")
                .criticality(ComponentCriticality.CRITICAL)
                .latencyMs(15.0)
                .availability(99.999)
                .loadQps(800.0)
                .failureProbability(0.0001)
                .build();

        assertThat(comp.getId()).isEqualTo("auth");
        assertThat(comp.getCriticality()).isEqualTo(ComponentCriticality.CRITICAL);
        assertThat(comp.getProperties().getLatencyMs()).isEqualTo(15.0);
        assertThat(comp.getProperties().getAvailability()).isEqualTo(99.999);
    }
}
