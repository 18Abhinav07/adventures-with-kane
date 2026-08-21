import { Wallet, CalendarClock, Target, Gauge, ArrowUpRight } from 'lucide-react'
import './SummaryCards.css'

const CARDS = [
  {
    label: 'TOTAL PORTFOLIO',
    metric: '$24,816,392.41',
    secondary: '+$184,219.22  +0.75%',
    icon: Wallet,
    positive: true,
  },
  {
    label: 'TODAY',
    metric: '+$84,219.17',
    secondary: '+0.34%',
    icon: CalendarClock,
    positive: true,
  },
  {
    label: 'YTD RETURN',
    metric: '+11.84%',
    secondary: 'vs benchmark +9.62%',
    icon: Target,
    positive: true,
  },
  {
    label: 'RISK SCORE',
    metric: '61 / 100',
    secondary: 'MODERATE',
    icon: Gauge,
    positive: null,
  },
]

function SummaryCards() {
  return (
    <div className="summary-cards">
      {CARDS.map((card) => {
        const Icon = card.icon
        return (
          <div className="summary-card" key={card.label}>
            <div className="summary-card-top">
              <span className="summary-card-label">{card.label}</span>
              <Icon className="summary-card-icon" size={14} strokeWidth={1.75} aria-hidden="true" />
            </div>
            <div className="summary-card-metric">{card.metric}</div>
            <div className="summary-card-bottom">
              <span
                className={`summary-card-secondary${card.positive === true ? ' positive' : ''}`}
              >
                {card.secondary}
              </span>
              {card.positive === true && (
                <ArrowUpRight className="summary-card-trend positive" size={12} strokeWidth={2} aria-hidden="true" />
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default SummaryCards
