import type {
  CrewMember,
  Episode,
  VitalKey,
  VitalReading,
  Vitals,
} from '../types'
import { clamp, round } from '../utils/format'

export const HISTORY_LIMIT = 90

const KEYS: VitalKey[] = [
  'heartRate',
  'spo2',
  'temperature',
  'systolic',
  'diastolic',
  'radiation',
  'sleep',
]

const LIMITS: Record<VitalKey, [number, number]> = {
  heartRate: [44, 148],
  spo2: [84, 100],
  temperature: [35.1, 39.2],
  systolic: [88, 178],
  diastolic: [52, 112],
  radiation: [1.1, 5.2],
  sleep: [3.2, 8.6],
}

const VOLATILITY: Record<VitalKey, number> = {
  heartRate: 1.9,
  spo2: 0.28,
  temperature: 0.035,
  systolic: 1.4,
  diastolic: 0.9,
  radiation: 0.012,
  sleep: 0.015,
}

const DIGITS: Record<VitalKey, number> = {
  heartRate: 0,
  spo2: 1,
  temperature: 1,
  systolic: 0,
  diastolic: 0,
  radiation: 2,
  sleep: 1,
}

const EPISODE_OPTIONS: Array<{ metric: VitalKey; magnitude: number }> = [
  { metric: 'heartRate', magnitude: 46 },
  { metric: 'spo2', magnitude: -8.5 },
  { metric: 'temperature', magnitude: 1.85 },
  { metric: 'systolic', magnitude: 46 },
]

function noise(scale: number): number {
  return (Math.random() - 0.5) * 2 * scale
}

export function spawnEpisode(): Episode {
  const pick =
    EPISODE_OPTIONS[Math.floor(Math.random() * EPISODE_OPTIONS.length)] ??
    EPISODE_OPTIONS[0]
  return {
    metric: pick.metric,
    magnitude: pick.magnitude,
    ticksLeft: 3,
  }
}

export function createReading(
  previous: VitalReading | null,
  base: Vitals,
  timestamp: number,
  episode?: Episode,
): VitalReading {
  const prior: VitalReading = previous ?? { ...base, timestamp }
  const next = { timestamp } as VitalReading

  for (const key of KEYS) {
    const active = episode?.metric === key
    const target = base[key] + (active ? episode.magnitude : 0)
    const alpha = active ? 0.42 : 0.09
    const raw = prior[key] + (target - prior[key]) * alpha + noise(VOLATILITY[key])
    const [min, max] = LIMITS[key]
    next[key] = round(clamp(raw, min, max), DIGITS[key])
  }

  return next
}

export function buildInitialHistory(
  crew: CrewMember,
  endMinute: number,
  episode?: Episode,
): VitalReading[] {
  const readings: VitalReading[] = []
  let previous: VitalReading | null = null
  const start = endMinute - (HISTORY_LIMIT - 1)

  for (let i = 0; i < HISTORY_LIMIT; i += 1) {
    const timestamp = start + i
    const active =
      episode && i >= HISTORY_LIMIT - 4
        ? { ...episode, ticksLeft: Math.max(1, HISTORY_LIMIT - i) }
        : undefined
    previous = createReading(previous, crew.baseline, timestamp, active)
    readings.push(previous)
  }

  return readings
}

export function metricDelta(
  readings: VitalReading[],
  metric: VitalKey,
  window = 12,
): number {
  if (readings.length < 2) return 0
  const latest = readings[readings.length - 1]
  const prior = readings[Math.max(0, readings.length - 1 - window)]
  if (!latest || !prior) return 0
  return latest[metric] - prior[metric]
}
