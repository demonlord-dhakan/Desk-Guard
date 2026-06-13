// src/components/DeskGrid.jsx
import DeskCard from './DeskCard';
import { Monitor, BookOpen, Users, Compass } from 'lucide-react';
import '../styles/LibraryMap.css';

export default function DeskGrid({ desks, selectedDeskId, onDeskClick }) {
  const zones = [
    { name: 'Quiet Study', icon: BookOpen, range: [1, 15] },
    { name: 'Collaboration Area', icon: Users, range: [16, 30] },
    { name: 'PC Lab', icon: Monitor, range: [31, 40] },
    { name: 'Window View', icon: Compass, range: [41, 50] },
  ];

  const getZoneStats = (zoneName) => {
    const zoneDesks = desks.filter((d) => d.zone === zoneName);
    const free = zoneDesks.filter((d) => d.status === 'free').length;
    return { free, total: zoneDesks.length };
  };

  return (
    <div className="desk-grid-layout">
      {zones.map((zone) => {
        const ZoneIcon = zone.icon;
        const zoneDesks = desks.filter((d) => d.id >= zone.range[0] && d.id <= zone.range[1]);
        const stats = getZoneStats(zone.name);
        
        return (
          <div key={zone.name} className="glass-panel zone-section animate-fade-in">
            <div className="zone-header">
              <div className="zone-info">
                <ZoneIcon size={18} className="zone-icon text-blue" />
                <h3 className="zone-title">{zone.name}</h3>
              </div>
              <span className="zone-badge">
                {stats.free} / {stats.total} available
              </span>
            </div>
            
            <div className="zone-desks-grid">
              {zoneDesks.map((desk) => (
                <DeskCard
                  key={desk.id}
                  desk={desk}
                  isSelected={selectedDeskId === desk.id}
                  onClick={onDeskClick}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
