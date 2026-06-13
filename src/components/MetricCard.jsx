// src/components/MetricCard.jsx
import '../styles/Components.css';

export default function MetricCard({ title, value, subtext, icon: Icon, type = 'primary', progress }) {
  // Determine CSS classes based on the metric type
  const typeClass = `metric-type-${type}`;
  
  return (
    <div className="glass-panel metric-card animate-fade-in">
      <div className="metric-content">
        <span className="metric-title">{title}</span>
        <h3 className="metric-value">{value}</h3>
        {subtext && <span className="metric-subtext">{subtext}</span>}
      </div>
      
      <div className="metric-visual">
        {progress !== undefined ? (
          <div className="metric-progress-circle">
            <svg width="60" height="60" viewBox="0 0 36 36" className="circular-chart">
              <path
                className="circle-bg"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="circle"
                strokeDasharray={`${progress}, 100`}
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                style={{ stroke: `var(--primary)` }}
              />
              <text x="18" y="20.35" className="percentage">{Math.round(progress)}%</text>
            </svg>
          </div>
        ) : (
          <div className={`metric-icon-wrapper ${typeClass}`}>
            {Icon && <Icon size={22} className="metric-icon" />}
          </div>
        )}
      </div>
    </div>
  );
}
