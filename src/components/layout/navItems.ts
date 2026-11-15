import {
  Activity,
  BellRing,
  History,
  LayoutDashboard,
  ScanSearch,
  SlidersHorizontal,
  Users,
  type LucideIcon,
} from 'lucide-react'

export interface NavItem {
  to: string
  label: string
  index: string
  icon: LucideIcon
}

export const NAV_ITEMS: NavItem[] = [
  { to: '/', label: 'Overview', index: '01', icon: LayoutDashboard },
  { to: '/crew', label: 'Crew Monitoring', index: '02', icon: Users },
  { to: '/analytics', label: 'Health Analytics', index: '03', icon: Activity },
  { to: '/risk', label: 'AI Risk Analysis', index: '04', icon: ScanSearch },
  { to: '/alerts', label: 'Alerts', index: '05', icon: BellRing },
  { to: '/history', label: 'Medical History', index: '06', icon: History },
  { to: '/settings', label: 'Settings', index: '07', icon: SlidersHorizontal },
]

export function getPageTitle(pathname: string): string {
  if (pathname === '/') return 'Overview'
  if (pathname.startsWith('/crew/')) return 'Astronaut Profile'
  const match = NAV_ITEMS.find(
    (item) =>
      item.to !== '/' &&
      (pathname === item.to || pathname.startsWith(`${item.to}/`)),
  )
  return match?.label ?? 'AstroVital'
}
