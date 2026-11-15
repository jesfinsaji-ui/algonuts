import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { useSimulationClock } from '../../hooks/useSimulationClock'
import { useUIStore } from '../../store/useUIStore'
import { ToastViewport } from '../common/ToastViewport'
import { Header } from './Header'
import { Sidebar } from './Sidebar'

export function AppLayout() {
  useSimulationClock()
  const location = useLocation()
  const setSidebarOpen = useUIStore((state) => state.setSidebarOpen)

  useEffect(() => {
    setSidebarOpen(false)
    window.scrollTo({ top: 0, behavior: 'auto' })
  }, [location.pathname, setSidebarOpen])

  return (
    <div className="min-h-screen bg-bg text-ink">
      <Sidebar />
      <div className="lg:pl-[266px]">
        <Header onOpenMenu={() => setSidebarOpen(true)} />
        <main className="mx-auto w-full max-w-[1560px] px-4 py-7 sm:px-6 sm:py-9 lg:px-10 lg:py-10">
          <Outlet />
        </main>
        <footer className="mx-auto flex w-full max-w-[1560px] flex-col gap-3 border-t border-line px-4 py-6 font-mono text-[9px] uppercase tracking-[0.16em] text-muted sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-10">
          <span>AstroVital · Demo build · Simulated telemetry</span>
          <span>
            Not affiliated with NASA · Not for medical use ·{' '}
            <span className="text-accent">Space Apps concept</span>
          </span>
        </footer>
      </div>
      <ToastViewport />
    </div>
  )
}
