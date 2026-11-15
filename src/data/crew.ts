import type { CrewMember } from '../types'
import { MISSION_START_MINUTES } from '../utils/format'

export const CREW: CrewMember[] = [
  {
    id: 'elena-vasquez',
    crewId: 'AV-001',
    name: 'Elena Vasquez',
    callSign: 'ORION',
    role: 'Mission Commander',
    specialty: 'Flight systems & EVA',
    agency: 'Demo Crew Directorate',
    bio: 'Veteran commander on her third orbital rotation. Responsible for crew safety, EVA sequencing, and mission decision authority.',
    baseline: {
      heartRate: 71,
      spo2: 98,
      temperature: 36.6,
      systolic: 118,
      diastolic: 76,
      radiation: 1.7,
      sleep: 7.4,
    },
    events: [
      {
        timestamp: MISSION_START_MINUTES - 46,
        label: 'EVA-14 suit telemetry verified',
        detail: 'Suit integrity nominal. Oxygen pre-breathe completed at 100%.',
      },
      {
        timestamp: MISSION_START_MINUTES - 188,
        label: 'Cognitive baseline completed',
        detail: 'Reaction time and memory battery within personal reference band.',
      },
      {
        timestamp: MISSION_START_MINUTES - 320,
        label: 'Sleep cycle logged',
        detail: '7h 24m protected sleep window. Actigraphy consistent with log.',
      },
    ],
  },
  {
    id: 'marcus-chen',
    crewId: 'AV-002',
    name: 'Marcus Chen',
    callSign: 'VESPER',
    role: 'Flight Surgeon',
    specialty: 'Aerospace medicine',
    agency: 'Demo Crew Directorate',
    bio: 'Mission medical lead responsible for physiological monitoring, countermeasure planning, and crew health reporting.',
    baseline: {
      heartRate: 66,
      spo2: 97,
      temperature: 36.5,
      systolic: 122,
      diastolic: 78,
      radiation: 1.6,
      sleep: 7.1,
    },
    events: [
      {
        timestamp: MISSION_START_MINUTES - 32,
        label: 'Crew health sync complete',
        detail: 'All four crew members reporting within nominal reference bands.',
      },
      {
        timestamp: MISSION_START_MINUTES - 144,
        label: 'Countermeasure session',
        detail: 'Resistive exercise block completed. Heart rate recovery normal.',
      },
      {
        timestamp: MISSION_START_MINUTES - 410,
        label: 'SpO₂ dip reviewed',
        detail: 'Transient sensor artifact resolved after probe repositioning.',
      },
    ],
  },
  {
    id: 'aisha-rahman',
    crewId: 'AV-003',
    name: 'Aisha Rahman',
    callSign: 'KESTREL',
    role: 'Mission Specialist',
    specialty: 'Astrobiology & payloads',
    agency: 'Demo Crew Directorate',
    bio: 'Payload lead for the biological sample suite. Splits mission time between microgravity experiments and EVA support.',
    baseline: {
      heartRate: 84,
      spo2: 96,
      temperature: 37,
      systolic: 112,
      diastolic: 72,
      radiation: 1.8,
      sleep: 6.4,
    },
    events: [
      {
        timestamp: MISSION_START_MINUTES - 24,
        label: 'Sample suite activation',
        detail: 'Incubator rack powered and thermal steady-state reached.',
      },
      {
        timestamp: MISSION_START_MINUTES - 210,
        label: 'Exercise protocol',
        detail: 'Treadmill session completed with vibration isolation engaged.',
      },
      {
        timestamp: MISSION_START_MINUTES - 500,
        label: 'Rest period logged',
        detail: 'Short rest cycle recommended after elevated heart rate trend.',
      },
    ],
  },
  {
    id: 'tomas-novak',
    crewId: 'AV-004',
    name: 'Tomas Novak',
    callSign: 'ATLAS',
    role: 'Systems Engineer',
    specialty: 'ECLSS & power',
    agency: 'Demo Crew Directorate',
    bio: 'Responsible for life support, power distribution, and thermal control loops. Certified EVA maintenance specialist.',
    baseline: {
      heartRate: 78,
      spo2: 98,
      temperature: 36.4,
      systolic: 126,
      diastolic: 80,
      radiation: 2.1,
      sleep: 6.8,
    },
    events: [
      {
        timestamp: MISSION_START_MINUTES - 18,
        label: 'Dosimeter calibration',
        detail: 'Personal dosimeter recalibrated against the cabin reference sensor.',
      },
      {
        timestamp: MISSION_START_MINUTES - 165,
        label: 'ECLSS loop inspection',
        detail: 'CO₂ scrubber efficiency confirmed within operational limits.',
      },
      {
        timestamp: MISSION_START_MINUTES - 380,
        label: 'Radiation survey',
        detail: 'Cabin survey completed. Localized shelter zone mapped.',
      },
    ],
  },
]

export const crewById = (id: string): CrewMember | undefined =>
  CREW.find((member) => member.id === id)
