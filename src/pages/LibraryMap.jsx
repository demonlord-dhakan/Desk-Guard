// src/pages/LibraryMap.jsx
import DeskGrid from '../components/DeskGrid';
import DetailPanel from '../components/DetailPanel';
import '../styles/LibraryMap.css';

export default function LibraryMap({ desks, selectedDesk, setSelectedDesk, onStatusChange }) {
  const handleDeskClick = (desk) => {
    setSelectedDesk(desk);
  };

  const handleClosePanel = () => {
    setSelectedDesk(null);
  };

  // Quick stats calculations for map header
  const free = desks.filter((d) => d.status === 'free').length;
  const occupied = desks.filter((d) => d.status === 'occupied').length;
  const away = desks.filter((d) => d.status === 'away').length;

  return (
    <div className="library-map-view">
      <div className="page-header animate-fade-in">
        <div>
          <h2 className="page-title">Interactive Floor Map</h2>
          <p className="page-subtitle">Select a study cell or desk below to check in, check out, or log an absence.</p>
        </div>

        {/* Mini Legend Indicators */}
        <div className="map-legend glass-panel">
          <div className="legend-item">
            <span className="legend-dot dot-free"></span>
            <span>Free ({free})</span>
          </div>
          <div className="legend-item">
            <span className="legend-dot dot-occupied"></span>
            <span>Occupied ({occupied})</span>
          </div>
          <div className="legend-item">
            <span className="legend-dot dot-away"></span>
            <span>Away ({away})</span>
          </div>
        </div>
      </div>

      <div className="map-layout-grid">
        {/* Desk Grid Display */}
        <div className="map-grid-container">
          <DeskGrid
            desks={desks}
            selectedDeskId={selectedDesk?.id || null}
            onDeskClick={handleDeskClick}
          />
        </div>

        {/* Detail Action Panel */}
        <div className="map-details-container">
          <DetailPanel
            key={selectedDesk?.id || 'none'}
            desk={selectedDesk}
            onClose={handleClosePanel}
            onStatusChange={onStatusChange}
          />
        </div>
      </div>
    </div>
  );
}
