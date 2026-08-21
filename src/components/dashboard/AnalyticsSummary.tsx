/**
 * AnalyticsSummary.tsx
 *
 * Follow-up ให้ 5.7 (Analytics Events) — เดิมแค่เก็บ event ลง
 * `analytics_events` ยังไม่มีอะไรอ่าน/แสดงผล ไฟล์นี้เชื่อม
 * `getAnalyticsSummary()` เข้า Dashboard เป็น "ภาพรวมพฤติกรรม" ของผู้ใช้คนนั้น
 * (RLS จำกัดแค่ข้อมูลของตัวเองอยู่แล้ว ไม่ใช่ admin dashboard)
 */

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { getAnalyticsSummary, type AnalyticsSummary as Summary } from '@/services/analytics';
import { HUB_OPTIONS } from '@/constants/hubs';
import './AnalyticsSummary.css';

function hubLabel(hubId: string): string {
  const hub = HUB_OPTIONS.find((h: { id: string; label: string; description: string; icon: string }) => h.id === hubId);
  return hub ? `${hub.icon} ${hub.label}` : hubId;
}

const AnalyticsSummaryView: React.FC = () => {
  const { session } = useAuth();
  const [summary, setSummary] = useState<Summary | null>(null);

  useEffect(() => {
    const userId = session?.user?.id;
    if (!userId) return;

    let cancelled = false;
    (async () => {
      const result = await getAnalyticsSummary(userId);
      if (!cancelled) setSummary(result);
    })();

    return () => {
      cancelled = true;
    };
  }, [session]);

  if (!summary || summary.totalEvents === 0) return null;

  const totalFeedback = summary.feedback.helpful + summary.feedback.unhelpful;
  const helpfulPercent =
    totalFeedback > 0 ? Math.round((summary.feedback.helpful / totalFeedback) * 100) : null;

  return (
    <div className="analytics-section">
      <h2>ภาพรวมพฤติกรรมการใช้งาน</h2>
      <div className="analytics-grid">
        {summary.topHub && (
          <div className="analytics-card">
            <div className="analytics-card-label">Hub ที่ใช้บ่อยที่สุด</div>
            <div className="analytics-card-value">{hubLabel(summary.topHub)}</div>
            <div className="analytics-card-subtitle">
              {summary.hubVisitCounts[summary.topHub]} ครั้ง
            </div>
          </div>
        )}

        <div className="analytics-card">
          <div className="analytics-card-label">เปลี่ยน Mood</div>
          <div className="analytics-card-value">{summary.moodChangeCount}</div>
          <div className="analytics-card-subtitle">ครั้ง</div>
        </div>

        {totalFeedback > 0 && (
          <div className="analytics-card">
            <div className="analytics-card-label">คำตอบที่เป็นประโยชน์</div>
            <div className="analytics-card-value">{helpfulPercent}%</div>
            <div className="analytics-card-subtitle">
              👍 {summary.feedback.helpful} / 👎 {summary.feedback.unhelpful}
            </div>
          </div>
        )}

        {summary.latestArchetypeAccuracy !== null && (
          <div className="analytics-card">
            <div className="analytics-card-label">ความแม่นยำล่าสุด</div>
            <div className="analytics-card-value">{summary.latestArchetypeAccuracy}%</div>
            <div className="analytics-card-subtitle">AI Twin blueprint</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalyticsSummaryView;
