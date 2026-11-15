import { ArrowDownRight, ArrowUpRight, Minus } from 'lucide-react'
import type { Severity } from '../../types'
import { cn } from '../../utils/cn'
import { signed } from '../../utils/format'
import { Sparkline } from '../charts/Sparkline'
import { StatusDot } from '../common/StatusDot'

interface VitalMetricProps {
  label: string
  short: string
  value: string
  unit: string
  values: number[]
  delta: number
  digits?: number
  severity: Severity
  context?: string
}

export function VitalMetric({
  label,
  short,
  value,
  unit,
  values,
  delta,
  digits = 0,
  severity,
  context = 'Crew average',
}: VitalMetricProps) {
  const rising = delta > 0.05
  const falling = delta < -0.05
  const TrendIcon = rising ? ArrowUpRight : falling ? ArrowDownRight : Minus
  const trendColor =
    severity === 'critical'
      ? 'text-crit'
      : severity === 'warning'
        ? 'text-warn'
        : 'text-muted'

  return (
    <div className="flex flex-col justify-between bg-surface px-5 py-5 sm:px-6 sm:py-6">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-baseline gap-2">
          <span className="label">{label}</span>
          <span className="font-mono text-[9px] tracking-[0.14em] text-muted/60">
            {short}
          </span>
        </div>
        <StatusDot severity={severity} pulse={severity === 'critical'} />
      </div>

      <div className="mt-6 flex items-end gap-2">
        <span className="numeric text-[42px] leading-[0.85] sm:text-[50px] xl:text-[54px]">
          {value}
        </span>
        <span className="mb-1 font-mono text-[10px] uppercase tracking-[0.16em] text-muted">
          {unit}
        </span>
      </div>

      <div className="mt-4 flex items-end justify-between gap-3">
        <div>
          <div
            className={cn(
              'flex items-center gap-1 font-mono text-[10px] tabular-nums',
              trendColor,
            )}
          >
            <TrendIcon size={12} strokeWidth={1.8} />
            {signed(delta, digits)}
            <span className="text-muted">/ 12m</span>
          </div>
          <div className="mt-1.5 font-mono text-[8px] uppercase tracking-[0.16em] text-muted/70">
            {context}
          </div>
        </div>
        <div className="w-20 shrink-0 sm:w-24">
          <Sparkline
            values={values}
            height={38}
            color={
              severity === 'critical'
                ? 'var(--crit)'
                : severity === 'warning'
                  ? 'var(--warn)'
                  : 'var(--accent)'
            }
          />
        </div>
      </div>
    </div>
  )
}
