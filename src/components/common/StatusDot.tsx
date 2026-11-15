import type { Severity } from '../../types'
import { cn } from '../../utils/cn'

const COLORS: Record<Severity, string> = {
  nominal: 'bg-ok',
  warning: 'bg-warn',
  critical: 'bg-crit',
}

interface StatusDotProps {
  severity: Severity
  className?: string
  pulse?: boolean
}

export function StatusDot({ severity, className, pulse = true }: StatusDotProps) {
  return (
    <span className={cn('relative inline-flex h-2 w-2', className)}>
      {pulse && severity !== 'nominal' && (
        <span
          className={cn(
            'absolute inline-flex h-full w-full animate-ping rounded-full opacity-50',
            COLORS[severity],
          )}
        />
      )}
      <span
        className={cn('relative inline-flex h-2 w-2 rounded-full', COLORS[severity])}
      />
    </span>
  )
}
