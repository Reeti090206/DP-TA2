import type { ComponentId, DemoSystem, Dependency, SystemComponent } from '../types/domain'

export function getComponentById(system: DemoSystem, componentId: ComponentId): SystemComponent {
  const component = system.components.find((item) => item.id === componentId)

  if (!component) {
    throw new Error(`Unknown component: ${componentId}`)
  }

  return component
}

export function getIncomingDependencies(system: DemoSystem, componentId: ComponentId): Dependency[] {
  return system.dependencies.filter((dependency) => dependency.target === componentId)
}

export function getOutgoingDependencies(system: DemoSystem, componentId: ComponentId): Dependency[] {
  return system.dependencies.filter((dependency) => dependency.source === componentId)
}

export function getCyclePathLabel(system: DemoSystem): string {
  return system.cyclePath
    .map((componentId) => getComponentById(system, componentId).name)
    .join(' → ')
}
