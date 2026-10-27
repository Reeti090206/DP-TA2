import type { ComponentId } from '../types/domain'

export const graphLayout: Record<ComponentId, { x: number; y: number }> = {
  'web-gateway': { x: 0, y: 240 },
  authentication: { x: 190, y: 40 },
  'product-catalog': { x: 190, y: 175 },
  inventory: { x: 190, y: 370 },
  cart: { x: 380, y: 260 },
  checkout: { x: 570, y: 260 },
  payment: { x: 760, y: 90 },
  'order-service': { x: 760, y: 390 },
  notification: { x: 950, y: 220 },
  analytics: { x: 950, y: 430 },
}
