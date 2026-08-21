/**
 * AnalysisPage.tsx
 *
 * Full Personal Analysis — Route: /analysis
 *
 * Master Direction §10 — 9 sections:
 *   01 ภาพรวมตัวตน      02 รูปแบบพฤติกรรม   03 จุดแข็ง
 *   04 ข้อควรระวัง       05 แนวโน้ม           06 เส้นทางชีวิต
 *   07 สิ่งที่ควรสนใจ    08 ข้อแนะนำส่วนบุคคล  09 แผนพัฒนา
 *
 * Implementation:
 * - useAuth() for userId (never localStorage)
 * - useQuery — real Supabase data (shared cache keys with Dashboard)
 * - InsightEngine.generateFullAnalysis() — deterministic, real data
 * - No mocks, no hardcoding
 */

import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useLifecycleStore } from '@/store/lifecycleStore';
import { PersonalContextBuilder } from '@/lib/intelligence/PersonalContextBuilder';
import { PatternDetector } from '@/lib/intelligence/PatternDetector';
import { AIFeedbackLoop } from '@/lib/intelligence/AIFeedbackLoop';
import { InsightEngine } from '@/lib/intelligence/InsightEngine';
import { ConfidenceIndicator } from '@/components/intelligence/ConfidenceIndicator';
import { NavBar } from '@/components/layout/NavBar';
import { Footer } from '@/components/layout/Footer';
import { BottomNav } from '@/components/layout/BottomNav';
import { Alert } from '@/components/composites/Alert';
import { useAnalysisStore } from '@/store/analysisStore';
import '../styles/analysis.css';

// ============================================================================
// Section header helper
// ============================================================================

const SectionHeader: React.FC<{ number: string; title: string; icon: string }> = ({
  number,
  title,
  icon,
}) => (
  <div className="analysis__section-header">
    <span className="analysis__section-number">{number}</span>
    <span className="analysis__section-icon" aria-hidden="true">{icon}</span>
    <h2 className="analysis__section-title">{title}</h2>
  </div>
);

// ============================================================================
// Main Page
// ============================================================================

