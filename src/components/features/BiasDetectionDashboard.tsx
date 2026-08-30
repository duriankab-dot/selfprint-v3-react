/**
 * 🎯 BiasDetectionDashboard Component — การแสดง Cognitive Biases
 *
 * **ทำหน้าที่:**
 * - แสดง cognitive biases ที่เข้ารหัสจาก DecisionIntelligenceEngine
 * - ความรุนแรง (low/medium/high)
 * - หลักฐาน + คำแนะนำการลดเบา
 * - Timeline bias changes
 *
 * **Integration:**
 * - DecisionIntelligenceEngine.analyze()
 * - PersonalContext data
 */

import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { DecisionIntelligenceEngine } from '@/lib/intelligence/DecisionIntelligenceEngine';
import { PersonalContextBuilder } from '@/lib/intelligence/PersonalContextBuilder';
import './bias-detection.css';

// ============================================================================
// Component
// ============================================================================

const BiasDetectionDashboard: React.FC = () => {
  const { session } = useAuth();
  const userId = session?.user?.id ?? '';
  const { language } = useLanguage();
  const isTh = language === 'th';

  const contextBuilder = useMemo(() => new PersonalContextBuilder(), []);
  const decisionEngine = useMemo(() => new DecisionIntelligenceEngine(), []);

  // Query
  const { data: personalContext, isLoading } = useQuery({
    queryKey: ['personalContext', userId],
    queryFn: () => contextBuilder.getContext(userId),
    enabled: !!userId,
    staleTime: 60_000,
  });

  // Analyze
  const analysis = useMemo(() => {
    if (!personalContext) return null;
    return decisionEngine.analyze(personalContext);
  }, [personalContext, decisionEngine]);

  if (!userId) {
    return (
      <div className="bias-detection">
        <p>{isTh ? 'กรุณาเข้าสู่ระบบ' : 'Please log in'}</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="bias-detection bias-detection--loading">
        <div className="spinner" />
        <p>{isTh ? 'กำลังวิเคราะห์ Biases...' : 'Analyzing biases...'}</p>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="bias-detection">
        <p>{isTh ? 'ไม่สามารถโหลดข้อมูล' : 'Could not load data'}</p>
      </div>
    );
  }

  const highSeverity = analysis.biasRisks.filter((b) => b.severity === 'high');
  const mediumSeverity = analysis.biasRisks.filter((b) => b.severity === 'medium');
  const lowSeverity = analysis.biasRisks.filter((b) => b.severity === 'low');

  return (
    <div className="bias-detection">
      <div className="bias-detection__header">
        <h2>🎯 {isTh ? 'Cognitive Biases ที่พบบ่อย' : 'Common Cognitive Biases'}</h2>
        <p>{isTh ? 'biases ที่มักเกิดขึ้นในการตัดสินใจของคุณ พร้อมเคล็ดลับการลดเบา' : 'Biases that tend to show up in your decisions, with tips to reduce them'}</p>
      </div>

      {/* High Severity */}
      {highSeverity.length > 0 && (
        <section className="bias-section bias-section--high">
          <h3>⚠️ {isTh ? 'ความเสี่ยงสูง' : 'High risk'} ({highSeverity.length})</h3>
          <div className="bias-grid">
            {highSeverity.map((bias, idx) => (
              <div key={idx} className="bias-card bias-card--high">
                <h4>{bias.name}</h4>
                <p className="bias-desc">{bias.descriptionThai}</p>
                {bias.personalizedNote && (
                  <p className="bias-note">💡 {bias.personalizedNote}</p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Medium Severity */}
      {mediumSeverity.length > 0 && (
        <section className="bias-section bias-section--medium">
          <h3>⚡ {isTh ? 'ความเสี่ยงกลาง' : 'Medium risk'} ({mediumSeverity.length})</h3>
          <div className="bias-grid">
            {mediumSeverity.map((bias, idx) => (
              <div key={idx} className="bias-card bias-card--medium">
                <h4>{bias.name}</h4>
                <p className="bias-desc">{bias.descriptionThai}</p>
                {bias.personalizedNote && (
                  <p className="bias-note">💡 {bias.personalizedNote}</p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Low Severity */}
      {lowSeverity.length > 0 && (
        <section className="bias-section bias-section--low">
          <h3>ℹ️ {isTh ? 'ความเสี่ยงต่ำ' : 'Low risk'} ({lowSeverity.length})</h3>
          <div className="bias-grid">
            {lowSeverity.map((bias, idx) => (
              <div key={idx} className="bias-card bias-card--low">
                <h4>{bias.name}</h4>
                <p className="bias-desc">{bias.descriptionThai}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Tips */}
      <section className="bias-tips">
        <h3>💡 {isTh ? 'เคล็ดลับการลดเบา' : 'Tips to reduce bias'}</h3>
        <ul className="tips-list">
          {isTh ? (
            <>
              <li>ทำให้สมมติฐานของคุณสามารถเห็น ลองเขียนออกมา</li>
              <li>ขอความเห็นจากคนที่มีมุมมองต่างกัน</li>
              <li>ใช้แล้งเวิร์กสำหรับการตัดสินใจสำคัญ ไม่ใช่เพียง Gut feeling</li>
              <li>ติดตามผลลัพธ์จริง ตรวจสอบว่าความคาดหวังตรงกันไหม</li>
              <li>ให้เวลากับการตัดสินใจหากเป็นไปได้ Emotional reactions จะสงบลง</li>
            </>
          ) : (
            <>
              <li>Make your assumptions visible — try writing them out</li>
              <li>Ask for opinions from people with different perspectives</li>
              <li>Use a framework for important decisions, not just gut feeling</li>
              <li>Track actual outcomes — check whether expectations matched reality</li>
              <li>Give a decision time when possible — emotional reactions settle down</li>
            </>
          )}
        </ul>
      </section>
    </div>
  );
};

export default BiasDetectionDashboard;
