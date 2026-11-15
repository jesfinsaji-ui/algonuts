import type { ReactNode } from 'react'
import { cn } from '../../utils/cn'

interface SectionLabelProps {
  children: ReactNode
  index?: string
  className?: string
}

export function SectionLabel({ children, index, className }: SectionLabelProps) {
  return (
    <div
      className={cn(
        'flex items-center gap-2 font-mono text-[10px] font-medium uppercase leading-none tracking-[0.2em] text-muted',
        className,
      )}
    >
      {index && <span className="text-accent">{index}</span>}
      <span>{children}</span>
    </div>
  )
}
