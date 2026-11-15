import { ArrowLeft, Download } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { TrendChart } from '../components/charts/TrendChart'
import { Badge } from '../components/common/Badge'
import { Button } from '../components/common/Button'
import { EmptyState } from '../components/common/EmptyState'
import { Panel } from '../components/common/Panel'
import { SectionLabel } from '../components/common/SectionLabel'
import { AstronautPortrait } from '../components/crew/AstronautPortrait'
import { ProfileVital } from '../components/crew/ProfileVital'
import { crewById } from '../data/crew'
import { useSimulationStore } from '../store/useSimulationStore'
import { useUIStore } from '../store/useUIStore'
import type { Severity, VitalKey } from '../types'
import { cn } from '../utils/cn'
import {
  downloadCSV,
  formatAgo,
  formatClock,
  formatMETCompact,
  formatMissionDay,
  uid,
} from '../utils/format'
import { buildTrendData } from '../utils/series'
import {
  classifyMetric,
  formatMetric,
  latestReading,
  maxSeverity,
  overallSeverity,
} from '../utils/vitals'

const RANGES = [15, 30, 60] as const

function deltaOf(values: number[]): number {
  if (values.length < 2) return 0
  const last = values[values.length - 1] ?? 0
  const prior = values[Math.max(0, values.length - 13)] ?? last
  return last - prior
}

