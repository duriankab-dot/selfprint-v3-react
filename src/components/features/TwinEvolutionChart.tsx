/**
 * 📈 TwinEvolutionChart Component — Accuracy Trend Visualization
 *
 * **ทำหน้าที่:**
 * - Display Twin accuracy trend over time
 * - Show progress (improving ↑ / stable → / declining ↓)
 *
 * NOPLACEHOLDER-001 FIX: this used to render a 20-bar history chart built
 * from Math.random() (see the removed generateMockData helper) — a fake
 * accuracy history displayed as if it were real. No persisted accuracy
 * time-series exists yet to render honestly in its place, so this shows
 * only the real accuracy/trend values it's actually given, as a single
 * meter — no fabricated data points.
 *
 * **Input Props:**
 * - accuracy: number (0-1)
 * - trend: 'improving' | 'stable' | 'declining'
 *
 * @module features/TwinEvolutionChart
 */

import React from 'react';
import { useLanguage } from '@/context/LanguageContext';
import './TwinEvolutionChart.css';

interface TwinEvolutionChartProps {
  accuracy: number;
  trend: 'improving' | 'stable' | 'declining';
}

export const TwinEvolutionChart: React.FC<TwinEvolutionChartProps> = ({ accuracy, trend }) => {
  const { language } = useLanguage();
  const isTh = language === 'th';
  const accuracyPercent = Math.round(accuracy * 100);

  return (
    <div className="twin-evolution-chart">
      {/* Single real-data meter — see NOPLACEHOLDER-001 note above for why
          this isn't a multi-point history chart. */}
      <div className="chart-meter">
        <div
          className={`chart-meter-fill chart-meter-fill--${trend}`}
          style={{ width: `${accuracyPercent}%` }}
        />
      </div>

      {/* Stats below chart */}
      <div className="chart-stats">
        <div className="stat-item">
          <span className="stat-label">{isTh ? 'ปัจจุบัน' : 'Current'}</span>
          <span className="stat-value">{accuracyPercent}%</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">{isTh ? 'แนวโน้ม' : 'Trend'}</span>
          <span className={`stat-value trend-${trend}`}>
            {isTh
              ? (trend === 'improving' ? '📈 ดีขึ้น' : trend === 'declining' ? '📉 ลดลง' : '➡️ คงที่')
              : (trend === 'improving' ? '📈 Improving' : trend === 'declining' ? '📉 Declining' : '➡️ Stable')}
          </span>
        </div>
        <div className="stat-item">
          <span className="stat-label">{isTh ? 'เป้าหมาย' : 'Target'}</span>
          <span className="stat-value">90%+</span>
        </div>
      </div>

      {/* Insight message */}
      <div className={`chart-insight insight-${trend}`}>
        <p>
          {isTh
            ? (trend === 'improving'
                ? '✅ Twin ของคุณ กำลังเรียนรู้ได้ดีขึ้น ให้ feedback ต่อไป!'
                : trend === 'declining'
                  ? '⚠️ Twin accuracy ลดลง อาจจำเป็นต้องให้ feedback เพิ่มเติม'
                  : '➡️ Twin accuracy อยู่ในระดับคงที่ ทำให้ feedback เพิ่มเติมเพื่อปรับปรุง')
            : (trend === 'improving'
                ? '✅ Your Twin is learning better — keep giving feedback!'
                : trend === 'declining'
                  ? '⚠️ Twin accuracy is declining — more feedback may help'
                  : '➡️ Twin accuracy is stable — give more feedback to improve it')}
        </p>
      </div>
    </div>
  );
};

export default TwinEvolutionChart;