const AnalysisPage: React.FC = () => {
  const { session } = useAuth();
  const userId = session?.user?.id ?? '';
  const navigate = useNavigate();
  const setAnalysis = useAnalysisStore((state) => state.setAnalysis);
  const transitionTo = useLifecycleStore((state) => state.transitionTo);

  // Stable instances
  const contextBuilder = useMemo(() => new PersonalContextBuilder(), []);
  const patternDetector = useMemo(() => new PatternDetector(), []);
  const feedbackLoop = useMemo(() => new AIFeedbackLoop(), []);
  const insightEngine = useMemo(() => new InsightEngine(), []);

  // --------------------------------------------------------------------------
  // Queries — reuse dashboard cache keys → no extra Supabase calls
  // --------------------------------------------------------------------------

  const {
    data: context,
    isLoading: ctxLoading,
    error: ctxError,
  } = useQuery({
    queryKey: ['personalContext', userId],
    queryFn: () => contextBuilder.getContext(userId),
    enabled: !!userId,
    staleTime: 30_000,
  });

  const { data: patterns = [], isLoading: patLoading } = useQuery({
    queryKey: ['behavioralPatterns', userId],
    queryFn: () => patternDetector.detectPatterns(userId),
    enabled: !!userId,
    staleTime: 60_000,
  });

  const { data: metrics } = useQuery({
    queryKey: ['accuracyMetrics', userId],
    queryFn: () => feedbackLoop.getAccuracyMetrics(userId),
    enabled: !!userId,
    staleTime: 30_000,
  });

  // --------------------------------------------------------------------------
  // Full analysis (only when data is ready)
  // --------------------------------------------------------------------------

  const analysis = useMemo(() => {
    if (!context || context.sourceCount === 0) return null;
    return insightEngine.generateFullAnalysis(context, patterns, metrics ?? null);
  }, [context, patterns, metrics, insightEngine]);

  const isLoading = ctxLoading || patLoading;

  // --------------------------------------------------------------------------
  // Handlers
  // --------------------------------------------------------------------------

  const handleAwakeTwin = async () => {
    if (analysis && userId) {
      // Save analysis to store for CoreAwakening to use
      setAnalysis(analysis);
      // NEW: Transition lifecycle to ANALYSIS
      await transitionTo(userId, 'ANALYSIS');
      // Navigate to Twin birth ceremony
      navigate('/core-awakening');
    }
  };

  // --------------------------------------------------------------------------
  // Guards
  // --------------------------------------------------------------------------

  if (!userId) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <NavBar />
        <div className="analysis__page">
          <Alert variant="warning" message="กรุณาเข้าสู่ระบบ SELFPRINT" />
        </div>
        <Footer />
        <BottomNav />
      </div>
    );
  }

  // --------------------------------------------------------------------------
  // Render
  // --------------------------------------------------------------------------

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <NavBar />

      <main className="analysis__page">
        {/* Page header */}
        <div className="analysis__page-header">
          <button
            className="analysis__back-btn"
            onClick={() => navigate('/dashboard')}
            aria-label="กลับไป Dashboard"
          >
            ← Dashboard
          </button>
          <div>
            <h1 className="analysis__page-title">การวิเคราะห์ส่วนตัวของคุณ</h1>
            <p className="analysis__page-subtitle">
              ภาพรวมเต็มรูปแบบจาก AI ฝาแฝด — อ้างอิงข้อมูลจริงจากการใช้งานของคุณ
            </p>
          </div>
          {metrics && metrics.totalInsights > 0 && (
            <div className="analysis__header-confidence">
              <ConfidenceIndicator
                confidence={metrics.accuracy}
                evidenceCount={metrics.totalInsights}
                compact
                explanation={`ฝาแฝด เข้าใจ ${Math.round(metrics.accuracy * 100)}% จาก ${metrics.totalInsights} feedbacks`}
              />
            </div>
          )}
        </div>

        {/* Error */}
        {ctxError && (
          <Alert
            variant="error"
            message={`ไม่สามารถโหลดข้อมูล: ${ctxError instanceof Error ? ctxError.message : String(ctxError)}`}
          />
        )}

        {/* Loading */}
        {isLoading && (
          <div className="analysis__loading" aria-live="polite">
            <div className="analysis__spinner" aria-hidden="true" />
            <p>กำลังสังเคราะห์รูปแบบต้นแบบของคุณ...</p>
          </div>
        )}

        {/* No data */}
        {!isLoading && !analysis && (
          <div className="analysis__empty">
            <div className="analysis__empty-icon">🌱</div>
            <h2>ยังไม่มีข้อมูลเพียงพอ</h2>
            <p>
              ใช้ Selfprint ต่อไปสักระยะ บันทึกความทรงจำและ reflection
              เพื่อให้ ฝาแฝด สร้างการวิเคราะห์ที่ชัดเจนขึ้น
            </p>
            <button className="analysis__back-btn" onClick={() => navigate('/dashboard')}>
              กลับไปบันทึกความทรงจำ
            </button>
          </div>
        )}

        {/* Full analysis */}
        {!isLoading && analysis && (
          <div className="analysis__content">

            {/* 01 — ภาพรวมตัวตน */}
            <section className="analysis__section" aria-labelledby="section-01">
              <SectionHeader number="01" title="ภาพรวมตัวตน" icon="🪞" />
              <div className="analysis__section-body">
                <p className="analysis__overview-text">{analysis.selfOverview}</p>
                {context && (
                  <div className="analysis__meta-row">
                    <span className="analysis__meta-item">
                      📊 ข้อมูล {analysis.sourceCount} ชิ้น
                    </span>
                    <span className="analysis__meta-item">
                      🗓 อัพเดต {analysis.generatedAt.toLocaleDateString('th-TH')}
                    </span>
                    {analysis.modelAccuracy > 0 && (
                      <span className="analysis__meta-item">
                        🎯 เข้าใจ {Math.round(analysis.modelAccuracy * 100)}%
                      </span>
                    )}
                  </div>
                )}
              </div>
            </section>

            {/* 02 — รูปแบบพฤติกรรม */}
            <section className="analysis__section" aria-labelledby="section-02">
              <SectionHeader number="02" title="รูปแบบพฤติกรรม" icon="📊" />
              <div className="analysis__section-body">
                {analysis.behavioralPatterns.length === 0 ? (
                  <p className="analysis__empty-section">
                    ยังไม่พบรูปแบบที่ชัดเจน — ใช้งานต่อไปเพื่อให้ ฝาแฝด สังเกตรูปแบบที่ชัดเจนของคุณมากขึ้น
                  </p>
                ) : (
                  <div className="analysis__pattern-list">
                    {analysis.behavioralPatterns.map((p, i) => (
                      <div key={i} className="analysis__pattern-item">
                        <div className="analysis__pattern-item-header">
                          <div>
                            <span className="analysis__pattern-type-badge">
                              {p.type === 'repeating' ? '🔁 ซ้ำ'
                                : p.type === 'emerging' ? '🌱 เกิดขึ้นใหม่'
                                : '🔄 เปลี่ยนแปลง'}
                            </span>
                            <h3 className="analysis__pattern-name">{p.name}</h3>
                          </div>
                          <ConfidenceIndicator confidence={p.confidence} compact />
                        </div>
                        <p className="analysis__pattern-desc">{p.description}</p>
                        {p.insight && (
                          <p className="analysis__pattern-insight">💡 {p.insight}</p>
                        )}
                        <p className="analysis__pattern-freq">
                          ความถี่: {p.frequency} · พบล่าสุด{' '}
                          {p.lastDetected.toLocaleDateString('th-TH')}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>

            {/* 03 — จุดแข็ง */}
            <section className="analysis__section" aria-labelledby="section-03">
              <SectionHeader number="03" title="จุดแข็ง" icon="💪" />
              <div className="analysis__section-body">
                {analysis.strengths.length === 0 ? (
                  <p className="analysis__empty-section">
                    ฝาแฝด ยังไม่ได้ระบุจุดแข็งของคุณ — ใช้ Selfprint ต่อไปเพื่อให้ข้อมูลมากขึ้น
                  </p>
                ) : (
                  <div className="analysis__strength-grid">
                    {analysis.strengths.map((s, i) => (
                      <div key={i} className="analysis__strength-card">
                        <div className="analysis__strength-header">
                          <h3 className="analysis__strength-name">{s.name}</h3>
                          <ConfidenceIndicator confidence={s.confidence} compact />
                        </div>
                        {s.description && (
                          <p className="analysis__strength-desc">{s.description}</p>
                        )}
                        {s.evidence.length > 0 && (
                          <p className="analysis__strength-evidence">
                            จาก {s.evidence.length} หลักฐาน
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>

            {/* 04 — ข้อควรระวัง */}
            <section className="analysis__section" aria-labelledby="section-04">
              <SectionHeader number="04" title="Blind Spots" icon="🔍" />
              <div className="analysis__section-body">
                <p className="analysis__section-note">
                  สิ่งเหล่านี้คือสิ่งที่ ฝาแฝดคุณ สังเกตว่าคุณอาจมองข้ามไป — ไม่ใช่การตัดสิน แต่เป็นพื้นที่ให้สำรวจ
                </p>
                {analysis.blindSpots.length === 0 ? (
                  <p className="analysis__empty-section">
                    ยังไม่พบ ข้อควรระวัง ที่ชัดเจนในตอนนี้
                  </p>
                ) : (
                  <div className="analysis__blindspot-list">
                    {analysis.blindSpots.map((b, i) => (
                      <div key={i} className="analysis__blindspot-item">
                        <div className="analysis__blindspot-header">
                          <h3 className="analysis__blindspot-title">{b.title}</h3>
                          <ConfidenceIndicator confidence={b.confidence} compact />
                        </div>
                        {b.description && (
                          <p className="analysis__blindspot-desc">{b.description}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>

            {/* 05 — แนวโน้ม */}
            <section className="analysis__section" aria-labelledby="section-05">
              <SectionHeader number="05" title="แนวโน้ม" icon="📈" />
              <div className="analysis__section-body">
                {analysis.trends.length === 0 ? (
                  <p className="analysis__empty-section">
                    ยังไม่มีแนวโน้มการเปลี่ยนแปลงที่ชัดเจน — กลับมาดูในอีก 30 วัน
                  </p>
                ) : (
                  <div className="analysis__trend-list">
                    {analysis.trends.map((t, i) => (
                      <div key={i} className="analysis__trend-item">
                        <p className="analysis__trend-desc">{t.description}</p>
                        {t.insight && (
                          <p className="analysis__trend-insight">💡 {t.insight}</p>
                        )}
                        <p className="analysis__trend-since">
                          ตั้งแต่ {t.since.toLocaleDateString('th-TH')} ·{' '}
                          <ConfidenceIndicator confidence={t.confidence} compact />
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>

            {/* 06 — เส้นทางชีวิต */}
            <section className="analysis__section" aria-labelledby="section-06">
              <SectionHeader number="06" title="Journey" icon="🗺" />
              <div className="analysis__section-body">
                <div className="analysis__journey-stage">
                  <span className="analysis__journey-stage-label">ตอนนี้คุณอยู่ที่:</span>
                  <span className="analysis__journey-stage-value">{analysis.journey.currentStage}</span>
                </div>
                <p className="analysis__journey-desc">{analysis.journey.description}</p>

                <div className="analysis__journey-grid">
                  {analysis.journey.growing.length > 0 && (
                    <div className="analysis__journey-col">
                      <h4 className="analysis__journey-col-title">🌱 สิ่งที่เติบโต</h4>
                      <ul className="analysis__journey-list">
                        {analysis.journey.growing.map((g, i) => <li key={i}>{g}</li>)}
                      </ul>
                    </div>
                  )}
                  {analysis.journey.changing.length > 0 && (
                    <div className="analysis__journey-col">
                      <h4 className="analysis__journey-col-title">🔄 สิ่งที่เปลี่ยนแปลง</h4>
                      <ul className="analysis__journey-list">
                        {analysis.journey.changing.map((c, i) => <li key={i}>{c}</li>)}
                      </ul>
                    </div>
                  )}
                  {analysis.journey.stillWorking.length > 0 && (
                    <div className="analysis__journey-col">
                      <h4 className="analysis__journey-col-title">⚙️ กำลังพัฒนา</h4>
                      <ul className="analysis__journey-list">
                        {analysis.journey.stillWorking.map((w, i) => <li key={i}>{w}</li>)}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </section>

            {/* 07 — สิ่งที่ควรสนใจ */}
            <section className="analysis__section" aria-labelledby="section-07">
              <SectionHeader number="07" title="สิ่งที่ควรให้ความสนใจ" icon="🎯" />
              <div className="analysis__section-body">
                {analysis.focusAreas.length === 0 ? (
                  <p className="analysis__empty-section">
                    ฝาแฝด ยังไม่สามารถระบุพื้นที่ที่ควรให้ความสนใจได้ชัดเจน
                  </p>
                ) : (
                  <div className="analysis__focus-list">
                    {analysis.focusAreas.map((area, i) => (
                      <div key={i} className="analysis__focus-item">
                        <span className="analysis__focus-number">{i + 1}</span>
                        <span className="analysis__focus-text">{area}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>

            {/* 08 — ข้อแนะนำส่วนบุคคล */}
            <section className="analysis__section" aria-labelledby="section-08">
              <SectionHeader number="08" title="Personal Guidance" icon="🧭" />
              <div className="analysis__section-body">
                <p className="analysis__section-note">
                  คำแนะนำเหล่านี้มาจากรูปแบบที่ ฝาแฝด สังเกตเห็น — เป็นแค่คำถามให้คุณลองสำรวจ
                </p>
                {analysis.guidance.length === 0 ? (
                  <p className="analysis__empty-section">ยังไม่มีคำแนะนำเฉพาะบุคคลในตอนนี้</p>
                ) : (
                  <div className="analysis__guidance-list">
                    {analysis.guidance.map((g, i) => (
                      <div key={i} className="analysis__guidance-item">
                        <span className="analysis__guidance-bullet">→</span>
                        <p className="analysis__guidance-text">{g}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>

            {/* 09 — แผนพัฒนา */}
            <section className="analysis__section analysis__section--last" aria-labelledby="section-09">
              <SectionHeader number="09" title="Next Step" icon="🚀" />
              <div className="analysis__section-body">
                <div className="analysis__next-steps">
                  {analysis.nextSteps.map((step, i) => (
                    <div key={i} className="analysis__next-step">
                      <div className="analysis__next-step-num">{i + 1}</div>
                      <p className="analysis__next-step-text">{step}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Footer */}
            <div className="analysis__page-footer">
              <p className="analysis__disclaimer">
                การวิเคราะห์นี้สร้างจากข้อมูลจริงที่ ฝาแฝดของคุณ เรียนรู้จากการใช้งานของคุณ
                ยิ่งใช้ Selfprint มาก ฝาแฝด ยิ่งเข้าใจคุณได้มากขึ้น
              </p>
              <div className="analysis__footer-buttons">
                <button
                  className="analysis__back-to-dashboard"
                  onClick={() => navigate('/dashboard')}
                >
                  ← กลับ Dashboard
                </button>
                {analysis && (
                  <button
                    className="analysis__awaken-twin-btn"
                    onClick={handleAwakeTwin}
                    aria-label="ตื่นตัวฝาแฝดของคุณ"
                  >
                    ✨ ความรู้ของคุณพร้อมแล้ว → ตื่นตัวฝาแฝด
                  </button>
                )}
              </div>
            </div>

          </div>
        )}
      </main>

      <Footer />
      <BottomNav />
    </div>
  );
};

export default AnalysisPage;
