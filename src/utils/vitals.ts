import type {
  Anomaly,
  Concern,
  Severity,
  VitalKey,
  VitalReading,
  Vitals,
} from '../types'

interface MetricMeta {
  label: string
  short: string
  unit: string
  reference: string
}

export const VITAL_META: Record<VitalKey, MetricMeta> = {
  heartRate: {
    label: 'Heart rate',
    short: 'HR',
    unit: 'bpm',
    reference: '50–110 bpm',
  },
  spo2: {
    label: 'Blood oxygen',
    short: 'SpO₂',
    unit: '%',
    reference: '94–100%',
  },
  temperature: {
    label: 'Core temperature',
    short: 'TEMP',
    unit: '°C',
    reference: '35.5–37.6 °C',
  },
  systolic: {
    label: 'Systolic pressure',
    short: 'SYS',
    unit: 'mmHg',
    reference: '90–140 mmHg',
  },
  diastolic: {
    label: 'Diastolic pressure',
    short: 'DIA',
    unit: 'mmHg',
    reference: '55–90 mmHg',
  },
  radiation: {
    label: 'Radiation dose',
    short: 'RAD',
    unit: 'mSv/day',
    reference: '≤ 2.5 mSv/day',
  },
  sleep: {
    label: 'Sleep (24h)',
    short: 'SLP',
    unit: 'h',
    reference: '≥ 6.0 h',
  },
}

interface Rule {
  lowWarn?: number
  lowCrit?: number
  highWarn?: number
  highCrit?: number
}

export const RULES: Record<VitalKey, Rule> = {
  heartRate: { lowWarn: 50, lowCrit: 42, highWarn: 110, highCrit: 130 },
  spo2: { lowWarn: 94, lowCrit: 90 },
  temperature: { lowWarn: 35.5, lowCrit: 35, highWarn: 37.6, highCrit: 38.3 },
  systolic: { highWarn: 140, highCrit: 160 },
  diastolic: { highWarn: 90, highCrit: 100 },
  radiation: { highWarn: 2.5, highCrit: 4 },
  sleep: { lowWarn: 6, lowCrit: 4 },
}

const RANK: Record<Severity, number> = {
  nominal: 0,
  warning: 1,
  critical: 2,
}

export function maxSeverity(a: Severity, b: Severity): Severity {
  return RANK[a] >= RANK[b] ? a : b
}

export function classifyMetric(metric: VitalKey, value: number): Severity {
  const rule = RULES[metric]
  if (rule.highCrit !== undefined && value >= rule.highCrit) return 'critical'
  if (rule.lowCrit !== undefined && value <= rule.lowCrit) return 'critical'
  if (rule.highWarn !== undefined && value >= rule.highWarn) return 'warning'
  if (rule.lowWarn !== undefined && value <= rule.lowWarn) return 'warning'
  return 'nominal'
}

export function readingValue(
  reading: VitalReading | Vitals,
  metric: VitalKey,
): number {
  return reading[metric]
}

export function evaluateReading(reading: VitalReading | Vitals): Concern[] {
  const metrics = Object.keys(VITAL_META) as VitalKey[]
  return metrics
    .map((metric) => {
      const value = readingValue(reading, metric)
      const severity = classifyMetric(metric, value)
      return {
        metric,
        label: VITAL_META[metric].label,
        unit: VITAL_META[metric].unit,
        reference: VITAL_META[metric].reference,
        severity,
        value,
      }
    })
    .filter((concern) => concern.severity !== 'nominal')
    .sort((a, b) => RANK[b.severity] - RANK[a.severity])
}

export function overallSeverity(reading?: VitalReading | null): Severity {
  if (!reading) return 'nominal'
  return evaluateReading(reading).reduce<Severity>(
    (acc, concern) => maxSeverity(acc, concern.severity),
    'nominal',
  )
}

export function latestReading(
  readings: VitalReading[] | undefined,
): VitalReading | undefined {
  if (!readings || readings.length === 0) return undefined
  return readings[readings.length - 1]
}

