/**
 * InsightCards.tsx — TC-502: Insight cards for LivingTwin
 *
 * Shows key insights, blind spots, and dominant SICE from unified analysis.
 */

import React from 'react';
import { useTwinStore } from '@/store/twinStore';
import { useLanguage } from '@/context/LanguageContext';

interface InsightCardsProps {
  maxInsights?: number;
  maxBlindSpots?: number;
}

export const InsightCards: React.FC<InsightCardsProps> = ({
  maxInsights = 3,
  maxBlindSpots = 2,
}) => {
  const { language } = useLanguage();
  const isTh = language === 'th';
  const { current } = useTwinStore();

  if (!current) {
    return (
      <div className="insight-cards__empty">
        {isTh ? 'ยังไม่มีข้อมูลเชิงลึก — ทำ Onboarding ให้ครบ' : 'No insights yet — complete Onboarding'}
      </div>
    );
  }

  const insights = current.insights.slice(0, maxInsights);
  const blindSpots = current.blindSpots.slice(0, maxBlindSpots);
  const dominantSICE = current.dominantSICE;

  const SICE_LABELS: Record<string, { en: string; th: string }> = {
    self: { en: 'Self', th: 'ตัวตน' },
    mind: { en: 'Mind', th: 'จิตใจ' },
    decisions: { en: 'Decisions', th: 'การตัดสินใจ' },
    purpose: { en: 'Purpose', th: 'วัตถุประสงค์' },
    career: { en: 'Career', th: 'อาชีพ' },
    wealth: { en: 'Wealth', th: 'ความมั่งคั่ง' },
    life: { en: 'Life', th: 'ชีวิต' },
    growth: { en: 'Growth', th: 'การเติบโต' },
    relationships: { en: 'Relationships', th: 'ความสัมพันธ์' },
    love: { en: 'Love', th: 'ความรัก' },
    health: { en: 'Health', th: 'สุขภาพ' },
    future: { en: 'Future', th: 'อนาคต' },
  };

  return (
    <div className="insight-cards">
      {/* Dominant SICE */}
      {dominantSICE && (
        <div className="insight-cards__dominant">
          <span className="insight-cards__dominant-label">
            {isTh ? 'ด้านเด่นที่สุด' : 'Dominant Dimension'}
          </span>
          <span className="insight-cards__dominant-value">
            {isTh ? SICE_LABELS[dominantSICE]?.th : SICE_LABELS[dominantSICE]?.en}
          </span>
        </div>
      )}

      {/* Insights */}
      {insights.length > 0 && (
        <div className="insight-cards__section">
          <h4 className="insight-cards__section-title">
            {isTh ? '💡 ข้อมูลเชิงลึก' : '💡 Insights'}
          </h4>
          <div className="insight-cards__grid">
            {insights.map((insight, idx) => (
              <div key={idx} className="insight-cards__card insight-cards__card--insight">
                <span className="insight-cards__card-icon">💡</span>
                <span className="insight-cards__card-text">{insight}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Blind Spots */}
      {blindSpots.length > 0 && (
        <div className="insight-cards__section">
          <h4 className="insight-cards__section-title">
            {isTh ? '⚠️ จุดอ่อน' : '⚠️ Blind Spots'}
          </h4>
          <div className="insight-cards__grid">
            {blindSpots.map((spot, idx) => (
              <div key={idx} className="insight-cards__card insight-cards__card--blindspot">
                <span className="insight-cards__card-icon">⚠️</span>
                <span className="insight-cards__card-text">{spot}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sources */}
      {current.sources.length > 0 && (
        <div className="insight-cards__sources">
          <span className="insight-cards__sources-label">
            {isTh ? 'แหล่งข้อมูล' : 'Sources'}
          </span>
          <span className="insight-cards__sources-list">
            {current.sources.map((s, i) => (
              <span key={i} className="insight-cards__source-badge">
                {s.replace('v1_', 'v1: ').replace('v2_', 'v2: ').replace('v3_', 'v3: ')}
              </span>
            ))}
          </span>
        </div>
      )}
    </div>
  );
};

export default InsightCards;