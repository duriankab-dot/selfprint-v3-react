import React from 'react';
import type { PatternInsight } from '../../lib/patternDetection';

interface PatternInsightsProps {
  patterns: PatternInsight[];
}

const PatternInsights: React.FC<PatternInsightsProps> = ({ patterns }) => {
  if (patterns.length === 0) return null;

  return (
    <div className="insights-section">
      <h2>รูปแบบที่พบ</h2>
      <ul
        style={{
          listStyle: 'none',
          padding: 0,
          margin: 0,
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
        }}
      >
        {patterns.map((pattern, idx) => (
          <li
            key={idx}
            style={{
              background: 'var(--color-bg-secondary)',
              borderRadius: '12px',
              padding: '16px 20px',
              border: '2px solid var(--accent-light)',
              fontSize: '14px',
              color: 'var(--color-text-primary)',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              lineHeight: 1.5,
            }}
          >
            <span style={{ fontSize: '18px' }} aria-hidden="true">
              {pattern.direction === 'up' ? '📈' : '📉'}
            </span>
            {pattern.message}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PatternInsights;
