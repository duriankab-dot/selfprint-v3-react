/**
 * FutureSelfPanel.tsx — §46 P2
 * แสดง AI projection 3 horizons จาก FutureSelfEngine
 */

import React, { useMemo } from 'react';
import { FutureSelfEngine } from '@/lib/intelligence/FutureSelfEngine';
import type { PersonalContext } from '@/lib/intelligence/types';
import { useLanguage } from '@/context/LanguageContext';
import './FutureSelfPanel.css';

interface Props {
  context: PersonalContext | null | undefined;
}

const FutureSelfPanel: React.FC<Props> = ({ context }) => {
  const { language } = useLanguage();
  const isTh = language === 'th';
  const engine = useMemo(() => new FutureSelfEngine(), []);

  const projection = useMemo(() => {
    if (!context) return null;
    return engine.project(context);
  }, [engine, context]);

  if (!projection) {
    return (
      <div className="future-self-panel future-self-panel--empty">
        <p className="future-self-empty-text">
          {isTh ? 'เพิ่ม reflection เพื่อให้ AI ทำนายอนาคตของคุณ' : 'Add a reflection so AI can project your future'}
        </p>
      </div>
    );
  }

  const qualityLabel =
    projection.dataQuality === 'rich' ? (isTh ? '🟢 ข้อมูลครบ' : '🟢 Rich data') :
    projection.dataQuality === 'moderate' ? (isTh ? '🟡 ข้อมูลปานกลาง' : '🟡 Moderate data') : (isTh ? '🔴 ข้อมูลน้อย' : '🔴 Limited data');

  return (
    <div className="future-self-panel">
      <div className="future-self-header">
        <h3 className="future-self-title">Future Self Projection</h3>
        <span className="future-self-quality">{qualityLabel}</span>
      </div>

      <p className="future-self-narrative">{projection.overallNarrative}</p>

      <div className="future-self-scenarios">
        {projection.scenarios.map((s) => (
          <div key={s.horizon} className="future-self-scenario">
            <div className="scenario-header">
              <span className="scenario-label">{s.horizonLabel}</span>
              <span className="scenario-confidence">{Math.round(s.confidence * 100)}%</span>
            </div>

            <div className="scenario-section">
              <p className="scenario-section-title">📈 {isTh ? 'แนวโน้ม' : 'Trajectory'}</p>
              <ul className="scenario-list">
                {s.likelyTrajectory.map((t, i) => (
                  <li key={i}>{t}</li>
                ))}
              </ul>
            </div>

            <div className="scenario-section">
              <p className="scenario-section-title">↑ {isTh ? 'โอกาสเติบโต' : 'Growth Opportunities'}</p>
              <ul className="scenario-list">
                {s.growthOpportunities.map((g, i) => (
                  <li key={i}>{g}</li>
                ))}
              </ul>
            </div>

            {s.riskAreas.length > 0 && (
              <div className="scenario-section">
                <p className="scenario-section-title">⚠️ {isTh ? 'ระวัง' : 'Watch out for'}</p>
                <ul className="scenario-list scenario-list--risk">
                  {s.riskAreas.map((r, i) => (
                    <li key={i}>{r}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="scenario-question">
              <span className="scenario-question-icon">💭</span>
              <p>{s.keyQuestion}</p>
            </div>
          </div>
        ))}
      </div>

      {projection.leadingStrength && (
        <div className="future-self-footer">
          <span className="future-self-anchor">⚓ Anchor: <strong>{projection.leadingStrength}</strong></span>
        </div>
      )}
    </div>
  );
};

export default FutureSelfPanel;
