import { useId } from 'react'
import type { CrewMember } from '../../types'
import { cn } from '../../utils/cn'

interface AstronautPortraitProps {
  crew: CrewMember
  className?: string
  live?: boolean
}

export function AstronautPortrait({
  crew,
  className,
  live = true,
}: AstronautPortraitProps) {
  const gridId = useId().replace(/:/g, '')
  const visorId = useId().replace(/:/g, '')

  return (
    <div
      className={cn(
        'relative overflow-hidden border border-line bg-surface2',
        className,
      )}
    >
      <svg
        viewBox="0 0 220 264"
        className="h-full w-full"
        role="img"
        aria-label={`Stylized mission portrait of ${crew.name}`}
      >
        <defs>
          <pattern
            id={gridId}
            width="22"
            height="22"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M22 0H0V22"
              fill="none"
              stroke="var(--line)"
              strokeWidth="0.6"
            />
          </pattern>
          <linearGradient id={visorId} x1="0" y1="0" x2="0.8" y2="1">
            <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.95" />
            <stop offset="100%" stopColor="var(--accent)" stopOpacity="0.62" />
          </linearGradient>
        </defs>

        <rect width="220" height="264" fill="var(--surface-2)" />
        <rect width="220" height="264" fill={`url(#${gridId})`} />

        <path
          d="M14 34V14h20M186 14h20v20M206 230v20h-20M34 250H14v-20"
          fill="none"
          stroke="var(--muted)"
          strokeWidth="1"
          opacity="0.55"
        />

        <text
          x="18"
          y="30"
          fill="var(--muted)"
          style={{
            fontSize: 7.5,
            letterSpacing: '0.18em',
            fontFamily: 'JetBrains Mono',
          }}
        >
          {crew.callSign}
        </text>
        <text
          x="202"
          y="30"
          textAnchor="end"
          fill="var(--muted)"
          style={{
            fontSize: 7.5,
            letterSpacing: '0.18em',
            fontFamily: 'JetBrains Mono',
          }}
        >
          {crew.crewId}
        </text>

        <path
          d="M22 264c6-52 39-74 88-74s82 22 88 74z"
          fill="var(--ink)"
          opacity="0.92"
        />
        <path
          d="M110 190v-20"
          stroke="var(--surface)"
          strokeWidth="22"
          strokeLinecap="butt"
          opacity="0.25"
        />

        <circle
          cx="110"
          cy="116"
          r="66"
          fill="var(--surface)"
          stroke="var(--ink)"
          strokeWidth="1.3"
        />
        <circle
          cx="110"
          cy="116"
          r="58"
          fill="none"
          stroke="var(--line)"
          strokeWidth="0.8"
        />
        <ellipse
          cx="110"
          cy="118"
          rx="47"
          ry="38"
          fill={`url(#${visorId})`}
          stroke="var(--ink)"
          strokeWidth="1.2"
        />
        <path
          d="M78 106c10-12 25-18 40-16"
          fill="none"
          stroke="#FFFFFF"
          strokeOpacity="0.6"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M76 132h68"
          stroke="#FFFFFF"
          strokeOpacity="0.22"
          strokeWidth="0.8"
        />
        <circle cx="110" cy="55" r="2.4" fill="var(--accent)" />
        <circle
          cx="110"
          cy="55"
          r="6"
          fill="none"
          stroke="var(--accent)"
          strokeOpacity="0.35"
          strokeWidth="0.8"
        />
        <path
          d="M47 116h-9M182 116h-9M110 46v-9M110 195v-9"
          stroke="var(--muted)"
          strokeWidth="0.7"
          opacity="0.65"
        />
      </svg>

      {live && (
        <span className="absolute bottom-2.5 left-1/2 flex -translate-x-1/2 items-center gap-1.5 border border-white/20 bg-black/60 px-2 py-1 font-mono text-[8px] uppercase tracking-[0.2em] text-white backdrop-blur-sm">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-70" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-accent" />
          </span>
          Live
        </span>
      )}
    </div>
  )
}
