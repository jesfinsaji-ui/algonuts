import type { VitalKey, VitalReading } from '../types'
import { formatClock } from './format'

export interface TrendPoint {
  clock: string
  [key: string]: string | number
}

export function buildTrendData(
  readingsByCrew: Record<string, VitalReading[]>,
  crewIds: string[],
  series: VitalKey[],
  range: number,
): TrendPoint[] {
  if (crewIds.length === 0) return []
  const maxLength = Math.min(
    ...crewIds.map((id) => readingsByCrew[id]?.length ?? 0),
  )
  const count = Math.min(range, maxLength)
  if (count <= 0) return []

  const points: TrendPoint[] = []
  for (let i = 0; i < count; i += 1) {
    const offset = maxLength - count + i
    const timestamp =
      readingsByCrew[crewIds[0] ?? '']?.[offset]?.timestamp ?? 0
    const point: TrendPoint = { clock: formatClock(timestamp) }
    for (const key of series) {
      const values = crewIds
        .map((id) => readingsByCrew[id]?.[offset]?.[key])
        .filter((value): value is number => typeof value === 'number')
      point[key] = values.length
        ? values.reduce((total, value) => total + value, 0) / values.length
        : 0
    }
    points.push(point)
  }
  return points
}

export function sparkValues(
  readings: VitalReading[] | undefined,
  metric: VitalKey,
  count = 20,
): number[] {
  if (!readings) return []
  return readings.slice(-count).map((reading) => reading[metric])
}

export function seriesStats(
  points: TrendPoint[],
  key: string,
): { min: number; max: number; avg: number } {
  const values = points
    .map((point) => point[key])
    .filter((value): value is number => typeof value === 'number')
  if (values.length === 0) return { min: 0, max: 0, avg: 0 }
  return {
    min: Math.min(...values),
    max: Math.max(...values),
    avg: values.reduce((total, value) => total + value, 0) / values.length,
  }
}
