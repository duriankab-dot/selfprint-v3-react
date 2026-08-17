/**
 * 📈 TwinEvolutionChart Component — Accuracy Trend Visualization
 *
 * **ทำหน้าที่:**
 * - Display Twin accuracy trend over time
 * - Show progress (improving ↑ / stable → / declining ↓)
 * - Mockup chart (in production: use Recharts/D3)
 *
 * **Input Props:**
 * - accuracy: number (0-1)
 * - trend: 'improving' | 'stable' | 'declining'
 *
 * @module features/TwinEvolutionChart
 */

import React from 'react';
import './TwinEvolutionChart.css';

interface TwinEvolutionChartProps {
  accuracy: number;
  trend: 'improving' | 'stable' | 'declining';
}

export const TwinEvolutionChart: React.FC<TwinEvolutionChartProps> = ({ accuracy, trend }) => {
  const accuracyPercent = Math.round(accuracy * 100);

  // Mockup data: generate realistic trend data
  const mockData = generateMockData(accuracy, trend);

  return (
    <div className="twin-evolution-chart">
      {/* Simple bar chart mockup */}
      <div className="chart-container">
        <div className="chart-bars">
          {mockData.map((point, idx) => (
            <div key={idx} className="bar-wrapper">
              <div
                className={`bar ${point.highlight ? 'bar--highlight' : ''}`}
                style={{ height: `${point.value}%` }}
                title={`${point.value}% accuracy`}
              />
            </div>
          ))}
        </div>

        {/* Y-axis labels */}
        <div className="chart-labels">
          <div className="label">100%</div>
          <div className="label">50%</div>
          <div className="label">0%</div>
        </div>
      </div>

      {/* Stats below chart */}
      <div className="chart-stats">
        <div className="stat-item">
          <span className="stat-label">ปัจจุบัน</span>
          <span className="stat-value">{accuracyPercent}%</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">แนวโน้ม</span>
          <span className={`stat-value trend-${trend}`}>
            {trend === 'improving' ? '📈 ดีขึ้น' : trend === 'declining' ? '📉 ลดลง' : '➡️ คงที่'}
          </span>
        </div>
        <div className="stat-item">
          <span className="stat-label">เป้าหมาย</span>
          <span className="stat-value">90%+</span>
        </div>
      </div>

      {/* Insight message */}
      <div className={`chart-insight insight-${trend}`}>
        <p>
          {trend === 'improving'
            ? '✅ Twin ของคุณ กำลังเรียนรู้ได้ดีขึ้น ให้ feedback ต่อไป!'
            : trend === 'declining'
              ? '⚠️ Twin accuracy ลดลง อาจจำเป็นต้องให้ feedback เพิ่มเติม'
              : '➡️ Twin accuracy อยู่ในระดับคงที่ ทำให้ feedback เพิ่มเติมเพื่อปรับปรุง'}
        </p>
      </div>
    </div>
  );
};

// ============================================================================
// Helper: Generate mockup data
// ============================================================================

function generateMockData(accuracy: number, trend: 'improving' | 'stable' | 'declining') {
  const baseValue = Math.round(accuracy * 100);

  // Generate 20 data points with trend
  const data = [];
  for (let i = 0; i < 20; i++) {
    let value = baseValue * (0.7 + Math.random() * 0.3); // Vary around base

    // Apply trend
    if (trend === 'improving') {
      value += (i * 0.5); // Gradually increase
    } else if (trend === 'declining') {
      value -= (i * 0.3); // Gradually decrease
    }

    value = Math.max(0, Math.min(100, value)); // Clamp to 0-100

    data.push({
      value: Math.round(value),
      highlight: i === data.length - 1, // Highlight last point
    });
  }

  return data;
}

export default TwinEvolutionChart;
