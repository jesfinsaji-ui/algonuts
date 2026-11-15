import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { TrendPoint } from '../../utils/series'

export interface TrendSeries {
  key: string
  label: string
  color: string
  dashed?: boolean
}

interface ReferenceBand {
  value: number
  label: string
}

interface TrendChartProps {
  data: TrendPoint[]
  series: TrendSeries[]
  height?: number
  unit?: string
  digits?: number
  references?: ReferenceBand[]
  showGrid?: boolean
}

interface TooltipRow {
  name?: string
  value?: number | string
  color?: string
}

interface ChartTooltipProps {
  active?: boolean
  payload?: TooltipRow[]
  label?: string | number
  unit?: string
  digits?: number
}

function ChartTooltip({
  active,
  payload,
  label,
  unit,
  digits = 0,
}: ChartTooltipProps) {
  if (!active || !payload || payload.length === 0) return null

  return (
    <div className="border border-line bg-surface px-3 py-2 shadow-soft">
      <div className="font-mono text-[9px] uppercase tracking-[0.2em] text-muted">
        MET {label}
      </div>
      <div className="mt-2 flex flex-col gap-1">
        {payload.map((row) => (
          <div
            key={`${row.name}-${row.value}`}
            className="flex items-center justify-between gap-4"
          >
            <span className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.1em] text-muted">
              <span
                className="inline-block h-1.5 w-1.5 rounded-full"
                style={{ background: row.color }}
              />
              {row.name}
            </span>
            <span className="font-mono text-xs tabular-nums text-ink">
              {typeof row.value === 'number'
                ? row.value.toFixed(digits)
                : row.value}
              {unit ? <span className="ml-1 text-muted">{unit}</span> : null}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

export function TrendChart({
  data,
  series,
  height = 260,
  unit,
  digits = 0,
  references = [],
  showGrid = true,
}: TrendChartProps) {
  return (
    <div style={{ height }} className="w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{ top: 10, right: 14, bottom: 0, left: -10 }}
        >
          {showGrid && (
            <CartesianGrid
              stroke="var(--grid)"
              strokeDasharray="2 4"
              vertical={false}
            />
          )}
          <XAxis
            dataKey="clock"
            tickLine={false}
            axisLine={{ stroke: 'var(--line)' }}
            tick={{ fill: 'var(--muted)', fontSize: 9, fontFamily: 'JetBrains Mono' }}
            minTickGap={48}
            interval="preserveStartEnd"
            dy={6}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            tick={{ fill: 'var(--muted)', fontSize: 9, fontFamily: 'JetBrains Mono' }}
            width={46}
            domain={['auto', 'auto']}
            tickCount={4}
          />
          <Tooltip
            content={<ChartTooltip unit={unit} digits={digits} />}
            cursor={{ stroke: 'var(--line)', strokeWidth: 1 }}
            wrapperStyle={{ outline: 'none' }}
          />
          {references.map((reference) => (
            <ReferenceLine
              key={`${reference.label}-${reference.value}`}
              y={reference.value}
              stroke="var(--warn)"
              strokeDasharray="3 4"
              strokeOpacity={0.7}
              label={{
                value: reference.label,
                position: 'insideTopRight',
                fill: 'var(--muted)',
                fontSize: 8,
                fontFamily: 'JetBrains Mono',
              }}
            />
          ))}
          {series.map((entry) => (
            <Line
              key={entry.key}
              type="monotone"
              dataKey={entry.key}
              name={entry.label}
              stroke={entry.color}
              strokeWidth={1.7}
              strokeDasharray={entry.dashed ? '4 4' : undefined}
              dot={false}
              activeDot={{ r: 3, strokeWidth: 0, fill: entry.color }}
              isAnimationActive={false}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
