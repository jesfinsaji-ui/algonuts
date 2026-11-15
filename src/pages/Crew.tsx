import { Download } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Button } from '../components/common/Button'
import { EmptyState } from '../components/common/EmptyState'
import { PageHeader } from '../components/common/PageHeader'
import { SearchInput } from '../components/common/SearchInput'
import { CrewCard } from '../components/crew/CrewCard'
import { CREW } from '../data/crew'
import { useSimulationStore } from '../store/useSimulationStore'
import { useUIStore } from '../store/useUIStore'
import type { Severity } from '../types'
import { cn } from '../utils/cn'
import { downloadCSV, formatClock, formatMissionDay } from '../utils/format'
import { latestReading, overallSeverity } from '../utils/vitals'

type StatusFilter = 'all' | Severity

const STATUS_FILTERS: Array<{ value: StatusFilter; label: string }> = [
  { value: 'all', label: 'All' },
  { value: 'nominal', label: 'Nominal' },
  { value: 'warning', label: 'Warning' },
  { value: 'critical', label: 'Critical' },
]

export function Crew() {
  const readings = useSimulationStore((state) => state.readings)
  const missionMinutes = useSimulationStore((state) => state.missionMinutes)
  const addToast = useUIStore((state) => state.addToast)

  const [query, setQuery] = useState('')
  const [status, setStatus] = useState<StatusFilter>('all')

  const rows = useMemo(
    () =>
      CREW.map((member) => ({
        member,
        latest: latestReading(readings[member.id]),
        severity: overallSeverity(latestReading(readings[member.id])),
      })),
    [readings],
  )

  const filtered = rows.filter(({ member, severity }) => {
    const text = `${member.name} ${member.role} ${member.crewId} ${member.callSign} ${member.specialty}`.toLowerCase()
    const matchesQuery = text.includes(query.trim().toLowerCase())
    const matchesStatus = status === 'all' || severity === status
    return matchesQuery && matchesStatus
  })

  const handleExport = () => {
    const header = [
      'Crew ID',
      'Name',
      'Call sign',
      'Role',
      'Status',
      'Heart rate (bpm)',
      'SpO2 (%)',
      'Temperature (C)',
      'Blood pressure (mmHg)',
      'Radiation (mSv/day)',
      'Sleep (h)',
      'Mission day',
    ]
    const data = filtered.map(({ member, latest, severity }) => [
      member.crewId,
      member.name,
      member.callSign,
      member.role,
      severity,
      latest ? Math.round(latest.heartRate) : '',
      latest ? latest.spo2.toFixed(1) : '',
      latest ? latest.temperature.toFixed(1) : '',
      latest ? `${Math.round(latest.systolic)}/${Math.round(latest.diastolic)}` : '',
      latest ? latest.radiation.toFixed(2) : '',
      latest ? latest.sleep.toFixed(1) : '',
      formatMissionDay(missionMinutes),
    ])
    downloadCSV(
      `astrovital-crew-${formatClock(missionMinutes).replace(':', '')}.csv`,
      [header, ...data],
    )
    addToast(`Exported ${filtered.length} crew records to CSV.`, 'success')
  }

  return (
    <div>
      <PageHeader
        eyebrow="Crew monitoring / 04 personnel"
        title="The crew."
        description="Four simulated crew members, continuously monitored across core physiology, environmental exposure and recovery. Open a profile for full telemetry and history."
        actions={
          <Button
            variant="outline"
            size="sm"
            icon={<Download size={13} />}
            onClick={handleExport}
          >
            Export roster
          </Button>
        }
      />

      <div className="mb-5 flex flex-col gap-3 border-b border-line pb-5 sm:flex-row sm:items-center sm:justify-between">
        <SearchInput
          value={query}
          onChange={setQuery}
          placeholder="Search name, role or crew ID"
          className="w-full sm:max-w-xs"
        />
        <div className="flex flex-wrap items-center gap-2">
          <span className="label mr-1">Status</span>
          <div className="flex flex-wrap gap-1.5">
            {STATUS_FILTERS.map((filter) => (
              <button
                key={filter.value}
                type="button"
                onClick={() => setStatus(filter.value)}
                className={cn(
                  'border px-2.5 py-1.5 font-mono text-[9px] uppercase tracking-[0.12em] transition-colors',
                  status === filter.value
                    ? 'border-ink bg-ink text-bg'
                    : 'border-line text-muted hover:border-ink hover:text-ink',
                )}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mb-4 flex items-center justify-between">
        <span className="label">
          Showing {filtered.length} of {CREW.length} crew members
        </span>
        <span className="label hidden sm:block">Simulated telemetry</span>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title="No crew match this filter"
          description="Try a different search term or reset the status filter."
          action={
            <Button
              size="sm"
              onClick={() => {
                setQuery('')
                setStatus('all')
              }}
            >
              Clear filters
            </Button>
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-2">
          {filtered.map(({ member, latest }) => (
            <CrewCard
              key={member.id}
              member={member}
              latest={latest}
              missionMinutes={missionMinutes}
            />
          ))}
        </div>
      )}
    </div>
  )
}
