import {
  LayoutDashboard,
  Briefcase,
  TrendingUp,
  Eye,
  ArrowLeftRight,
  Activity,
  ShieldAlert,
  PieChart,
  GitBranch,
  FileText,
  Bookmark,
  ClipboardList,
  BellRing,
  HeartPulse,
  type LucideIcon,
} from 'lucide-react'
import type { NavItemId } from '../../types'

export interface NavItem {
  id: NavItemId
  label: string
  icon: LucideIcon
}

export interface NavSection {
  heading: string
  items: NavItem[]
}

export const NAV_SECTIONS: NavSection[] = [
  {
    heading: 'PRIMARY',
    items: [
      { id: 'overview', label: 'Overview', icon: LayoutDashboard },
      { id: 'portfolio', label: 'Portfolio', icon: Briefcase },
      { id: 'markets', label: 'Markets', icon: TrendingUp },
      { id: 'watchlist', label: 'Watchlist', icon: Eye },
      { id: 'transactions', label: 'Transactions', icon: ArrowLeftRight },
    ],
  },
  {
    heading: 'ANALYTICS',
    items: [
      { id: 'performance', label: 'Performance', icon: Activity },
      { id: 'risk', label: 'Risk', icon: ShieldAlert },
      { id: 'attribution', label: 'Attribution', icon: PieChart },
      { id: 'scenarios', label: 'Scenarios', icon: GitBranch },
    ],
  },
  {
    heading: 'RESEARCH',
    items: [
      { id: 'research-notes', label: 'Research Notes', icon: FileText },
      { id: 'saved-views', label: 'Saved Views', icon: Bookmark },
      { id: 'reports', label: 'Reports', icon: ClipboardList },
    ],
  },
  {
    heading: 'SYSTEM',
    items: [
      { id: 'alerts', label: 'Alerts', icon: BellRing },
      { id: 'data-health', label: 'Data Health', icon: HeartPulse },
    ],
  },
]

export const NAV_HEADINGS: Record<NavItemId, string> = {
  overview: 'Portfolio Overview',
  portfolio: 'Portfolio',
  markets: 'Markets',
  watchlist: 'Watchlist',
  transactions: 'Transactions',
  performance: 'Performance',
  risk: 'Risk',
  attribution: 'Attribution',
  scenarios: 'Scenarios',
  'research-notes': 'Research Notes',
  'saved-views': 'Saved Views',
  reports: 'Reports',
  alerts: 'Alerts',
  'data-health': 'Data Health',
}
