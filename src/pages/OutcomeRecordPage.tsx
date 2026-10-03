/**
 * OutcomeRecordPage.tsx
 * Batch D — New dedicated page for recording decision outcomes and rating
 * Twin's advice quality. Route: /decision/:id/outcome
 */

import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import type { Decision } from '../types/decision';
import { supabase } from '../services/supabase-service';
import { recordOutcome, updateRecommendationQuality } from '../services/DecisionService';
import { WORLDS } from '../constants/worlds';
import type { WorldId } from '../constants/worlds';
import { AppShell } from '@/components/layout/AppShell';
import ErrorBoundary from '@/components/ErrorBoundary';
import './outcome-record-page.css';

const RATING_OPTIONS = [
  { value: 0.15, labelTh: 'ไม่มีประโยชน์เลย', labelEn: 'Very unhelpful' },
  { value: 0.35, labelTh: 'ค่อนข้างไม่มีประโยชน์', labelEn: 'Somewhat unhelpful' },
  { value: 0.50, labelTh: 'เป็นกลาง', labelEn: 'Neutral' },
  { value: 0.70, labelTh: 'มีประโยชน์', labelEn: 'Helpful' },
  { value: 0.90, labelTh: 'มีประโยชน์มาก', labelEn: 'Very helpful' },
];

type ImpactType = 'positive' | 'neutral' | 'negative';

interface StateFields {
  impact: ImpactType;
  feedback: string;
  lessons: string;
}