export function averageReadings(readings: VitalReading[]): Vitals | null {
  if (readings.length === 0) return null
  const keys: VitalKey[] = [
    'heartRate',
    'spo2',
    'temperature',
    'systolic',
    'diastolic',
    'radiation',
    'sleep',
  ]
  const totals = keys.reduce(
    (acc, key) => {
      acc[key] = readings.reduce((sum, reading) => sum + reading[key], 0)
      return acc
    },
    {} as Record<VitalKey, number>,
  )
  const result = {} as Vitals
  for (const key of keys) {
    result[key] = totals[key] / readings.length
  }
  return result
}

export function formatMetric(metric: VitalKey, value: number): string {
  if (metric === 'temperature') return value.toFixed(1)
  if (metric === 'spo2' || metric === 'radiation' || metric === 'sleep')
    return value.toFixed(1)
  return String(Math.round(value))
}

export function describeAnomaly(concern: Concern): Anomaly {
  const rule = RULES[concern.metric]
  const high =
    rule.highWarn !== undefined &&
    concern.value >= rule.highWarn &&
    !(rule.lowWarn !== undefined && concern.value <= rule.lowWarn)
  const isCritical = concern.severity === 'critical'

  const copy: Record<VitalKey, { explanation: string; action: string }> = {
    heartRate: {
      explanation: high
        ? 'Heart rate is tracking above the simulated reference band, suggesting physiological strain or elevated activity.'
        : 'Heart rate is tracking below the simulated reference band, which may indicate fatigue or reduced perfusion.',
      action: high
        ? 'Schedule a rest period and confirm the reading with a manual pulse check before the next activity block.'
        : 'Check sensor contact and hydration. Escalate to the flight surgeon if the value stays low across two intervals.',
    },
    spo2: {
      explanation:
        'Peripheral oxygen saturation has dropped below the simulated reference band, a possible sign of respiratory or sensor issues.',
      action:
        'Verify sensor placement, run a controlled breathing protocol, and review supplemental oxygen readiness.',
    },
    temperature: {
      explanation: high
        ? 'Core temperature trend exceeds the simulated reference band, consistent with fever, heat stress, or physical exertion.'
        : 'Core temperature trend falls below the simulated reference band, which can indicate cold stress or measurement drift.',
      action: high
        ? 'Move to a cooling protocol, repeat the reading with a second probe, and notify the flight surgeon.'
        : 'Apply active warming and re-check the probe placement before the next monitoring interval.',
    },
    systolic: {
      explanation:
        'Systolic blood pressure exceeds the simulated reference band and warrants a controlled re-measurement.',
      action:
        'Repeat after five minutes of seated rest. Notify the flight surgeon if the elevation is sustained.',
    },
    diastolic: {
      explanation:
        'Diastolic blood pressure exceeds the simulated reference band, which can indicate cardiovascular load.',
      action:
        'Repeat after five minutes of seated rest and review fluid intake and workload.',
    },
    radiation: {
      explanation:
        'Dosimeter trend exceeds the simulated daily reference band, indicating a higher-than-planned exposure profile.',
      action:
        'Review the shelter protocol, limit non-essential exposure, and confirm dosimeter calibration.',
    },
    sleep: {
      explanation:
        'Sleep duration over the last 24 hours is below the simulated reference band, which can affect recovery and cognition.',
      action:
        'Protect the next sleep window and review workload and lighting schedules.',
    },
  }

  return {
    ...concern,
    explanation: `${isCritical ? 'Critical: ' : ''}${copy[concern.metric].explanation}`,
    action: copy[concern.metric].action,
  }
}

export function anomalySeverityLabel(severity: Severity): string {
  if (severity === 'critical') return 'Critical'
  if (severity === 'warning') return 'Warning'
  return 'Nominal'
}

export function metricUnit(metric: VitalKey): string {
  return VITAL_META[metric].unit
}
