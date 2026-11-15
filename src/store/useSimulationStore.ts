import { create } from 'zustand'
import { CREW, crewById } from '../data/crew'
import {
  createSeedActivity,
  createSeedAlerts,
  createSeedNotifications,
} from '../data/seed'
import {
  buildInitialHistory,
  createReading,
  HISTORY_LIMIT,
  spawnEpisode,
} from '../services/simulation'
import type {
  ActivityEvent,
  AlertRecord,
  Concern,
  Episode,
  NotificationItem,
  VitalKey,
  VitalReading,
} from '../types'
import {
  MISSION_START_MINUTES,
  formatValue,
  uid,
} from '../utils/format'
import {
  classifyMetric,
  describeAnomaly,
  evaluateReading,
  latestReading,
  VITAL_META,
} from '../utils/vitals'

interface SimulationStore {
  running: boolean
  speed: number
  missionMinutes: number
  readings: Record<string, VitalReading[]>
  alerts: AlertRecord[]
  notifications: NotificationItem[]
  activity: ActivityEvent[]
  episodes: Record<string, Episode>
  start: () => void
  pause: () => void
  toggle: () => void
  setSpeed: (speed: number) => void
  reset: () => void
  tick: () => void
  acknowledgeAlert: (id: string) => void
  resolveAlert: (id: string) => void
  markNotificationRead: (id: string) => void
  markAllNotificationsRead: () => void
  dismissNotification: (id: string) => void
  clearNotifications: () => void
}

const initialEpisodes: Record<string, Episode> = {
  'aisha-rahman': { metric: 'heartRate', magnitude: 42, ticksLeft: 4 },
  'tomas-novak': { metric: 'radiation', magnitude: 1.15, ticksLeft: 3 },
}

const ALERT_TITLES: Record<VitalKey, string> = {
  heartRate: 'Heart rate outside reference',
  spo2: 'Blood oxygen below reference',
  temperature: 'Core temperature excursion',
  systolic: 'Systolic pressure elevated',
  diastolic: 'Diastolic pressure elevated',
  radiation: 'Elevated radiation exposure',
  sleep: 'Reduced sleep duration',
}

function buildAlert(astronautId: string, concern: Concern, now: number): AlertRecord {
  const anomaly = describeAnomaly(concern)
  const meta = VITAL_META[concern.metric]
  return {
    id: uid('ALT', now),
    astronautId,
    metric: concern.metric,
    title: ALERT_TITLES[concern.metric],
    severity: concern.severity === 'critical' ? 'critical' : 'warning',
    status: 'active',
    detectedAt: now,
    observed: `${formatValue(concern.value, concern.metric === 'temperature' ? 1 : 0)} ${meta.unit}`,
    reference: meta.reference,
    explanation: anomaly.explanation,
    action: anomaly.action,
    source: 'simulation',
  }
}

function createInitialState() {
  const readings: Record<string, VitalReading[]> = {}
  for (const crew of CREW) {
    readings[crew.id] = buildInitialHistory(
      crew,
      MISSION_START_MINUTES,
      initialEpisodes[crew.id],
    )
  }

  return {
    running: true,
    speed: 1,
    missionMinutes: MISSION_START_MINUTES,
    readings,
    alerts: createSeedAlerts(),
    notifications: createSeedNotifications(),
    activity: createSeedActivity(),
    episodes: { ...initialEpisodes },
  }
}

function crewName(id: string): string {
  return crewById(id)?.name ?? id
}

function pushActivity(
  activity: ActivityEvent[],
  entry: Omit<ActivityEvent, 'id'>,
): ActivityEvent[] {
  return [{ ...entry, id: uid('ACT') }, ...activity].slice(0, 40)
}

