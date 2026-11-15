import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from '../../utils/cn'

type Variant = 'primary' | 'outline' | 'accent' | 'ghost' | 'danger'

const VARIANTS: Record<Variant, string> = {
  primary:
    'border-ink bg-ink text-bg hover:border-accent hover:bg-accent hover:text-white',
  outline:
    'border-line bg-transparent text-ink hover:border-ink hover:bg-surface2',
  accent:
    'border-accent bg-accent text-white hover:border-ink hover:bg-ink hover:text-bg',
  ghost:
    'border-transparent bg-transparent text-muted hover:text-ink',
  danger:
    'border-crit bg-transparent text-crit hover:bg-crit hover:text-white',
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: 'sm' | 'md'
  icon?: ReactNode
}

export function Button({
  variant = 'outline',
  size = 'md',
  icon,
  className,
  children,
  type = 'button',
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        'inline-flex items-center justify-center gap-2 border font-mono font-medium uppercase tracking-[0.14em] transition-colors duration-200 disabled:pointer-events-none disabled:opacity-40',
        size === 'sm' ? 'px-3 py-1.5 text-[10px]' : 'px-4 py-2.5 text-[11px]',
        VARIANTS[variant],
        className,
      )}
      {...rest}
    >
      {icon}
      {children}
    </button>
  )
}
