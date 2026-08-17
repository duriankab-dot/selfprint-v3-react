/**
 * 📊 DecisionAnalytics Component — สถิติการตัดสินใจ
 */

import React, { useMemo } from 'react';
import type { DecisionIntelligenceReport } from '@/lib/intelligence/DecisionIntelligenceEngine';
import './decision-analytics.css';

interface Decision {
  id: string;
  title: string;
  confidence?: number;
  createdAt: Date;
}

interface DecisionAnalyticsProps {
  decisions: Decision[];
  decisionAnalysis?: DecisionIntelligenceReport | null;
}

const DecisionAnalytics: React.FC<DecisionAnalyticsProps> = ({
  decisions,
  decisionAnalysis,
}) => {
  const stats = useMemo(() => {
    return {
      totalDecisions: decisions.length,
      avgConfidence:
        decisions.length > 0
          ? Math.round(
              decisions.reduce((sum, d) => sum + (d.confidence ?? 50), 0) /
                decisions.length
            )
          : 0,
      recentDecisions: decisions.slice(0, 5),
    };
  }, [decisions]);

  return (
    <div className="decision-analytics">
      <h3>📊 สถิติการตัดสินใจ</h3>

      <div className="analytics-grid">
        <div className="analytics-card">
          <p className="analytics-label">การตัดสินใจทั้งหมด</p>
          <p className="analytics-value">{stats.totalDecisions}</p>
        </div>

        <div className="analytics-card">
          <p className="analytics-label">ความมั่นใจเฉลี่ย</p>
          <p className="analytics-value">{stats.avgConfidence}%</p>
        </div>

        {decisionAnalysis && (
          <div className="analytics-card">
            <p className="analytics-label">สไตล์การตัดสินใจ</p>
            <p className="analytics-value">{decisionAnalysis.styleProfile.type}</p>
          </div>
        )}
      </div>

      {decisionAnalysis && (
        <div className="analytics-section">
          <h4>💡 ข้อมูลเชิงลึก</h4>
          <p>{decisionAnalysis.topInsight}</p>

          <div className="strengths-section">
            <h5>✅ จุดแข็ง</h5>
            <ul>
              {decisionAnalysis.styleProfile.strengthsThai.map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ul>
          </div>

          <div className="watchouts-section">
            <h5>⚠️ จุดที่ต้องระวัง</h5>
            <ul>
              {decisionAnalysis.styleProfile.watchoutsThai.map((w, i) => (
                <li key={i}>{w}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {stats.recentDecisions.length > 0 && (
        <div className="analytics-section">
          <h4>📋 การตัดสินใจล่าสุด</h4>
          <ul className="recent-list">
            {stats.recentDecisions.map((d) => (
              <li key={d.id}>{d.title}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default DecisionAnalytics;
