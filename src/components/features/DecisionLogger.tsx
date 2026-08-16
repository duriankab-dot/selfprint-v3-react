/**
 * 📋 DecisionLogger Component — บันทึกและวิเคราะห์การตัดสินใจ
 *
 * **ทำหน้าที่:**
 * - ฟอร์มบันทึกการตัดสินใจใหม่
 * - รายการการตัดสินใจที่บันทึกไว้
 * - สถิติและแนวโน้ม
 * - ข้อเสนอแนะจาก DecisionIntelligenceEngine
 *
 * **Integration:**
 * - DecisionIntelligenceEngine (Phase 1) สำหรับ bias warnings
 * - React Query สำหรับ data fetching
 * - Thai language throughout
 */

import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { getUserDecisions } from '@/services/supabase-service';
import { DecisionIntelligenceEngine } from '@/lib/intelligence/DecisionIntelligenceEngine';
import { PersonalContextBuilder } from '@/lib/intelligence/PersonalContextBuilder';
import DecisionForm from './DecisionForm';
import DecisionList from './DecisionList';
import DecisionAnalytics from './DecisionAnalytics';
import { Alert } from '@/components/composites/Alert';
import './decision-logger.css';

// ============================================================================
// Types
// ============================================================================

type ActiveView = 'create' | 'list' | 'analytics';

interface DecisionInfo {
  id: string;
  userId: string;
  title: string;
  context: string;
  expectedOutcome: string;
  createdAt: Date;
  outcome?: string;
  actualOutcome?: string;
  biasWarnings?: string[];
}

// ============================================================================
// Component
// ============================================================================

/**
 * ✅ DecisionLogger — Main decision logging dashboard
 */