function OutcomeRecordPageInner() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { session } = useAuth();
  const { language } = useLanguage();
  const isTh = language === 'th';

  // Data loading state
  const [decision, setDecision] = useState<Decision | null>(null);
  const [loading, setLoading] = useState(true);
  const [, setError] = useState<string | null>(null);

  // Phase tracking
  const [phase, setPhase] = useState<'load' | 'outcome' | 'rating' | 'done'>('load');

  // Outcome form state
  const [stateFields, setStateFields] = useState<StateFields>({
    impact: 'neutral' as ImpactType,
    feedback: '',
    lessons: '',
  });
  const [submittingOutcome, setSubmittingOutcome] = useState(false);
  const [outcomeError, setOutcomeError] = useState<string | null>(null);

  // Rating state
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [submittingRating, setSubmittingRating] = useState(false);
  const [ratingError, setRatingError] = useState<string | null>(null);

  // Check if decision already has a rating
  const hasExistingRating = !!decision?.twinRecommendationQuality;

  // Load decision data
  useEffect(() => {
    if (!id || !supabase) {
      setError(isTh ? 'ไม่พบ ID การตัดสินใจ' : 'Missing decision ID');
      setLoading(false);
      return;
    }

    async function loadDecision() {
      try {
        const { data, error: err } = await supabase
          .from('decision_log')
          .select('*')
          .eq('id', id)
          .single();

        if (err || !data) {
          setError(isTh ? 'ไม่พบการตัดสินใจ' : 'Decision not found');
          setLoading(false);
          return;
        }

        setDecision({
          id: data.id,
          twinId: data.twin_id,
          world: data.world as WorldId,
          question: data.question,
          options: data.options || [],
          twinRecommendation: data.twin_recommendation,
          userChoice: data.user_choice,
          chosenAt: data.created_at,
          context: data.context,
          createdAt: data.created_at,
          updatedAt: data.updated_at,
          twinRecommendationQuality: data.twin_recommendation_quality,
        });

        // If already rated, skip straight to done
        if (data.twin_recommendation_quality !== null && data.twin_recommendation_quality !== undefined) {
          setPhase('done');
        } else {
          setPhase('outcome');
        }
      } catch (e) {
        setError(isTh ? 'เกิดข้อผิดพลาดในการโหลด' : 'Failed to load decision');
      } finally {
        setLoading(false);
      }
    }

    loadDecision();
  }, [id, isTh]);

  const handleOutcomeSubmit = useCallback(async () => {
    if (!id || !session?.user?.id) return;

    if (!stateFields.feedback.trim()) {
      setOutcomeError(isTh ? 'กรุณาพิมพ์คำติชม' : 'Please enter feedback');
      return;
    }

    setSubmittingOutcome(true);
    setOutcomeError(null);

    try {
      const outcome = await recordOutcome(
        id,
        stateFields.feedback.trim(),
        stateFields.impact,
        stateFields.lessons.trim()
      );

      if (!outcome) {
        setOutcomeError(isTh ? 'ไม่สามารถบันทึกผลลัพธ์ได้' : 'Failed to record outcome');
        return;
      }

      setPhase('rating');
    } catch (e) {
      setOutcomeError(isTh ? 'เกิดข้อผิดพลาด' : 'An error occurred');
    } finally {
      setSubmittingOutcome(false);
    }
  }, [id, session?.user?.id, stateFields, isTh]);

  const handleRatingSubmit = useCallback(async () => {
    if (!id || selectedRating === null) return;

    setSubmittingRating(true);
    setRatingError(null);

    const success = await updateRecommendationQuality(id, selectedRating);

    if (!success) {
      setRatingError(isTh ? 'ไม่สามารถบันทึกคะแนนได้' : 'Failed to save rating');
      return;
    }

    setPhase('done');
  }, [id, selectedRating, isTh]);

  const handleSkipRating = useCallback(() => {
    setPhase('done');
  }, []);

  if (loading) {
    return (
      <AppShell>
        <div className="outcome-record-page" style={{ textAlign: 'center', padding: '4rem' }}>
          <p>{isTh ? 'กำลังโหลด...' : 'Loading...'}</p>
        </div>
      </AppShell>
    );
  }

  if (!decision || phase === 'done') {
    return (
      <AppShell>
        <div className="outcome-record-page">
          <div className="page-content">
            <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
              <h1 style={{ marginBottom: '1rem' }}>
                {hasExistingRating ? (
                  <>
                    {isTh ? '📊 คะแนนคำแนะนำเดิม' : '📊 Existing Rating'}
                  </>
                ) : (
                  <>
                    {isTh ? '✅ บันทึกครบแล้ว' : '✅ Completed'}
                  </>
                )}
              </h1>

              {hasExistingRating && (
                <div className="existing-rating-display">
                  <p style={{ fontSize: '1.2rem', color: 'var(--text-primary)' }}>
                    {isTh ? 'Twin ได้แนะนำ:' : 'The Twin recommended:'}
                  </p>
                  <blockquote style={{ borderLeft: '4px solid var(--primary-color)', paddingLeft: '1rem', margin: '1rem 0', fontStyle: 'italic' }}>
                    {decision.twinRecommendation}
                  </blockquote>
                  <p style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
                    {isTh ? 'คุณให้คะแนน:' : 'You rated:'}{' '}
                    <span style={{ color: 'var(--primary-color)' }}>
                      {RATING_OPTIONS.find(r => r.value === decision.twinRecommendationQuality)?.[isTh ? 'labelTh' : 'labelEn']}
                    </span>
                    {' ('}{decision.twinRecommendationQuality}{')'}
                  </p>
                </div>
              )}

              {!hasExistingRating && phase === 'done' && (
                <p>{isTh ? 'ขอบคุณสำหรับการติดตามผล!' : 'Thank you for completing your follow-up!'}</p>
              )}

              <button
                onClick={() => navigate('/decisions')}
                style={{ marginTop: '2rem', padding: '0.75rem 2rem', borderRadius: '0.5rem', border: 'none', background: 'var(--primary-color)', color: 'white', cursor: 'pointer' }}
              >
                {isTh ? 'กลับหน้า Dashboard' : 'Back to Dashboard'}
              </button>
            </div>
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="outcome-record-page">
        <div className="page-content">
          {/* Breadcrumb */}
          <button
            onClick={() => navigate(-1)}
            style={{ background: 'none', border: 'none', color: 'var(--primary-color)', cursor: 'pointer', padding: '0', marginBottom: '1rem', fontSize: '0.9rem' }}
          >
            ← {isTh ? 'กลับ' : 'Back'}
          </button>

          {/* Decision Context Card */}
          <div className="odc-decision-context">
            <div className="odc-header">
              <h2>{isTh ? '📋 ข้อมูลการตัดสินใจ' : '📋 Decision Details'}</h2>
              {decision.world && (
                <span className="dd-world-badge">{WORLDS[decision.world]?.nameTh || decision.world}</span>
              )}
            </div>

            <div className="odc-question">
              <strong>{isTh ? 'คำถาม:' : 'Question:'}</strong>
              <p>{decision.question}</p>
            </div>

            <div className="odc-recommendation">
              <strong>{isTh ? 'คำแนะนำจาก Twin:' : 'Twin Recommendation:'}</strong>
              <p className="odc-rec-text">{decision.twinRecommendation}</p>
            </div>

            <div className="odc-choice">
              <strong>{isTh ? 'คุณเลือก:' : 'Your Choice:'}</strong>
              <p>{decision.userChoice}</p>
            </div>
          </div>

          {/* Phase 1: Record Outcome */}
          {phase === 'outcome' && (
            <div className="odc-phase">
              <h2 style={{ marginBottom: '1rem' }}>
                {isTh ? '📝 บันทึกผลลัพธ์' : '📝 Record Outcome'}
              </h2>

              {outcomeError && (
                <div className="odc-error-banner">{outcomeError}</div>
              )}

              <div className="odc-form-group">
                <label>
                  {isTh ? 'ผลกระทบของทางเลือกนี้:' : 'Impact of your choice:'}
                </label>
                <div className="odc-radio-group">
                  <label className="odc-radio-option">
                    <input
                      type="radio"
                      name="impact"
                      value="positive"
                      checked={stateFields.impact === 'positive'}
                      onChange={() => setStateFields(s => ({ ...s, impact: 'positive' }))}
                    />
                    <span>{isTh ? '➕ เป็นบวก (ผลดี)' : 'Positive (good result)'}</span>
                  </label>
                  <label className="odc-radio-option">
                    <input
                      type="radio"
                      name="impact"
                      value="neutral"
                      checked={stateFields.impact === 'neutral'}
                      onChange={() => setStateFields(s => ({ ...s, impact: 'neutral' }))}
                    />
                    <span>{isTh ? '➖ เฉยๆ (ไม่ดีขึ้น ไม่แย่ลง)' : 'Neutral (no significant change)'}</span>
                  </label>
                  <label className="odc-radio-option">
                    <input
                      type="radio"
                      name="impact"
                      value="negative"
                      checked={stateFields.impact === 'negative'}
                      onChange={() => setStateFields(s => ({ ...s, impact: 'negative' }))}
                    />
                    <span>{isTh ? '➖ เป็นลบ (ผลเสีย)' : 'Negative (bad result)'}</span>
                  </label>
                </div>
              </div>

              <div className="odc-form-group">
                <label htmlFor="feedback">
                  {isTh ? 'คำติชมของคุณ:' : 'Your feedback:'}
                </label>
                <textarea
                  id="feedback"
                  value={stateFields.feedback}
                  onChange={(e) => setStateFields(s => ({ ...s, feedback: e.target.value }))}
                  placeholder={isTh ? 'อธิบายผลลัพธ์ที่เกิดขึ้น...' : 'Describe what happened...'}
                  rows={4}
                  className="odc-textarea"
                />
              </div>

              <div className="odc-form-group">
                <label htmlFor="lessons">
                  {isTh ? 'บทเรียนที่ได้รับ (ถ้ามี):' : 'Lessons learned (optional):'}
                </label>
                <textarea
                  id="lessons"
                  value={stateFields.lessons}
                  onChange={(e) => setStateFields(s => ({ ...s, lessons: e.target.value }))}
                  placeholder={isTh ? 'มีอะไรที่อยากจดจำหรือเรียนรู้จากเรื่องนี้?' : 'Anything to remember or learn from this?'}
                  rows={3}
                  className="odc-textarea"
                />
              </div>

              <button
                onClick={handleOutcomeSubmit}
                disabled={submittingOutcome}
                className="odc-submit-btn odc-btn-primary"
              >
                {submittingOutcome
                  ? (isTh ? 'กำลังบันทึก...' : 'Saving...')
                  : (isTh ? 'บันทึกและไปขั้นถัดไป' : 'Save & Continue')}
              </button>
            </div>
          )}

          {/* Phase 2: Rate Advice Quality */}
          {phase === 'rating' && (
            <div className="odc-phase">
              <h2 style={{ marginBottom: '1rem' }}>
                {isTh ? '⭐ ให้คะแนนคำแนะนำของ Twin' : '⭐ Rate Twin\'s Advice'}
              </h2>

              <p style={{ marginBottom: '1.5rem', color: 'var(--text-secondary)' }}>
                {isTh
                  ? 'คำแนะนำของ Twin มีประโยชน์เพียงใด?'
                  : 'How helpful was the Twin\'s recommendation?'}
              </p>

              {/* Review original recommendation */}
              <div className="odc-review-box">
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                  {isTh ? 'คำแนะนำเดิม:' : 'Original recommendation:'}
                </div>
                <blockquote>{decision.twinRecommendation}</blockquote>
              </div>

              {ratingError && (
                <div className="odc-error-banner">{ratingError}</div>
              )}

              <div className="odc-rating-options">
                {RATING_OPTIONS.map((opt) => (
                  <label key={opt.value} className={`odc-rating-option ${selectedRating === opt.value ? 'odc-selected' : ''}`}>
                    <input
                      type="radio"
                      name="rating"
                      value={opt.value}
                      checked={selectedRating === opt.value}
                      onChange={() => setSelectedRating(opt.value)}
                    />
                    <span>
                      {isTh ? opt.labelTh : opt.labelEn}
                    </span>
                  </label>
                ))}
              </div>

              <div className="odc-actions">
                <button
                  onClick={handleSkipRating}
                  className="odc-btn-secondary"
                >
                  {isTh ? 'ข้าม' : 'Skip'}
                </button>
                <button
                  onClick={handleRatingSubmit}
                  disabled={submittingRating || selectedRating === null}
                  className="odc-btn-primary"
                >
                  {submittingRating
                    ? (isTh ? 'กำลังบันทึก...' : 'Saving...')
                    : (isTh ? 'บันทึกคะแนน' : 'Save Rating')}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}

export default function OutcomeRecordPage() {
  return (
    <ErrorBoundary>
      <OutcomeRecordPageInner />
    </ErrorBoundary>
  );
}
