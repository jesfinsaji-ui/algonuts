import { Download } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Badge } from '../components/common/Badge'
import { Button } from '../components/common/Button'
import { EmptyState } from '../components/common/EmptyState'
import { PageHeader } from '../components/common/PageHeader'
import { Panel } from '../components/common/Panel'
import { Select } from '../components/common/Select'
import { StatusDot } from '../components/common/StatusDot'
import { CREW, crewById } from '../data/crew'
import { useSimulationStore } from '../store/useSimulationStore'
import { useUIStore } from '../store/useUIStore'
import { downloadCSV, formatAgo, formatMETCompact } from '../utils/format'
import { overallSeverity } from '../utils/vitals'

const ROW_LIMIT = 24

export function History() {
  const readings = useSimulationStore((state) => state.readings)
  const alerts = useSimulationStore((state) => state.alerts)
  const activity = useSimulationStore((state) => state.activity)
  const missionMinutes = useSimulationStore((state) => state.missionMinutes)
  const addToast = useUIStore((state) => state.addToast)

  const [crewFilter, setCrewFilter] = useState('all')

  const readingRows = useMemo(() => {
    const ids =
      crewFilter === 'all' ? CREW.map((member) => member.id) : [crewFilter]
    const rows = ids.flatMap((id) =>
      (readings[id] ?? []).map((reading) => ({
        crewId: id,
        reading,
      })),
    )
    return rows
      .sort((a, b) => b.reading.timestamp - a.reading.timestamp)
      .slice(0, ROW_LIMIT)
  }, [readings, crewFilter])

  const alertRows = useMemo(() => {
    const filtered =
      crewFilter === 'all'
        ? alerts
        : alerts.filter((alert) => alert.astronautId === crewFilter)
    return [...filtered].sort((a, b) => b.detectedAt - a.detectedAt)
  }, [alerts, crewFilter])

  const records = useMemo(() => {
    const crewEvents = (crewFilter === 'all' ? CREW : CREW.filter((c) => c.id === crewFilter))
      .flatMap((member) =>
        member.events.map((event, index) => ({
          id: `REC-${member.id}-${index}`,
          timestamp: event.timestamp,
          title: event.label,
          detail: `${member.name} · ${event.detail}`,
          kind: 'crew' as const,
        })),
      )
    const activityEvents = activity.map((event) => ({
      id: `REC-${event.id}`,
      timestamp: event.timestamp,
      title: event.title,
      detail: event.detail,
      kind: event.kind,
    }))
    return [...crewEvents, ...activityEvents]
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 14)
  }, [activity, crewFilter])

  const handleExport = () => {
    const header = [
      'MET',
      'Crew',
      'Heart rate (bpm)',
      'SpO2 (%)',
      'Temperature (C)',
      'Systolic (mmHg)',
      'Diastolic (mmHg)',
      'Radiation (mSv/day)',
      'Sleep (h)',
      'Status',
    ]
    const rows = readingRows.map(({ crewId, reading }) => [
      formatMETCompact(reading.timestamp),
      crewById(crewId)?.name ?? crewId,
      reading.heartRate,
      reading.spo2,
      reading.temperature,
      reading.systolic,
      reading.diastolic,
      reading.radiation,
      reading.sleep,
      overallSeverity(reading),
    ])
    downloadCSV(
      `astrovital-history-${crewFilter}-${ROW_LIMIT}.csv`,
      [header, ...rows],
    )
    addToast(`Exported ${rows.length} historical readings.`, 'success')
  }

  return (
    <div>
      <PageHeader
        eyebrow="Medical history / session archive"
        title="Medical record."
        description="A rolling archive of simulated readings, alert events and monitoring notes held in this browser session. Data resets when the simulation is reset or the page is closed."
        actions={
          <Button
            variant="outline"
            size="sm"
            icon={<Download size={13} />}
            onClick={handleExport}
          >
            Export readings
          </Button>
        }
      />

      <div className="mb-5 flex flex-col gap-3 border border-line bg-surface p-3 sm:flex-row sm:items-center sm:justify-between sm:p-4">
        <div className="flex flex-wrap items-center gap-3">
          <span className="label">Crew</span>
          <Select
            value={crewFilter}
            onChange={setCrewFilter}
            ariaLabel="Filter medical history by crew member"
            className="w-full sm:w-[220px]"
            options={[
              { value: 'all', label: 'All crew' },
              ...CREW.map((member) => ({
                value: member.id,
                label: member.name,
              })),
            ]}
          />
        </div>
        <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-muted">
          Showing latest {ROW_LIMIT} readings · {alertRows.length} alerts
        </span>
      </div>

      <Panel
        title="Health readings"
        index="02"
        bodyClassName="p-0"
        actions={<span className="label">Newest first</span>}
      >
        <div className="w-full overflow-x-auto">
          <table className="w-full min-w-[760px] text-left">
            <thead>
              <tr className="border-b border-line">
                <th className="px-4 py-3 text-left font-mono text-[8.5px] font-medium uppercase tracking-[0.16em] text-muted">
                  MET
                </th>
                <th className="px-4 py-3 text-left font-mono text-[8.5px] font-medium uppercase tracking-[0.16em] text-muted">
                  Crew
                </th>
                <th className="px-4 py-3 text-left font-mono text-[8.5px] font-medium uppercase tracking-[0.16em] text-muted">
                  HR
                </th>
                <th className="px-4 py-3 text-left font-mono text-[8.5px] font-medium uppercase tracking-[0.16em] text-muted">
                  SpO₂
                </th>
                <th className="px-4 py-3 text-left font-mono text-[8.5px] font-medium uppercase tracking-[0.16em] text-muted">
                  Temp
                </th>
                <th className="px-4 py-3 text-left font-mono text-[8.5px] font-medium uppercase tracking-[0.16em] text-muted">
                  Blood pressure
                </th>
                <th className="px-4 py-3 text-left font-mono text-[8.5px] font-medium uppercase tracking-[0.16em] text-muted">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {readingRows.map(({ crewId, reading }) => {
                const severity = overallSeverity(reading)
                return (
                  <tr
                    key={`${crewId}-${reading.timestamp}`}
                    className="border-b border-line transition-colors last:border-b-0 hover:bg-surface2"
                  >
                    <td className="whitespace-nowrap px-4 py-2.5 font-mono text-[10px] tabular-nums text-muted">
                      {formatMETCompact(reading.timestamp)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-2.5">
                      <Link
                        to={`/crew/${crewId}`}
                        className="text-[12px] font-medium transition-colors hover:text-accent"
                      >
                        {crewById(crewId)?.name ?? crewId}
                      </Link>
                    </td>
                    <td className="px-4 py-2.5 font-mono text-[11px] tabular-nums">
                      {Math.round(reading.heartRate)}
                    </td>
                    <td className="px-4 py-2.5 font-mono text-[11px] tabular-nums">
                      {reading.spo2.toFixed(1)}%
                    </td>
                    <td className="px-4 py-2.5 font-mono text-[11px] tabular-nums">
                      {reading.temperature.toFixed(1)}°
                    </td>
                    <td className="px-4 py-2.5 font-mono text-[11px] tabular-nums">
                      {Math.round(reading.systolic)}/
                      {Math.round(reading.diastolic)}
                    </td>
                    <td className="px-4 py-2.5">
                      <span className="inline-flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.1em] text-muted">
                        <StatusDot severity={severity} pulse={false} />
                        {severity}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Panel>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <Panel
          title="Alert archive"
          index="03"
          bodyClassName="p-4 sm:p-5"
          actions={
            <Link
              to="/alerts"
              className="font-mono text-[9px] uppercase tracking-[0.14em] text-accent transition-opacity hover:opacity-70"
            >
              Open queue
            </Link>
          }
        >
          {alertRows.length === 0 ? (
            <EmptyState
              title="No alerts recorded"
              description="Alerts raised by the simulation will appear in this archive."
            />
          ) : (
            <ul>
              {alertRows.map((alert) => (
                <li
                  key={alert.id}
                  className="border-b border-line py-3 first:pt-0 last:border-b-0 last:pb-0"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate text-[12.5px] font-medium">
                      {alert.title}
                    </span>
                    <Badge
                      tone={
                        alert.status === 'resolved'
                          ? 'resolved'
                          : alert.severity === 'critical'
                            ? 'critical'
                            : 'warning'
                      }
                    >
                      {alert.status === 'resolved'
                        ? 'resolved'
                        : alert.severity}
                    </Badge>
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-[8.5px] uppercase tracking-[0.1em] text-muted">
                    <span>{crewById(alert.astronautId)?.name}</span>
                    <span>·</span>
                    <span>{alert.observed}</span>
                    <span>·</span>
                    <span>{formatAgo(missionMinutes - alert.detectedAt)}</span>
                    <span>·</span>
                    <span>{alert.id}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel
          title="Monitoring records"
          index="04"
          bodyClassName="p-4 sm:p-5"
          actions={<span className="label">Notes + system log</span>}
        >
          <ul className="relative ml-1 border-l border-line">
            {records.map((record) => (
              <li key={record.id} className="relative pb-5 pl-5 last:pb-0">
                <span
                  className={`absolute -left-[3.5px] top-1.5 h-1.5 w-1.5 rounded-full ${
                    record.kind === 'alert' ? 'bg-accent' : 'bg-muted'
                  }`}
                />
                <div className="flex items-baseline justify-between gap-3">
                  <span className="text-[12.5px] font-medium">
                    {record.title}
                  </span>
                  <span className="shrink-0 font-mono text-[8px] uppercase tracking-[0.1em] text-muted">
                    {formatMETCompact(record.timestamp)}
                  </span>
                </div>
                <p className="mt-1 text-[11px] leading-relaxed text-muted">
                  {record.detail}
                </p>
              </li>
            ))}
          </ul>
        </Panel>
      </div>

      <p className="mt-6 font-mono text-[8.5px] uppercase leading-relaxed tracking-[0.14em] text-muted">
        Historical records are generated by the local simulation and are not
        medical records. Data is retained in memory for the current session
        only.
      </p>
    </div>
  )
}
