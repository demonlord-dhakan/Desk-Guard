// src/components/DeskCard.jsx
import '../styles/LibraryMap.css';

export default function DeskCard({ desk, isSelected, onClick }) {
  const getStatusClass = (status) => {
    switch (status) {
      case 'free':
        return 'desk-status-free';
      case 'occupied':
        return 'desk-status-occupied';
      case 'away':
        return 'desk-status-away';
      default:
        return '';
    }
  };

  const formattedNumber = desk.id < 10 ? `0${desk.id}` : desk.id;

  return (
    <button
      onClick={() => onClick(desk)}
      className={`desk-card ${getStatusClass(desk.status)} ${isSelected ? 'selected' : ''}`}
      aria-label={`Desk ${desk.id}, Status: ${desk.status}`}
    >
      <div className="desk-indicator"></div>
      <span className="desk-number">{formattedNumber}</span>
      {desk.studentName && (
        <span className="desk-tooltip">{desk.studentName.split(' ')[0]}</span>
      )}
    </button>
  );
}
