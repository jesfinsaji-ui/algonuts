import { AlertTriangle, CheckCircle2, Info, X, XCircle } from 'lucide-react'
import type { ToastTone } from '../../types'
import { useUIStore } from '../../store/useUIStore'

const TONE_STYLES: Record<
  ToastTone,
  { border: string; icon: typeof Info; iconClass: string }
> = {
  default: { border: 'var(--line)', icon: Info, iconClass: 'text-muted' },
  success: { border: 'var(--ok)', icon: CheckCircle2, iconClass: 'text-ok' },
  warning: { border: 'var(--warn)', icon: AlertTriangle, iconClass: 'text-warn' },
  critical: { border: 'var(--crit)', icon: XCircle, iconClass: 'text-crit' },
}

export function ToastViewport() {
  const toasts = useUIStore((state) => state.toasts)
  const dismissToast = useUIStore((state) => state.dismissToast)

  return (
    <div
      aria-live="polite"
      aria-atomic="false"
      className="pointer-events-none fixed bottom-4 right-4 z-[100] flex w-[calc(100vw-2rem)] max-w-sm flex-col gap-2"
    >
      {toasts.map((toast) => {
        const style = TONE_STYLES[toast.tone]
        const Icon = style.icon
        return (
          <div
            key={toast.id}
            className="pointer-events-auto flex animate-toast-in items-start gap-3 border border-line bg-surface p-3 shadow-soft"
            style={{ borderLeft: `3px solid ${style.border}` }}
          >
            <Icon size={16} className={style.iconClass} strokeWidth={1.8} />
            <p className="flex-1 pt-0.5 text-xs leading-relaxed text-ink">
              {toast.message}
            </p>
            <button
              type="button"
              onClick={() => dismissToast(toast.id)}
              aria-label="Dismiss notification"
              className="text-muted transition-colors hover:text-ink"
            >
              <X size={14} />
            </button>
          </div>
        )
      })}
    </div>
  )
}
