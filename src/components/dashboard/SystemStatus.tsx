import type { Severity } from '../../types'
import { cn } from '../../utils/cn'
import { StatusDot } from '../common/StatusDot'

interface SystemRow {
  label: string
  detail: string
  value: string
  severity: Severity
}

const SYSTEMS: SystemRow[] = [
  {
    label: 'ECLSS',
    detail: 'CO₂ scrubber',
    value: '98%',
    severity: 'nominal',
  },
  {
    label: 'Power bus',
    detail: 'Solar array input',
    value: '87%',
    severity: 'nominal',
  },
  {
    label: 'Comms',
    detail: 'Deep-space link',
    value: 'LOCK',
    severity: 'nominal',
  },
  {
    label: 'Radiation',
    detail: 'Solar particle forecast',
    value: 'WATCH',
    severity: 'warning',
  },
]

export function SystemStatus() {
  return (
    <ul>
      {SYSTEMS.map((system) => (
        <li
          key={system.label}
          className="flex items-center gap-3 border-b border-line py-3 first:pt-0 last:border-b-0 last:pb-0"
        >
          <StatusDot severity={system.severity} pulse={false} />
          <span className="min-w-0 flex-1">
            <span className="block text-[12.5px] font-medium">
              {system.label}
            </span>
            <span className="mt-0.5 block font-mono text-[8.5px] uppercase tracking-[0.12em] text-muted">
              {system.detail}
            </span>
          </span>
          <span
            className={cn(
              'font-mono text-[11px] tabular-nums',
              system.severity === 'warning' ? 'text-warn' : 'text-ink',
            )}
          >
            {system.value}
          </span>
        </li>
      ))}
    </ul>
  )
}
