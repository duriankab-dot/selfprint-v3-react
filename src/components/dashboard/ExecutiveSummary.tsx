/**
 * ExecutiveSummary.tsx
 *
 * Dashboard section — "สิ่งที่ Selfprint เห็นในตัวคุณตอนนี้"
 *
 * Master Direction §8–9:
 * - Dashboard must be "MY SELFPRINT / YOUR SPACE"
 * - First section = human-language analysis, not number cards
 * - Includes "Read Full Analysis" button → /analysis
 *
 * Implementation:
 * - useAuth() for userId (never localStorage)
 * - useQuery for real Supabase data
 * - InsightEngine synthesizes context + patterns → human text
 * - Real-time invalidation via queryClient (shared with IntelligencePanel)
 *
 * @module components/dashboard/ExecutiveSummary
 */

import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { PersonalContextBuilder } from '@/lib/intelligence/PersonalContextBuilder';
import { PatternDetector } from '@/lib/intelligence/PatternDetector';
import { AIFeedbackLoop } from '@/lib/intelligence/AIFeedbackLoop';
import { InsightEngine } from '@/lib/intelligence/InsightEngine';
import { ConfidenceIndicator } from '@/components/intelligence/ConfidenceIndicator';
import type { KnowledgeLevel } from '@/lib/intelligence/types';

// ============================================================================
// Knowledge level labels
// ============================================================================

const KNOWLEDGE_LABEL: Record<KnowledgeLevel, string> = {
  KNOW: '✓ รู้แน่',
  INFER: '~ สรุปจากข้อมูล',
  UNKNOWN: '? ยังไม่ทราบ',
};

const KNOWLEDGE_CLASS: Record<KnowledgeLevel, string> = {
  KNOW: 'exec-summary__badge--know',
  INFER: 'exec-summary__badge--infer',
  UNKNOWN: 'exec-summary__badge--unknown',
};

// ============================================================================
// Component
// ============================================================================

export const ExecutiveSummary: React.FC = () => {
  const { session } = useAuth();
  const userId = session?.user?.id ?? '';
  const navigate = useNavigate();

  // Stable instances (same pattern as IntelligencePanel — React Query dedupes calls)
  const contextBuilder = useMemo(() => new PersonalContextBuilder(), []);
  const patternDetector = useMemo(() => new PatternDetector(), []);
  const feedbackLoop = useMemo(() => new AIFeedbackLoop(), []);
  const insightEngine = useMemo(() => new InsightEngine(), []);

  // --------------------------------------------------------------------------
  // Queries — shared cache keys with IntelligencePanel → no duplicate fetches
  // --------------------------------------------------------------------------

  const { data: context, isLoading: ctxLoading } = useQuery({
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
  // Synthesize summary — recalculates only when data changes
  // --------------------------------------------------------------------------

  const summary = useMemo(
    () => insightEngine.generateExecutiveSummary(context ?? null, patterns, metrics ?? null),
    [context, patterns, metrics, insightEngine]
  );

  // --------------------------------------------------------------------------
  // Not logged in
  // --------------------------------------------------------------------------

  if (!userId) return null;

  // --------------------------------------------------------------------------
  // Loading skeleton
  // --------------------------------------------------------------------------

  if (ctxLoading || patLoading) {
    return (
      <div className="exec-summary exec-summary--loading" aria-busy="true">
        <div className="exec-summary__skeleton exec-summary__skeleton--title" />
        <div className="exec-summary__skeleton exec-summary__skeleton--line" />
        <div className="exec-summary__skeleton exec-summary__skeleton--line exec-summary__skeleton--short" />
        <div className="exec-summary__skeleton exec-summary__skeleton--line" />
      </div>
    );
  }

  // --------------------------------------------------------------------------
  // Empty state — no data yet
  // --------------------------------------------------------------------------

  if (summary.dataDepth === 'empty') {
    return (
      <div className="exec-summary exec-summary--empty">
        <div className="exec-summary__empty-icon">🌱</div>
        <h2 className="exec-summary__empty-title">Twin ของคุณเพิ่งเริ่มต้น</h2>
        <p className="exec-summary__empty-body">
          บันทึกความทรงจำหรือทำ reflection สัก 2–3 ครั้ง
          เพื่อให้ AI Twin เริ่มเรียนรู้และเข้าใจตัวคุณ
        </p>
      </div>
    );
  }

  // --------------------------------------------------------------------------
  // Main render
  // --------------------------------------------------------------------------

  return (
    <section className="exec-summary" aria-label="Executive Summary — AI Twin">
      {/* Header row */}
      <div className="exec-summary__header">
        <div>
          <p className="exec-summary__eyebrow">AI Twin ของคุณ</p>
          <h2 className="exec-summary__headline">{summary.headline}</h2>
        </div>
        {metrics && metrics.totalInsights > 0 && (
          <div className="exec-summary__accuracy">
            <ConfidenceIndicator
              confidence={metrics.accuracy}
              evidenceCount={metrics.totalInsights}
              compact
              explanation={`Twin แม่นยำ ${Math.round(metrics.accuracy * 100)}% จาก ${metrics.totalInsights} feedbacks`}
            />
          </div>
        )}
      </div>

      {/* Insight lines */}
      <div className="exec-summary__insights" role="list">
        {summary.insights.map((line, i) => (
          <div key={i} className="exec-summary__insight-row" role="listitem">
            <div className="exec-summary__insight-dot" aria-hidden="true" />
            <div className="exec-summary__insight-body">
              <p className="exec-summary__insight-text">{line.text}</p>
              <span className={`exec-summary__badge ${KNOWLEDGE_CLASS[line.knowledgeLevel]}`}>
                {KNOWLEDGE_LABEL[line.knowledgeLevel]}
                {' · '}
                {line.sourceLabel}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Top pattern callout */}
      {summary.topPattern && (
        <div className="exec-summary__pattern-callout" role="note">
          <span className="exec-summary__pattern-icon" aria-hidden="true">
            {summary.topPattern.type === 'repeating'
              ? '🔁'
              : summary.topPattern.type === 'emerging'
                ? '🌱'
                : '🔄'}
          </span>
          <div>
            <p className="exec-summary__pattern-label">pattern ที่น่าสนใจ</p>
            <p className="exec-summary__pattern-text">{summary.topPattern.description}</p>
          </div>
          <ConfidenceIndicator
            confidence={summary.topPattern.confidence}
            compact
            className="exec-summary__pattern-confidence"
          />
        </div>
      )}

      {/* Footer */}
      <div className="exec-summary__footer">
        <span className="exec-summary__depth-label">
          {summary.dataDepth === 'minimal' && '🌱 ข้อมูลน้อย — Twin ยังเรียนรู้'}
          {summary.dataDepth === 'growing' && '📈 Twin กำลังเติบโต'}
          {summary.dataDepth === 'established' && '🧠 Twin เข้าใจคุณพอสมควรแล้ว'}
          {summary.dataDepth === 'deep' && '✨ Twin เข้าใจคุณในระดับลึก'}
        </span>

        {summary.readMoreEnabled && (
          <button
            className="exec-summary__read-more"
            onClick={() => navigate('/analysis')}
            aria-label="อ่านการวิเคราะห์เต็มรูปแบบ"
          >
            อ่านการวิเคราะห์เต็มรูปแบบ →
          </button>
        )}
      </div>
    </section>
  );
};

export default ExecutiveSummary;
