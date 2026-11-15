import { ArrowUpRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { CREW } from '../../data/crew'
import type { VitalReading } from '../../types'
import { latestReading, overallSeverity } from '../../utils/vitals'
import { AstronautPortrait } from '../crew/AstronautPortrait'
import { StatusDot } from '../common/StatusDot'

interface CrewOverviewListProps {
  readings: Record<string, VitalReading[]>
}

export function CrewOverviewList({ readings }: CrewOverviewListProps) {
  return (
    <ul>
      {CREW.map((member) => {
        const latest = latestReading(readings[member.id])
        const severity = overallSeverity(latest)
        return (
          <li key={member.id} className="border-b border-line last:border-b-0">
            <Link
              to={`/crew/${member.id}`}
              className="group flex items-center gap-3 px-1 py-3 transition-colors hover:bg-surface2"
            >
              <div className="h-11 w-10 shrink-0 overflow-hidden border border-line">
                <AstronautPortrait crew={member} live={false} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="truncate text-[13px] font-medium">
                    {member.name}
                  </span>
                  <StatusDot severity={severity} pulse={false} />
                </div>
                <div className="mt-0.5 truncate font-mono text-[8.5px] uppercase tracking-[0.12em] text-muted">
                  {member.role}
                </div>
              </div>
              <div className="shrink-0 text-right">
                <div className="font-mono text-[11px] tabular-nums text-ink">
                  {latest ? Math.round(latest.heartRate) : '—'}
                  <span className="ml-1 text-[8px] uppercase text-muted">bpm</span>
                </div>
                <div className="mt-0.5 font-mono text-[9px] tabular-nums text-muted">
                  SpO₂ {latest ? latest.spo2.toFixed(0) : '—'}%
                </div>
              </div>
              <ArrowUpRight
                size={13}
                className="shrink-0 text-muted transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-accent"
              />
            </Link>
          </li>
        )
      })}
    </ul>
  )
}
