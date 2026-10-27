import { cn } from '../../lib/cn'

interface BrandMarkProps {
  className?: string
}

export function BrandMark({ className }: BrandMarkProps) {
  return (
    <svg
      aria-hidden="true"
      className={cn('size-5', className)}
      viewBox="0 0 32 32"
      fill="none"
    >
      <circle cx="16" cy="16" r="12" stroke="currentColor" strokeOpacity="0.22" strokeWidth="1.5" />
      <circle cx="16" cy="16" r="7" stroke="currentColor" strokeOpacity="0.62" strokeWidth="1.5" />
      <circle cx="16" cy="16" r="2.5" fill="currentColor" />
      <path
        d="M16 4V1.5M28 16h2.5M16 28v2.5M4 16H1.5"
        stroke="currentColor"
        strokeOpacity="0.55"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  )
}
