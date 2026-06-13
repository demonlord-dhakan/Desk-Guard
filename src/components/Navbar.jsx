// src/components/Navbar.jsx
import { LayoutDashboard, Map, BarChart3, Shield, Radio } from 'lucide-react';
import '../styles/Navbar.css';

export default function Navbar({ activePage, setActivePage, stats }) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'map', label: 'Library Map', icon: Map, badge: stats.free },
    { id: 'admin', label: 'Admin Panel', icon: BarChart3 },
  ];

  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-logo">
          <Shield className="logo-icon" size={24} />
        </div>
        <div className="brand-info">
          <h1 className="brand-name">DeskGuard</h1>
          <span className="brand-tagline">Library Occupancy</span>
        </div>
      </div>

      <nav className="nav-menu">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activePage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActivePage(item.id)}
              className={`nav-item ${isActive ? 'active' : ''}`}
            >
              <Icon size={20} className="nav-icon" />
              <span className="nav-label">{item.label}</span>
              {item.badge !== undefined && item.id === 'map' && (
                <span className="nav-badge">{item.badge} free</span>
              )}
            </button>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <div className="connection-status">
          <div className="pulse-indicator"></div>
          <span>System Online</span>
        </div>
        <div className="version-info">
          <Radio size={14} className="version-icon" />
          <span>v1.2.0 (Prototype)</span>
        </div>
      </div>
    </aside>
  );
}
