/**
 * 📊 AdvancedAnalytics Component — วิเคราะห์ข้อมูลขั้นสูง
 *
 * **ทำหน้าที่:**
 * - Timeline ของ insights ทั้งหมด
 * - Correlation analysis (patterns vs decisions)
 * - Predictive insights
 * - Export capability
 */

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import './advanced-analytics.css';

const AdvancedAnalytics: React.FC = () => {
  const { session } = useAuth();
  const userId = session?.user?.id ?? '';
  const { language } = useLanguage();
  const isTh = language === 'th';

  const { data: analytics, isLoading } = useQuery({
    queryKey: ['advancedAnalytics', userId, language],
    queryFn: async () => {
      // Mock data สำหรับตอนนี้
      return {
        totalInsights: 42,
        totalDecisions: 8,
        totalPatterns: 12,
        totalMemories: 35,
        trendAccuracy: 'improving',
        correlations: [
          { metric: 'Accuracy ↔ Confidence', strength: 'strong' },
          { metric: 'Decisions ↔ Pattern Discovery', strength: 'moderate' },
          { metric: 'Memories ↔ Context Understanding', strength: 'strong' },
        ],
        predictions: isTh
          ? [
              'Accuracy จะมีแนวโน้มเพิ่มขึ้นต่อไป ถ้าคุณบันทึกข้อมูลอย่างต่อเนื่อง',
              'Bias ที่ตรวจพบบ่อยสุด: Confirmation bias (ให้ความสำคัญกับสิ่งที่เห็นด้วย)',
              'ข้อมูล 30 วันแรกบ่งชี้ว่า AI Twin มีความเข้าใจตัวคุณในด้าน work decisions',
            ]
          : [
              'Accuracy will likely keep improving if you keep logging data consistently',
              'Most frequently detected bias: Confirmation bias (favoring what you already agree with)',
              'Your first 30 days of data suggest your AI Twin understands you best in work decisions',
            ],
      };
    },
    enabled: !!userId,
    staleTime: 120_000,
  });

  if (!userId) {
    return <div>{isTh ? 'กรุณาเข้าสู่ระบบ' : 'Please log in'}</div>;
  }

  if (isLoading) {
    return (
      <div className="analytics-loading">
        <div className="spinner" />
        <p>{isTh ? 'กำลังวิเคราะห์ข้อมูล...' : 'Analyzing data...'}</p>
      </div>
    );
  }

  if (!analytics) {
    return <div>{isTh ? 'ไม่สามารถโหลดข้อมูล' : 'Could not load data'}</div>;
  }

  return (
    <div className="advanced-analytics">
      <h2>📊 Advanced Analytics</h2>

      {/* Summary Stats */}
      <section className="analytics-section">
        <h3>📈 Summary Statistics</h3>
        <div className="stats-grid">
          <div className="stat-box">
            <span className="stat-label">Total Insights</span>
            <span className="stat-value">{analytics.totalInsights}</span>
          </div>
          <div className="stat-box">
            <span className="stat-label">Decisions Made</span>
            <span className="stat-value">{analytics.totalDecisions}</span>
          </div>
          <div className="stat-box">
            <span className="stat-label">Patterns Found</span>
            <span className="stat-value">{analytics.totalPatterns}</span>
          </div>
          <div className="stat-box">
            <span className="stat-label">Memories Saved</span>
            <span className="stat-value">{analytics.totalMemories}</span>
          </div>
        </div>
      </section>

      {/* Correlations */}
      <section className="analytics-section">
        <h3>🔗 Correlation Analysis</h3>
        <div className="correlations-list">
          {analytics.correlations.map((corr, idx) => (
            <div key={idx} className="correlation-item">
              <span className="correlation-metric">{corr.metric}</span>
              <span className={`correlation-strength strength-${corr.strength}`}>
                {corr.strength === 'strong' && '💪 Strong'}
                {corr.strength === 'moderate' && '👍 Moderate'}
                {corr.strength === 'weak' && '→ Weak'}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Predictions */}
      <section className="analytics-section">
        <h3>🔮 Predictive Insights</h3>
        <div className="predictions-list">
          {analytics.predictions.map((pred, idx) => (
            <div key={idx} className="prediction-item">
              <span className="prediction-icon">→</span>
              <span className="prediction-text">{pred}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Export */}
      <section className="analytics-section">
        <h3>📥 Export Data</h3>
        <div className="export-buttons">
          <button className="export-btn">
            📊 Export as PDF
          </button>
          <button className="export-btn">
            📋 Export as CSV
          </button>
        </div>
      </section>
    </div>
  );
};

export default AdvancedAnalytics;
