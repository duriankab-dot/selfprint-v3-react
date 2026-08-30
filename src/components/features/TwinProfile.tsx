/**
 * 👥 TwinProfile Component — AI Twin Profile Page
 *
 * **ทำหน้าที่:**
 * - Display Twin accuracy metrics (% + trend)
 * - Show evolution timeline (accuracy over time)
 * - Display Twin stats (insights, feedback, patterns)
 * - Show recent feedback history
 * - Display Twin confidence level
 * - Evolution badge system
 *
 * **Input Props:** None (uses userId from AuthContext)
 *
 * **Output:**
 * - Full Twin profile with accuracy + evolution + stats
 * - Real-time metric updates
 * - Feedback history list
 *
 * @module features/TwinProfile
 */

import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { AIFeedbackLoop } from '@/lib/intelligence/AIFeedbackLoop';
import { PatternDetector } from '@/lib/intelligence/PatternDetector';
import { MemoryManager } from '@/lib/intelligence/MemoryManager';
import { AccuracyBadgeFromMetrics } from '@/components/intelligence/AccuracyBadge';
import { TwinEvolutionChart } from './TwinEvolutionChart';
import { TwinStatsCard } from './TwinStatsCard';
import './TwinProfile.css';

// ============================================================================
// Component
// ============================================================================

