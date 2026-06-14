// src/App.jsx
import { useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import Dashboard from "./pages/Dashboard";
import LibraryMap from "./pages/LibraryMap";
import AdminDashboard from "./pages/AdminDashboard";
import * as apiClient from "./api/apiClient";
import "./styles/App.css";

export default function App() {
  const [activePage, setActivePage] = useState("dashboard");
  const [desks, setDesks] = useState([]);
  const [activities, setActivities] = useState([]);
  const [selectedDesk, setSelectedDesk] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch initial data from backend
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await apiClient.fetchInitialData();
        setDesks(data.desks);
        setActivities(data.activities);
      } catch (err) {
        console.error("Failed to load data:", err);
        setError(err.message);
        // Fallback: Show empty state instead of crashing
        setDesks([]);
        setActivities([]);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Compute live library stats
  const total = desks.length;
  const occupied = desks.filter((d) => d.status === "occupied").length;
  const free = desks.filter((d) => d.status === "free").length;
  const away = desks.filter((d) => d.status === "away").length;
  const occupancyPercentage = ((occupied + away) / total) * 100;

  const stats = {
    total,
    occupied,
    free,
    away,
    occupancyPercentage,
  };

  // State modification callback - makes API calls to update desk status
  const handleStatusChange = async (
    deskId,
    newStatus,
    studentName = null,
    studentId = null,
    checkInTime = null,
    lastActive = null,
  ) => {
    try {
      // Find the desk by id to get desk_number for API calls
      const desk = desks.find((d) => d.id === deskId);
      if (!desk) {
        throw new Error(`Desk with id ${deskId} not found`);
      }

      const deskNumber = desk.desk_number;
      // Call appropriate API endpoint based on new status.
      // After a successful API response, re-fetch full application state
      // from the backend to avoid optimistic inconsistencies.
      if (newStatus === "occupied") {
        await apiClient.checkInDesk(deskNumber, studentName, studentId);
      } else if (newStatus === "away") {
        const userId = studentId || studentName || desk.studentName || null;
        if (!userId) throw new Error("Unable to mark away: no user information available");
        await apiClient.markDeskAway(deskNumber, userId);
      } else if (newStatus === "free") {
        const userId = studentId || studentName || desk.studentName || null;
        if (!userId) throw new Error("Unable to release: no user information available");
        await apiClient.releaseDesk(deskNumber, userId);
      }

      // Re-fetch full data to synchronize desks, activities, and stats
      const data = await apiClient.fetchInitialData();
      setDesks(data.desks);
      setActivities(data.activities);
      // Preserve selected desk if it still exists
      if (selectedDesk) {
        const refreshed = data.desks.find((d) => d.id === selectedDesk.id) || null;
        setSelectedDesk(refreshed);
      }
    } catch (error) {
      console.error(`Error changing desk status:`, error);
      alert(`Failed to update desk: ${error.message}`);
    }
  };

  // View Router
  const renderPage = () => {
    switch (activePage) {
      case "dashboard":
        return (
          <Dashboard
            desks={desks}
            stats={stats}
            activities={activities}
            setActivePage={setActivePage}
            setSelectedDesk={setSelectedDesk}
          />
        );
      case "map":
        return (
          <LibraryMap
            desks={desks}
            selectedDesk={selectedDesk}
            setSelectedDesk={setSelectedDesk}
            onStatusChange={handleStatusChange}
          />
        );
      case "admin":
        return (
          <AdminDashboard
            desks={desks}
            activities={activities}
            onStatusChange={handleStatusChange}
          />
        );
      default:
        return (
          <Dashboard
            desks={desks}
            stats={stats}
            activities={activities}
            setActivePage={setActivePage}
            setSelectedDesk={setSelectedDesk}
          />
        );
    }
  };

  return (
    <div className="app-container">
      <Navbar
        activePage={activePage}
        setActivePage={setActivePage}
        stats={stats}
      />
      <main className="main-content">
        {loading ? (
          <div style={{ padding: "2rem", textAlign: "center" }}>
            <p>Loading dashboard data...</p>
          </div>
        ) : error ? (
          <div style={{ padding: "2rem", textAlign: "center", color: "red" }}>
            <p>Error loading data: {error}</p>
            <p>Make sure the backend is running on http://127.0.0.1:8000</p>
          </div>
        ) : (
          renderPage()
        )}
      </main>
    </div>
  );
}
