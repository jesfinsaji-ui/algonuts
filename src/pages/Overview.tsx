import { ArrowUpRight } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { TrendChart } from '../components/charts/TrendChart'
import { ActivityFeed } from '../components/dashboard/ActivityFeed'
import { CrewOverviewList } from '../components/dashboard/CrewOverviewList'
import { RecentAlerts } from '../components/dashboard/RecentAlerts'
import { SystemStatus } from '../components/dashboard/SystemStatus'
import { VitalMetric } from '../components/dashboard/VitalMetric'
import { Badge } from '../components/common/Badge'
import { Panel } from '../components/common/Panel'
import { SectionLabel } from '../components/common/SectionLabel'
import { Select } from '../components/common/Select'
import { StatusDot } from '../components/common/StatusDot'
import { CREW } from '../data/crew'
import { useSimulationStore } from '../store/useSimulationStore'
import type { Severity, VitalReading } from '../types'
import { cn } from '../utils/cn'
import {
  formatClock,
  formatMET,
  formatMissionDay,
} from '../utils/format'
import { buildTrendData, seriesStats } from '../utils/series'
import {
  averageReadings,
  classifyMetric,
  latestReading,
  maxSeverity,
} from '../utils/vitals'

type OverviewMetric = 'heartRate' | 'spo2' | 'temperature' | 'systolic'

const METRIC_VIEW: Record<
  OverviewMetric,
  {
    label: string
    tab: string
    unit: string
    digits: number
    reference: number
    referenceLabel: string
  }
> = {
  heartRate: {
    label: 'Heart rate',
    tab: 'HR',
    unit: 'bpm',
    digits: 0,
    reference: 110,
    referenceLabel: 'WARN 110',
  },
  spo2: {
    label: 'Blood oxygen',
    tab: 'SpO₂',
    unit: '%',
    digits: 1,
    reference: 94,
    referenceLabel: 'MIN 94',
  },
  temperature: {
    label: 'Core temperature',
    tab: 'TEMP',
    unit: '°C',
    digits: 1,
    reference: 37.6,
    referenceLabel: 'WARN 37.6',
  },
  systolic: {
    label: 'Systolic pressure',
    tab: 'SYS',
    unit: 'mmHg',
    digits: 0,
    reference: 140,
    referenceLabel: 'WARN 140',
  },
}

const ALL_CREW_IDS = CREW.map((member) => member.id)

function deltaOf(values: number[]): number {
  if (values.length < 2) return 0
  const latest = values[values.length - 1] ?? 0
  const prior = values[Math.max(0, values.length - 13)] ?? latest
  return latest - prior
}

