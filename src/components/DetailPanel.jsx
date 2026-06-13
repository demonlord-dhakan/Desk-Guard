// src/components/DetailPanel.jsx
import { useState } from "react";
import {
  X,
  User,
  Clock,
  ShieldAlert,
  CheckCircle,
  LogOut,
  Coffee,
  ArrowRight,
} from "lucide-react";
import "../styles/LibraryMap.css";

export default function DetailPanel({ desk, onClose, onStatusChange }) {
  const [name, setName] = useState("");
  const [studentId, setStudentId] = useState("");
  const [error, setError] = useState("");

  if (!desk) {
    return (
      <div className="glass-panel detail-panel empty-state">
        <div className="empty-panel-content animate-fade-in">
          <div className="empty-icon-wrapper">
            <CompassIcon />
          </div>
          <h3>No Desk Selected</h3>
          <p>
            Click on any desk in the library grid layout to view detailed
            availability, check-in student, or change occupancy status.
          </p>
        </div>
      </div>
    );
  }

  const handleCheckInSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Please enter a student name.");
      return;
    }
    setError("");

    // Generate a random student ID if none provided
    const finalId =
      studentId.trim() || `STU-${Math.floor(8000 + Math.random() * 2000)}`;
    const currentTime = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    onStatusChange(desk.id, "occupied", name, finalId, currentTime);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "free":
        return (
          <span className="badge-status bg-green-glow text-green">
            <CheckCircle size={12} style={{ marginRight: 4 }} /> Free
          </span>
        );
      case "occupied":
        return (
          <span className="badge-status bg-red-glow text-red">
            <User size={12} style={{ marginRight: 4 }} /> Occupied
          </span>
        );
      case "away":
        return (
          <span className="badge-status bg-yellow-glow text-yellow">
            <Coffee size={12} style={{ marginRight: 4 }} /> Away
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="glass-panel detail-panel active animate-fade-in">
      <div className="panel-header">
        <div>
          <span className="panel-tag">DESK DETAILS</span>
          <h3 className="panel-title">
            Desk {desk.id < 10 ? `0${desk.id}` : desk.id}
          </h3>
        </div>
        <button
          className="btn-close"
          onClick={onClose}
          aria-label="Close panel"
        >
          <X size={18} />
        </button>
      </div>

      <div className="panel-body">
        <div className="panel-meta-item">
          <span className="meta-label">Location Zone</span>
          <span className="meta-value">{desk.zone}</span>
        </div>

        <div className="panel-meta-item">
          <span className="meta-label">Current Status</span>
          <div className="meta-value">{getStatusBadge(desk.status)}</div>
        </div>

        <hr className="panel-divider" />

        {/* Dynamic Display based on status */}
        {desk.status !== "free" && (
          <div className="occupant-details animate-fade-in">
            <h4 className="section-subtitle">Occupant Information</h4>

            <div className="info-card">
              <div className="info-row">
                <User size={16} className="info-icon" />
                <div>
                  <span className="info-label">Student Name</span>
                  <span className="info-data">{desk.studentName}</span>
                </div>
              </div>

              <div className="info-row">
                <ShieldAlert size={16} className="info-icon" />
                <div>
                  <span className="info-label">Student ID</span>
                  <span className="info-data">{desk.studentId}</span>
                </div>
              </div>

              <div className="info-row">
                <Clock size={16} className="info-icon" />
                <div>
                  <span className="info-label">Check-in Time</span>
                  <span className="info-data">{desk.checkInTime || "N/A"}</span>
                </div>
              </div>

              {desk.status === "away" && (
                <div className="info-row highlight-away">
                  <Coffee size={16} className="info-icon text-yellow" />
                  <div>
                    <span className="info-label">Active Session Status</span>
                    <span className="info-data text-yellow">
                      Currently Away ({desk.lastActive || "recently left"})
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className="panel-actions">
              {desk.status === "occupied" && (
                <button
                  onClick={() =>
                    onStatusChange(
                      desk.id,
                      "away",
                      desk.studentName,
                      desk.studentId,
                      desk.checkInTime,
                      "0 mins away",
                    )
                  }
                  className="btn-action btn-away"
                >
                  <Coffee size={16} />
                  <span>Mark Away</span>
                </button>
              )}
              {desk.status === "away" && (
                <button
                  onClick={() =>
                    onStatusChange(
                      desk.id,
                      "occupied",
                      desk.studentName,
                      desk.studentId,
                      desk.checkInTime,
                      "Recently active",
                    )
                  }
                  className="btn-action btn-checkin-resume"
                >
                  <CheckCircle size={16} />
                  <span>Resume Session</span>
                </button>
              )}
              <button
                onClick={() =>
                  onStatusChange(
                    desk.id,
                    "free",
                    desk.studentName,
                    desk.studentId,
                    desk.checkInTime,
                  )
                }
                className="btn-action btn-checkout"
              >
                <LogOut size={16} />
                <span>Check Out / Release</span>
              </button>
            </div>
          </div>
        )}

        {desk.status === "free" && (
          <form
            onSubmit={handleCheckInSubmit}
            className="checkin-form animate-fade-in"
          >
            <h4 className="section-subtitle">Check In Student</h4>

            <div className="form-group">
              <label htmlFor="student-name">Full Name *</label>
              <input
                id="student-name"
                type="text"
                placeholder="e.g. John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="student-id">Student ID (Optional)</label>
              <input
                id="student-id"
                type="text"
                placeholder="e.g. STU-8821"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                className="form-input"
              />
            </div>

            {error && <p className="form-error-msg">{error}</p>}

            <button type="submit" className="btn-submit-checkin">
              <span>Confirm Check-in</span>
              <ArrowRight size={16} />
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

// Inline custom SVG graphic for empty state
function CompassIcon() {
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
      className="text-blue"
    >
      <circle cx="12" cy="12" r="10" />
      <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
    </svg>
  );
}
