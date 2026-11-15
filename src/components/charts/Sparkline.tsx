import { Line, LineChart, ResponsiveContainer } from 'recharts'

interface SparklineProps {
  values: number[]
  color?: string
  height?: number
}

export function Sparkline({
  values,
  color = 'var(--accent)',
  height = 36,
}: SparklineProps) {
  const data = values.map((value, index) => ({ index, value }))

  return (
    <div style={{ height }} className="w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 3, right: 1, bottom: 1, left: 1 }}>
          <Line
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={1.5}
            dot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
