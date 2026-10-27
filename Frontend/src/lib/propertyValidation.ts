import { formatNumber, formatPropertyValue } from './format'
import type { SupportedProperty } from '../types/domain'

export interface PropertyValueValidation {
  value: number | null
  error: string | null
}

const STEP_TOLERANCE = 1e-7

export function validatePropertyValue(
  property: SupportedProperty,
  rawValue: string,
): PropertyValueValidation {
  const normalizedValue = rawValue.trim()

  if (normalizedValue.length === 0) {
    return { value: null, error: 'Enter a value.' }
  }

  const value = Number(normalizedValue)

  if (!Number.isFinite(value)) {
    return { value: null, error: 'Enter a valid number.' }
  }

  if (value < property.min || value > property.max) {
    return {
      value: null,
      error: `Value must be between ${formatPropertyValue(property.min, property.unit)} and ${formatPropertyValue(property.max, property.unit)}.`,
    }
  }

  if (property.step > 0) {
    const stepPosition = (value - property.min) / property.step

    if (Math.abs(stepPosition - Math.round(stepPosition)) > STEP_TOLERANCE) {
      return {
        value: null,
        error: `Use increments of ${formatNumber(property.step)} within the allowed range.`,
      }
    }
  }

  return { value, error: null }
}
