/**
 * FutureSelfPanel.tsx — §46 P2
 * แสดง AI projection 3 horizons จาก FutureSelfEngine
 */

import React, { useMemo } from 'react';
import { FutureSelfEngine } from '@/lib/intelligence/FutureSelfEngine';
import type { PersonalContext } from '@/lib/intelligence/types';
import './FutureSelfPanel.css';

interface Props {
  context: PersonalContext | null | undefined;
}

const FutureSelfPanel: React.FC<Props> = ({ context }) => {
  const engine = useMemo(() => new FutureSelfEngine(), []);

  const projection = useMemo(() => {
    if (!context) return null;
    return engine.project(context);
  }, [engine, context]);

  if (!projection) {
    return (
      <div className="future-self-panel future-self-panel--empty">
        <p className="future-self-empty-text">เพิ่ม reflection เพื่อให้ AI ทำนายอนาคตของคุณ</p>
      </div>
    );
  }

  const qualityLabel =
    projection.dataQuality === 'rich' ? '🟢 ข้อมูลครบ' :
    projection.dataQuality === 'moderate' ? '🟡 ข้อมูลปานกลาง' : '🔴 ข้อมูลน้อย';

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
              <p className="scenario-section-title">📈 แนวโน้ม</p>
              <ul className="scenario-list">
                {s.likelyTrajectory.map((t, i) => (
                  <li key={i}>{t}</li>
                ))}
              </ul>
            </div>

            <div className="scenario-section">
              <p className="scenario-section-title">↑ โอกาสเติบโต</p>
              <ul className="scenario-list">
                {s.growthOpportunities.map((g, i) => (
                  <li key={i}>{g}</li>
                ))}
              </ul>
            </div>

            {s.riskAreas.length > 0 && (
              <div className="scenario-section">
                <p className="scenario-section-title">⚠️ ระวัง</p>
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