export function AstronautProfile() {
  const { id } = useParams()
  const crew = crewById(id ?? '')

  const readings = useSimulationStore((state) => state.readings)
  const alerts = useSimulationStore((state) => state.alerts)
  const activity = useSimulationStore((state) => state.activity)
  const missionMinutes = useSimulationStore((state) => state.missionMinutes)
  const addToast = useUIStore((state) => state.addToast)

  const [range, setRange] = useState<(typeof RANGES)[number]>(30)

  const crewId = crew?.id ?? ''
  const history = readings[crewId] ?? []
  const latest = latestReading(history)
  const severity = overallSeverity(latest)

  const trends = useMemo(() => {
    const ids = crewId ? [crewId] : []
    return {
      heartRate: buildTrendData(readings, ids, ['heartRate'], range),
      spo2: buildTrendData(readings, ids, ['spo2'], range),
      temperature: buildTrendData(readings, ids, ['temperature'], range),
      pressure: buildTrendData(
        readings,
        ids,
        ['systolic', 'diastolic'],
        range,
      ),
      radiation: buildTrendData(readings, ids, ['radiation'], 24),
      sleep: buildTrendData(readings, ids, ['sleep'], 24),
    }
  }, [readings, crewId, range])

  const crewAlerts = useMemo(
    () =>
      alerts
        .filter((alert) => alert.astronautId === crewId)
        .sort((a, b) => b.detectedAt - a.detectedAt),
    [alerts, crewId],
  )

  const timeline = useMemo(() => {
    if (!crew) return []
    const events = [
      ...crew.events.map((event) => ({
        id: uid('TL', event.timestamp),
        timestamp: event.timestamp,
        title: event.label,
        detail: event.detail,
        kind: 'crew' as const,
      })),
      ...crewAlerts.map((alert) => ({
        id: `TL-${alert.id}`,
        timestamp: alert.detectedAt,
        title: alert.title,
        detail: `${alert.severity} · observed ${alert.observed}`,
        kind: 'alert' as const,
      })),
      ...activity
        .filter((event) => event.detail.includes(crew.name))
        .map((event) => ({
          id: `TL-${event.id}`,
          timestamp: event.timestamp,
          title: event.title,
          detail: event.detail,
          kind: 'system' as const,
        })),
    ]
    return events.sort((a, b) => b.timestamp - a.timestamp).slice(0, 10)
  }, [crew, crewAlerts, activity])

  if (!crew) {
    return (
      <EmptyState
        title="Crew member not found"
        description="This profile does not exist in the simulated crew roster."
        action={
          <Link to="/crew">
            <Button size="sm">Back to crew</Button>
          </Link>
        }
      />
    )
  }

  const metricConfig: Array<{
    key: VitalKey
    label: string
    short: string
    value: string
    unit: string
    digits: number
    values: number[]
    delta: number
    severity: Severity
  }> = [
    {
      key: 'heartRate',
      label: 'Heart rate',
      short: 'HR',
      value: latest ? String(Math.round(latest.heartRate)) : '—',
      unit: 'bpm',
      digits: 0,
      values: trends.heartRate.map((point) => Number(point.heartRate)),
      delta: deltaOf(trends.heartRate.map((point) => Number(point.heartRate))),
      severity: latest ? classifyMetric('heartRate', latest.heartRate) : 'nominal',
    },
    {
      key: 'spo2',
      label: 'Blood oxygen',
      short: 'SpO₂',
      value: latest ? latest.spo2.toFixed(1) : '—',
      unit: '%',
      digits: 1,
      values: trends.spo2.map((point) => Number(point.spo2)),
      delta: deltaOf(trends.spo2.map((point) => Number(point.spo2))),
      severity: latest ? classifyMetric('spo2', latest.spo2) : 'nominal',
    },
    {
      key: 'temperature',
      label: 'Core temperature',
      short: 'TEMP',
      value: latest ? latest.temperature.toFixed(1) : '—',
      unit: '°C',
      digits: 1,
      values: trends.temperature.map((point) => Number(point.temperature)),
      delta: deltaOf(trends.temperature.map((point) => Number(point.temperature))),
      severity: latest
        ? classifyMetric('temperature', latest.temperature)
        : 'nominal',
    },
    {
      key: 'systolic',
      label: 'Blood pressure',
      short: 'BP',
      value: latest
        ? `${Math.round(latest.systolic)}/${Math.round(latest.diastolic)}`
        : '—',
      unit: 'mmHg',
      digits: 0,
      values: trends.pressure.map((point) => Number(point.systolic)),
      delta: deltaOf(trends.pressure.map((point) => Number(point.systolic))),
      severity: latest
        ? maxSeverity(
            classifyMetric('systolic', latest.systolic),
            classifyMetric('diastolic', latest.diastolic),
          )
        : 'nominal',
    },
    {
      key: 'radiation',
      label: 'Radiation dose',
      short: 'RAD',
      value: latest ? latest.radiation.toFixed(2) : '—',
      unit: 'mSv/day',
      digits: 2,
      values: trends.radiation.map((point) => Number(point.radiation)),
      delta: deltaOf(trends.radiation.map((point) => Number(point.radiation))),
      severity: latest
        ? classifyMetric('radiation', latest.radiation)
        : 'nominal',
    },
    {
      key: 'sleep',
      label: 'Sleep · 24h',
      short: 'SLP',
      value: latest ? latest.sleep.toFixed(1) : '—',
      unit: 'hours',
      digits: 1,
      values: trends.sleep.map((point) => Number(point.sleep)),
      delta: deltaOf(trends.sleep.map((point) => Number(point.sleep))),
      severity: latest ? classifyMetric('sleep', latest.sleep) : 'nominal',
    },
  ]

  const handleExport = () => {
    const header = [
      'Clock',
      'Heart rate (bpm)',
      'SpO2 (%)',
      'Temperature (C)',
      'Systolic (mmHg)',
      'Diastolic (mmHg)',
      'Radiation (mSv/day)',
      'Sleep (h)',
    ]
    const rows = history.map((reading) => [
      formatClock(reading.timestamp),
      reading.heartRate,
      reading.spo2,
      reading.temperature,
      reading.systolic,
      reading.diastolic,
      reading.radiation,
      reading.sleep,
    ])
    downloadCSV(
      `astrovital-${crew.id}-${range}m.csv`,
      [header, ...rows],
    )
    addToast(`Exported vitals for ${crew.name}.`, 'success')
  }

  const badgeTone =
    severity === 'critical'
      ? 'critical'
      : severity === 'warning'
        ? 'warning'
        : 'nominal'

  return (
    <div>
      <Link
        to="/crew"
        className="label inline-flex items-center gap-2 transition-colors hover:text-ink"
      >
        <ArrowLeft size={12} />
        Crew monitoring
      </Link>

      <section className="mt-4 grid gap-6 lg:grid-cols-[300px_minmax(0,1fr)]">
        <AstronautPortrait crew={crew} className="aspect-[220/264] w-full" />
        <div className="flex flex-col justify-between border border-line bg-surface p-5 sm:p-7">
          <div>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <Badge tone={badgeTone} dot>
                {severity}
              </Badge>
              <span className="label">
                {crew.crewId} / Callsign {crew.callSign}
              </span>
            </div>
            <h1 className="mt-6 font-display text-[38px] font-semibold leading-[0.95] tracking-[-0.035em] sm:text-[52px]">
              {crew.name}
            </h1>
            <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.18em] text-accent">
              {crew.role}
            </p>
            <p className="mt-4 max-w-xl text-[13px] leading-relaxed text-muted">
              {crew.bio}
            </p>
          </div>

          <div className="mt-7 grid grid-cols-2 gap-x-6 gap-y-4 border-t border-line pt-5 sm:grid-cols-4">
            <div>
              <div className="label">Mission day</div>
              <div className="mt-1.5 font-mono text-[12px]">
                {formatMissionDay(missionMinutes)}
              </div>
            </div>
            <div>
              <div className="label">Specialty</div>
              <div className="mt-1.5 font-mono text-[12px]">
                {crew.specialty}
              </div>
            </div>
            <div>
              <div className="label">Agency</div>
              <div className="mt-1.5 font-mono text-[12px]">{crew.agency}</div>
            </div>
            <div>
              <div className="label">Monitoring</div>
              <div className="mt-1.5 font-mono text-[12px]">1 Hz · SIM</div>
            </div>
          </div>
        </div>
      </section>

      <div className="mb-3 mt-8 flex flex-wrap items-end justify-between gap-3">
        <SectionLabel index="02">Vital-sign summary</SectionLabel>
        <div className="flex flex-wrap items-center gap-2">
          <span className="label mr-1">Range</span>
          {RANGES.map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setRange(value)}
              className={cn(
                'border px-2.5 py-1.5 font-mono text-[9px] uppercase tracking-[0.12em] transition-colors',
                range === value
                  ? 'border-ink bg-ink text-bg'
                  : 'border-line text-muted hover:border-ink hover:text-ink',
              )}
            >
              {value} min
            </button>
          ))}
          <Button
            variant="outline"
            size="sm"
            icon={<Download size={12} />}
            onClick={handleExport}
          >
            Export vitals
          </Button>
        </div>
      </div>

      <div className="grid gap-px border border-line bg-line sm:grid-cols-2 xl:grid-cols-3">
        {metricConfig.map((metric) => (
          <ProfileVital
            key={metric.key}
            label={metric.label}
            short={metric.short}
            value={metric.value}
            unit={metric.unit}
            values={metric.values}
            delta={metric.delta}
            digits={metric.digits}
            severity={metric.severity}
          />
        ))}
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <Panel title="Heart rate trend" index="03" bodyClassName="p-3 pb-4">
          <TrendChart
            data={trends.heartRate}
            unit="bpm"
            digits={0}
            references={[{ value: 110, label: 'WARN 110' }]}
            series={[
              { key: 'heartRate', label: 'Heart rate', color: 'var(--accent)' },
            ]}
            height={230}
          />
        </Panel>
        <Panel title="SpO₂ trend" index="04" bodyClassName="p-3 pb-4">
          <TrendChart
            data={trends.spo2}
            unit="%"
            digits={1}
            references={[{ value: 94, label: 'MIN 94' }]}
            series={[
              { key: 'spo2', label: 'SpO₂', color: 'var(--accent)' },
            ]}
            height={230}
          />
        </Panel>
        <Panel title="Temperature trend" index="05" bodyClassName="p-3 pb-4">
          <TrendChart
            data={trends.temperature}
            unit="°C"
            digits={1}
            references={[{ value: 37.6, label: 'WARN 37.6' }]}
            series={[
              {
                key: 'temperature',
                label: 'Temperature',
                color: 'var(--accent)',
              },
            ]}
            height={230}
          />
        </Panel>
        <Panel title="Blood pressure trend" index="06" bodyClassName="p-3 pb-4">
          <TrendChart
            data={trends.pressure}
            unit="mmHg"
            digits={0}
            references={[
              { value: 140, label: 'SYS 140' },
              { value: 90, label: 'DIA 90' },
            ]}
            series={[
              {
                key: 'systolic',
                label: 'Systolic',
                color: 'var(--accent)',
              },
              {
                key: 'diastolic',
                label: 'Diastolic',
                color: 'var(--ink)',
                dashed: true,
              },
            ]}
            height={230}
          />
        </Panel>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
        <Panel
          title="Recent alerts"
          index="07"
          bodyClassName="p-4 sm:p-5"
          actions={
            <Link
              to="/alerts"
              className="font-mono text-[9px] uppercase tracking-[0.14em] text-accent transition-opacity hover:opacity-70"
            >
              Alert queue
            </Link>
          }
        >
          {crewAlerts.length === 0 ? (
            <p className="py-6 text-center text-xs text-muted">
              No alerts recorded for this crew member.
            </p>
          ) : (
            <ul>
              {crewAlerts.slice(0, 5).map((alert) => (
                <li
                  key={alert.id}
                  className="border-b border-line py-3 first:pt-0 last:border-b-0 last:pb-0"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-[12.5px] font-medium">
                      {alert.title}
                    </span>
                    <Badge
                      tone={
                        alert.severity === 'critical' ? 'critical' : 'warning'
                      }
                    >
                      {alert.severity}
                    </Badge>
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-2 font-mono text-[8.5px] uppercase tracking-[0.1em] text-muted">
                    <span>{alert.observed}</span>
                    <span>·</span>
                    <span>ref {alert.reference}</span>
                    <span>·</span>
                    <span>{formatAgo(missionMinutes - alert.detectedAt)}</span>
                    <span>·</span>
                    <span
                      className={
                        alert.status === 'resolved'
                          ? 'text-muted'
                          : 'text-accent'
                      }
                    >
                      {alert.status}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel
          title="Monitoring timeline"
          index="08"
          bodyClassName="p-4 sm:p-5"
        >
          <ul className="relative ml-1 border-l border-line">
            {timeline.map((event) => (
              <li key={event.id} className="relative pb-5 pl-5 last:pb-0">
                <span
                  className={cn(
                    'absolute -left-[3.5px] top-1.5 h-1.5 w-1.5 rounded-full',
                    event.kind === 'alert' ? 'bg-accent' : 'bg-muted',
                  )}
                />
                <div className="flex items-baseline justify-between gap-3">
                  <span className="text-[12.5px] font-medium">
                    {event.title}
                  </span>
                  <span className="shrink-0 font-mono text-[8px] uppercase tracking-[0.1em] text-muted">
                    {formatMETCompact(event.timestamp)}
                  </span>
                </div>
                <p className="mt-1 text-[11px] leading-relaxed text-muted">
                  {event.detail}
                </p>
              </li>
            ))}
          </ul>
        </Panel>
      </div>

      <p className="mt-6 font-mono text-[8.5px] uppercase leading-relaxed tracking-[0.14em] text-muted">
        Simulated demonstration · {crew.name} is a fictional crew member · No
        real physiological data is displayed · Not for medical use.
        <span className="ml-2 text-accent">
          Current HR {latest ? formatMetric('heartRate', latest.heartRate) : '—'}
        </span>
      </p>
    </div>
  )
}
