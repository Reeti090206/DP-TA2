export function formatDate(value: string) {
  return new Intl.DateTimeFormat('en', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value))
}

export function formatDateTime(value: string) {
  return new Intl.DateTimeFormat('en', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value))
}

export function formatNumber(value: number) {
  return new Intl.NumberFormat('en').format(value)
}

export function getUnitLabel(unit?: string) {
  return unit === 'requests/s' ? 'req/s' : (unit ?? '')
}

export function formatPropertyValue(value: number, unit?: string) {
  const label = getUnitLabel(unit)

  return label ? `${formatNumber(value)} ${label}` : formatNumber(value)
}

export function formatPropertyRange(min: number, max: number, unit?: string) {
  const label = getUnitLabel(unit)

  return `${formatNumber(min)}–${formatNumber(max)}${label ? ` ${label}` : ''}`
}
