import type { Severity } from '../../types'
import { signed } from '../../utils/format'
import { Sparkline } from '../charts/Sparkline'
import { SectionLabel } from '../common/SectionLabel'
import { StatusDot } from '../common/StatusDot'

interface ProfileVitalProps {
  label: string
  short: string
  value: string
  unit: string
  values: number[]
  delta: number
  digits?: number
  severity: Severity
}

export function ProfileVital({
  label,
  short,
  value,
  unit,
  values,
  delta,
  digits = 0,
  severity,
}: ProfileVitalProps) {
  const color =
    severity === 'critical'
      ? 'var(--crit)'
      : severity === 'warning'
        ? 'var(--warn)'
        : 'var(--accent)'

  return (
    <div className="bg-surface p-4 sm:p-5">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-baseline gap-2">
          <SectionLabel>{label}</SectionLabel>
          <span className="font-mono text-[8px] tracking-[0.12em] text-muted/60">
            {short}
          </span>
        </div>
        <StatusDot severity={severity} pulse={severity === 'critical'} />
      </div>
      <div className="mt-4 flex items-end gap-1.5">
        <span className="numeric text-[32px] leading-none">{value}</span>
        <span className="mb-0.5 font-mono text-[9px] uppercase tracking-[0.14em] text-muted">
          {unit}
        </span>
      </div>
      <div className="mt-3 flex items-end justify-between gap-3">
        <span className="font-mono text-[9px] tabular-nums text-muted">
          {signed(delta, digits)} / 12m
        </span>
        <div className="w-24 shrink-0">
          <Sparkline values={values} color={color} height={30} />
        </div>
      </div>
    </div>
  )
}
