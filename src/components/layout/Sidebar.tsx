import { Crosshair, LogOut, Pause, Play, X } from 'lucide-react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/useAuthStore'
import { useSimulationStore } from '../../store/useSimulationStore'
import { useUIStore } from '../../store/useUIStore'
import { cn } from '../../utils/cn'
import { formatMET } from '../../utils/format'
import { NAV_ITEMS } from './navItems'

interface SidebarContentProps {
  onNavigate?: () => void
}

function SidebarContent({ onNavigate }: SidebarContentProps) {
  const navigate = useNavigate()
  const session = useAuthStore((state) => state.session)
  const signOut = useAuthStore((state) => state.signOut)
  const running = useSimulationStore((state) => state.running)
  const missionMinutes = useSimulationStore((state) => state.missionMinutes)
  const openAlerts = useSimulationStore(
    (state) => state.alerts.filter((alert) => alert.status !== 'resolved').length,
  )
  const toggle = useSimulationStore((state) => state.toggle)
  const setSidebarOpen = useUIStore((state) => state.setSidebarOpen)

  return (
    <>
      <div className="flex items-center justify-between border-b border-line px-5 py-5">
        <Link to="/" onClick={onNavigate} className="flex items-center gap-3">
          <span className="relative flex h-9 w-9 items-center justify-center bg-ink">
            <span className="absolute inset-[5px] border border-accent" />
            <Crosshair size={15} className="text-accent" strokeWidth={1.8} />
          </span>
          <span>
            <span className="block font-display text-[17px] font-bold leading-none tracking-[-0.02em]">
              ASTROVITAL
            </span>
            <span className="mt-1 block font-mono text-[7.5px] uppercase tracking-[0.22em] text-muted">
              Crew health system
            </span>
          </span>
        </Link>
        <button
          type="button"
          onClick={() => setSidebarOpen(false)}
          className="text-muted transition-colors hover:text-ink lg:hidden"
          aria-label="Close navigation"
        >
          <X size={18} />
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto py-4" aria-label="Primary">
        <div className="label px-5 pb-3">Mission Control</div>
        <ul>
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon
            return (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  end={item.to === '/'}
                  onClick={onNavigate}
                  className={({ isActive }) =>
                    cn(
                      'group flex items-center gap-3 border-l-2 py-2.5 pl-5 pr-4 transition-colors',
                      isActive
                        ? 'border-accent bg-surface text-ink'
                        : 'border-transparent text-muted hover:bg-surface/70 hover:text-ink',
                    )
                  }
                >
                  {({ isActive }) => (
                    <>
                      <span
                        className={cn(
                          'font-mono text-[9px] tracking-[0.16em]',
                          isActive ? 'text-accent' : 'text-muted/70',
                        )}
                      >
                        {item.index}
                      </span>
                      <Icon size={15} strokeWidth={1.7} />
                      <span className="flex-1 text-[12.5px] font-medium tracking-[0.01em]">
                        {item.label}
                      </span>
                      {item.to === '/alerts' && openAlerts > 0 && (
                        <span className="border border-accent px-1.5 py-0.5 font-mono text-[9px] leading-none text-accent">
                          {openAlerts}
                        </span>
                      )}
                    </>
                  )}
                </NavLink>
              </li>
            )
          })}
        </ul>
      </nav>

      <div className="border-t border-line p-4">
        <div className="border border-line bg-surface p-3">
          <div className="flex items-center justify-between">
            <span className="label">Simulation</span>
            <span className="flex items-center gap-1.5">
              <span
                className={cn(
                  'h-1.5 w-1.5 rounded-full',
                  running ? 'animate-pulse bg-ok' : 'bg-warn',
                )}
              />
              <span className="font-mono text-[9px] uppercase tracking-[0.16em] text-muted">
                {running ? 'Live' : 'Paused'}
              </span>
            </span>
          </div>
          <div className="mt-2 font-mono text-[11px] tabular-nums text-ink">
            {formatMET(missionMinutes)}
          </div>
          <div className="mt-3 flex items-center justify-between">
            <button
              type="button"
              onClick={toggle}
              className="inline-flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-[0.16em] text-muted transition-colors hover:text-ink"
            >
              {running ? <Pause size={11} /> : <Play size={11} />}
              {running ? 'Pause' : 'Resume'}
            </button>
            <Link
              to="/settings"
              onClick={onNavigate}
              className="font-mono text-[9px] uppercase tracking-[0.16em] text-accent transition-opacity hover:opacity-70"
            >
              Controls
            </Link>
          </div>
        </div>

        <div className="mt-3 border border-line bg-surface p-3">
          <div className="flex items-center justify-between gap-2">
            <span className="label">Operator</span>
            <span className="font-mono text-[8px] uppercase tracking-[0.14em] text-ok">
              Demo
            </span>
          </div>
          <p className="mt-1.5 truncate font-mono text-[10px] text-ink">
            {session?.email ?? 'Demo session'}
          </p>
          <button
            type="button"
            onClick={() => {
              signOut()
              onNavigate?.()
              navigate('/login', { replace: true })
            }}
            className="mt-2.5 inline-flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-[0.16em] text-accent transition-opacity hover:opacity-70"
          >
            <LogOut size={11} />
            Sign out
          </button>
        </div>

        <p className="mt-3 font-mono text-[8px] uppercase leading-relaxed tracking-[0.14em] text-muted">
          Demo build · Simulated telemetry · No NASA affiliation
        </p>
      </div>
    </>
  )
}

export function Sidebar() {
  const sidebarOpen = useUIStore((state) => state.sidebarOpen)
  const setSidebarOpen = useUIStore((state) => state.setSidebarOpen)

  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[266px] flex-col border-r border-line bg-bg lg:flex">
        <SidebarContent />
      </aside>

      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Close navigation overlay"
            onClick={() => setSidebarOpen(false)}
            className="absolute inset-0 animate-fade-in bg-black/55"
          />
          <div className="absolute inset-y-0 left-0 flex w-[284px] animate-slide-in flex-col border-r border-line bg-bg shadow-soft">
            <SidebarContent onNavigate={() => setSidebarOpen(false)} />
          </div>
        </div>
      )}
    </>
  )
}
