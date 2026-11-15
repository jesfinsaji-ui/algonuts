import {
  Download,
  LogOut,
  Moon,
  Pause,
  Play,
  RotateCcw,
  Sun,
  Trash2,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useTheme } from '../context/useTheme'
import { Button } from '../components/common/Button'
import { PageHeader } from '../components/common/PageHeader'
import { Panel } from '../components/common/Panel'
import { SectionLabel } from '../components/common/SectionLabel'
import { CREW } from '../data/crew'
import { useAuthStore } from '../store/useAuthStore'
import { useSimulationStore } from '../store/useSimulationStore'
import { useUIStore } from '../store/useUIStore'
import type { Theme } from '../types'
import { cn } from '../utils/cn'
import {
  downloadCSV,
  formatClock,
  formatMET,
  formatMissionDay,
  SIMULATION_TICK_MS,
} from '../utils/format'
import { latestReading } from '../utils/vitals'

const THEME_OPTIONS: Array<{
  value: Theme
  label: string
  detail: string
  icon: typeof Sun
}> = [
  {
    value: 'light',
    label: 'Editorial light',
    detail: 'Off-white canvas, black type',
    icon: Sun,
  },
  {
    value: 'dark',
    label: 'Mission dark',
    detail: 'Deep space navy, ice type',
    icon: Moon,
  },
]

const SPEEDS = [1, 2, 4] as const