export const DecisionLogger: React.FC = () => {
  const { session } = useAuth();
  const userId = session?.user?.id ?? '';

  const [activeView, setActiveView] = useState<ActiveView>('list');
  const [lastSavedDecision, setLastSavedDecision] = useState<DecisionInfo | null>(null);

  // Stable class instances
  const contextBuilder = useMemo(() => new PersonalContextBuilder(), []);
  const decisionEngine = useMemo(() => new DecisionIntelligenceEngine(), []);

  // ===================================================
  // Queries
  // ===================================================

  const { data: personalContext, isLoading: contextLoading } = useQuery({
    queryKey: ['personalContext', userId],
    queryFn: () => contextBuilder.getContext(userId),
    enabled: !!userId,
    staleTime: 60_000,
  });

  const { data: decisions = [], isLoading: decisionsLoading } = useQuery({
    queryKey: ['userDecisions', userId],
    queryFn: async () => {
      const results = await getUserDecisions(userId);
      return results.map(r => ({
        id: r.id,
        userId,
        title: r.title,
        context: r.context,
        expectedOutcome: r.expectedOutcome,
        createdAt: new Date(r.createdAt),
      })) as DecisionInfo[];
    },
    enabled: !!userId,
    staleTime: 60_000,
  });

  // ===================================================
  // Decision Intelligence Analysis
  // ===================================================

  const decisionAnalysis = useMemo(() => {
    if (!personalContext) return null;
    return decisionEngine.analyze(personalContext);
  }, [personalContext, decisionEngine]);

  // ===================================================
  // Unauthenticated state
  // ===================================================

  if (!userId) {
    return (
      <div className="decision-logger">
        <Alert variant="warning" message="กรุณาเข้าสู่ระบบเพื่อใช้ Decision Logger" />
      </div>
    );
  }

  // ===================================================
  // Loading state
  // ===================================================

  const isLoading = contextLoading || decisionsLoading;

  if (isLoading) {
    return (
      <div className="decision-logger decision-logger--loading">
        <div className="decision-logger__spinner" />
        <p>กำลังโหลด Decision Logger...</p>
      </div>
    );
  }

  // ===================================================
  // Render
  // ===================================================

  return (
    <div className="decision-logger">
      {/* Header */}
      <div className="decision-logger__header">
        <h1 className="decision-logger__title">📋 บันทึกการตัดสินใจ</h1>
        <p className="decision-logger__subtitle">
          บันทึกการตัดสินใจสำคัญและติดตามผลลัพธ์ เรียนรู้จากรูปแบบการตัดสินใจของคุณ
        </p>
      </div>

      {/* Success Alert */}
      {lastSavedDecision && (
        <Alert
          variant="success"
          message={`✅ บันทึก "${lastSavedDecision.title}" เรียบร้อยแล้ว`}
          onClose={() => setLastSavedDecision(null)}
        />
      )}

      {/* Tabs */}
      <nav className="decision-logger__tabs" role="tablist">
        <button
          role="tab"
          aria-selected={activeView === 'create'}
          className={`decision-logger__tab-btn${activeView === 'create' ? ' active' : ''}`}
          onClick={() => setActiveView('create')}
        >
          ➕ เพิ่มการตัดสินใจ
        </button>
        <button
          role="tab"
          aria-selected={activeView === 'list'}
          className={`decision-logger__tab-btn${activeView === 'list' ? ' active' : ''}`}
          onClick={() => setActiveView('list')}
        >
          📝 รายการ ({decisions.length})
        </button>
        <button
          role="tab"
          aria-selected={activeView === 'analytics'}
          className={`decision-logger__tab-btn${activeView === 'analytics' ? ' active' : ''}`}
          onClick={() => setActiveView('analytics')}
        >
          📊 สถิติ
        </button>
      </nav>

      {/* Tab Content */}
      <div className="decision-logger__content">
        {/* CREATE VIEW */}
        {activeView === 'create' && (
          <div className="decision-logger__panel">
            {decisionAnalysis && (
              <div className="decision-logger__insight-box">
                <h3>💡 ข้อเสนอแนะส่วนตัว</h3>
                <p className="insight-text">{decisionAnalysis.topInsight}</p>
                <p className="insight-style">
                  สไตล์การตัดสินใจของคุณ: <strong>{decisionAnalysis.styleProfile.type}</strong>
                </p>
              </div>
            )}

            <DecisionForm
              userId={userId}
              decisionAnalysis={decisionAnalysis}
              onDecisionCreated={(decision) => {
                setLastSavedDecision(decision);
                setActiveView('list');
              }}
            />
          </div>
        )}

        {/* LIST VIEW */}
        {activeView === 'list' && (
          <div className="decision-logger__panel">
            {decisions.length === 0 ? (
              <div className="decision-logger__empty">
                <p className="decision-logger__empty-icon">📭</p>
                <h3>ยังไม่มีการตัดสินใจที่บันทึก</h3>
                <p>เริ่มบันทึกการตัดสินใจแรกของคุณ เพื่อเริ่มติดตามรูปแบบการตัดสินใจ</p>
              </div>
            ) : (
              <DecisionList
                userId={userId}
                decisions={decisions}
              />
            )}
          </div>
        )}

        {/* ANALYTICS VIEW */}
        {activeView === 'analytics' && (
          <div className="decision-logger__panel">
            <DecisionAnalytics
              decisions={decisions}
              decisionAnalysis={decisionAnalysis}
            />
          </div>
        )}
      </div>

      {/* Bias Warning Box (if high severity biases detected) */}
      {decisionAnalysis && decisionAnalysis.biasRisks.some(b => b.severity === 'high') && (
        <div className="decision-logger__bias-warning">
          <h4>⚠️ เตือน: Cognitive Biases ที่พบบ่อยในรูปแบบการตัดสินใจของคุณ</h4>
          <ul className="bias-list">
            {decisionAnalysis.biasRisks
              .filter(b => b.severity === 'high')
              .map((bias, idx) => (
                <li key={idx} className="bias-item bias-item--high">
                  <strong>{bias.name}:</strong> {bias.descriptionThai}
                </li>
              ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default DecisionLogger;
