// src/pages/AdminDashboard.jsx
import { useState, useEffect } from "react";
import {
  WeeklyUtilizationChart,
  PeakHoursChart,
} from "../components/AnalyticsCharts";
import * as apiClient from "../api/apiClient";
import {
  Clock,
  TrendingUp,
  Sparkles,
  AlertTriangle,
  RefreshCw,
  XCircle,
} from "lucide-react";
import "../styles/AdminDashboard.css";

// Fallback data for analytics if API doesn't provide it
const FALLBACK_PEAK_USAGE_HOURS = [
  { hour: "08:00 AM", percentage: 25 },
  { hour: "10:00 AM", percentage: 55 },
  { hour: "12:00 PM", percentage: 78 },
  { hour: "02:00 PM", percentage: 88 },
  { hour: "04:00 PM", percentage: 84 },
  { hour: "06:00 PM", percentage: 70 },
  { hour: "08:00 PM", percentage: 45 },
  { hour: "10:00 PM", percentage: 15 },
];

const FALLBACK_WEEKLY_UTILIZATION = [
  { day: "Mon", rate: 72 },
  { day: "Tue", rate: 78 },
  { day: "Wed", rate: 85 },
  { day: "Thu", rate: 81 },
  { day: "Fri", rate: 64 },
  { day: "Sat", rate: 45 },
  { day: "Sun", rate: 38 },
];

export default function AdminDashboard({ desks, onStatusChange }) {
  const [peakHours, setPeakHours] = useState(FALLBACK_PEAK_USAGE_HOURS);
  const [weeklyUtilization, setWeeklyUtilization] = useState(
    FALLBACK_WEEKLY_UTILIZATION,
  );
  const [analyticsLoading, setAnalyticsLoading] = useState(true);

  // Fetch analytics data from backend
  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        setAnalyticsLoading(true);
        const stats = await apiClient.fetchStatistics();

        if (stats.peak_hours && stats.peak_hours.length > 0) {
          setPeakHours(stats.peak_hours);
        }
        if (stats.weekly_utilization && stats.weekly_utilization.length > 0) {
          setWeeklyUtilization(stats.weekly_utilization);
        }
      } catch (error) {
        console.error("Error fetching analytics:", error);
        // Use fallback data on error
      } finally {
        setAnalyticsLoading(false);
      }
    };

    loadAnalytics();
  }, []);
  // Get all desks currently away
  const awayDesks = desks.filter((d) => d.status === "away");

  // Helper to extract numbers from "X mins away" for visual warnings
  const getAwayMinutes = (lastActiveText) => {
    if (!lastActiveText) return 0;
    const match = lastActiveText.match(/\d+/);
    return match ? parseInt(match[0], 10) : 0;
  };

  const handleRelease = (deskId) => {
    onStatusChange(deskId, "free");
  };

  return (
    <div className="admin-view">
      <div className="page-header animate-fade-in">
        <div>
          <h2 className="page-title">Admin Management Console</h2>
          <p className="page-subtitle">
            Historical usage trends, peak optimization, and active room
            management.
          </p>
        </div>
        <div className="admin-badge glass-panel">
          <TrendingUp size={14} className="text-blue" />
          <span>System Analytics Active</span>
        </div>
      </div>

      {/* Analytics Summary Highlights */}
      <div className="admin-summary-grid">
        <div className="glass-panel summary-highlight animate-fade-in">
          <div className="highlight-icon bg-blue-glow">
            <Clock size={18} className="text-blue" />
          </div>
          <div className="highlight-content">
            <span className="highlight-label">Avg. Session Duration</span>
            <h4 className="highlight-value">2.4 Hours</h4>
            <span className="highlight-sub">Per checked-in student</span>
          </div>
        </div>

        <div className="glass-panel summary-highlight animate-fade-in">
          <div className="highlight-icon bg-yellow-glow">
            <TrendingUp size={18} className="text-yellow" />
          </div>
          <div className="highlight-content">
            <span className="highlight-label">Peak Occupancy Time</span>
            <h4 className="highlight-value">02:00 PM</h4>
            <span className="highlight-sub">Highest daily traffic</span>
          </div>
        </div>

        <div className="glass-panel summary-highlight animate-fade-in">
          <div className="highlight-icon bg-green-glow">
            <Sparkles size={18} className="text-green" />
          </div>
          <div className="highlight-content">
            <span className="highlight-label">Most Popular Zone</span>
            <h4 className="highlight-value">PC Lab</h4>
            <span className="highlight-sub">94% average occupancy</span>
          </div>
        </div>
      </div>

      {/* Custom Charts Grid */}
      <div className="admin-charts-grid">
        <div className="glass-panel chart-card-wrapper animate-fade-in">
          <WeeklyUtilizationChart data={weeklyUtilization} />
        </div>

        <div className="glass-panel chart-card-wrapper animate-fade-in">
          <PeakHoursChart data={peakHours} />
        </div>
      </div>

      {/* Recently Abandoned Desks Section */}
      <div className="glass-panel abandoned-desks-card animate-fade-in">
        <div className="card-header">
          <AlertTriangle className="card-header-icon text-yellow" size={20} />
          <div>
            <h3 className="card-title">Away Desk Exceeded Time Limits</h3>
            <p className="card-description">
              Students marked "Away" for over 30 minutes. You can manually
              release these desks to restore availability.
            </p>
          </div>
        </div>

        <div className="abandoned-table-container">
          {awayDesks.length > 0 ? (
            <table className="abandoned-table">
              <thead>
                <tr>
                  <th>Desk</th>
                  <th>Location Zone</th>
                  <th>Student Name</th>
                  <th>Away Duration</th>
                  <th>Status Warning</th>
                  <th style={{ textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {awayDesks.map((desk) => {
                  const awayMins = getAwayMinutes(desk.lastActive);
                  const isOverLimit = awayMins >= 30;

                  return (
                    <tr
                      key={desk.id}
                      className={isOverLimit ? "row-critical" : ""}
                    >
                      <td>
                        <span className="table-desk-num">
                          Desk {desk.id < 10 ? `0${desk.id}` : desk.id}
                        </span>
                      </td>
                      <td>{desk.zone}</td>
                      <td>
                        <span className="table-student-name">
                          {desk.studentName}
                        </span>
                      </td>
                      <td>
                        <span
                          className={`away-time-badge ${isOverLimit ? "badge-critical" : "badge-warning"}`}
                        >
                          {desk.lastActive}
                        </span>
                      </td>
                      <td>
                        {isOverLimit ? (
                          <span className="text-critical flex-align">
                            <XCircle size={14} className="icon-gap" /> Over 30m
                            Limit
                          </span>
                        ) : (
                          <span className="text-warning flex-align">
                            <Clock size={14} className="icon-gap" /> Within
                            Grace Period
                          </span>
                        )}
                      </td>
                      <td style={{ textAlign: "right" }}>
                        <button
                          onClick={() => handleRelease(desk.id)}
                          className="btn-table-release"
                          title="Release desk back to Free pool"
                        >
                          <RefreshCw size={12} className="btn-release-icon" />
                          <span>Release Desk</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <div className="abandoned-empty-state">
              <CheckCircleIcon />
              <h4>No desks are currently in "Away" status.</h4>
              <p>
                When a student marks a desk away, it will show up here for
                administrative oversight.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function CheckCircleIcon() {
  return (
    <svg
      width="32"
      height="32"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-green"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}
