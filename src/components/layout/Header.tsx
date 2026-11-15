import {
  Bell,
  CheckCheck,
  LogOut,
  Menu,
  Moon,
  Sun,
} from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useTheme } from '../../context/useTheme'
import { useAuthStore } from '../../store/useAuthStore'
import { useSimulationStore } from '../../store/useSimulationStore'
import { useUIStore } from '../../store/useUIStore'
import { cn } from '../../utils/cn'
import { formatAgo, formatMET } from '../../utils/format'
import { getPageTitle } from './navItems'
import { StatusDot } from '../common/StatusDot'

export function Header({ onOpenMenu }: { onOpenMenu: () => void }) {
  const location = useLocation()
  const navigate = useNavigate()
  const { theme, toggleTheme } = useTheme()
  const { pathname } = location

  const signOut = useAuthStore((state) => state.signOut)
  const running = useSimulationStore((state) => state.running)
  const missionMinutes = useSimulationStore((state) => state.missionMinutes)
  const notifications = useSimulationStore((state) => state.notifications)
  const toggleSimulation = useSimulationStore((state) => state.toggle)
  const markNotificationRead = useSimulationStore(
    (state) => state.markNotificationRead,
  )
  const markAllNotificationsRead = useSimulationStore(
    (state) => state.markAllNotificationsRead,
  )
  const addToast = useUIStore((state) => state.addToast)

  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const notificationsRef = useRef<HTMLDivElement>(null)

  const unread = notifications.filter((item) => !item.read).length

  useEffect(() => {
    if (!notificationsOpen) return
    const handler = (event: MouseEvent) => {
      if (
        notificationsRef.current &&
        !notificationsRef.current.contains(event.target as Node)
      ) {
        setNotificationsOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [notificationsOpen])

  const handleSimulationToggle = () => {
    toggleSimulation()
    addToast(
      running
        ? 'Simulation paused. Telemetry values are frozen.'
        : 'Simulation resumed. Telemetry stream is live.',
      running ? 'warning' : 'success',
    )
  }

  const handleSignOut = () => {
    signOut()
    addToast('Demo session closed. You are signed out.', 'warning')
    navigate('/login', { replace: true })
  }

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-bg/95 backdrop-blur">
      <div className="flex h-[74px] items-center gap-3 px-4 sm:gap-4 sm:px-6 lg:px-10">
        <button
          type="button"
          onClick={onOpenMenu}
          className="flex h-9 w-9 items-center justify-center border border-line text-ink transition-colors hover:border-ink lg:hidden"
          aria-label="Open navigation"
        >
          <Menu size={17} />
        </button>

        <div className="min-w-0">
          <div className="label hidden sm:block">AstroVital / Mission Control</div>
          <div className="mt-1 truncate font-display text-[15px] font-semibold tracking-[-0.01em] sm:text-base">
            {getPageTitle(pathname)}
          </div>
        </div>

        <div className="ml-auto flex items-center gap-2 sm:gap-3">
          <div className="hidden flex-col items-end xl:flex">
            <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-muted">
              Artemis Demo Mission
            </span>
            <span className="mt-1 font-mono text-[11px] tabular-nums text-ink">
              MET {formatMET(missionMinutes)}
            </span>
          </div>

          <div className="hidden h-8 w-px bg-line xl:block" />

          <button
            type="button"
            onClick={handleSimulationToggle}
            className={cn(
              'inline-flex h-9 items-center gap-2 border px-2.5 font-mono text-[9px] uppercase tracking-[0.16em] transition-colors',
              running
                ? 'border-line text-muted hover:border-ink hover:text-ink'
                : 'border-warn text-warn',
            )}
            aria-label={running ? 'Pause simulation' : 'Resume simulation'}
          >
            <StatusDot severity={running ? 'nominal' : 'warning'} pulse={false} />
            <span className="hidden sm:inline">
              {running ? 'Sim live' : 'Paused'}
            </span>
          </button>

          <div className="relative" ref={notificationsRef}>
            <button
              type="button"
              onClick={() => setNotificationsOpen((open) => !open)}
              className="relative flex h-9 w-9 items-center justify-center border border-line text-ink transition-colors hover:border-ink"
              aria-label={`Notifications${unread ? `, ${unread} unread` : ''}`}
              aria-expanded={notificationsOpen}
            >
              <Bell size={16} strokeWidth={1.7} />
              {unread > 0 && (
                <span className="absolute -right-1.5 -top-1.5 flex h-4 min-w-[16px] items-center justify-center bg-accent px-1 font-mono text-[8px] leading-none text-white">
                  {unread}
                </span>
              )}
            </button>

            {notificationsOpen && (
              <div className="absolute right-0 top-[calc(100%+10px)] w-[min(330px,calc(100vw-2rem))] animate-fade-in border border-line bg-surface shadow-soft">
                <div className="flex items-center justify-between border-b border-line px-4 py-3">
                  <span className="label">Notifications</span>
                  <button
                    type="button"
                    onClick={markAllNotificationsRead}
                    className="inline-flex items-center gap-1 font-mono text-[9px] uppercase tracking-[0.14em] text-accent transition-opacity hover:opacity-70"
                  >
                    <CheckCheck size={12} />
                    Mark all read
                  </button>
                </div>
                <div className="max-h-[360px] overflow-y-auto">
                  {notifications.length === 0 && (
                    <p className="px-4 py-8 text-center text-xs text-muted">
                      No notifications.
                    </p>
                  )}
                  {notifications.slice(0, 8).map((item) => (
                    <Link
                      key={item.id}
                      to="/alerts"
                      onClick={() => {
                        markNotificationRead(item.id)
                        setNotificationsOpen(false)
                      }}
                      className={cn(
                        'flex gap-3 border-b border-line px-4 py-3 transition-colors last:border-b-0 hover:bg-surface2',
                        !item.read && 'bg-surface2/60',
                      )}
                    >
                      <span className="mt-1.5">
                        <StatusDot severity={item.severity} pulse={false} />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center justify-between gap-2">
                          <span
                            className={cn(
                              'truncate text-xs font-medium',
                              item.read ? 'text-muted' : 'text-ink',
                            )}
                          >
                            {item.title}
                          </span>
                          <span className="shrink-0 font-mono text-[8px] uppercase tracking-[0.1em] text-muted">
                            {formatAgo(missionMinutes - item.createdAt)}
                          </span>
                        </span>
                        <span className="mt-1 block text-[11px] leading-snug text-muted">
                          {item.message}
                        </span>
                      </span>
                    </Link>
                  ))}
                </div>
                <Link
                  to="/alerts"
                  className="block border-t border-line px-4 py-3 text-center font-mono text-[9px] uppercase tracking-[0.18em] text-ink transition-colors hover:bg-surface2"
                >
                  View all alerts
                </Link>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={toggleTheme}
            className="flex h-9 w-9 items-center justify-center border border-line text-ink transition-colors hover:border-ink"
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            {theme === 'dark' ? (
              <Sun size={16} strokeWidth={1.7} />
            ) : (
              <Moon size={16} strokeWidth={1.7} />
            )}
          </button>

          <div className="hidden h-8 w-px bg-line sm:block" />

          <button
            type="button"
            onClick={handleSignOut}
            className="flex h-9 w-9 items-center justify-center border border-line text-muted transition-colors hover:border-crit hover:text-crit"
            aria-label="Sign out of demo session"
            title="Sign out"
          >
            <LogOut size={16} strokeWidth={1.7} />
          </button>
        </div>
      </div>
    </header>
  )
}
