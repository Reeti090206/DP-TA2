import { useId, useState, type FormEvent, type KeyboardEvent } from 'react'
import { Check, Pencil, RotateCcw, TriangleAlert } from 'lucide-react'
import { Badge } from '../ui/Badge'
import { Button } from '../ui/Button'
import {
  formatNumber,
  formatPropertyRange,
  formatPropertyValue,
  getUnitLabel,
} from '../../lib/format'
import { validatePropertyValue } from '../../lib/propertyValidation'
import { getScenarioChange } from '../../lib/scenarioState'
import { cn } from '../../lib/cn'
import type {
  ComponentId,
  PropertyKey,
  Scenario,
  ScenarioChange,
  SupportedProperty,
  SystemComponent,
} from '../../types/domain'

interface ScenarioChangeEditorProps {
  scenario: Scenario
  component: SystemComponent
  onApplyChange: (change: ScenarioChange) => void
  onResetChange: (componentId: ComponentId, propertyKey: PropertyKey) => void
}

interface PropertyChangeRowProps {
  scenario: Scenario
  componentId: ComponentId
  property: SupportedProperty
  onApplyChange: (change: ScenarioChange) => void
  onResetChange: (componentId: ComponentId, propertyKey: PropertyKey) => void
}

function PropertyChangeRow({
  scenario,
  componentId,
  property,
  onApplyChange,
  onResetChange,
}: PropertyChangeRowProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [rawValue, setRawValue] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isConfirmingReset, setIsConfirmingReset] = useState(false)
  const inputId = useId()
  const helpId = useId()
  const errorId = useId()
  const change = getScenarioChange(scenario, componentId, property.key)
  const scenarioValue = change?.value ?? property.defaultValue
  const unitLabel = getUnitLabel(property.unit)

  const startEditing = () => {
    setRawValue(String(scenarioValue))
    setError(null)
    setIsConfirmingReset(false)
    setIsEditing(true)
  }

  const closeEditor = () => {
    setIsEditing(false)
    setError(null)
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const validation = validatePropertyValue(property, rawValue)

    if (validation.value === null) {
      setError(validation.error)
      return
    }

    if (validation.value === property.defaultValue) {
      setError(
        change
          ? 'This is the baseline value. Use Reset to remove the override.'
          : 'This already matches the baseline. Enter a different value.',
      )
      return
    }

    if (change && validation.value === change.value) {
      setError('This is already the scenario value.')
      return
    }

    onApplyChange({
      componentId,
      propertyKey: property.key,
      value: validation.value,
    })
    closeEditor()
  }

  const handleFormKeyDown = (event: KeyboardEvent<HTMLFormElement>) => {
    if (event.key === 'Escape') {
      closeEditor()
    }
  }

  const handleReset = () => {
    onResetChange(componentId, property.key)
    setIsConfirmingReset(false)
  }

  return (
    <div className="rounded-lg border border-line bg-white p-2.5">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-1.5">
            <h4 className="text-[10.5px] font-semibold text-ink">{property.label}</h4>
            {change ? <Badge tone="teal">Modified</Badge> : null}
          </div>
          <p
            title={property.description}
            className="mt-0.5 font-mono text-[8px] leading-4 text-ink-subtle"
          >
            {formatPropertyRange(property.min, property.max, property.unit)} · step{' '}
            {formatNumber(property.step)}
          </p>
        </div>
      </div>

      <div className="mt-2 grid grid-cols-2 gap-1.5">
        <div className="rounded-md border border-line bg-canvas/50 px-2 py-1.5">
          <div className="text-[7.5px] font-bold uppercase tracking-[0.09em] text-ink-subtle">
            Baseline
          </div>
          <div className="mt-0.5 font-mono text-[10px] font-semibold text-ink-muted">
            {formatPropertyValue(property.defaultValue, property.unit)}
          </div>
        </div>
        <div
          className={cn(
            'rounded-md border px-2 py-1.5',
            change
              ? 'border-brand-line bg-brand-soft/55'
              : 'border-dashed border-line bg-canvas/30',
          )}
        >
          <div className="text-[7.5px] font-bold uppercase tracking-[0.09em] text-ink-subtle">
            Scenario
          </div>
          <div
            className={cn(
              'mt-0.5 font-mono text-[10px] font-semibold',
              change ? 'text-brand-strong' : 'text-ink-subtle',
            )}
          >
            {change
              ? formatPropertyValue(change.value, property.unit)
              : 'Not set'}
          </div>
        </div>
      </div>

      {isEditing ? (
        <form
          noValidate
          onSubmit={handleSubmit}
          onKeyDown={handleFormKeyDown}
          className="mt-2 rounded-md border border-brand-line bg-brand-soft/30 p-2"
        >
          <label
            htmlFor={inputId}
            className="text-[8px] font-bold uppercase tracking-[0.09em] text-brand-strong"
          >
            Scenario value
          </label>
          <div className="relative mt-1">
            <input
              id={inputId}
              autoFocus
              type="number"
              inputMode="decimal"
              min={property.min}
              max={property.max}
              step={property.step}
              value={rawValue}
              onChange={(event) => {
                setRawValue(event.target.value)
                if (error) {
                  setError(null)
                }
              }}
              aria-invalid={error ? true : undefined}
              aria-describedby={error ? `${helpId} ${errorId}` : helpId}
              className={cn(
                'h-8 w-full rounded-md border bg-white px-2 font-mono text-[11px] font-semibold text-ink outline-none transition-colors focus:border-brand focus:ring-2 focus:ring-brand/10',
                unitLabel ? 'pr-14' : '',
                error ? 'border-risk-critical' : 'border-line-strong',
              )}
            />
            {unitLabel ? (
              <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-y-0 right-2 flex items-center font-mono text-[8.5px] text-ink-subtle"
              >
                {unitLabel}
              </span>
            ) : null}
          </div>
          <p id={helpId} className="mt-1 text-[8px] leading-3.5 text-ink-subtle">
            Allowed {formatPropertyRange(property.min, property.max, property.unit)}.
          </p>
          {error ? (
            <div
              id={errorId}
              role="alert"
              className="mt-1 flex items-start gap-1 text-[8.5px] leading-3.5 text-risk-critical"
            >
              <TriangleAlert aria-hidden="true" size={10} className="mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          ) : null}
          <div className="mt-2 flex items-center justify-between gap-2">
            <span className="text-[8px] text-ink-subtle">Confirming updates the revision.</span>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-[9.5px]"
                onClick={closeEditor}
              >
                Cancel
              </Button>
              <Button type="submit" size="sm" className="h-7 px-2 text-[9.5px]">
                <Check aria-hidden="true" size={10} />
                Confirm
              </Button>
            </div>
          </div>
        </form>
      ) : isConfirmingReset ? (
        <div
          role="group"
          aria-label={`Remove ${property.label} override`}
          className="mt-2 rounded-md border border-risk-critical/20 bg-risk-critical-soft/65 px-2 py-1.5"
        >
          <p className="text-[8.5px] font-semibold leading-3.5 text-risk-critical">
            Remove this override and restore the baseline value?
          </p>
          <div className="mt-1.5 flex items-center justify-end gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-[9.5px]"
              onClick={() => setIsConfirmingReset(false)}
            >
              Keep change
            </Button>
            <Button
              variant="secondary"
              size="sm"
              className="h-7 border-risk-critical/30 px-2 text-[9.5px] text-risk-critical hover:border-risk-critical/50 hover:bg-risk-critical-soft"
              onClick={handleReset}
            >
              Remove
            </Button>
          </div>
        </div>
      ) : (
        <div className="mt-2 flex items-center justify-end gap-1">
          {change ? (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-[9.5px]"
              onClick={() => {
                setError(null)
                setIsConfirmingReset(true)
              }}
            >
              <RotateCcw aria-hidden="true" size={10} />
              Reset
            </Button>
          ) : null}
          <Button
            variant="secondary"
            size="sm"
            className="h-7 px-2 text-[9.5px]"
            onClick={startEditing}
            aria-label={`${change ? 'Edit' : 'Propose'} ${property.label} for this scenario`}
          >
            <Pencil aria-hidden="true" size={10} />
            {change ? 'Edit' : 'Propose'}
          </Button>
        </div>
      )}
    </div>
  )
}

export function ScenarioChangeEditor({
  scenario,
  component,
  onApplyChange,
  onResetChange,
}: ScenarioChangeEditorProps) {
  const overrideCount = component.supportedProperties.filter((property) =>
    getScenarioChange(scenario, component.id, property.key),
  ).length

  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-2">
        <div>
          <h3 className="text-[9px] font-bold uppercase tracking-[0.12em] text-ink-subtle">
            Supported properties
          </h3>
          <p className="mt-0.5 text-[8.5px] text-ink-subtle">
            Only {component.name} properties in the baseline model can be edited.
          </p>
        </div>
        <Badge tone={overrideCount > 0 ? 'teal' : 'neutral'}>
          {overrideCount} set
        </Badge>
      </div>

      <div className="space-y-1.5">
        {component.supportedProperties.map((property) => (
          <PropertyChangeRow
            key={`${component.id}:${scenario.id}:${property.key}`}
            scenario={scenario}
            componentId={component.id}
            property={property}
            onApplyChange={onApplyChange}
            onResetChange={onResetChange}
          />
        ))}
      </div>
    </div>
  )
}
