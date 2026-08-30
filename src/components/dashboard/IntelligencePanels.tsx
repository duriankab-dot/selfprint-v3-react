/**
 * IntelligencePanels.tsx — §46 P2
 * รวม DecisionCard + LifePackCarousel + ForecastWidget
 * แยกไฟล์เดียวเพื่อประหยัด imports ใน Dashboard
 */

import React, { useMemo, useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { DecisionIntelligenceEngine } from '@/lib/intelligence/DecisionIntelligenceEngine';
import { LifeIntelligencePackEngine } from '@/lib/intelligence/LifeIntelligencePackEngine';
import { BehavioralForecastEngine } from '@/lib/intelligence/BehavioralForecastEngine';
import type { PersonalContext } from '@/lib/intelligence/types';
import './IntelligencePanels.css';

// ─── DecisionCard ──────────────────────────────────────────────────────────────

interface DecisionCardProps {
  context: PersonalContext | null | undefined;
}

export const DecisionCard: React.FC<DecisionCardProps> = ({ context }) => {
  const { language } = useLanguage();
  const isTh = language === 'th';
  const engine = useMemo(() => new DecisionIntelligenceEngine(), []);
  const [open, setOpen] = useState(false);

  const report = useMemo(() => {
    if (!context) return null;
    return engine.analyze(context);
  }, [engine, context]);

  if (!report) {
    return (
      <div className="intel-card intel-card--empty">
        <p className="intel-empty">
          {isTh ? 'เพิ่ม reflection เพื่อวิเคราะห์รูปแบบการตัดสินใจ' : 'Add a reflection to analyze your decision patterns'}
        </p>
      </div>
    );
  }

  const sp = report.styleProfile;

  return (
    <div className="intel-card decision-card">
      <div className="intel-card-header">
        <span className="intel-card-icon">⚖️</span>
        <h3 className="intel-card-title">Decision Intelligence</h3>
        <span className="intel-confidence">{Math.round(report.confidence * 100)}%</span>
      </div>

      <div className="decision-style-badge" data-style={sp.type}>
        {sp.type === 'analytical' && '📊 Analytical'}
        {sp.type === 'intuitive' && '🔮 Intuitive'}
        {sp.type === 'collaborative' && '🤝 Collaborative'}
        {sp.type === 'mixed' && '⚡ Mixed'}
      </div>

      <p className="intel-card-summary">{report.topInsight}</p>

      {report.biasRisks.length > 0 && (
        <div className="decision-biases">
          <p className="intel-section-title">⚠️ {isTh ? 'Bias ที่ควรระวัง' : 'Biases to watch'}</p>
          {report.biasRisks.slice(0, 2).map((b, i) => (
            <div key={i} className={`bias-item bias-item--${b.severity}`}>
              <span className="bias-name">{b.name}</span>
              <span className={`bias-severity bias-severity--${b.severity}`}>{b.severity}</span>
              {b.personalizedNote && (
                <p className="bias-note">{b.personalizedNote}</p>
              )}
            </div>
          ))}
        </div>
      )}

      <button
        className="intel-expand-btn"
        onClick={() => setOpen(!open)}
        type="button"
      >
        {open ? (isTh ? '▲ ซ่อน' : '▲ Hide') : (isTh ? '▼ ดู Frameworks + Checklist' : '▼ View Frameworks + Checklist')}
      </button>

      {open && (
        <div className="decision-details">
          {report.recommendedFrameworks.length > 0 && (
            <div className="decision-frameworks">
              <p className="intel-section-title">🛠 {isTh ? 'Frameworks แนะนำ' : 'Recommended Frameworks'}</p>
              {report.recommendedFrameworks.map((f, i) => (
                <div key={i} className="framework-item">
                  <p className="framework-name">{f.nameThai}</p>
                  <p className="framework-desc">{f.descriptionThai}</p>
                </div>
              ))}
            </div>
          )}

          {report.preDecisionChecklist.length > 0 && (
            <div className="decision-checklist">
              <p className="intel-section-title">✅ Pre-Decision Checklist</p>
              {report.preDecisionChecklist.map((c, i) => (
                <div key={i} className="checklist-item">
                  <span className="checklist-num">{i + 1}</span>
                  <div>
                    <p className="checklist-q">{c.question}</p>
                    <p className="checklist-rationale">{c.rationale}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ─── LifePackCarousel ──────────────────────────────────────────────────────────

interface LifePackCarouselProps {
  context: PersonalContext | null | undefined;
}

export const LifePackCarousel: React.FC<LifePackCarouselProps> = ({ context }) => {
  const { language } = useLanguage();
  const isTh = language === 'th';
  const engine = useMemo(() => new LifeIntelligencePackEngine(), []);
  const [activeIdx, setActiveIdx] = useState(0);

  const report = useMemo(() => {
    if (!context) return null;
    return engine.generate(context);
  }, [engine, context]);

  if (!report) {
    return (
      <div className="intel-card intel-card--empty">
        <p className="intel-empty">
          {isTh ? 'ยังไม่มีข้อมูลสำหรับ Life Intelligence Packs' : 'No data yet for Life Intelligence Packs'}
        </p>
      </div>
    );
  }

  const packs = report.packs.slice(0, 6); // top 6
  const active = packs[activeIdx];

  if (!active) return null;

  return (
    <div className="intel-card life-pack-card">
      <div className="intel-card-header">
        <span className="intel-card-icon">🌐</span>
        <h3 className="intel-card-title">Life Intelligence Packs</h3>
      </div>

      <div className="life-pack-tabs">
        {packs.map((p, i) => (
          <button
            key={p.hub}
            className={`life-pack-tab${activeIdx === i ? ' life-pack-tab--active' : ''}`}
            onClick={() => setActiveIdx(i)}
            type="button"
          >
            {p.hubEmoji}
          </button>
        ))}
      </div>

      <div className="life-pack-content">
        <div className="life-pack-name">
          {active.hubEmoji} {active.hubNameThai}
          <span className="life-pack-score">{Math.round(active.relevanceScore * 100)}%</span>
        </div>

        {active.personalizedNote && (
          <p className="life-pack-note">{active.personalizedNote}</p>
        )}

        <div className="life-pack-section">
          <p className="intel-section-title">❓ {isTh ? 'คำถามสำคัญ' : 'Key Questions'}</p>
          <ul className="intel-list">
            {active.keyQuestions.slice(0, 3).map((q, i) => <li key={i}>{q}</li>)}
          </ul>
        </div>

        <div className="life-pack-section">
          <p className="intel-section-title">🚀 {isTh ? 'Action แนะนำ' : 'Recommended Actions'}</p>
          <ul className="intel-list intel-list--action">
            {active.recommendedActions.slice(0, 2).map((a, i) => <li key={i}>{a}</li>)}
          </ul>
        </div>
      </div>
    </div>
  );
};

// ─── ForecastWidget ────────────────────────────────────────────────────────────

interface ForecastWidgetProps {
  context: PersonalContext | null | undefined;
}

export const ForecastWidget: React.FC<ForecastWidgetProps> = ({ context }) => {
  const { language } = useLanguage();
  const isTh = language === 'th';
  const engine = useMemo(() => new BehavioralForecastEngine(), []);

  const forecast = useMemo(() => {
    if (!context) return null;
    return engine.forecast(context);
  }, [engine, context]);

  if (!forecast) {
    return (
      <div className="intel-card intel-card--empty">
        <p className="intel-empty">
          {isTh ? 'เพิ่มข้อมูลเพื่อให้ AI ทำนายพฤติกรรมของคุณ' : 'Add more data so AI can forecast your behavior'}
        </p>
      </div>
    );
  }

  return (
    <div className="intel-card forecast-card">
      <div className="intel-card-header">
        <span className="intel-card-icon">🧠</span>
        <h3 className="intel-card-title">Behavioral Forecast</h3>
        <span className="intel-confidence">{Math.round(forecast.confidence * 100)}%</span>
      </div>

      <p className="intel-card-summary">{forecast.forecastSummary}</p>

      <div className="forecast-mood-hub">
        <div className="forecast-pill forecast-pill--mood">
          <span className="forecast-pill-label">{isTh ? 'สภาวะถัดไป' : 'Next likely mood'}</span>
          <span className="forecast-pill-value">{forecast.nextLikelyMoodLabel}</span>
        </div>
        <div className="forecast-pill forecast-pill--hub">
          <span className="forecast-pill-label">{isTh ? 'Hub ที่จะ focus' : 'Hub to focus on'}</span>
          <span className="forecast-pill-value">{forecast.predictedHubFocusLabel}</span>
        </div>
      </div>

      {forecast.positiveMomentum.length > 0 && (
        <div className="forecast-momentum">
          <p className="intel-section-title">✨ {isTh ? 'Positive Momentum' : 'Positive Momentum'}</p>
          {forecast.positiveMomentum.slice(0, 2).map((m, i) => (
            <div key={i} className="momentum-item">
              <p className="momentum-area">{m.area}</p>
              <p className="momentum-amplify">{m.howToAmplify}</p>
            </div>
          ))}
        </div>
      )}

      {forecast.behavioralRisks.length > 0 && (
        <div className="forecast-risks">
          <p className="intel-section-title">⚠️ {isTh ? 'ความเสี่ยงที่ควรระวัง' : 'Risks to Watch'}</p>
          {forecast.behavioralRisks.slice(0, 2).map((r, i) => (
            <div key={i} className={`risk-item risk-item--${r.likelihood}`}>
              <p className="risk-text">{r.risk}</p>
              <p className="risk-mitigation">{r.mitigation}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
