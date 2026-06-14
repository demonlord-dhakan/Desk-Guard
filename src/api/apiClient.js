// src/api/apiClient.js
// Centralized API client for FastAPI backend communication

const API_BASE_URL = "https://desk-guard-1.onrender.com";

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

const handleResponse = async (response) => {
  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ message: "Unknown error" }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }
  return response.json();
};

// Transform backend desk response to frontend shape
const transformDesk = (backendDesk) => {
  // Backend returns id (integer) and desk_number (string like "Desk-1")
  const id = backendDesk.id;
  const deskNumber = backendDesk.desk_number;

  // Calculate zone based on desk id (same logic as mockData)
  let zone = "Quiet Study";
  if (id > 15 && id <= 30) zone = "Collaboration Area";
  else if (id > 30 && id <= 40) zone = "PC Lab";
  else if (id > 40) zone = "Window View";

  // Map backend status values to frontend status values
  // Backend: "Green" (free), "Red" (occupied), "Yellow" (away)
  // Frontend: "free", "occupied", "away"
  const statusMap = {
    Green: "free",
    Red: "occupied",
    Yellow: "away",
  };
  const status = statusMap[backendDesk.status] || "free";

  // Format last_ping as a human-readable time
  let checkInTime = null;
  if (backendDesk.last_ping) {
    const date = new Date(backendDesk.last_ping);
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    checkInTime = `${hours}:${minutes}`;
  }

  // Calculate lastActive based on away_expires_at or last_ping
  let lastActive = null;
  if (backendDesk.away_expires_at) {
    const expiresDate = new Date(backendDesk.away_expires_at);
    const now = new Date();
    const minutesAway = Math.floor((expiresDate - now) / (1000 * 60));
    if (minutesAway > 0) {
      lastActive = `${minutesAway} mins away`;
    }
  } else if (backendDesk.last_ping) {
    const pingDate = new Date(backendDesk.last_ping);
    const now = new Date();
    const minutesAgo = Math.floor((now - pingDate) / (1000 * 60));
    if (minutesAgo > 0) {
      lastActive = `${minutesAgo} mins ago`;
    }
  }

  return {
    id,
    desk_number: deskNumber,
    zone,
    status,
    studentName: backendDesk.current_user || null,
    studentId: null, // Backend doesn't provide separate studentId
    checkInTime,
    lastActive,
  };
};

// Transform backend activity response to frontend shape
const transformActivity = (backendActivity) => {
  // Extract desk id from desk_number string (e.g., "Desk-5" -> 5)
  let deskId = null;
  if (backendActivity.desk_number) {
    const match = backendActivity.desk_number.match(/\d+/);
    deskId = match ? parseInt(match[0], 10) : null;
  }

  // Transform action names to user-friendly format
  const actionMap = {
    CHECKED_IN: "Checked in",
    MARKED_AWAY: "Marked Away",
    RELEASED: "Checked out",
    AUTO_RELEASED_AWAY: "Auto-released (away timeout)",
    AUTO_RELEASED_ABANDONED: "Auto-released (abandoned)",
  };
  const action =
    actionMap[backendActivity.action] || backendActivity.action || "Unknown";

  // Convert timestamp to relative time string
  let time = "Just now";
  if (backendActivity.timestamp) {
    const activityDate = new Date(backendActivity.timestamp);
    const now = new Date();
    const diffMinutes = Math.floor((now - activityDate) / (1000 * 60));
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMinutes < 1) {
      time = "Just now";
    } else if (diffMinutes < 60) {
      time = `${diffMinutes} min${diffMinutes > 1 ? "s" : ""} ago`;
    } else if (diffHours < 24) {
      time = `${diffHours} hr${diffHours > 1 ? "s" : ""} ago`;
    } else {
      time = `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
    }
  }

  return {
    id: backendActivity.id || Date.now(),
    deskId,
    studentName: backendActivity.user_id || "Unknown",
    action,
    time,
  };
};

// ============================================================================
// DESK OPERATIONS
// ============================================================================

export const fetchDesks = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/desks`);
    const data = await handleResponse(response);

    // Handle if response is wrapped in an object with 'desks' key
    const deskArray = Array.isArray(data) ? data : data.desks || [];

    return deskArray.map(transformDesk);
  } catch (error) {
    console.error("Error fetching desks:", error);
    throw error;
  }
};

export const checkInDesk = async (deskNumber, studentName, studentId) => {
  try {
    // Backend expects user_id field
    const userId = studentId || studentName || "Unknown";
    const response = await fetch(
      `${API_BASE_URL}/desks/${deskNumber}/checkin`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: userId,
        }),
      },
    );
    const data = await handleResponse(response);
    return transformDesk(data);
  } catch (error) {
    console.error(`Error checking in desk ${deskNumber}:`, error);
    throw error;
  }
};

export const markDeskAway = async (deskNumber, userId) => {
  try {
    // Backend expects user_id field for authentication
    const response = await fetch(`${API_BASE_URL}/desks/${deskNumber}/away`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_id: userId,
      }),
    });
    const data = await handleResponse(response);
    return transformDesk(data);
  } catch (error) {
    console.error(`Error marking desk ${deskNumber} away:`, error);
    throw error;
  }
};

export const releaseDesk = async (deskNumber, userId) => {
  try {
    // Backend expects user_id field for authentication
    const response = await fetch(
      `${API_BASE_URL}/desks/${deskNumber}/release`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: userId,
        }),
      },
    );
    const data = await handleResponse(response);
    return transformDesk(data);
  } catch (error) {
    console.error(`Error releasing desk ${deskNumber}:`, error);
    throw error;
  }
};

export const resetDesk = async (deskNumber) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/admin/desks/${deskNumber}/reset`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      },
    );
    const data = await handleResponse(response);
    return transformDesk(data);
  } catch (error) {
    console.error(`Error resetting desk ${deskNumber}:`, error);
    throw error;
  }
};

// ============================================================================
// ACTIVITY & STATISTICS
// ============================================================================

export const fetchActivities = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/activities`);
    const data = await handleResponse(response);

    // Handle if response is wrapped in an object with 'activities' key
    const activityArray = Array.isArray(data) ? data : data.activities || [];

    return activityArray.map(transformActivity);
  } catch (error) {
    console.error("Error fetching activities:", error);
    throw error;
  }
};

export const fetchStatistics = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/statistics`);
    const data = await handleResponse(response);

    return {
      peak_hours: data.peak_hours || data.peakHours || [],
      weekly_utilization:
        data.weekly_utilization || data.weeklyUtilization || [],
    };
  } catch (error) {
    console.error("Error fetching statistics:", error);
    throw error;
  }
};

// ============================================================================
// HELPER FUNCTION FOR BULK API CALLS
// ============================================================================

export const fetchInitialData = async () => {
  try {
    const [desks, activities, statistics] = await Promise.all([
      fetchDesks(),
      fetchActivities(),
      fetchStatistics(),
    ]);

    return { desks, activities, statistics };
  } catch (error) {
    console.error("Error fetching initial data:", error);
    throw error;
  }
};
