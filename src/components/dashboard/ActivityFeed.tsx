import { BellRing, Radio, RefreshCw, Users } from 'lucide-react'
import type { ActivityEvent } from '../../types'
import { formatAgo } from '../../utils/format'

const KIND_ICONS = {
  system: Radio,
  alert: BellRing,
  crew: Users,
  simulation: RefreshCw,
} as const

interface ActivityFeedProps {
  activity: ActivityEvent[]
  missionMinutes: number
  limit?: number
}

export function ActivityFeed({
  activity,
  missionMinutes,
  limit = 6,
}: ActivityFeedProps) {
  return (
    <ul>
      {activity.slice(0, limit).map((event) => {
        const Icon = KIND_ICONS[event.kind]
        return (
          <li
            key={event.id}
            className="flex gap-3 border-b border-line py-3 first:pt-0 last:border-b-0 last:pb-0"
          >
            <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center border border-line text-muted">
              <Icon size={13} strokeWidth={1.7} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="flex items-baseline justify-between gap-3">
                <span className="truncate text-[12.5px] font-medium">
                  {event.title}
                </span>
                <span className="shrink-0 font-mono text-[8px] uppercase tracking-[0.1em] text-muted">
                  {formatAgo(missionMinutes - event.timestamp)}
                </span>
              </span>
              <span className="mt-1 block truncate text-[11px] text-muted">
                {event.detail}
              </span>
            </span>
          </li>
        )
      })}
    </ul>
  )
}
