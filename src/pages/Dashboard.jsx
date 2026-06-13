// src/pages/Dashboard.jsx
import { useState } from 'react';
import MetricCard from '../components/MetricCard';
import { Library, UserCheck, CheckCircle, Coffee, Percent, Activity, Search, HelpCircle } from 'lucide-react';
import '../styles/Dashboard.css';
import QRCodeCard from "../components/QRCodeCard";

export default function Dashboard({ desks, stats, activities, setActivePage, setSelectedDesk }) {
  const [searchQuery, setSearchQuery] = useState('');

  // Search desks by number or zone
  const filteredDesks = searchQuery
    ? desks.filter(
        (desk) =>
          desk.id.toString().includes(searchQuery) ||
          desk.zone.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  const handleQuickDeskClick = (desk) => {
    setSelectedDesk(desk);
    setActivePage('map');
  };

  return (
    <div className="dashboard-view">
      <div className="page-header animate-fade-in">
        <div>
          <h2 className="page-title">DeskGuard System Overview</h2>
          <p className="page-subtitle">Real-time occupancy metrics and library status dashboard.</p>
        </div>
        <div className="time-indicator glass-panel">
          <span className="live-dot"></span>
          <span>Live Sensor Stream</span>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="kpi-grid">
        <MetricCard
          title="Total Desks"
          value={stats.total}
          subtext="Configured on Floor 1"
          icon={Library}
          type="primary"
        />
        <MetricCard
          title="Occupied"
          value={stats.occupied}
          subtext="Active sessions"
          icon={UserCheck}
          type="occupied"
        />
        <MetricCard
          title="Available Free"
          value={stats.free}
          subtext="Ready for check-in"
          icon={CheckCircle}
          type="free"
        />
        <MetricCard
          title="Away / Reserving"
          value={stats.away}
          subtext="Temporary absences"
          icon={Coffee}
          type="away"
        />
        <MetricCard
          title="Occupancy Rate"
          value={`${Math.round(stats.occupancyPercentage)}%`}
          subtext="Current utilization"
          icon={Percent}
          type="secondary"
          progress={stats.occupancyPercentage}
        />
      </div>

      <div className="dashboard-layout-grid">
        {/* Search & Zones */}
        <div className="dashboard-col left-col">
          <div className="glass-panel search-card animate-fade-in">
            <div className="card-header">
              <Search className="card-header-icon text-blue" size={18} />
              <h3 className="card-title">Quick Desk Finder</h3>
            </div>
            <p className="card-description">
              Find a study desk by typing a number or location zone (e.g., "Quiet", "PC", "Window").
            </p>
            <div className="search-input-wrapper">
              <Search className="input-search-icon" size={16} />
              <input
                type="text"
                placeholder="Search desk number or zone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
            </div>
            
            {searchQuery && (
              <div className="search-results scroll-container">
                {filteredDesks.length > 0 ? (
                  filteredDesks.map((desk) => (
                    <button
                      key={desk.id}
                      onClick={() => handleQuickDeskClick(desk)}
                      className="search-result-row"
                    >
                      <div className="result-main">
                        <span className="result-number">Desk {desk.id < 10 ? `0${desk.id}` : desk.id}</span>
                        <span className="result-zone">{desk.zone}</span>
                      </div>
                      <div className="result-status">
                        <span className={`status-indicator-dot dot-${desk.status}`}></span>
                        <span className={`status-label text-${desk.status === 'free' ? 'green' : desk.status === 'occupied' ? 'red' : 'yellow'}`}>
                          {desk.status}
                        </span>
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="search-no-results">No desks match your search</div>
                )}
              </div>
            )}
          </div>

          <div className="glass-panel info-guide-card animate-fade-in">
            <div className="card-header">
              <HelpCircle className="card-header-icon text-blue" size={18} />
              <h3 className="card-title">How DeskGuard Works</h3>
            </div>
            <div className="guide-list">
              <div className="guide-item">
                <span className="guide-bullet bullet-free"></span>
                <div>
                  <strong>Green (Free)</strong>
                  <p>Desk is fully open. You can check in instantly by walking up and claiming it.</p>
                </div>
              </div>
              <div className="guide-item">
                <span className="guide-bullet bullet-occupied"></span>
                <div>
                  <strong>Red (Occupied)</strong>
                  <p>Desk is actively in use by another student.</p>
                </div>
              </div>
              <div className="guide-item">
                <span className="guide-bullet bullet-away"></span>
                <div>
                  <strong>Yellow (Away)</strong>
                  <p>The student has stepped away temporarily. Desks are reserved for up to 30 minutes before release.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Live Activity Stream */}
        <div className="dashboard-col right-col">
          <div className="glass-panel activity-card animate-fade-in">
            <div className="card-header">
              <Activity className="card-header-icon text-blue" size={18} />
              <h3 className="card-title">Recent Desk Activity</h3>
            </div>
            <div className="activity-stream">
              {activities.length > 0 ? (
                activities.slice(0, 5).map((act) => (
                  <div key={act.id} className="activity-row">
                    <div className="activity-icon-col">
                      <span className={`activity-badge-dot badge-${act.action.toLowerCase().includes('in') ? 'checkin' : act.action.toLowerCase().includes('away') ? 'away' : 'checkout'}`}></span>
                    </div>
                    <div className="activity-details">
                      <p className="activity-text">
                        <strong>{act.studentName}</strong> {act.action.toLowerCase()} <strong>Desk {act.deskId < 10 ? `0${act.deskId}` : act.deskId}</strong>
                      </p>
                      <span className="activity-time">{act.time}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="activity-empty">No activities recorded yet.</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
