import type { Anomaly, VitalReading } from '../types'
import { describeAnomaly, evaluateReading } from './vitals'

export type RiskLevel = 'low' | 'moderate' | 'elevated' | 'high'

export function analyzeReading(reading?: VitalReading): Anomaly[] {
  if (!reading) return []
  return evaluateReading(reading).map(describeAnomaly)
}

export function riskScore(anomalies: Anomaly[]): number {
  const raw = anomalies.reduce(
    (total, anomaly) => total + (anomaly.severity === 'critical' ? 42 : 18),
    0,
  )
  return Math.min(100, raw)
}

export function riskLevel(score: number): RiskLevel {
  if (score < 20) return 'low'
  if (score < 45) return 'moderate'
  if (score < 70) return 'elevated'
  return 'high'
}

export function riskLabel(level: RiskLevel): string {
  switch (level) {
    case 'low':
      return 'Low'
    case 'moderate':
      return 'Moderate'
    case 'elevated':
      return 'Elevated'
    case 'high':
      return 'High'
  }
}

export function aggregateRisk(
  crewAnomalies: Array<{ anomalies: Anomaly[] }>,
): { score: number; level: RiskLevel; flagged: number; critical: number } {
  const scores = crewAnomalies.map((entry) => riskScore(entry.anomalies))
  const max = Math.max(0, ...scores)
  const flagged = crewAnomalies.filter(
    (entry) => entry.anomalies.length > 0,
  ).length
  const critical = crewAnomalies.reduce(
    (total, entry) =>
      total +
      entry.anomalies.filter((anomaly) => anomaly.severity === 'critical').length,
    0,
  )
  const score = Math.min(100, max + Math.max(0, flagged - 1) * 6)
  return { score, level: riskLevel(score), flagged, critical }
}
