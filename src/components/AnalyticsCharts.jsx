// src/components/AnalyticsCharts.jsx
import { useState } from 'react';
import '../styles/Dashboard.css';

export function WeeklyUtilizationChart({ data }) {
  const [hoveredIdx, setHoveredIdx] = useState(null);
  
  const width = 500;
  const height = 180;
  const paddingX = 40;
  const paddingY = 25;
  
  // Calculate plotting boundaries
  const chartWidth = width - paddingX * 2;
  const chartHeight = height - paddingY * 2;
  
  const getCoords = (rate, idx) => {
    const x = paddingX + (idx / (data.length - 1)) * chartWidth;
    const y = paddingY + chartHeight - (rate / 100) * chartHeight;
    return { x, y };
  };

  // Generate path points
  const points = data.map((d, i) => getCoords(d.rate, i));
  
  // Create area path
  let areaPath = '';
  let linePath = '';
  
  if (points.length > 0) {
    linePath = `M ${points[0].x} ${points[0].y} ` + points.slice(1).map(p => `L ${p.x} ${p.y}`).join(' ');
    areaPath = `${linePath} L ${points[points.length - 1].x} ${height - paddingY} L ${points[0].x} ${height - paddingY} Z`;
  }

  return (
    <div className="chart-container">
      <div className="chart-header">
        <h4 className="chart-title">Weekly Utilization Rate</h4>
        {hoveredIdx !== null && (
          <div className="chart-tooltip-bubble">
            <span className="tooltip-day">{data[hoveredIdx].day}:</span>
            <span className="tooltip-value"> {data[hoveredIdx].rate}% occupancy</span>
          </div>
        )}
      </div>
      
      <div className="svg-wrapper">
        <svg viewBox={`0 0 ${width} ${height}`} width="100%" height="100%">
          <defs>
            <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.4" />
              <stop offset="100%" stopColor="var(--primary)" stopOpacity="0.0" />
            </linearGradient>
          </defs>
          
          {/* Grid lines */}
          {[0, 25, 50, 75, 100].map((level) => {
            const y = paddingY + chartHeight - (level / 100) * chartHeight;
            return (
              <g key={level}>
                <line
                  x1={paddingX}
                  y1={y}
                  x2={width - paddingX}
                  y2={y}
                  stroke="var(--border-light)"
                  strokeWidth="1"
                  strokeDasharray="4 4"
                />
                <text
                  x={paddingX - 10}
                  y={y + 4}
                  fill="var(--text-muted)"
                  fontSize="9"
                  textAnchor="end"
                >
                  {level}%
                </text>
              </g>
            );
          })}
          
          {/* Filled Area */}
          <path d={areaPath} fill="url(#areaGrad)" />
          
          {/* Line Path */}
          <path d={linePath} fill="none" stroke="var(--primary)" strokeWidth="2.5" />
          
          {/* Interactive Dots and Labels */}
          {points.map((p, i) => (
            <g key={i}>
              {/* Invisible interactive hover zone */}
              <circle
                cx={p.x}
                cy={p.y}
                r="16"
                fill="transparent"
                style={{ cursor: 'pointer' }}
                onMouseEnter={() => setHoveredIdx(i)}
                onMouseLeave={() => setHoveredIdx(null)}
              />
              {/* Visual Dot */}
              <circle
                cx={p.x}
                cy={p.y}
                r={hoveredIdx === i ? '6' : '4'}
                fill="var(--bg-primary)"
                stroke={hoveredIdx === i ? 'var(--secondary)' : 'var(--primary)'}
                strokeWidth={hoveredIdx === i ? '3' : '2'}
                style={{ transition: 'all 0.15s ease', pointerEvents: 'none' }}
              />
              {/* Day Labels */}
              <text
                x={p.x}
                y={height - paddingY + 16}
                fill="var(--text-muted)"
                fontSize="10"
                textAnchor="middle"
              >
                {data[i].day}
              </text>
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
}

export function PeakHoursChart({ data }) {
  const [hoveredIdx, setHoveredIdx] = useState(null);
  
  const width = 500;
  const height = 180;
  const paddingX = 40;
  const paddingY = 25;
  
  const chartWidth = width - paddingX * 2;
  const chartHeight = height - paddingY * 2;
  
  const barWidth = (chartWidth / data.length) * 0.6;
  const gap = (chartWidth / data.length) * 0.4;

  return (
    <div className="chart-container">
      <div className="chart-header">
        <h4 className="chart-title">Peak Usage Hours</h4>
        {hoveredIdx !== null && (
          <div className="chart-tooltip-bubble second-chart">
            <span className="tooltip-day">{data[hoveredIdx].hour}:</span>
            <span className="tooltip-value"> {data[hoveredIdx].percentage}% Busy</span>
          </div>
        )}
      </div>
      
      <div className="svg-wrapper">
        <svg viewBox={`0 0 ${width} ${height}`} width="100%" height="100%">
          <defs>
            <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--secondary)" />
              <stop offset="100%" stopColor="var(--primary)" />
            </linearGradient>
          </defs>
          
          {/* Grid lines */}
          {[0, 25, 50, 75, 100].map((level) => {
            const y = paddingY + chartHeight - (level / 100) * chartHeight;
            return (
              <g key={level}>
                <line
                  x1={paddingX}
                  y1={y}
                  x2={width - paddingX}
                  y2={y}
                  stroke="var(--border-light)"
                  strokeWidth="1"
                />
              </g>
            );
          })}
          
          {/* Bars */}
          {data.map((d, i) => {
            const barHeight = (d.percentage / 100) * chartHeight;
            const x = paddingX + i * (barWidth + gap) + gap / 2;
            const y = paddingY + chartHeight - barHeight;
            const isHovered = hoveredIdx === i;
            
            return (
              <g key={i}>
                {/* Visual Bar */}
                <rect
                  x={x}
                  y={y}
                  width={barWidth}
                  height={barHeight}
                  rx="4"
                  fill="url(#barGrad)"
                  opacity={isHovered ? 1 : 0.75}
                  style={{ transition: 'all 0.2s ease', cursor: 'pointer' }}
                  onMouseEnter={() => setHoveredIdx(i)}
                  onMouseLeave={() => setHoveredIdx(null)}
                />
                
                {/* X-axis Label (Time range shorthand, like '8a', '10a') */}
                <text
                  x={x + barWidth / 2}
                  y={height - paddingY + 15}
                  fill="var(--text-muted)"
                  fontSize="9"
                  textAnchor="middle"
                >
                  {d.hour.split(':')[0] + d.hour.slice(-2).toLowerCase().charAt(0)}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
