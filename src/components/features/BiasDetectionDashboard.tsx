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
import { DecisionIntelligenceEngine } from '@/lib/intelligence/DecisionIntelligenceEngine';
import { PersonalContextBuilder } from '@/lib/intelligence/PersonalContextBuilder';
import './bias-detection.css';

// ============================================================================
// Component
// ============================================================================

const BiasDetectionDashboard: React.FC = () => {
  const { session } = useAuth();
  const userId = session?.user?.id ?? '';

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
        <p>กรุณาเข้าสู่ระบบ</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="bias-detection bias-detection--loading">
        <div className="spinner" />
        <p>กำลังวิเคราะห์ Biases...</p>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="bias-detection">
        <p>ไม่สามารถโหลดข้อมูล</p>
      </div>
    );
  }

  const highSeverity = analysis.biasRisks.filter((b) => b.severity === 'high');
  const mediumSeverity = analysis.biasRisks.filter((b) => b.severity === 'medium');
  const lowSeverity = analysis.biasRisks.filter((b) => b.severity === 'low');

  return (
    <div className="bias-detection">
      <div className="bias-detection__header">
        <h2>🎯 Cognitive Biases ที่พบบ่อย</h2>
        <p>biases ที่มักเกิดขึ้นในการตัดสินใจของคุณ พร้อมเคล็ดลับการลดเบา</p>
      </div>

      {/* High Severity */}
      {highSeverity.length > 0 && (
        <section className="bias-section bias-section--high">
          <h3>⚠️ ความเสี่ยงสูง ({highSeverity.length})</h3>
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
          <h3>⚡ ความเสี่ยงกลาง ({mediumSeverity.length})</h3>
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
          <h3>ℹ️ ความเสี่ยงต่ำ ({lowSeverity.length})</h3>
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
        <h3>💡 เคล็ดลับการลดเบา</h3>
        <ul className="tips-list">
          <li>ทำให้สมมติฐานของคุณสามารถเห็น ลองเขียนออกมา</li>
          <li>ขอความเห็นจากคนที่มีมุมมองต่างกัน</li>
          <li>ใช้แล้งเวิร์กสำหรับการตัดสินใจสำคัญ ไม่ใช่เพียง Gut feeling</li>
          <li>ติดตามผลลัพธ์จริง ตรวจสอบว่าความคาดหวังตรงกันไหม</li>
          <li>ให้เวลากับการตัดสินใจหากเป็นไปได้ Emotional reactions จะสงบลง</li>
        </ul>
      </section>
    </div>
  );
};

export default BiasDetectionDashboard;
