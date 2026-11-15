import { Check, Download, ShieldCheck } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Badge } from '../components/common/Badge'
import { Button } from '../components/common/Button'
import { EmptyState } from '../components/common/EmptyState'
import { PageHeader } from '../components/common/PageHeader'
import { SearchInput } from '../components/common/SearchInput'
import { crewById } from '../data/crew'
import { useSimulationStore } from '../store/useSimulationStore'
import { useUIStore } from '../store/useUIStore'
import type { AlertStatus } from '../types'
import { cn } from '../utils/cn'
import { downloadCSV, formatAgo, formatClock } from '../utils/format'

type SeverityFilter = 'all' | 'critical' | 'warning'
type StatusFilter = 'all' | AlertStatus

const STATUS_TABS: Array<{ value: StatusFilter; label: string }> = [
  { value: 'all', label: 'All' },
  { value: 'active', label: 'Active' },
  { value: 'acknowledged', label: 'Acknowledged' },
  { value: 'resolved', label: 'Resolved' },
]

const SEVERITY_TABS: Array<{ value: SeverityFilter; label: string }> = [
  { value: 'all', label: 'All severities' },
  { value: 'critical', label: 'Critical' },
  { value: 'warning', label: 'Warning' },
]

export function Alerts() {
  const alerts = useSimulationStore((state) => state.alerts)
  const missionMinutes = useSimulationStore((state) => state.missionMinutes)
  const acknowledgeAlert = useSimulationStore(
    (state) => state.acknowledgeAlert,
  )
  const resolveAlert = useSimulationStore((state) => state.resolveAlert)
  const addToast = useUIStore((state) => state.addToast)

  const [query, setQuery] = useState('')
  const [severity, setSeverity] = useState<SeverityFilter>('all')
  const [status, setStatus] = useState<StatusFilter>('all')

  const counts = useMemo(
    () => ({
      critical: alerts.filter(
        (alert) => alert.severity === 'critical' && alert.status !== 'resolved',
      ).length,
      warning: alerts.filter(
        (alert) => alert.severity === 'warning' && alert.status !== 'resolved',
      ).length,
      acknowledged: alerts.filter((alert) => alert.status === 'acknowledged')
        .length,
      resolved: alerts.filter((alert) => alert.status === 'resolved').length,
    }),
    [alerts],
  )

  const filtered = useMemo(() => {
    const text = query.trim().toLowerCase()
    return alerts
      .filter((alert) => {
        const member = crewById(alert.astronautId)
        const haystack =
          `${alert.title} ${alert.id} ${alert.observed} ${alert.reference} ${member?.name ?? ''}`.toLowerCase()
        const matchesQuery = haystack.includes(text)
        const matchesSeverity =
          severity === 'all' || alert.severity === severity
        const matchesStatus =
          status === 'all' || alert.status === status
        return matchesQuery && matchesSeverity && matchesStatus
      })
      .sort((a, b) => b.detectedAt - a.detectedAt)
  }, [alerts, query, severity, status])

  const handleAcknowledge = (id: string) => {
    acknowledgeAlert(id)
    addToast('Alert acknowledged. The crew has been notified.', 'success')
  }

  const handleResolve = (id: string) => {
    resolveAlert(id)
    addToast('Alert resolved and archived in the medical history.', 'success')
  }

  const handleExport = () => {
    const header = [
      'Alert ID',
      'Detected (MET)',
      'Crew',
      'Title',
      'Severity',
      'Status',
      'Observed',
      'Reference',
      'Explanation',
      'Suggested action',
    ]
    const rows = filtered.map((alert) => [
      alert.id,
      formatClock(alert.detectedAt),
      crewById(alert.astronautId)?.name ?? alert.astronautId,
      alert.title,
      alert.severity,
      alert.status,
      alert.observed,
      alert.reference,
      alert.explanation,
      alert.action,
    ])
    downloadCSV(
      `astrovital-alerts-${formatClock(missionMinutes).replace(':', '')}.csv`,
      [header, ...rows],
    )
    addToast(`Exported ${rows.length} alerts to CSV.`, 'success')
  }

  const summary = [
    { label: 'Critical open', value: counts.critical, accent: true },
    { label: 'Warnings open', value: counts.warning, accent: false },
    { label: 'Acknowledged', value: counts.acknowledged, accent: false },
    { label: 'Resolved', value: counts.resolved, accent: false },
  ]

  return (
    <div>
      <PageHeader
        eyebrow="Alerts / simulated monitoring"
        title="Alert queue."
        description="Threshold events raised by the simulation. Acknowledge to confirm human review, then resolve once the situation is addressed. Actions are stored in the in-browser session only."
        actions={
          <Button
            variant="outline"
            size="sm"
            icon={<Download size={13} />}
            onClick={handleExport}
          >
            Export CSV
          </Button>
        }
      />

      <div className="mb-6 grid grid-cols-2 gap-px border border-line bg-line lg:grid-cols-4">
        {summary.map((item) => (
          <div key={item.label} className="bg-surface px-4 py-4 sm:px-5">
            <div className="label">{item.label}</div>
            <div
              className={cn(
                'mt-2 numeric text-[34px] leading-none',
                item.accent && item.value > 0 ? 'text-accent' : 'text-ink',
              )}
            >
              {String(item.value).padStart(2, '0')}
            </div>
          </div>
        ))}
      </div>

      <div className="mb-6 border border-line bg-surface p-3 sm:p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <SearchInput
              value={query}
              onChange={setQuery}
              placeholder="Search alerts, crew or ID"
              className="w-full sm:w-64"
            />
            <div className="flex flex-wrap items-center gap-1.5">
              {SEVERITY_TABS.map((tab) => (
                <button
                  key={tab.value}
                  type="button"
                  onClick={() => setSeverity(tab.value)}
                  className={cn(
                    'border px-2.5 py-1.5 font-mono text-[9px] uppercase tracking-[0.12em] transition-colors',
                    severity === tab.value
                      ? 'border-accent bg-accent text-white'
                      : 'border-line text-muted hover:border-ink hover:text-ink',
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {STATUS_TABS.map((tab) => (
              <button
                key={tab.value}
                type="button"
                onClick={() => setStatus(tab.value)}
                className={cn(
                  'border px-2.5 py-1.5 font-mono text-[9px] uppercase tracking-[0.12em] transition-colors',
                  status === tab.value
                    ? 'border-ink bg-ink text-bg'
                    : 'border-line text-muted hover:border-ink hover:text-ink',
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mb-3 flex items-center justify-between">
        <span className="label">
          {filtered.length} alert{filtered.length === 1 ? '' : 's'} in view
        </span>
        <span className="label">Sorted by detected time</span>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title="No alerts match this view"
          description="Adjust the status or severity filters, or clear the search field."
          action={
            <Button
              size="sm"
              onClick={() => {
                setQuery('')
                setSeverity('all')
                setStatus('all')
              }}
            >
              Clear filters
            </Button>
          }
        />
      ) : (
        <ul className="flex flex-col gap-3">
          {filtered.map((alert) => {
            const member = crewById(alert.astronautId)
            const isResolved = alert.status === 'resolved'
            const isAcknowledged = alert.status === 'acknowledged'
            return (
              <li
                key={alert.id}
                className={cn(
                  'border border-line bg-surface',
                  alert.severity === 'critical' &&
                    !isResolved &&
                    'border-l-2 border-l-crit',
                )}
              >
                <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-start sm:p-5">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge
                        tone={
                          alert.severity === 'critical'
                            ? 'critical'
                            : 'warning'
                        }
                      >
                        {alert.severity}
                      </Badge>
                      <Badge
                        tone={
                          alert.status === 'active'
                            ? 'active'
                            : alert.status === 'acknowledged'
                              ? 'acknowledged'
                              : 'resolved'
                        }
                      >
                        {alert.status}
                      </Badge>
                      <span className="font-mono text-[8.5px] uppercase tracking-[0.14em] text-muted">
                        {alert.id} · {formatAgo(missionMinutes - alert.detectedAt)}
                      </span>
                    </div>

                    <h3 className="mt-3 text-[14px] font-medium">
                      {alert.title}
                    </h3>
                    <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-[9px] uppercase tracking-[0.1em] text-muted">
                      <span className="text-ink">
                        {member?.name ?? alert.astronautId}
                      </span>
                      <span>·</span>
                      <span>Observed {alert.observed}</span>
                      <span>·</span>
                      <span>Ref {alert.reference}</span>
                    </div>
                    <p className="mt-2.5 max-w-3xl text-[11.5px] leading-relaxed text-muted">
                      {alert.explanation}
                    </p>
                    {!isResolved && (
                      <p className="mt-2 max-w-3xl border-l-2 border-accent pl-2.5 text-[11.5px] leading-relaxed text-ink">
                        <span className="label mr-2 inline-block">Action</span>
                        {alert.action}
                      </p>
                    )}
                  </div>

                  <div className="flex shrink-0 flex-wrap items-center gap-2 sm:flex-col sm:items-stretch">
                    {alert.status === 'active' && (
                      <Button
                        variant="outline"
                        size="sm"
                        icon={<Check size={12} />}
                        onClick={() => handleAcknowledge(alert.id)}
                      >
                        Acknowledge
                      </Button>
                    )}
                    {!isResolved && (
                      <Button
                        variant={isAcknowledged ? 'primary' : 'accent'}
                        size="sm"
                        icon={<ShieldCheck size={12} />}
                        onClick={() => handleResolve(alert.id)}
                      >
                        Resolve
                      </Button>
                    )}
                    {isResolved && (
                      <span className="inline-flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-[0.12em] text-muted">
                        <ShieldCheck size={12} />
                        Resolved{' '}
                        {alert.resolvedAt
                          ? formatAgo(missionMinutes - alert.resolvedAt)
                          : ''}
                      </span>
                    )}
                  </div>
                </div>
              </li>
            )
          })}
        </ul>
      )}

      <p className="mt-6 font-mono text-[8.5px] uppercase leading-relaxed tracking-[0.14em] text-muted">
        Alerts are generated from simulated thresholds. Acknowledging or
        resolving an alert does not affect the simulated physiology.
      </p>
    </div>
  )
}
