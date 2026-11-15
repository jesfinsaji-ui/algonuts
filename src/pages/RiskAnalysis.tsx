import { ScanSearch, ShieldAlert } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Badge } from '../components/common/Badge'
import { Button } from '../components/common/Button'
import { PageHeader } from '../components/common/PageHeader'
import { Panel } from '../components/common/Panel'
import { StatusDot } from '../components/common/StatusDot'
import { RiskGauge } from '../components/charts/RiskGauge'
import { CREW } from '../data/crew'
import { useSimulationStore } from '../store/useSimulationStore'
import { useUIStore } from '../store/useUIStore'
import type { Anomaly } from '../types'
import { cn } from '../utils/cn'
import { formatClock, formatMET } from '../utils/format'
import {
  aggregateRisk,
  analyzeReading,
  riskLabel,
  riskLevel,
  riskScore,
  type RiskLevel,
} from '../utils/risk'
import { latestReading, VITAL_META } from '../utils/vitals'

const LEVEL_COLOR: Record<RiskLevel, string> = {
  low: 'var(--ok)',
  moderate: 'var(--warn)',
  elevated: 'var(--accent)',
  high: 'var(--crit)',
}

const LEVEL_TONE: Record<RiskLevel, 'nominal' | 'warning' | 'critical'> = {
  low: 'nominal',
  moderate: 'warning',
  elevated: 'warning',
  high: 'critical',
}

function AnomalyRow({ anomaly }: { anomaly: Anomaly }) {
  return (
    <div className="border-b border-line py-4 first:pt-0 last:border-b-0 last:pb-0">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-[13px] font-medium">{anomaly.label}</span>
        <Badge
          tone={anomaly.severity === 'critical' ? 'critical' : 'warning'}
        >
          {anomaly.severity}
        </Badge>
      </div>
      <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-[9px] uppercase tracking-[0.1em] text-muted">
        <span className="text-ink">
          Observed {anomaly.value.toFixed(anomaly.metric === 'temperature' ? 1 : 0)}{' '}
          {VITAL_META[anomaly.metric].unit}
        </span>
        <span>·</span>
        <span>Ref {anomaly.reference}</span>
      </div>
      <p className="mt-2.5 text-[11.5px] leading-relaxed text-muted">
        {anomaly.explanation}
      </p>
      <p className="mt-2.5 border-l-2 border-accent pl-2.5 text-[11.5px] leading-relaxed text-ink">
        <span className="label mr-2 inline-block">Human review</span>
        {anomaly.action}
      </p>
    </div>
  )
}

