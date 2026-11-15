import { ArrowUpRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { crewById } from '../../data/crew'
import type { AlertRecord } from '../../types'
import { formatAgo } from '../../utils/format'
import { Badge } from '../common/Badge'
import { StatusDot } from '../common/StatusDot'

interface RecentAlertsProps {
  alerts: AlertRecord[]
  missionMinutes: number
}

export function RecentAlerts({ alerts, missionMinutes }: RecentAlertsProps) {
  const sorted = [...alerts]
    .sort((a, b) => {
      const rank = (alert: AlertRecord) =>
        alert.status === 'resolved' ? 1 : 0
      return (
        rank(a) - rank(b) ||
        b.detectedAt - a.detectedAt
      )
    })
    .slice(0, 4)

  if (sorted.length === 0) {
    return (
      <p className="py-8 text-center text-xs text-muted">
        No alerts on the current shift.
      </p>
    )
  }

  return (
    <ul>
      {sorted.map((alert) => {
        const member = crewById(alert.astronautId)
        return (
          <li key={alert.id} className="border-b border-line last:border-b-0">
            <Link
              to="/alerts"
              className="group flex gap-3 px-1 py-3 transition-colors hover:bg-surface2"
            >
              <span className="mt-1">
                <StatusDot severity={alert.severity} pulse={false} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-center justify-between gap-2">
                  <span className="truncate text-[12.5px] font-medium">
                    {alert.title}
                  </span>
                  <span className="shrink-0 font-mono text-[8px] uppercase tracking-[0.1em] text-muted">
                    {formatAgo(missionMinutes - alert.detectedAt)}
                  </span>
                </span>
                <span className="mt-1 flex items-center gap-2">
                  <span className="font-mono text-[9px] uppercase tracking-[0.1em] text-muted">
                    {member?.name ?? alert.astronautId}
                  </span>
                  <Badge
                    tone={
                      alert.status === 'resolved'
                        ? 'resolved'
                        : alert.status === 'acknowledged'
                          ? 'acknowledged'
                          : 'active'
                    }
                    className="px-1.5 py-0.5 text-[8px]"
                  >
                    {alert.status}
                  </Badge>
                </span>
              </span>
              <ArrowUpRight
                size={13}
                className="mt-1 shrink-0 text-muted transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-accent"
              />
            </Link>
          </li>
        )
      })}
    </ul>
  )
}
