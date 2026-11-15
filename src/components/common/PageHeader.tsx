import type { ReactNode } from 'react'

interface PageHeaderProps {
  eyebrow: string
  title: ReactNode
  description?: ReactNode
  actions?: ReactNode
}

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
}: PageHeaderProps) {
  return (
    <section className="mb-8 flex flex-col gap-6 border-b border-line pb-7 lg:flex-row lg:items-end lg:justify-between">
      <div>
        <div className="label">{eyebrow}</div>
        <h1 className="mt-3 font-display text-[34px] font-semibold leading-[0.95] tracking-[-0.03em] sm:text-[46px]">
          {title}
        </h1>
        {description && (
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted">
            {description}
          </p>
        )}
      </div>
      {actions && (
        <div className="flex flex-wrap items-center gap-2">{actions}</div>
      )}
    </section>
  )
}
