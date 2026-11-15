import type {
  ActivityEvent,
  AlertRecord,
  NotificationItem,
} from '../types'
import { MISSION_START_MINUTES } from '../utils/format'

const now = MISSION_START_MINUTES

export function createSeedAlerts(): AlertRecord[] {
  return [
    {
      id: 'ALT-2187',
      astronautId: 'tomas-novak',
      metric: 'radiation',
      title: 'Elevated radiation exposure',
      severity: 'warning',
      status: 'active',
      detectedAt: now - 14,
      observed: '3.1 mSv/day',
      reference: '≤ 2.5 mSv/day',
      explanation:
        'Dosimeter trend exceeds the simulated daily reference band during the current orbital segment.',
      action:
        'Review shelter protocol, limit non-essential exposure, and confirm dosimeter calibration.',
      source: 'seed',
    },
    {
      id: 'ALT-2186',
      astronautId: 'aisha-rahman',
      metric: 'heartRate',
      title: 'Sustained elevated heart rate',
      severity: 'warning',
      status: 'active',
      detectedAt: now - 26,
      observed: '116 bpm',
      reference: '50–110 bpm',
      explanation:
        'Heart rate has remained above the simulated reference band across two consecutive monitoring intervals.',
      action:
        'Schedule a rest period, confirm with a manual pulse check, and re-evaluate in 10 minutes.',
      source: 'seed',
    },
    {
      id: 'ALT-2185',
      astronautId: 'marcus-chen',
      metric: 'spo2',
      title: 'Transient SpO₂ dip',
      severity: 'warning',
      status: 'resolved',
      detectedAt: now - 96,
      acknowledgedAt: now - 88,
      resolvedAt: now - 72,
      observed: '93%',
      reference: '94–100%',
      explanation:
        'A short oxygen saturation dip was recorded after a probe repositioning event.',
      action:
        'Sensor re-seated. Recovery confirmed across three consecutive readings.',
      source: 'seed',
    },
    {
      id: 'ALT-2184',
      astronautId: 'elena-vasquez',
      metric: 'sleep',
      title: 'Reduced sleep duration',
      severity: 'warning',
      status: 'resolved',
      detectedAt: now - 258,
      acknowledgedAt: now - 240,
      resolvedAt: now - 184,
      observed: '5.8 h',
      reference: '≥ 6.0 h',
      explanation:
        'Actigraphy recorded a short sleep window during a high-workload EVA preparation block.',
      action:
        'Protected sleep window scheduled. Duration restored above the reference band.',
      source: 'seed',
    },
    {
      id: 'ALT-2183',
      astronautId: 'aisha-rahman',
      metric: 'temperature',
      title: 'Core temperature excursion',
      severity: 'critical',
      status: 'resolved',
      detectedAt: now - 412,
      acknowledgedAt: now - 405,
      resolvedAt: now - 372,
      observed: '38.6 °C',
      reference: '35.5–37.6 °C',
      explanation:
        'Temperature excursion recorded after a high-intensity exercise block. Cooling protocol initiated.',
      action:
        'Crew member cooled and reassessed. Temperature returned to the simulated reference band.',
      source: 'seed',
    },
  ]
}

export function createSeedNotifications(): NotificationItem[] {
  return [
    {
      id: 'NTF-901',
      alertId: 'ALT-2187',
      title: 'Radiation exposure warning',
      message: 'Tomas Novak · dosimeter above daily reference band.',
      severity: 'warning',
      createdAt: now - 14,
      read: false,
    },
    {
      id: 'NTF-900',
      alertId: 'ALT-2186',
      title: 'Heart rate warning',
      message: 'Aisha Rahman · sustained reading above 110 bpm.',
      severity: 'warning',
      createdAt: now - 26,
      read: false,
    },
    {
      id: 'NTF-899',
      alertId: 'ALT-2185',
      title: 'SpO₂ alert resolved',
      message: 'Marcus Chen · saturation returned to the reference band.',
      severity: 'nominal',
      createdAt: now - 72,
      read: true,
    },
  ]
}

export function createSeedActivity(): ActivityEvent[] {
  return [
    {
      id: 'ACT-501',
      timestamp: now - 2,
      title: 'Telemetry link established',
      detail: 'Four crew channels streaming at 1 Hz (simulated).',
      kind: 'system',
    },
    {
      id: 'ACT-502',
      timestamp: now - 14,
      title: 'Alert raised — radiation exposure',
      detail: 'Tomas Novak · warning · dosimeter trend above reference.',
      kind: 'alert',
    },
    {
      id: 'ACT-503',
      timestamp: now - 41,
      title: 'Dose calibration complete',
      detail: 'Personal dosimeters synchronized with cabin reference sensor.',
      kind: 'system',
    },
    {
      id: 'ACT-504',
      timestamp: now - 58,
      title: 'Crew rest cycle started',
      detail: 'Protected sleep window logged for two crew members.',
      kind: 'crew',
    },
    {
      id: 'ACT-505',
      timestamp: now - 119,
      title: 'Simulation clock synchronized',
      detail: 'Mission elapsed time aligned to the demo reference clock.',
      kind: 'simulation',
    },
  ]
}