export function RiskAnalysis() {
  const readings = useSimulationStore((state) => state.readings)
  const missionMinutes = useSimulationStore((state) => state.missionMinutes)
  const addToast = useUIStore((state) => state.addToast)
  const [lastRun, setLastRun] = useState(missionMinutes)

  const analyses = useMemo(
    () =>
      CREW.map((member) => {
        const latest = latestReading(readings[member.id])
        const anomalies = analyzeReading(latest)
        const score = riskScore(anomalies)
        return {
          member,
          latest,
          anomalies,
          score,
          level: riskLevel(score),
        }
      }),
    [readings],
  )

  const aggregate = useMemo(() => aggregateRisk(analyses), [analyses])

  const handleRerun = () => {
    setLastRun(missionMinutes)
    addToast(
      'Rule-based anomaly pass complete. Results refreshed from the latest simulated readings.',
      'success',
    )
  }

  return (
    <div>
      <PageHeader
        eyebrow="AI risk analysis / rule-based demo"
        title="Anomaly watch."
        description="A transparent, rule-based scan of the latest simulated vitals. Each finding pairs an observed value with a reference band, a plain-language explanation, and a suggested action for human review."
        actions={
          <Button
            variant="outline"
            size="sm"
            icon={<ScanSearch size={13} />}
            onClick={handleRerun}
          >
            Re-run analysis
          </Button>
        }
      />

      <div className="mb-6 flex items-start gap-3 border border-warn/60 bg-accentsoft p-4">
        <ShieldAlert
          size={18}
          className="mt-0.5 shrink-0 text-crit"
          strokeWidth={1.7}
        />
        <div>
          <div className="font-mono text-[9px] uppercase tracking-[0.18em] text-crit">
            Demonstration only
          </div>
          <p className="mt-1.5 text-[11.5px] leading-relaxed text-muted">
            This page does not run a machine-learning model or a medical
            diagnosis. Findings come from deterministic threshold rules applied
            to simulated readings. AstroVital is a hackathon concept and is not
            affiliated with NASA.
          </p>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[340px_minmax(0,1fr)]">
        <Panel
          title="Overall risk classification"
          index="02"
          bodyClassName="p-5 sm:p-6"
        >
          <RiskGauge score={aggregate.score} level={aggregate.level} />
          <div className="mt-5 grid grid-cols-2 gap-px border border-line bg-line">
            <div className="bg-surface p-3">
              <div className="label">Crew flagged</div>
              <div className="mt-1.5 numeric text-2xl">
                {aggregate.flagged}
                <span className="ml-1 font-mono text-[10px] text-muted">/ 4</span>
              </div>
            </div>
            <div className="bg-surface p-3">
              <div className="label">Critical findings</div>
              <div
                className={cn(
                  'mt-1.5 numeric text-2xl',
                  aggregate.critical ? 'text-crit' : 'text-ink',
                )}
              >
                {aggregate.critical}
              </div>
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between font-mono text-[8.5px] uppercase tracking-[0.14em] text-muted">
            <span>Last pass · MET {formatClock(lastRun)}</span>
            <span className="flex items-center gap-1.5">
              <StatusDot severity={aggregate.level === 'high' ? 'critical' : 'nominal'} pulse={false} />
              Auto-refresh
            </span>
          </div>
          <p className="mt-4 border-t border-line pt-3 font-mono text-[8px] uppercase leading-relaxed tracking-[0.14em] text-muted">
            28 channels scanned · 4 crew × 7 vitals · deterministic thresholds
          </p>
        </Panel>

        <Panel
          title="Crew risk ranking"
          index="03"
          bodyClassName="p-4 sm:p-5"
          actions={<span className="label">Higher score = more review</span>}
        >
          <ul>
            {[...analyses]
              .sort((a, b) => b.score - a.score)
              .map((analysis) => (
                <li
                  key={analysis.member.id}
                  className="border-b border-line py-3 first:pt-0 last:border-b-0 last:pb-0"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <Link
                        to={`/crew/${analysis.member.id}`}
                        className="truncate text-[13px] font-medium transition-colors hover:text-accent"
                      >
                        {analysis.member.name}
                      </Link>
                      <div className="mt-0.5 font-mono text-[8.5px] uppercase tracking-[0.12em] text-muted">
                        {analysis.member.role} ·{' '}
                        {analysis.anomalies.length === 0
                          ? 'no anomalies'
                          : `${analysis.anomalies.length} finding${analysis.anomalies.length > 1 ? 's' : ''}`}
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-3">
                      <span className="font-mono text-[10px] tabular-nums text-muted">
                        {analysis.score}/100
                      </span>
                      <Badge tone={LEVEL_TONE[analysis.level]}>
                        {riskLabel(analysis.level)}
                      </Badge>
                    </div>
                  </div>
                  <div className="mt-2.5 h-1 w-full bg-surface2">
                    <div
                      className="h-full transition-all duration-500"
                      style={{
                        width: `${Math.max(3, analysis.score)}%`,
                        background: LEVEL_COLOR[analysis.level],
                      }}
                    />
                  </div>
                </li>
              ))}
          </ul>
        </Panel>
      </div>

      <div className="mt-8 mb-3 flex flex-wrap items-center justify-between gap-2">
        <span className="label">Detected anomalies by crew member</span>
        <span className="label">Simulated · Rule-based</span>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        {analyses.map((analysis) => (
          <Panel
            key={analysis.member.id}
            title={analysis.member.name}
            bodyClassName="p-4 sm:p-5"
            actions={
              <Badge tone={LEVEL_TONE[analysis.level]}>
                {riskLabel(analysis.level)} · {analysis.score}
              </Badge>
            }
          >
            <div className="mb-4 flex items-center justify-between gap-3 border-b border-line pb-3">
              <span className="font-mono text-[8.5px] uppercase tracking-[0.14em] text-muted">
                {analysis.member.crewId} · {analysis.member.callSign} ·{' '}
                {analysis.member.role}
              </span>
              <Link
                to={`/crew/${analysis.member.id}`}
                className="font-mono text-[8.5px] uppercase tracking-[0.14em] text-accent transition-opacity hover:opacity-70"
              >
                Profile
              </Link>
            </div>

            {analysis.anomalies.length === 0 ? (
              <div className="flex items-center gap-3 border border-dashed border-line px-4 py-6">
                <StatusDot severity="nominal" pulse={false} />
                <div>
                  <p className="text-xs font-medium">
                    No anomalies above reference bands
                  </p>
                  <p className="mt-1 text-[11px] text-muted">
                    Continue routine monitoring. Next pass runs automatically
                    with telemetry.
                  </p>
                </div>
              </div>
            ) : (
              <div>
                {analysis.anomalies.map((anomaly) => (
                  <AnomalyRow key={anomaly.metric} anomaly={anomaly} />
                ))}
              </div>
            )}
          </Panel>
        ))}
      </div>

      <p className="mt-6 font-mono text-[8.5px] uppercase leading-relaxed tracking-[0.14em] text-muted">
        Overall risk index is a demonstration heuristic: 18 points per warning,
        42 per critical finding, normalised to 100. It is not a clinical score.
        <span className="ml-2 text-accent">
          Mission elapsed {formatMET(missionMinutes)}
        </span>
      </p>
    </div>
  )
}
