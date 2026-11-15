export type Severity = 'nominal' | 'warning' | 'critical'

export type AlertStatus = 'active' | 'acknowledged' | 'resolved'

export type VitalKey =
  | 'heartRate'
  | 'spo2'
  | 'temperature'
  | 'systolic'
  | 'diastolic'
  | 'radiation'
  | 'sleep'

export type AlertMetric = VitalKey | 'composite'

export interface VitalReading {
  timestamp: number
  heartRate: number
  spo2: number
  temperature: number
  systolic: number
  diastolic: number
  radiation: number
  sleep: number
}

export type Vitals = Omit<VitalReading, 'timestamp'>

export interface CrewEvent {
  timestamp: number
  label: string
  detail: string
}

export interface CrewMember {
  id: string
  crewId: string
  name: string
  callSign: string
  role: string
  specialty: string
  agency: string
  bio: string
  baseline: Vitals
  events: CrewEvent[]
}

export interface AlertRecord {
  id: string
  astronautId: string
  metric: AlertMetric
  title: string
  severity: Exclude<Severity, 'nominal'>
  status: AlertStatus
  detectedAt: number
  acknowledgedAt?: number
  resolvedAt?: number
  observed: string
  reference: string
  explanation: string
  action: string
  source: 'simulation' | 'seed'
}

export interface NotificationItem {
  id: string
  alertId?: string
  title: string
  message: string
  severity: Severity
  createdAt: number
  read: boolean
}

export interface ActivityEvent {
  id: string
  timestamp: number
  title: string
  detail: string
  kind: 'system' | 'alert' | 'crew' | 'simulation'
}

export interface Concern {
  metric: VitalKey
  label: string
  severity: Severity
  value: number
  unit: string
  reference: string
}

export interface Anomaly extends Concern {
  explanation: string
  action: string
}

export interface Episode {
  metric: VitalKey
  magnitude: number
  ticksLeft: number
}

export type Theme = 'light' | 'dark'

export interface DemoSession {
  id: string
  email: string
  name: string
  remember: boolean
  signedInAt: number
}

export type ToastTone = 'default' | 'success' | 'warning' | 'critical'

export interface ToastItem {
  id: string
  message: string
  tone: ToastTone
}
