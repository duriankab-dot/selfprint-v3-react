import React from 'react';
import './TrendChart.css';

interface TrendPoint {
  created_at: string;
  autonomy_level: number;
  confidence: number;
}

interface TrendChartProps {
  data: TrendPoint[];
}

const TrendChart: React.FC<TrendChartProps> = ({ data }) => {
  if (data.length < 2) {
    return <div className="chart-empty">ข้อมูลยังไม่พอสำหรับแสดงกราฟ</div>;
  }

  // Find min/max for scaling
  const autonomyLevels = data.map((d) => d.autonomy_level);
  const minAutonomy = Math.min(...autonomyLevels);
  const maxAutonomy = Math.max(...autonomyLevels);
  const range = maxAutonomy - minAutonomy || 10; // Avoid division by zero

  // Calculate chart dimensions
  const chartWidth = 800;
  const chartHeight = 300;
  const pointSpacing = (chartWidth - 60) / (data.length - 1);

  // Generate SVG path for autonomy line
  const pathPoints = data
    .map((d, i) => {
      const x = 30 + i * pointSpacing;
      const y = chartHeight - 30 - ((d.autonomy_level - minAutonomy) / range) * (chartHeight - 60);
      return `${x},${y}`;
    })
    .join(' L ');

  const svgPath = `M ${pathPoints}`;

  // Format date for labels
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('th-TH', { month: '2-digit', day: '2-digit' });
  };

  return (
    <div className="trend-chart">
      <svg width={chartWidth} height={chartHeight} viewBox={`0 0 ${chartWidth} ${chartHeight}`}>
        {/* Grid lines */}
        {[0, 25, 50, 75, 100].map((level) => (
          <g key={`grid-${level}`}>
            <line
              x1="30"
              y1={chartHeight - 30 - ((level - minAutonomy) / range) * (chartHeight - 60)}
              x2={chartWidth - 30}
              y2={chartHeight - 30 - ((level - minAutonomy) / range) * (chartHeight - 60)}
              stroke="#e9ecef"
              strokeWidth="1"
              strokeDasharray="4 4"
            />
            <text
              x="20"
              y={chartHeight - 20 - ((level - minAutonomy) / range) * (chartHeight - 60)}
              textAnchor="end"
              fontSize="12"
              fill="#6c757d"
            >
              {level}%
            </text>
          </g>
        ))}

        {/* Y-axis */}
        <line x1="30" y1="30" x2="30" y2={chartHeight - 30} stroke="#495057" strokeWidth="2" />

        {/* X-axis */}
        <line x1="30" y1={chartHeight - 30} x2={chartWidth - 30} y2={chartHeight - 30} stroke="#495057" strokeWidth="2" />

        {/* Trend line */}
        <path d={svgPath} stroke="url(#trendGradient)" strokeWidth="3" fill="none" strokeLinecap="round" />

        {/* Gradient definition */}
        <defs>
          <linearGradient id="trendGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#667eea" />
            <stop offset="100%" stopColor="#764ba2" />
          </linearGradient>
        </defs>

        {/* Data points */}
        {data.map((d, i) => {
          const x = 30 + i * pointSpacing;
          const y = chartHeight - 30 - ((d.autonomy_level - minAutonomy) / range) * (chartHeight - 60);
          return (
            <circle
              key={`point-${i}`}
              cx={x}
              cy={y}
              r="5"
              fill="white"
              stroke="#667eea"
              strokeWidth="2"
            />
          );
        })}

        {/* X-axis labels (every nth point) */}
        {data.map((d, i) => {
          if (i % Math.ceil(data.length / 5) === 0) {
            const x = 30 + i * pointSpacing;
            return (
              <text
                key={`label-${i}`}
                x={x}
                y={chartHeight - 10}
                textAnchor="middle"
                fontSize="12"
                fill="#6c757d"
              >
                {formatDate(d.created_at)}
              </text>
            );
          }
          return null;
        })}
      </svg>

      <div className="chart-legend">
        <div className="legend-item">
          <div className="legend-color" style={{ background: 'linear-gradient(90deg, #667eea, #764ba2)' }} />
          <span>ระดับความเป็นอิสระ (%)</span>
        </div>
      </div>
    </div>
  );
};

export default TrendChart;
