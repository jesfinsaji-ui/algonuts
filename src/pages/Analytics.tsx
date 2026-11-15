import { Download } from 'lucide-react'
import { useMemo, useState } from 'react'
import { TrendChart, type TrendSeries } from '../components/charts/TrendChart'
import { Button } from '../components/common/Button'
import { PageHeader } from '../components/common/PageHeader'
import { Panel } from '../components/common/Panel'
import { Select } from '../components/common/Select'
import { CREW } from '../data/crew'
import { useSimulationStore } from '../store/useSimulationStore'
import { useUIStore } from '../store/useUIStore'
import { cn } from '../utils/cn'
import { downloadCSV, formatClock } from '../utils/format'
import { buildTrendData, seriesStats } from '../utils/series'

const RANGES = [15, 30, 60] as const

interface ChartConfig {
  key: string
  title: string
  index: string
  unit: string
  digits: number
  series: TrendSeries[]
  references: Array<{ value: number; label: string }>
}

const CHARTS: ChartConfig[] = [
  {
    key: 'heartRate',
    title: 'Heart rate',
    index: '02',
    unit: 'bpm',
    digits: 0,
    series: [
      { key: 'heartRate', label: 'Heart rate', color: 'var(--accent)' },
    ],
    references: [{ value: 110, label: 'WARN 110' }],
  },
  {
    key: 'spo2',
    title: 'Blood oxygen',
    index: '03',
    unit: '%',
    digits: 1,
    series: [{ key: 'spo2', label: 'SpO₂', color: 'var(--accent)' }],
    references: [{ value: 94, label: 'MIN 94' }],
  },
  {
    key: 'temperature',
    title: 'Core temperature',
    index: '04',
    unit: '°C',
    digits: 1,
    series: [
      { key: 'temperature', label: 'Temperature', color: 'var(--accent)' },
    ],
    references: [{ value: 37.6, label: 'WARN 37.6' }],
  },
  {
    key: 'pressure',
    title: 'Blood pressure',
    index: '05',
    unit: 'mmHg',
    digits: 0,
    series: [
      { key: 'systolic', label: 'Systolic', color: 'var(--accent)' },
      {
        key: 'diastolic',
        label: 'Diastolic',
        color: 'var(--ink)',
        dashed: true,
      },
    ],
    references: [
      { value: 140, label: 'SYS 140' },
      { value: 90, label: 'DIA 90' },
    ],
  },
]

function StatStrip({
  stats,
  unit,
  digits,
}: {
  stats: { min: number; max: number; avg: number }
  unit: string
  digits: number
}) {
  return (
    <div className="mt-3 grid grid-cols-3 gap-px border border-line bg-line">
      {[
        { label: 'Min', value: stats.min },
        { label: 'Avg', value: stats.avg },
        { label: 'Max', value: stats.max },
      ].map((item) => (
        <div key={item.label} className="bg-surface px-3 py-2">
          <div className="label">{item.label}</div>
          <div className="mt-1 font-mono text-[12px] tabular-nums">
            {item.value.toFixed(digits)}
            <span className="ml-1 text-[8px] uppercase text-muted">{unit}</span>
          </div>
        </div>
      ))}
    </div>
  )
}

export function Analytics() {
  const readings = useSimulationStore((state) => state.readings)
  const missionMinutes = useSimulationStore((state) => state.missionMinutes)
  const addToast = useUIStore((state) => state.addToast)

  const [crewFilter, setCrewFilter] = useState('all')
  const [range, setRange] = useState<(typeof RANGES)[number]>(30)

  const crewIds = useMemo(
    () => (crewFilter === 'all' ? CREW.map((member) => member.id) : [crewFilter]),
    [crewFilter],
  )

  const data = useMemo(
    () =>
      buildTrendData(
        readings,
        crewIds,
        ['heartRate', 'spo2', 'temperature', 'systolic', 'diastolic'],
        range,
      ),
    [readings, crewIds, range],
  )

  const stats = useMemo(
    () => ({
      heartRate: seriesStats(data, 'heartRate'),
      spo2: seriesStats(data, 'spo2'),
      temperature: seriesStats(data, 'temperature'),
      pressure: seriesStats(data, 'systolic'),
    }),
    [data],
  )

  const selectedName =
    crewFilter === 'all'
      ? 'Crew average'
      : CREW.find((member) => member.id === crewFilter)?.name ?? 'Crew'

  const handleExport = () => {
    const header = [
      'Clock',
      'Heart rate (bpm)',
      'SpO2 (%)',
      'Temperature (C)',
      'Systolic (mmHg)',
      'Diastolic (mmHg)',
    ]
    const rows = data.map((point) => [
      point.clock,
      Number(point.heartRate).toFixed(0),
      Number(point.spo2).toFixed(1),
      Number(point.temperature).toFixed(1),
      Number(point.systolic).toFixed(0),
      Number(point.diastolic).toFixed(0),
    ])
    downloadCSV(
      `astrovital-analytics-${crewFilter}-${range}m-${formatClock(missionMinutes).replace(':', '')}.csv`,
      [header, ...rows],
    )
    addToast(`Exported ${rows.length} telemetry rows.`, 'success')
  }

  return (
    <div>
      <PageHeader
        eyebrow="Health analytics / simulated telemetry"
        title="Vitals, in detail."
        description="Interactive trends across the simulated crew. Select a crew member, choose a time window, and inspect each physiological channel. Reference lines mark the demonstration alert bands."
        actions={
          <Button
            variant="outline"
            size="sm"
            icon={<Download size={13} />}
            onClick={handleExport}
          >
            Export range
          </Button>
        }
      />

      <div className="mb-6 flex flex-col gap-3 border border-line bg-surface p-3 sm:flex-row sm:items-center sm:justify-between sm:p-4">
        <div className="flex flex-wrap items-center gap-3">
          <span className="label">Crew</span>
          <Select
            value={crewFilter}
            onChange={setCrewFilter}
            ariaLabel="Select crew member"
            className="w-full sm:w-[200px]"
            options={[
              { value: 'all', label: 'Crew average' },
              ...CREW.map((member) => ({
                value: member.id,
                label: member.name,
              })),
            ]}
          />
          <span className="hidden font-mono text-[9px] uppercase tracking-[0.14em] text-muted sm:inline">
            {selectedName} · {range} min window
          </span>
        </div>

        <div className="flex items-center gap-2">
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
              {value}m
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        {CHARTS.map((chart) => (
          <Panel
            key={chart.key}
            title={chart.title}
            index={chart.index}
            bodyClassName="p-3 pb-4"
            actions={
              <span className="label">{selectedName}</span>
            }
          >
            <TrendChart
              data={data}
              series={chart.series}
              unit={chart.unit}
              digits={chart.digits}
              references={chart.references}
              height={252}
            />
            <StatStrip
              stats={
                chart.key === 'pressure'
                  ? stats.pressure
                  : stats[chart.key as 'heartRate' | 'spo2' | 'temperature']
              }
              unit={chart.unit}
              digits={chart.digits}
            />
          </Panel>
        ))}
      </div>

      <p className="mt-6 font-mono text-[8.5px] uppercase leading-relaxed tracking-[0.14em] text-muted">
        All values are generated locally by the AstroVital simulation engine.
        Charts refresh with the simulation clock. Reference bands are
        demonstration thresholds, not clinical guidance.
      </p>
    </div>
  )
}
