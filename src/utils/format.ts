export const MISSION_START_MINUTES = 128 * 24 * 60 + 4 * 60 + 17

export const SIMULATION_TICK_MS = 3200

const pad = (n: number) => String(Math.floor(n)).padStart(2, '0')

export function formatMET(totalMinutes: number): string {
  const days = Math.floor(totalMinutes / 1440)
  const hours = Math.floor((totalMinutes % 1440) / 60)
  const minutes = Math.floor(totalMinutes % 60)
  return `${days}d ${pad(hours)}h ${pad(minutes)}m`
}

export function formatMETCompact(totalMinutes: number): string {
  const days = Math.floor(totalMinutes / 1440)
  const hours = Math.floor((totalMinutes % 1440) / 60)
  return `D${days} ${pad(hours)}:${pad(Math.floor(totalMinutes % 60))}`
}

export function formatClock(totalMinutes: number): string {
  const mins = ((totalMinutes % 1440) + 1440) % 1440
  return `${pad(Math.floor(mins / 60))}:${pad(mins % 60)}`
}

export function formatAgo(deltaMinutes: number): string {
  const minutes = Math.max(0, Math.round(deltaMinutes))
  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${minutes} min ago`
  const hours = Math.floor(minutes / 60)
  const rest = minutes % 60
  if (hours < 24) return rest ? `${hours}h ${rest}m ago` : `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ${hours % 24}h ago`
}

export function formatMissionDay(totalMinutes: number): number {
  return Math.floor(totalMinutes / 1440)
}

export function formatValue(value: number, digits = 0): string {
  return value.toFixed(digits)
}

export function formatPercent(value: number, digits = 0): string {
  return `${value.toFixed(digits)}%`
}

export function signed(value: number, digits = 0): string {
  const fixed = value.toFixed(digits)
  return value > 0 ? `+${fixed}` : fixed
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

export function round(value: number, digits = 0): number {
  const factor = 10 ** digits
  return Math.round(value * factor) / factor
}

export function downloadCSV(filename: string, rows: Array<Array<string | number>>): void {
  const csv = rows
    .map((row) =>
      row
        .map((cell) => {
          const text = String(cell)
          return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text
        })
        .join(','),
    )
    .join('\n')

  const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  window.setTimeout(() => URL.revokeObjectURL(url), 1000)
}

export function uid(prefix: string, seed = Date.now()): string {
  return `${prefix}-${seed.toString(36).slice(-5).toUpperCase()}${Math.floor(Math.random() * 90 + 10)}`
}
