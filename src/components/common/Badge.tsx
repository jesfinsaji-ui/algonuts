import type { ReactNode } from 'react'
import { cn } from '../../utils/cn'

export type BadgeTone =
  | 'nominal'
  | 'warning'
  | 'critical'
  | 'active'
  | 'acknowledged'
  | 'resolved'
  | 'accent'
  | 'neutral'

const TONES: Record<BadgeTone, string> = {
  nominal: 'border-line bg-surface2 text-muted',
  warning: 'border-warn bg-transparent text-warn',
  critical: 'border-crit bg-accentsoft text-crit',
  active: 'border-accent bg-transparent text-accent',
  acknowledged: 'border-line bg-surface2 text-ink',
  resolved: 'border-line bg-transparent text-muted',
  accent: 'border-accent bg-accent text-white',
  neutral: 'border-line bg-transparent text-ink',
}

interface BadgeProps {
  tone?: BadgeTone
  children: ReactNode
  className?: string
  dot?: boolean
}

export function Badge({
  tone = 'neutral',
  children,
  className,
  dot = false,
}: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 border px-2 py-1 font-mono text-[9px] font-medium uppercase tracking-[0.16em]',
        TONES[tone],
        className,
      )}
    >
      {dot && (
        <span
          className={cn(
            'h-1.5 w-1.5 rounded-full',
            tone === 'critical'
              ? 'bg-crit'
              : tone === 'warning'
                ? 'bg-warn'
                : tone === 'accent'
                  ? 'bg-white'
                  : 'bg-ok',
          )}
        />
      )}
      {children}
    </span>
  )
}