export const useSimulationStore = create<SimulationStore>()((set, get) => ({
  ...createInitialState(),

  start: () =>
    set((state) =>
      state.running
        ? state
        : {
            running: true,
            activity: pushActivity(state.activity, {
              timestamp: state.missionMinutes,
              title: 'Simulation resumed',
              detail: 'Telemetry generation stream resumed by operator.',
              kind: 'simulation',
            }),
          },
    ),

  pause: () =>
    set((state) =>
      state.running
        ? {
            running: false,
            activity: pushActivity(state.activity, {
              timestamp: state.missionMinutes,
              title: 'Simulation paused',
              detail: 'Telemetry generation stream paused by operator.',
              kind: 'simulation',
            }),
          }
        : state,
    ),

  toggle: () => {
    const state = get()
    if (state.running) state.pause()
    else state.start()
  },

  setSpeed: (speed) => set({ speed }),

  reset: () => set(createInitialState()),

  tick: () => {
    const current = get()
    const now = current.missionMinutes + current.speed
    const readings: Record<string, VitalReading[]> = { ...current.readings }
    const episodes: Record<string, Episode> = { ...current.episodes }
    let activity = current.activity

    const createdAlerts: AlertRecord[] = []
    const createdNotifications: NotificationItem[] = []
    let spawnAvailable =
      Object.keys(episodes).length === 0 && Math.random() < 0.09

    for (const crew of CREW) {
      let episode: Episode | undefined = episodes[crew.id]
      if (episode) {
        if (episode.ticksLeft <= 1) {
          delete episodes[crew.id]
          episode = undefined
        } else {
          episode = { ...episode, ticksLeft: episode.ticksLeft - 1 }
          episodes[crew.id] = episode
        }
      } else if (spawnAvailable) {
        episode = spawnEpisode()
        episodes[crew.id] = episode
        spawnAvailable = false
      }

      const history = readings[crew.id] ?? []
      const reading = createReading(
        history[history.length - 1] ?? null,
        crew.baseline,
        now,
        episode,
      )
      readings[crew.id] = [
        ...history.slice(-(HISTORY_LIMIT - 1)),
        reading,
      ]

      const [top] = evaluateReading(reading)
      if (!top) continue

      const alreadyOpen = [...current.alerts, ...createdAlerts].some(
        (alert) =>
          alert.astronautId === crew.id &&
          alert.metric === top.metric &&
          alert.status !== 'resolved',
      )
      if (alreadyOpen) continue

      const alert = buildAlert(crew.id, top, now)
      createdAlerts.push(alert)
      createdNotifications.push({
        id: uid('NTF', now),
        alertId: alert.id,
        title: alert.title,
        message: `${crew.name} · ${alert.observed} vs ${alert.reference}.`,
        severity: alert.severity,
        createdAt: now,
        read: false,
      })
      activity = pushActivity(activity, {
        timestamp: now,
        title: `Alert raised — ${alert.title.toLowerCase()}`,
        detail: `${crew.name} · ${alert.severity} · ${alert.observed}`,
        kind: 'alert',
      })
    }

    const nextAlerts = current.alerts.map((alert) => {
      if (alert.source !== 'simulation' || alert.status === 'resolved') {
        return alert
      }
      if (alert.metric === 'composite') return alert
      const reading = latestReading(readings[alert.astronautId])
      if (!reading) return alert
      const severity = classifyMetric(alert.metric, reading[alert.metric])
      if (severity !== 'nominal') return alert
      activity = pushActivity(activity, {
        timestamp: now,
        title: 'Alert auto-resolved',
        detail: `${crewName(alert.astronautId)} · ${alert.title.toLowerCase()} returned to the reference band.`,
        kind: 'alert',
      })
      return { ...alert, status: 'resolved' as const, resolvedAt: now }
    })

    set({
      missionMinutes: now,
      readings,
      episodes,
      alerts: [...createdAlerts, ...nextAlerts],
      notifications: [
        ...createdNotifications,
        ...current.notifications,
      ].slice(0, 24),
      activity,
    })
  },

  acknowledgeAlert: (id) => {
    const current = get()
    const target = current.alerts.find((alert) => alert.id === id)
    if (!target || target.status !== 'active') return
    set({
      alerts: current.alerts.map((alert) =>
        alert.id === id
          ? {
              ...alert,
              status: 'acknowledged' as const,
              acknowledgedAt: current.missionMinutes,
            }
          : alert,
      ),
      notifications: current.notifications.map((notification) =>
        notification.alertId === id
          ? { ...notification, read: true }
          : notification,
      ),
      activity: pushActivity(current.activity, {
        timestamp: current.missionMinutes,
        title: 'Alert acknowledged',
        detail: `${crewName(target.astronautId)} · ${target.title}`,
        kind: 'alert',
      }),
    })
  },

  resolveAlert: (id) => {
    const current = get()
    const target = current.alerts.find((alert) => alert.id === id)
    if (!target || target.status === 'resolved') return
    set({
      alerts: current.alerts.map((alert) =>
        alert.id === id
          ? {
              ...alert,
              status: 'resolved' as const,
              resolvedAt: current.missionMinutes,
              acknowledgedAt:
                alert.acknowledgedAt ?? current.missionMinutes,
            }
          : alert,
      ),
      notifications: current.notifications.map((notification) =>
        notification.alertId === id
          ? { ...notification, read: true }
          : notification,
      ),
      activity: pushActivity(current.activity, {
        timestamp: current.missionMinutes,
        title: 'Alert resolved',
        detail: `${crewName(target.astronautId)} · ${target.title}`,
        kind: 'alert',
      }),
    })
  },

  markNotificationRead: (id) =>
    set((state) => ({
      notifications: state.notifications.map((notification) =>
        notification.id === id
          ? { ...notification, read: true }
          : notification,
      ),
    })),

  markAllNotificationsRead: () =>
    set((state) => ({
      notifications: state.notifications.map((notification) => ({
        ...notification,
        read: true,
      })),
    })),

  dismissNotification: (id) =>
    set((state) => ({
      notifications: state.notifications.filter(
        (notification) => notification.id !== id,
      ),
    })),

  clearNotifications: () => set({ notifications: [] }),
}))