export const TwinProfile: React.FC = () => {
  const { session } = useAuth();
  const userId = session?.user?.id ?? '';
  const { language } = useLanguage();
  const isTh = language === 'th';

  const feedbackLoop = useMemo(() => new AIFeedbackLoop(), []);
  const patternDetector = useMemo(() => new PatternDetector(), []);
  const memoryManager = useMemo(() => new MemoryManager(), []);

  // Fetch accuracy metrics
  const { data: accuracyMetrics, isLoading: metricsLoading } = useQuery({
    queryKey: ['accuracyMetrics', userId],
    queryFn: () => feedbackLoop.getAccuracyMetrics(userId),
    enabled: !!userId,
    staleTime: 30_000,
    retry: 2,
  });

  // Fetch recent feedback
  const { data: recentFeedback = [], isLoading: feedbackLoading } = useQuery({
    queryKey: ['recentFeedback', userId],
    queryFn: () => feedbackLoop.getRecentFeedback(userId, 20),
    enabled: !!userId,
    staleTime: 30_000,
    retry: 2,
  });

  // Fetch patterns count
  const { data: patterns = [], isLoading: patternsLoading } = useQuery({
    queryKey: ['behavioralPatterns', userId],
    queryFn: () => patternDetector.detectPatterns(userId),
    enabled: !!userId,
    staleTime: 60_000,
    retry: 2,
  });

  // Fetch memories count
  const { data: memories = [], isLoading: memoriesLoading } = useQuery({
    queryKey: ['userMemories', userId],
    queryFn: () => memoryManager.getMemories(userId, undefined, 100),
    enabled: !!userId,
    staleTime: 60_000,
    retry: 2,
  });

  // Calculate stats
  const stats = useMemo(() => {
    return {
      totalInsights: accuracyMetrics?.totalInsights || 0,
      feedbackGiven: recentFeedback.length,
      patternsFound: patterns.length,
      memoriesRecorded: memories.length,
      accuracyTrend: accuracyMetrics?.trend || 'stable',
    };
  }, [accuracyMetrics, recentFeedback, patterns, memories]);

  // Calculate evolution score (0-100)
  const evolutionScore = useMemo(() => {
    const factors = {
      accuracy: (accuracyMetrics?.accuracy || 0) * 30, // 30%
      feedbackCount: Math.min((stats.totalInsights / 50) * 30, 30), // 30%
      patternCount: Math.min((patterns.length / 10) * 20, 20), // 20%
      memoryCount: Math.min((memories.length / 20) * 20, 20), // 20%
    };
    return Math.round(
      factors.accuracy + factors.feedbackCount + factors.patternCount + factors.memoryCount
    );
  }, [accuracyMetrics, patterns, memories, stats]);

  const isLoading = metricsLoading || feedbackLoading || patternsLoading || memoriesLoading;

  if (!userId) {
    return (
      <div className="twin-profile twin-profile--empty">
        <p>{isTh ? 'กรุณาเข้าสู่ระบบเพื่อดู Twin Profile ของคุณ' : 'Please log in to see your Twin Profile'}</p>
      </div>
    );
  }

  return (
    <div className="twin-profile">
      {/* Header */}
      <div className="twin-profile__header">
        <div className="twin-profile__title-section">
          <h1 className="twin-profile__title">👥 Twin Profile</h1>
          <p className="twin-profile__subtitle">
            {isTh ? 'ความเชี่ยวชาญและการพัฒนาของ AI Twin คุณ' : "Your AI Twin's expertise and growth"}
          </p>
        </div>

        {/* Evolution score badge */}
        <div className="twin-profile__evolution-badge">
          <div className="evolution-badge__score">{evolutionScore}</div>
          <div className="evolution-badge__label">
            <p>Evolution Score</p>
            <p className="evolution-badge__subtitle">0-100</p>
          </div>
        </div>
      </div>

      {/* Main metrics */}
      <section className="twin-profile__metrics-section">
        <h2 className="section-title">📊 {isTh ? 'ความแม่นยำ' : 'Accuracy'}</h2>

        {isLoading ? (
          <div className="twin-profile__loading">
            <span className="spinner" />
            <p>{isTh ? 'กำลังโหลด Twin stats...' : 'Loading Twin stats...'}</p>
          </div>
        ) : accuracyMetrics ? (
          <div className="metrics-container">
            <AccuracyBadgeFromMetrics metrics={accuracyMetrics} compact={false} />
          </div>
        ) : (
          <div className="metrics-empty">
            <p>{isTh ? 'ยังไม่มีข้อมูล feedback เพียงพอ ให้ feedback เพื่อให้ Twin เรียนรู้' : 'Not enough feedback data yet — give feedback so your Twin can learn'}</p>
          </div>
        )}
      </section>

      {/* Evolution timeline */}
      <section className="twin-profile__evolution-section">
        <h2 className="section-title">📈 Evolution Timeline</h2>
        <TwinEvolutionChart accuracy={accuracyMetrics?.accuracy || 0} trend={accuracyMetrics?.trend || 'stable'} />
      </section>

      {/* Stats grid */}
      <section className="twin-profile__stats-section">
        <h2 className="section-title">📌 Twin Stats</h2>
        <div className="stats-grid">
          <TwinStatsCard label="Total Insights" value={stats.totalInsights} icon="💡" />
          <TwinStatsCard label="Feedback Given" value={stats.feedbackGiven} icon="👍" />
          <TwinStatsCard label="Patterns Found" value={stats.patternsFound} icon="🔄" />
          <TwinStatsCard label="Memories Saved" value={stats.memoriesRecorded} icon="💾" />
        </div>
      </section>

      {/* Recent feedback history */}
      <section className="twin-profile__feedback-section">
        <h2 className="section-title">🔄 {isTh ? 'Feedback ล่าสุด' : 'Recent Feedback'}</h2>

        {feedbackLoading ? (
          <div className="twin-profile__loading">
            <span className="spinner" />
            <p>{isTh ? 'กำลังโหลด feedback history...' : 'Loading feedback history...'}</p>
          </div>
        ) : recentFeedback.length === 0 ? (
          <div className="feedback-empty">
            <p>{isTh ? 'ยังไม่มี feedback history' : 'No feedback history yet'}</p>
          </div>
        ) : (
          <div className="feedback-list">
            {recentFeedback.slice(0, 10).map((feedback) => (
              <div key={feedback.id} className="feedback-item">
                <span className="feedback-item__type">{getFeedbackEmoji(feedback.feedbackType)}</span>
                <span className="feedback-item__label">{getFeedbackLabel(feedback.feedbackType, isTh)}</span>
                <span className="feedback-item__date">{formatDate(feedback.createdAt, isTh)}</span>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Help text */}
      <section className="twin-profile__help-section">
        <h3>💡 {isTh ? 'เคล็ดลับ' : 'Tips'}</h3>
        <ul className="help-list">
          {isTh ? (
            <>
              <li>ให้ feedback บ่อยๆ เพื่อให้ Twin แม่นยำขึ้น</li>
              <li>บันทึก memories เพื่อให้ Twin เข้าใจคุณลึกขึ้น</li>
              <li>ตรวจสอบ patterns ที่ Twin ค้นพบ</li>
              <li>Evolution Score วัดความเชี่ยวชาญรวมของ Twin</li>
            </>
          ) : (
            <>
              <li>Give feedback often so your Twin gets more accurate</li>
              <li>Log memories so your Twin understands you more deeply</li>
              <li>Check the patterns your Twin discovers</li>
              <li>Evolution Score measures your Twin's overall expertise</li>
            </>
          )}
        </ul>
      </section>
    </div>
  );
};

// ============================================================================
// Helper Functions
// ============================================================================

function getFeedbackEmoji(type: string): string {
  switch (type) {
    case 'very_true':
      return '👍';
    case 'somewhat':
      return '🤔';
    case 'not_sure':
      return '❓';
    case 'not_me':
      return '❌';
    default:
      return '💬';
  }
}

function getFeedbackLabel(type: string, isTh: boolean): string {
  if (isTh) {
    switch (type) {
      case 'very_true':
        return 'ถูกต้อง';
      case 'somewhat':
        return 'บางส่วน';
      case 'not_sure':
        return 'ไม่แน่ใจ';
      case 'not_me':
        return 'ไม่ใช่ฉัน';
      default:
        return type;
    }
  }
  switch (type) {
    case 'very_true':
      return 'Accurate';
    case 'somewhat':
      return 'Somewhat';
    case 'not_sure':
      return 'Not sure';
    case 'not_me':
      return 'Not me';
    default:
      return type;
  }
}

function formatDate(date: Date, isTh: boolean): string {
  const d = new Date(date);
  const today = new Date();
  const diffMs = today.getTime() - d.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (isTh) {
    if (diffDays === 0) return 'วันนี้';
    if (diffDays === 1) return 'เมื่อวาน';
    if (diffDays < 7) return `${diffDays} วันที่แล้ว`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} สัปดาห์ที่แล้ว`;
    return `${Math.floor(diffDays / 30)} เดือนที่แล้ว`;
  }
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
  return `${Math.floor(diffDays / 30)}mo ago`;
}

export default TwinProfile;
