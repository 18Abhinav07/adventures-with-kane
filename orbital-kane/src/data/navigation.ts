import {
  LayoutGrid,
  Briefcase,
  LineChart,
  Star,
  ArrowLeftRight,
  TrendingUp,
  ShieldAlert,
  GitBranch,
  FlaskConical,
  FileText,
  Bookmark,
  ClipboardList,
  Bell,
  HeartPulse,
  type LucideIcon,
} from 'lucide-react'

export interface NavItem {
  label: string
  icon: LucideIcon
  heading: string
}

export interface NavSection {
  title: string
  items: NavItem[]
}

export const NAV_SECTIONS: NavSection[] = [
  {
    title: 'PRIMARY',
    items: [
      { label: 'Overview', icon: LayoutGrid, heading: 'Portfolio Overview' },
      { label: 'Portfolio', icon: Briefcase, heading: 'Portfolio' },
      { label: 'Markets', icon: LineChart, heading: 'Markets' },
      { label: 'Watchlist', icon: Star, heading: 'Watchlist' },
      { label: 'Transactions', icon: ArrowLeftRight, heading: 'Transactions' },
    ],
  },
  {
    title: 'ANALYTICS',
    items: [
      { label: 'Performance', icon: TrendingUp, heading: 'Performance' },
      { label: 'Risk', icon: ShieldAlert, heading: 'Risk' },
      { label: 'Attribution', icon: GitBranch, heading: 'Attribution' },
      { label: 'Scenarios', icon: FlaskConical, heading: 'Scenarios' },
    ],
  },
  {
    title: 'RESEARCH',
    items: [
      { label: 'Research Notes', icon: FileText, heading: 'Research Notes' },
      { label: 'Saved Views', icon: Bookmark, heading: 'Saved Views' },
      { label: 'Reports', icon: ClipboardList, heading: 'Reports' },
    ],
  },
  {
    title: 'SYSTEM',
    items: [
      { label: 'Alerts', icon: Bell, heading: 'Alerts' },
      { label: 'Data Health', icon: HeartPulse, heading: 'Data Health' },
    ],
  },
]

export const DEFAULT_NAV_LABEL = 'Overview'
