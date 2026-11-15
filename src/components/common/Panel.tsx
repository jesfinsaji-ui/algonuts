import type { ReactNode } from 'react'
import { cn } from '../../utils/cn'
import { SectionLabel } from './SectionLabel'

interface PanelProps {
  children: ReactNode
  title?: string
  index?: string
  actions?: ReactNode
  className?: string
  bodyClassName?: string
}

export function Panel({
  children,
  title,
  index,
  actions,
  className,
  bodyClassName,
}: PanelProps) {
  return (
    <section
      className={cn(
        'flex min-w-0 flex-col border border-line bg-surface',
        className,
      )}
    >
      {title && (
        <header className="flex min-h-[52px] min-w-0 flex-wrap items-center justify-between gap-3 border-b border-line px-4 py-3 sm:px-5">
          <SectionLabel index={index}>{title}</SectionLabel>
          {actions && (
            <div className="flex min-w-0 flex-wrap items-center gap-2">
              {actions}
            </div>
          )}
        </header>
      )}
      <div className={cn('min-w-0 flex-1', bodyClassName ?? 'p-4 sm:p-5')}>
        {children}
      </div>
    </section>
  )
}
