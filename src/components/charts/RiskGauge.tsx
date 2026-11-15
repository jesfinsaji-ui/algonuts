import type { RiskLevel } from '../../utils/risk'
import { riskLabel } from '../../utils/risk'

const LEVEL_COLORS: Record<RiskLevel, string> = {
  low: 'var(--ok)',
  moderate: 'var(--warn)',
  elevated: 'var(--accent)',
  high: 'var(--crit)',
}

interface RiskGaugeProps {
  score: number
  level: RiskLevel
}

const RADIUS = 82
const CIRCUMFERENCE = 2 * Math.PI * RADIUS
const ARC = CIRCUMFERENCE * 0.75

export function RiskGauge({ score, level }: RiskGaugeProps) {
  const color = LEVEL_COLORS[level]
  const progress = Math.max(0, Math.min(100, score))

  return (
    <div className="relative mx-auto w-full max-w-[260px]">
      <svg viewBox="0 0 220 200" className="w-full" role="img" aria-label={`Risk index ${score} of 100, ${riskLabel(level)}`}>
        <circle
          cx="110"
          cy="100"
          r={RADIUS}
          fill="none"
          stroke="var(--line)"
          strokeWidth="12"
          strokeDasharray={`${ARC} ${CIRCUMFERENCE}`}
          transform="rotate(135 110 100)"
        />
        <circle
          cx="110"
          cy="100"
          r={RADIUS}
          fill="none"
          stroke={color}
          strokeWidth="12"
          strokeDasharray={`${(ARC * progress) / 100} ${CIRCUMFERENCE}`}
          transform="rotate(135 110 100)"
          style={{ transition: 'stroke-dasharray 400ms ease' }}
        />
        <text
          x="110"
          y="100"
          textAnchor="middle"
          className="fill-ink font-display"
          style={{ fontSize: 52, fontWeight: 600, letterSpacing: '-0.04em' }}
        >
          {Math.round(score)}
        </text>
        <text
          x="110"
          y="122"
          textAnchor="middle"
          className="fill-muted font-mono"
          style={{ fontSize: 8, letterSpacing: '0.24em' }}
        >
          RISK INDEX
        </text>
        <text
          x="110"
          y="158"
          textAnchor="middle"
          fill={color}
          className="font-mono"
          style={{ fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase' }}
        >
          {riskLabel(level).toUpperCase()}
        </text>
      </svg>
    </div>
  )
}
