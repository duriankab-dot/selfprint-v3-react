/**
 * IntelligencePanel.tsx
 * Dashboard integration container for Phase 1 intelligence components
 *
 * Real implementation:
 * - useAuth() for userId (never localStorage)
 * - @tanstack/react-query for data fetching + cache invalidation
 * - supabase.channel() for real-time subscriptions
 * - No mocks, no hardcoding
 *
 * Renders: ContextDisplay | ConfidenceIndicator | FeedbackWidget | MemoryRecorder
 */

import React, { useState, useEffect, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase/client';
import { PersonalContextBuilder } from '@/lib/intelligence/PersonalContextBuilder';
import { PatternDetector } from '@/lib/intelligence/PatternDetector';
import { AIFeedbackLoop } from '@/lib/intelligence/AIFeedbackLoop';
import { ContextDisplay } from '@/components/intelligence/ContextDisplay';
import { ConfidenceIndicator } from '@/components/intelligence/ConfidenceIndicator';
import { MemoryRecorder } from '@/components/intelligence/MemoryRecorder';
import MemoryList from '@/components/intelligence/MemoryList';
import FeedbackSummary from '@/components/intelligence/FeedbackSummary';
import { PatternDisplay } from '@/components/intelligence/PatternDisplay';
import { MemoryManager } from '@/lib/intelligence/MemoryManager';
import { Alert } from '@/components/composites/Alert';
import type { PersonalMemory } from '@/lib/intelligence/types';

// ============================================================================
// Types
// ============================================================================

type ActiveTab = 'overview' | 'patterns' | 'memories' | 'feedback';

const TAB_LABELS: Record<ActiveTab, string> = {
  overview: '🪞 ภาพรวม',
  patterns: '📊 รูปแบบ',
  memories: '💾 ความทรงจำ',
  feedback: '📈 Feedback',
};

// ============================================================================
// Component
// ============================================================================

/**
 * IntelligencePanel
 * Container that integrates all Phase 1 intelligence components into Dashboard
 */
export const IntelligencePanel: React.FC = () => {
  const { session } = useAuth();
  const userId = session?.user?.id ?? '';
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');
  const [lastSavedMemory, setLastSavedMemory] = useState<PersonalMemory | null>(null);

  // Stable class instances — created once per component mount
  const contextBuilder = useMemo(() => new PersonalContextBuilder(), []);
  const patternDetector = useMemo(() => new PatternDetector(), []);
  const feedbackLoop = useMemo(() => new AIFeedbackLoop(), []);

  // --------------------------------------------------------------------------
  // Queries (React Query v5)
  // --------------------------------------------------------------------------

  const {
    data: personalContext,
    isLoading: contextLoading,
    error: contextError,
  } = useQuery({
    queryKey: ['personalContext', userId],
    queryFn: () => contextBuilder.getContext(userId),
    enabled: !!userId,
    staleTime: 30_000,
    retry: 2,
  });

  const {
    data: patterns = [],
    isLoading: patternsLoading,
    error: patternsError,
  } = useQuery({
    queryKey: ['behavioralPatterns', userId],
    queryFn: () => patternDetector.detectPatterns(userId),
    enabled: !!userId,
    staleTime: 60_000,
    retry: 2,
  });

  const {
    data: accuracyMetrics,
    isLoading: metricsLoading,
  } = useQuery({
    queryKey: ['accuracyMetrics', userId],
    queryFn: () => feedbackLoop.getAccuracyMetrics(userId),
    enabled: !!userId,
    staleTime: 30_000,
    retry: 2,
  });

  // ฟ้ได้ memories สำหรับแสดงใน MemoryList
  const {
    data: userMemories = [],
    isLoading: memoriesLoading,
    error: memoriesError,
  } = useQuery({
    queryKey: ['userMemories', userId],
    queryFn: async () => {
      const memoryManager = new MemoryManager();
      return memoryManager.getMemories(userId);
    },
    enabled: !!userId,
    staleTime: 60_000,
    retry: 2,
  });

  // --------------------------------------------------------------------------
  // Real-time subscriptions
  // --------------------------------------------------------------------------

  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel(`intelligence-panel-${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'personal_context',
          filter: `user_id=eq.${userId}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['personalContext', userId] });
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'behavioral_patterns',
          filter: `user_id=eq.${userId}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['behavioralPatterns', userId] });
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'insight_feedback',
          filter: `user_id=eq.${userId}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['accuracyMetrics', userId] });
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'personal_memories',
          filter: `user_id=eq.${userId}`,
        },
        () => {
          // ✅ Invalidate memories + patterns (memories อาจเปลี่ยนแปลง patterns)
          queryClient.invalidateQueries({ queryKey: ['userMemories', userId] });
          queryClient.invalidateQueries({ queryKey: ['behavioralPatterns', userId] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, queryClient]);

  // --------------------------------------------------------------------------
  // Unauthenticated state
  // --------------------------------------------------------------------------

  if (!userId) {
    return (
      <div className="intelligence-panel">
        <Alert variant="warning" message="กรุณาเข้าสู่ระบบเพื่อดู AI Twin ของคุณ" />
      </div>
    );
  }

  // --------------------------------------------------------------------------
  // Loading state
  // --------------------------------------------------------------------------

  const isFirstLoad = contextLoading || patternsLoading || metricsLoading;

  // --------------------------------------------------------------------------
  // Render
  // --------------------------------------------------------------------------

  return (
    <section className="intelligence-panel" aria-label="AI Twin Intelligence Panel">
      {/* Header */}
      <div className="intelligence-panel__header">
        <div className="intelligence-panel__title-row">
          <div>
            <h2 className="intelligence-panel__title">🧠 AI Twin ของคุณ</h2>
            <p className="intelligence-panel__subtitle">
              สิ่งที่ AI เรียนรู้และเข้าใจเกี่ยวกับตัวคุณ
            </p>
          </div>

          {/* Overall confidence badge */}
          {accuracyMetrics && accuracyMetrics.totalInsights > 0 && (
            <div className="intelligence-panel__confidence">
              <ConfidenceIndicator
                confidence={accuracyMetrics.accuracy}
                evidenceCount={accuracyMetrics.totalInsights}
                compact
                explanation={`ความแม่นยำ ${Math.round(accuracyMetrics.accuracy * 100)}% จาก ${accuracyMetrics.totalInsights} insights • แนวโน้ม: ${
                  accuracyMetrics.trend === 'improving'
                    ? '📈 ดีขึ้น'
                    : accuracyMetrics.trend === 'declining'
                      ? '📉 ลดลง'
                      : '➡️ คงที่'
                }`}
              />
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <nav className="intelligence-panel__tabs" role="tablist" aria-label="Intelligence sections">
        {(Object.keys(TAB_LABELS) as ActiveTab[]).map((tab) => (
          <button
            key={tab}
            role="tab"
            aria-selected={activeTab === tab}
            aria-controls={`intelligence-panel-tab-${tab}`}
            id={`intelligence-panel-tabbutton-${tab}`}
            className={`intelligence-panel__tab-btn${activeTab === tab ? ' intelligence-panel__tab-btn--active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {TAB_LABELS[tab]}
          </button>
        ))}
      </nav>

      {/* Tab Content */}
      <div
        className="intelligence-panel__content"
        role="tabpanel"
        id={`intelligence-panel-tab-${activeTab}`}
        aria-labelledby={`intelligence-panel-tabbutton-${activeTab}`}
      >
        {/* Global loading */}
        {isFirstLoad && (
          <div className="intelligence-panel__loading" aria-live="polite">
            <div className="intelligence-panel__spinner" aria-hidden="true" />
            <p>กำลังโหลด AI Twin ของคุณ...</p>
          </div>
        )}

        {/* ================================================================
            TAB: overview
        ================================================================ */}
        {!isFirstLoad && activeTab === 'overview' && (
          <div className="intelligence-panel__tab-panel">
            {contextError && (
              <Alert
                variant="error"
                message={`ไม่สามารถโหลด context: ${
                  contextError instanceof Error ? contextError.message : String(contextError)
                }`}
              />
            )}

            {!personalContext || personalContext.sourceCount === 0 ? (
              <div className="intelligence-panel__empty">
                <div className="intelligence-panel__empty-icon">🌱</div>
                <h3>AI Twin ของคุณกำลังเรียนรู้</h3>
                <p>
                  ยังไม่มีข้อมูลเพียงพอ เริ่มบันทึกความทรงจำใน tab "ความทรงจำ"
                  หรือทำ reflection เพื่อสอน AI ให้เข้าใจคุณ
                </p>
              </div>
            ) : (
              <ContextDisplay
                context={personalContext}
                patterns={patterns}
                accuracyMetrics={accuracyMetrics}
                expandedSection="all"
              />
            )}
          </div>
        )}

        {/* ================================================================
            TAB: patterns
        ================================================================ */}
        {!isFirstLoad && activeTab === 'patterns' && (
          <div className="intelligence-panel__tab-panel">
            {patternsError && (
              <Alert
                variant="error"
                message={`ไม่สามารถโหลดรูปแบบพฤติกรรม: ${
                  patternsError instanceof Error ? patternsError.message : String(patternsError)
                }`}
              />
            )}

            {patterns.length === 0 ? (
              <div className="intelligence-panel__empty">
                <div className="intelligence-panel__empty-icon">📈</div>
                <h3>ยังไม่พบรูปแบบพฤติกรรม</h3>
                <p>
                  AI จะเริ่มสังเกตรูปแบบหลังจากมีข้อมูล reflection และการตัดสินใจเพียงพอ
                  ใช้ Selfprint ต่อไปเรื่อย ๆ
                </p>
              </div>
            ) : (
              <PatternDisplay
                patterns={patterns}
                showConfidence={true}
                onPatternClick={() => {
                  // Optional: Can add modal/detail view here
                }}
              />
            )}
          </div>
        )}

        {/* ================================================================
            TAB: memories
        ================================================================ */}
        {!isFirstLoad && activeTab === 'memories' && (
          <div className="intelligence-panel__tab-panel">
            {memoriesError && (
              <Alert
                variant="error"
                message={`ไม่สามารถโหลด memories: ${
                  memoriesError instanceof Error ? memoriesError.message : String(memoriesError)
                }`}
              />
            )}

            {lastSavedMemory && (
              <Alert
                variant="success"
                message={`✅ บันทึก "${lastSavedMemory.title}" เรียบร้อยแล้ว`}
                onClose={() => setLastSavedMemory(null)}
              />
            )}

            {/* ✅ Memory Recorder Form */}
            <div className="memory-section memory-section--recorder">
              <h3 className="memory-section__title">📝 เพิ่ม Memory ใหม่</h3>
              <MemoryRecorder
                userId={userId}
                onMemoryCreated={(memory) => {
                  setLastSavedMemory(memory);
                  // ✅ Invalidate queries
                  queryClient.invalidateQueries({ queryKey: ['userMemories', userId] });
                  queryClient.invalidateQueries({ queryKey: ['personalContext', userId] });
                  queryClient.invalidateQueries({ queryKey: ['behavioralPatterns', userId] });
                }}
              />
            </div>

            {/* ✅ Memory List */}
            <div className="memory-section memory-section--list">
              <h3 className="memory-section__title">📚 Memories ของคุณ</h3>
              <MemoryList
                userId={userId}
                memories={userMemories}
                isLoading={memoriesLoading}
                onMemoryDeleted={() => {
                  // Optional: show toast or update UI
                }}
              />
            </div>
          </div>
        )}

        {/* ================================================================
            TAB: feedback
        ================================================================ */}
        {!isFirstLoad && activeTab === 'feedback' && (
          <div className="intelligence-panel__tab-panel">
            <FeedbackSummary userId={userId} />
          </div>
        )}
      </div>
    </section>
  );
};

export default IntelligencePanel;