export function Overview() {
  const readings = useSimulationStore((state) => state.readings)
  const alerts = useSimulationStore((state) => state.alerts)
  const activity = useSimulationStore((state) => state.activity)
  const missionMinutes = useSimulationStore((state) => state.missionMinutes)

  const [metric, setMetric] = useState<OverviewMetric>('heartRate')
  const [crewFilter, setCrewFilter] = useState('all')

  const latestReadings = useMemo(
    () =>
      CREW.map((member) => latestReading(readings[member.id])).filter(
        (reading): reading is VitalReading => Boolean(reading),
      ),
    [readings],
  )

  const average = useMemo(
    () => averageReadings(latestReadings),
    [latestReadings],
  )

  const sparkData = useMemo(
    () => ({
      heartRate: buildTrendData(readings, ALL_CREW_IDS, ['heartRate'], 24),
      spo2: buildTrendData(readings, ALL_CREW_IDS, ['spo2'], 24),
      temperature: buildTrendData(readings, ALL_CREW_IDS, ['temperature'], 24),
      systolic: buildTrendData(readings, ALL_CREW_IDS, ['systolic'], 24),
    }),
    [readings],
  )

  const hrSeries = useMemo(
    () => sparkData.heartRate.map((point) => Number(point.heartRate)),
    [sparkData],
  )
  const spo2Series = useMemo(
    () => sparkData.spo2.map((point) => Number(point.spo2)),
    [sparkData],
  )
  const tempSeries = useMemo(
    () => sparkData.temperature.map((point) => Number(point.temperature)),
    [sparkData],
  )
  const sysSeries = useMemo(
    () => sparkData.systolic.map((point) => Number(point.systolic)),
    [sparkData],
  )

  const chartData = useMemo(
    () =>
      buildTrendData(
        readings,
        crewFilter === 'all' ? ALL_CREW_IDS : [crewFilter],
        [metric],
        30,
      ),
    [readings, crewFilter, metric],
  )

  const stats = useMemo(
    () => seriesStats(chartData, metric),
    [chartData, metric],
  )

  const openAlerts = useMemo(
    () => alerts.filter((alert) => alert.status !== 'resolved'),
    [alerts],
  )
  const criticalCount = openAlerts.filter(
    (alert) => alert.severity === 'critical',
  ).length

  const missionSeverity: Severity = criticalCount
    ? 'critical'
    : openAlerts.length
      ? 'warning'
      : 'nominal'
  const missionLabel =
    missionSeverity === 'critical'
      ? 'Critical attention'
      : missionSeverity === 'warning'
        ? 'Attention advised'
        : 'All systems nominal'

  const hr = average?.heartRate ?? 0
  const spo2 = average?.spo2 ?? 0
  const temp = average?.temperature ?? 0
  const sys = average?.systolic ?? 0
  const dia = average?.diastolic ?? 0

  const hrSeverity = classifyMetric('heartRate', hr)
  const spo2Severity = classifyMetric('spo2', spo2)
  const tempSeverity = classifyMetric('temperature', temp)
  const bpSeverity = maxSeverity(
    classifyMetric('systolic', sys),
    classifyMetric('diastolic', dia),
  )

  const view = METRIC_VIEW[metric]
  const latestFrom = formatClock(missionMinutes)

  return (
    <div>
      <section className="mb-6 grid gap-px border border-line bg-line lg:grid-cols-[1.7fr_1fr]">
        <div className="relative bg-surface p-5 sm:p-8 lg:p-10">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Badge tone={missionSeverity} dot>
              Simulation · {missionLabel}
            </Badge>
            <span className="label">Artemis demo mission</span>
          </div>

          <h1 className="mt-10 max-w-2xl font-display text-[42px] font-semibold leading-[0.92] tracking-[-0.04em] sm:text-[58px] lg:text-[64px]">
            Crew health,
            <br />
            in orbit.
          </h1>
          <p className="mt-5 max-w-xl text-[13.5px] leading-relaxed text-muted">
            A quiet read on four simulated crew members — physiology, alerts and
            activity streamed from a locally generated telemetry model. Every
            reading on this screen is a demonstration.
          </p>

          <div className="mt-9 grid grid-cols-2 gap-x-6 gap-y-5 border-t border-line pt-6 sm:grid-cols-4">
            <div>
              <div className="label">Mission elapsed</div>
              <div className="mt-2 font-mono text-[13px] tabular-nums">
                {formatMET(missionMinutes)}
              </div>
            </div>
            <div>
              <div className="label">Crew on board</div>
              <div className="mt-2 font-mono text-[13px] tabular-nums">04</div>
            </div>
            <div>
              <div className="label">Open alerts</div>
              <div className="mt-2 font-mono text-[13px] tabular-nums">
                {String(openAlerts.length).padStart(2, '0')}
              </div>
            </div>
            <div>
              <div className="label">Telemetry</div>
              <div className="mt-2 font-mono text-[13px] tabular-nums">
                1 Hz · SIM
              </div>
            </div>
          </div>
        </div>

        <div className="accent-grid relative flex min-h-[280px] flex-col justify-between overflow-hidden bg-accent p-5 text-white sm:p-8">
          <div className="flex items-start justify-between">
            <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-white/75">
              Crew on board
            </span>
            <span className="border border-white/40 px-2 py-1 font-mono text-[8px] uppercase tracking-[0.18em] text-white/90">
              Demo data
            </span>
          </div>

          <div>
            <div className="numeric text-[104px] leading-[0.78] sm:text-[124px]">
              04
            </div>
            <div className="mt-4 max-w-[220px] font-mono text-[9px] uppercase leading-relaxed tracking-[0.16em] text-white/80">
              Four humans. One habitat. Continuous simulated physiological
              monitoring.
            </div>
          </div>

          <div className="mt-8 space-y-2 border-t border-white/30 pt-4">
            <div className="flex items-center justify-between font-mono text-[9px] uppercase tracking-[0.16em]">
              <span className="text-white/65">Mission day</span>
              <span>{formatMissionDay(missionMinutes)}</span>
            </div>
            <div className="flex items-center justify-between font-mono text-[9px] uppercase tracking-[0.16em]">
              <span className="text-white/65">Status</span>
              <span className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-white" />
                {missionSeverity === 'nominal' ? 'Nominal' : 'Review'}
              </span>
            </div>
          </div>
        </div>
      </section>

      <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
        <SectionLabel index="02">Crew vitals · live average</SectionLabel>
        <span className="label">MET {latestFrom}</span>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-px border border-line bg-line lg:grid-cols-4">
        <VitalMetric
          label="Heart rate"
          short="HR"
          value={Math.round(hr).toString()}
          unit="bpm"
          values={hrSeries}
          delta={deltaOf(hrSeries)}
          severity={hrSeverity}
        />
        <VitalMetric
          label="Blood oxygen"
          short="SpO₂"
          value={spo2.toFixed(1)}
          unit="%"
          values={spo2Series}
          delta={deltaOf(spo2Series)}
          digits={1}
          severity={spo2Severity}
        />
        <VitalMetric
          label="Body temperature"
          short="TEMP"
          value={temp.toFixed(1)}
          unit="°C"
          values={tempSeries}
          delta={deltaOf(tempSeries)}
          digits={1}
          severity={tempSeverity}
        />
        <VitalMetric
          label="Blood pressure"
          short="BP"
          value={`${Math.round(sys)}/${Math.round(dia)}`}
          unit="mmHg"
          values={sysSeries}
          delta={deltaOf(sysSeries)}
          severity={bpSeverity}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.65fr)_minmax(0,1fr)]">
        <Panel
          title="Health telemetry"
          index="03"
          actions={
            <>
              <div className="flex border border-line p-0.5">
                {(Object.keys(METRIC_VIEW) as OverviewMetric[]).map((key) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setMetric(key)}
                    className={cn(
                      'px-2.5 py-1.5 font-mono text-[9px] uppercase tracking-[0.12em] transition-colors',
                      metric === key
                        ? 'bg-ink text-bg'
                        : 'text-muted hover:text-ink',
                    )}
                  >
                    {METRIC_VIEW[key].tab}
                  </button>
                ))}
              </div>
              <Select
                value={crewFilter}
                onChange={setCrewFilter}
                ariaLabel="Filter telemetry by crew member"
                className="w-[150px]"
                options={[
                  { value: 'all', label: 'All crew' },
                  ...CREW.map((member) => ({
                    value: member.id,
                    label: member.name,
                  })),
                ]}
              />
            </>
          }
          bodyClassName="p-3 pb-4 sm:p-4 sm:pb-4"
        >
          <div className="flex flex-wrap items-center justify-between gap-2 px-1 pb-2">
            <span className="label">
              {view.label} · {crewFilter === 'all' ? 'Crew average' : 'Individual'}
            </span>
            <span className="flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.14em] text-muted">
              <StatusDot severity={missionSeverity} pulse={false} />
              Last 30 simulated minutes
            </span>
          </div>

          <TrendChart
            data={chartData}
            height={286}
            unit={view.unit}
            digits={view.digits}
            references={[
              {
                value: view.reference,
                label: view.referenceLabel,
              },
            ]}
            series={[
              {
                key: metric,
                label: view.label,
                color: 'var(--accent)',
              },
            ]}
          />

          <div className="mt-3 grid grid-cols-3 gap-px border border-line bg-line">
            {[
              { label: 'Minimum', value: stats.min },
              { label: 'Average', value: stats.avg },
              { label: 'Maximum', value: stats.max },
            ].map((item) => (
              <div key={item.label} className="bg-surface px-3 py-2.5">
                <div className="label">{item.label}</div>
                <div className="mt-1.5 font-mono text-[13px] tabular-nums">
                  {item.value.toFixed(view.digits)}
                  <span className="ml-1 text-[9px] uppercase text-muted">
                    {view.unit}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Panel>

        <div className="flex flex-col gap-6">
          <Panel
            title="Crew overview"
            index="04"
            actions={
              <Link
                to="/crew"
                className="inline-flex items-center gap-1 font-mono text-[9px] uppercase tracking-[0.14em] text-accent transition-opacity hover:opacity-70"
              >
                All crew
                <ArrowUpRight size={12} />
              </Link>
            }
            bodyClassName="p-3 sm:p-4"
          >
            <CrewOverviewList readings={readings} />
          </Panel>

          <Panel
            title="Recent alerts"
            index="05"
            actions={
              <Link
                to="/alerts"
                className="inline-flex items-center gap-1 font-mono text-[9px] uppercase tracking-[0.14em] text-accent transition-opacity hover:opacity-70"
              >
                View all
                <ArrowUpRight size={12} />
              </Link>
            }
            bodyClassName="p-3 sm:p-4"
          >
            <RecentAlerts alerts={alerts} missionMinutes={missionMinutes} />
          </Panel>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Panel
          title="System activity"
          index="06"
          actions={
            <span className="label">
              {activity.length} events · demo log
            </span>
          }
          bodyClassName="p-4 sm:p-5"
        >
          <ActivityFeed activity={activity} missionMinutes={missionMinutes} />
        </Panel>

        <Panel title="System status" index="07" bodyClassName="p-4 sm:p-5">
          <SystemStatus />
          <p className="mt-4 border-t border-line pt-3 font-mono text-[8px] uppercase leading-relaxed tracking-[0.14em] text-muted">
            Habitat systems are illustrative demo values. AstroVital is not
            connected to a spacecraft.
          </p>
        </Panel>
      </div>
    </div>
  )
}
