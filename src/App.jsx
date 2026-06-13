// src/App.jsx
import { useState } from 'react';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import LibraryMap from './pages/LibraryMap';
import AdminDashboard from './pages/AdminDashboard';
import { INITIAL_DESKS, INITIAL_ACTIVITIES } from './data/mockData';
import './styles/App.css';

export default function App() {
  const [activePage, setActivePage] = useState('dashboard');
  const [desks, setDesks] = useState(INITIAL_DESKS);
  const [activities, setActivities] = useState(INITIAL_ACTIVITIES);
  const [selectedDesk, setSelectedDesk] = useState(null);

  // Compute live library stats
  const total = desks.length;
  const occupied = desks.filter((d) => d.status === 'occupied').length;
  const free = desks.filter((d) => d.status === 'free').length;
  const away = desks.filter((d) => d.status === 'away').length;
  const occupancyPercentage = ((occupied + away) / total) * 100;

  const stats = {
    total,
    occupied,
    free,
    away,
    occupancyPercentage
  };

  // State modification callback
  const handleStatusChange = (deskId, newStatus, studentName = null, studentId = null, checkInTime = null, lastActive = null) => {
    // 1. Update Desks State
    setDesks((prevDesks) => {
      const updated = prevDesks.map((desk) => {
        if (desk.id === deskId) {
          const updatedDesk = {
            ...desk,
            status: newStatus,
            studentName,
            studentId,
            checkInTime,
            lastActive: newStatus === 'away' ? lastActive || 'Recently left' : lastActive
          };
          
          // Update selected desk reference if it's currently open
          if (selectedDesk && selectedDesk.id === deskId) {
            setSelectedDesk(updatedDesk);
          }
          
          return updatedDesk;
        }
        return desk;
      });
      return updated;
    });

    // 2. Create Activity Log Description
    let actionDesc = 'Released';
    let actorName = 'System';
    
    const targetDesk = desks.find(d => d.id === deskId);
    
    if (newStatus === 'occupied') {
      actionDesc = 'Checked in';
      actorName = studentName || 'Student';
    } else if (newStatus === 'away') {
      actionDesc = 'Marked Away';
      actorName = studentName || targetDesk?.studentName || 'Student';
    } else if (newStatus === 'free') {
      actionDesc = 'Checked out';
      actorName = targetDesk?.studentName || 'Student';
    }

    const newActivity = {
      id: Date.now(),
      deskId,
      studentName: actorName,
      action: actionDesc,
      time: 'Just now'
    };

    setActivities((prev) => [newActivity, ...prev]);
  };

  // View Router
  const renderPage = () => {
    switch (activePage) {
      case 'dashboard':
        return (
          <Dashboard
            desks={desks}
            stats={stats}
            activities={activities}
            setActivePage={setActivePage}
            setSelectedDesk={setSelectedDesk}
          />
        );
      case 'map':
        return (
          <LibraryMap
            desks={desks}
            selectedDesk={selectedDesk}
            setSelectedDesk={setSelectedDesk}
            onStatusChange={handleStatusChange}
          />
        );
      case 'admin':
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
        {renderPage()}
      </main>
    </div>
  );
}
