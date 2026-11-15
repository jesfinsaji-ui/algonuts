import { useEffect } from 'react'
import { SIMULATION_TICK_MS } from '../utils/format'
import { useSimulationStore } from '../store/useSimulationStore'

export function useSimulationClock(): void {
  const running = useSimulationStore((state) => state.running)
  const tick = useSimulationStore((state) => state.tick)

  useEffect(() => {
    if (!running) return
    const interval = window.setInterval(() => {
      tick()
    }, SIMULATION_TICK_MS)
    return () => window.clearInterval(interval)
  }, [running, tick])
}
