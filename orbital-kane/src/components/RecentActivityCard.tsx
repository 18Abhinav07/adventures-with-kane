import { RECENT_ACTIVITY } from '../data/activity'
import './RecentActivityCard.css'

function RecentActivityCard() {
  return (
    <div className="activity-card">
      <div className="activity-card-header">
        <h2 className="activity-card-title">Recent Activity</h2>
      </div>

      <table className="activity-table">
        <thead>
          <tr>
            <th>TIME</th>
            <th>TYPE</th>
            <th>DESCRIPTION</th>
            <th>ASSET</th>
            <th>VALUE</th>
            <th>STATUS</th>
          </tr>
        </thead>
        <tbody>
          {RECENT_ACTIVITY.map((event) => (
            <tr key={event.id}>
              <td className="activity-time">{event.time}</td>
              <td className="activity-type">{event.type}</td>
              <td className="activity-description">{event.description}</td>
              <td className="activity-asset">{event.asset}</td>
              <td className="activity-value">{event.value}</td>
              <td>
                <span className={`activity-status-pill ${event.status.toLowerCase()}`}>
                  {event.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default RecentActivityCard
