import { ArrowUpRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { CrewMember, VitalReading } from '../../types'
import { formatMissionDay, formatValue } from '../../utils/format'
import { overallSeverity } from '../../utils/vitals'
import { Badge } from '../common/Badge'
import { AstronautPortrait } from './AstronautPortrait'

interface CrewCardProps {
  member: CrewMember
  latest?: VitalReading
  missionMinutes: number
}

export function CrewCard({ member, latest, missionMinutes }: CrewCardProps) {
  const severity = overallSeverity(latest)
  const badgeTone =
    severity === 'critical'
      ? 'critical'
      : severity === 'warning'
        ? 'warning'
        : 'nominal'

  return (
    <Link
      to={`/crew/${member.id}`}
      className="group grid grid-cols-[92px_1fr] gap-4 border border-line bg-surface p-3 transition-colors hover:border-ink sm:grid-cols-[104px_1fr] sm:gap-5"
    >
      <AstronautPortrait
        crew={member}
        className="h-full min-h-[140px] w-full"
      />
      <div className="flex min-w-0 flex-col justify-between py-1 pr-1">
        <div>
          <div className="flex items-start justify-between gap-2">
            <span className="label">
              {member.crewId} / {member.callSign}
            </span>
            <Badge tone={badgeTone} dot>
              {severity}
            </Badge>
          </div>
          <h3 className="mt-3 font-display text-[19px] font-semibold leading-tight tracking-[-0.02em]">
            {member.name}
          </h3>
          <p className="mt-1 text-[11px] text-muted">{member.role}</p>
          <p className="mt-3 font-mono text-[8.5px] uppercase tracking-[0.12em] text-muted">
            Mission day {formatMissionDay(missionMinutes)} · {member.specialty}
          </p>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2 border-t border-line pt-3">
          <div>
            <div className="label">HR</div>
            <div className="mt-1 font-mono text-[13px] tabular-nums">
              {latest ? Math.round(latest.heartRate) : '—'}
            </div>
          </div>
          <div>
            <div className="label">SpO₂</div>
            <div className="mt-1 font-mono text-[13px] tabular-nums">
              {latest ? `${formatValue(latest.spo2, 0)}%` : '—'}
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between">
              <div className="label">TEMP</div>
              <ArrowUpRight
                size={12}
                className="text-muted transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-accent"
              />
            </div>
            <div className="mt-1 font-mono text-[13px] tabular-nums">
              {latest ? `${formatValue(latest.temperature, 1)}°` : '—'}
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}
