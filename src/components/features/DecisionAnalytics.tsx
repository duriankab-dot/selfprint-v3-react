/**
 * 📊 DecisionAnalytics Component — สถิติการตัดสินใจ
 */

import React, { useMemo } from 'react';
import { useLanguage } from '@/context/LanguageContext';
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
  const { language } = useLanguage();
  const isTh = language === 'th';
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
      <h3>📊 {isTh ? 'สถิติการตัดสินใจ' : 'Decision Statistics'}</h3>

      <div className="analytics-grid">
        <div className="analytics-card">
          <p className="analytics-label">{isTh ? 'การตัดสินใจทั้งหมด' : 'Total decisions'}</p>
          <p className="analytics-value">{stats.totalDecisions}</p>
        </div>

        <div className="analytics-card">
          <p className="analytics-label">{isTh ? 'ความมั่นใจเฉลี่ย' : 'Average confidence'}</p>
          <p className="analytics-value">{stats.avgConfidence}%</p>
        </div>

        {decisionAnalysis && (
          <div className="analytics-card">
            <p className="analytics-label">{isTh ? 'สไตล์การตัดสินใจ' : 'Decision style'}</p>
            <p className="analytics-value">{decisionAnalysis.styleProfile.type}</p>
          </div>
        )}
      </div>

      {decisionAnalysis && (
        <div className="analytics-section">
          <h4>💡 {isTh ? 'ข้อมูลเชิงลึก' : 'Insight'}</h4>
          <p>{decisionAnalysis.topInsight}</p>

          <div className="strengths-section">
            <h5>✅ {isTh ? 'จุดแข็ง' : 'Strengths'}</h5>
            <ul>
              {decisionAnalysis.styleProfile.strengthsThai.map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ul>
          </div>

          <div className="watchouts-section">
            <h5>⚠️ {isTh ? 'จุดที่ต้องระวัง' : 'Watch out for'}</h5>
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
          <h4>📋 {isTh ? 'การตัดสินใจล่าสุด' : 'Recent decisions'}</h4>
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