export function Settings() {
  const navigate = useNavigate()
  const { theme, setTheme } = useTheme()
  const session = useAuthStore((state) => state.session)
  const signOut = useAuthStore((state) => state.signOut)
  const running = useSimulationStore((state) => state.running)
  const speed = useSimulationStore((state) => state.speed)
  const missionMinutes = useSimulationStore((state) => state.missionMinutes)
  const readings = useSimulationStore((state) => state.readings)
  const alerts = useSimulationStore((state) => state.alerts)
  const notifications = useSimulationStore((state) => state.notifications)
  const start = useSimulationStore((state) => state.start)
  const pause = useSimulationStore((state) => state.pause)
  const reset = useSimulationStore((state) => state.reset)
  const setSpeed = useSimulationStore((state) => state.setSpeed)
  const clearNotifications = useSimulationStore(
    (state) => state.clearNotifications,
  )
  const addToast = useUIStore((state) => state.addToast)

  const openAlerts = alerts.filter((alert) => alert.status !== 'resolved').length
  const unread = notifications.filter((item) => !item.read).length

  const handleReset = () => {
    reset()
    addToast(
      'Simulation reset. Crew history and alerts restored to the demo baseline.',
      'warning',
    )
  }

  const handleExport = () => {
    const header = [
      'Crew ID',
      'Name',
      'Role',
      'Status',
      'Heart rate (bpm)',
      'SpO2 (%)',
      'Temperature (C)',
      'Systolic (mmHg)',
      'Diastolic (mmHg)',
      'Radiation (mSv/day)',
      'Sleep (h)',
      'Mission day',
    ]
    const rows = CREW.map((member) => {
      const latest = latestReading(readings[member.id])
      return [
        member.crewId,
        member.name,
        member.role,
        latest ? 'session snapshot' : 'no data',
        latest ? Math.round(latest.heartRate) : '',
        latest ? latest.spo2.toFixed(1) : '',
        latest ? latest.temperature.toFixed(1) : '',
        latest ? Math.round(latest.systolic) : '',
        latest ? Math.round(latest.diastolic) : '',
        latest ? latest.radiation.toFixed(2) : '',
        latest ? latest.sleep.toFixed(1) : '',
        formatMissionDay(missionMinutes),
      ]
    })
    downloadCSV(
      `astrovital-snapshot-${formatClock(missionMinutes).replace(':', '')}.csv`,
      [header, ...rows],
    )
    addToast('Session snapshot exported as CSV.', 'success')
  }

  const handleSignOut = () => {
    signOut()
    addToast('Demo session closed. You are signed out.', 'warning')
    navigate('/login', { replace: true })
  }

  return (
    <div>
      <PageHeader
        eyebrow="Settings / demo controls"
        title="Configure."
        description="Appearance, simulation behaviour and session data. Preferences persist locally; telemetry and alerts live only in this browser session."
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
        <div className="flex flex-col gap-6">
          <Panel title="Appearance" index="02" bodyClassName="p-4 sm:p-5">
            <p className="mb-4 text-[12px] leading-relaxed text-muted">
              Light mode is the default. Your choice is stored in{' '}
              <code className="font-mono text-[10px] text-ink">
                localStorage
              </code>{' '}
              and restored after refresh. The header toggle stays in sync with
              this control.
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              {THEME_OPTIONS.map((option) => {
                const Icon = option.icon
                const active = theme === option.value
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => {
                      setTheme(option.value)
                      addToast(
                        `${option.label} theme applied.`,
                        'success',
                      )
                    }}
                    className={cn(
                      'border p-2 text-left transition-colors',
                      active
                        ? 'border-accent'
                        : 'border-line hover:border-ink',
                    )}
                    aria-pressed={active}
                  >
                    <div
                      className="relative h-24 overflow-hidden border border-line p-3"
                      style={{
                        background:
                          option.value === 'light' ? '#F7F7F5' : '#080D16',
                      }}
                    >
                      <div
                        className="flex items-center justify-between border-b pb-2"
                        style={{
                          borderColor:
                            option.value === 'light' ? '#D8D8D5' : '#263548',
                        }}
                      >
                        <span
                          className="h-1.5 w-10"
                          style={{
                            background:
                              option.value === 'light' ? '#111111' : '#EAF2FA',
                          }}
                        />
                        <span className="h-1.5 w-1.5 bg-[#FF5038]" />
                      </div>
                      <div className="mt-3 flex items-end gap-2">
                        <span
                          className="h-7 w-12"
                          style={{
                            background:
                              option.value === 'light' ? '#111111' : '#EAF2FA',
                          }}
                        />
                        <span className="h-5 w-8 bg-[#FF5038]" />
                      </div>
                      <div className="mt-3 flex gap-1.5">
                        {[1, 2, 3].map((block) => (
                          <span
                            key={block}
                            className="h-4 flex-1 border"
                            style={{
                              borderColor:
                                option.value === 'light'
                                  ? '#D8D8D5'
                                  : '#263548',
                            }}
                          />
                        ))}
                      </div>
                    </div>
                    <div className="mt-3 flex items-center justify-between gap-2 px-1">
                      <span>
                        <span className="block font-mono text-[10px] uppercase tracking-[0.14em]">
                          {option.label}
                        </span>
                        <span className="mt-1 block text-[10px] text-muted">
                          {option.detail}
                        </span>
                      </span>
                      <Icon
                        size={15}
                        className={active ? 'text-accent' : 'text-muted'}
                      />
                    </div>
                  </button>
                )
              })}
            </div>
          </Panel>

          <Panel title="Simulation controls" index="03" bodyClassName="p-4 sm:p-5">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-4">
              <div>
                <SectionLabel>Engine state</SectionLabel>
                <div className="mt-2 flex items-center gap-2">
                  <span
                    className={cn(
                      'h-2 w-2 rounded-full',
                      running ? 'animate-pulse bg-ok' : 'bg-warn',
                    )}
                  />
                  <span className="font-display text-lg font-semibold">
                    {running ? 'Streaming' : 'Paused'}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <div className="label">Mission elapsed</div>
                <div className="mt-1.5 font-mono text-[13px] tabular-nums">
                  {formatMET(missionMinutes)}
                </div>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <Button
                variant="primary"
                size="sm"
                icon={<Play size={12} />}
                onClick={() => {
                  start()
                  addToast('Simulation started.', 'success')
                }}
                disabled={running}
              >
                Start
              </Button>
              <Button
                variant="outline"
                size="sm"
                icon={<Pause size={12} />}
                onClick={() => {
                  pause()
                  addToast('Simulation paused.', 'warning')
                }}
                disabled={!running}
              >
                Pause
              </Button>
              <Button
                variant="danger"
                size="sm"
                icon={<RotateCcw size={12} />}
                onClick={handleReset}
              >
                Reset
              </Button>
            </div>

            <div className="mt-5 border-t border-line pt-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <SectionLabel>Clock speed</SectionLabel>
                  <p className="mt-1.5 text-[11px] text-muted">
                    Simulated minutes advanced per tick ({SIMULATION_TICK_MS} ms
                    real time).
                  </p>
                </div>
                <div className="flex border border-line p-0.5">
                  {SPEEDS.map((value) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => {
                        setSpeed(value)
                        addToast(`Simulation speed set to ${value}×.`, 'default')
                      }}
                      className={cn(
                        'px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.12em] transition-colors',
                        speed === value
                          ? 'bg-ink text-bg'
                          : 'text-muted hover:text-ink',
                      )}
                    >
                      {value}×
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-px border border-line bg-line">
              <div className="bg-surface p-3">
                <div className="label">Open alerts</div>
                <div className="mt-1 font-mono text-lg tabular-nums">
                  {openAlerts}
                </div>
              </div>
              <div className="bg-surface p-3">
                <div className="label">Unread</div>
                <div className="mt-1 font-mono text-lg tabular-nums">
                  {unread}
                </div>
              </div>
              <div className="bg-surface p-3">
                <div className="label">Crew</div>
                <div className="mt-1 font-mono text-lg tabular-nums">
                  {String(CREW.length).padStart(2, '0')}
                </div>
              </div>
            </div>
          </Panel>
        </div>

        <div className="flex flex-col gap-6">
          <Panel title="Session data" index="04" bodyClassName="p-4 sm:p-5">
            <p className="text-[12px] leading-relaxed text-muted">
              Readings are stored in memory in the browser and capped at a
              rolling window. Export a snapshot for a portable copy, or clear
              notification history without affecting telemetry.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                icon={<Download size={12} />}
                onClick={handleExport}
              >
                Export snapshot
              </Button>
              <Button
                variant="ghost"
                size="sm"
                icon={<Trash2 size={12} />}
                onClick={() => {
                  clearNotifications()
                  addToast('Notification history cleared.', 'warning')
                }}
              >
                Clear notifications
              </Button>
            </div>
            <p className="mt-4 border-t border-line pt-3 font-mono text-[8px] uppercase leading-relaxed tracking-[0.14em] text-muted">
              Reset restores the seeded demo state, not the entire browser
              session.
            </p>
          </Panel>

          <Panel title="Demo session" index="05" bodyClassName="p-4 sm:p-5">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <SectionLabel>Signed in as</SectionLabel>
                <p className="mt-2 truncate font-mono text-[11px] text-ink">
                  {session?.email ?? 'No active demo session'}
                </p>
                <p className="mt-1 text-[10px] text-muted">
                  {session?.name ?? 'Demo Flight Surgeon'}
                </p>
              </div>
              <span className="shrink-0 border border-line px-2 py-1 font-mono text-[8px] uppercase tracking-[0.16em] text-muted">
                Demo
              </span>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-px border border-line bg-line">
              <div className="bg-surface p-3">
                <div className="label">Remembered</div>
                <div className="mt-1 font-mono text-[11px] uppercase">
                  {session?.remember ? 'Yes' : 'No'}
                </div>
              </div>
              <div className="bg-surface p-3">
                <div className="label">Storage</div>
                <div className="mt-1 font-mono text-[11px] uppercase">
                  localStorage
                </div>
              </div>
            </div>
            <p className="mt-3 text-[11px] leading-relaxed text-muted">
              Signing out clears the local demo session. No backend account is
              created, and dashboard telemetry is unaffected until the page is
              refreshed.
            </p>
            <Button
              variant="danger"
              size="sm"
              icon={<LogOut size={12} />}
              onClick={handleSignOut}
              className="mt-4"
            >
              Sign out
            </Button>
          </Panel>

          <Panel title="About AstroVital" index="06" bodyClassName="p-4 sm:p-5">
            <div className="flex items-baseline justify-between">
              <span className="font-display text-lg font-semibold">
                AstroVital
              </span>
              <span className="font-mono text-[9px] uppercase tracking-[0.16em] text-muted">
                v1.0 · Demo
              </span>
            </div>
            <p className="mt-3 text-[12px] leading-relaxed text-muted">
              A frontend-only astronaut health monitoring concept built for a
              NASA Space Apps style hackathon. The interface is inspired by
              minimalist editorial and Swiss design.
            </p>
            <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 border-t border-line pt-3 font-mono text-[9px] uppercase tracking-[0.12em] text-muted">
              <span>React + Vite</span>
              <span>TypeScript</span>
              <span>Tailwind CSS</span>
              <span>Recharts</span>
              <span>Zustand</span>
              <span>React Router</span>
            </div>
            <div className="mt-4 border border-warn/60 bg-accentsoft p-3">
              <div className="font-mono text-[8.5px] uppercase tracking-[0.16em] text-crit">
                Disclaimer
              </div>
              <p className="mt-1.5 text-[10.5px] leading-relaxed text-muted">
                All crew members, readings and analyses are fictional and
                locally simulated. AstroVital is not affiliated with NASA, is
                not connected to any spacecraft, and is not a medical device or
                diagnostic tool.
              </p>
            </div>
          </Panel>
        </div>
      </div>
    </div>
  )
}
