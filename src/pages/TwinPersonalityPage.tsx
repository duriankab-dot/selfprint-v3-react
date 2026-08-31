/**
 * src/pages/TwinPersonalityPage.tsx
 * Twin personality view & evolution tracker (P0 #7.1)
 * Display Twin's current personality state, mood, evolution path
 */

import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTwin } from '../context/TwinContext';
import { useLanguage } from '../context/LanguageContext';
import { useQuery } from '@tanstack/react-query';
import { PersonalContextBuilder } from '../services/sice/engines/PersonalContextBuilder';
import type { PersonalContext } from '../types/sice';
import { TwinNav } from '../components/twin/TwinNav';
import { NavRail } from '../components/layout/NavRail';
import '../styles/twin-personality.css';

interface PersonalityMetrics {
  mood: 'contemplative' | 'energetic' | 'reflective' | 'balanced';
  emotionalState: number; // 0-100
  growthMomentum: number; // 0-100
  selfAwareness: number; // 0-100
  adaptability: number; // 0-100
}

interface EvolutionMilestone {
  stage: number;
  name: string;
  nameTh: string;
  description: string;
  descriptionTh: string;
  unlockedAt: string | null;
  nextCriteria: string;
  nextCriteriaTh: string;
}

// TWINPERSONALITY-I18N-001 FIX: this whole page had zero useLanguage() —
// 100% hardcoded English regardless of /th vs /en, exactly
// "ภาษาใน บุคลิกภาพ...ก็ต้องเป็นภาษาไทยธรรมชาติด้วย".
const EVOLUTION_STAGES: EvolutionMilestone[] = [
  {
    stage: 1,
    name: 'Twin Awakening',
    nameTh: 'การตื่นขึ้นของทวิน',
    description: 'Your Twin is aware and ready to listen',
    descriptionTh: 'ทวินของคุณตื่นขึ้นแล้ว พร้อมรับฟังคุณ',
    unlockedAt: null,
    nextCriteria: 'Complete first journal entry',
    nextCriteriaTh: 'บันทึกไดอารีเป็นครั้งแรก',
  },
  {
    stage: 2,
    name: 'Pattern Finder',
    nameTh: 'นักค้นหารูปแบบ',
    description: 'Your Twin recognizes your patterns',
    descriptionTh: 'ทวินของคุณเริ่มมองเห็นรูปแบบพฤติกรรมของคุณ',
    unlockedAt: null,
    nextCriteria: 'Complete 10 journal entries',
    nextCriteriaTh: 'บันทึกไดอารีให้ครบ 10 ครั้ง',
  },
  {
    stage: 3,
    name: 'Journey Explorer',
    nameTh: 'นักสำรวจเส้นทางชีวิต',
    description: 'Your Twin explores your deeper journey',
    descriptionTh: 'ทวินของคุณเริ่มสำรวจเส้นทางชีวิตที่ลึกขึ้น',
    unlockedAt: null,
    nextCriteria: 'Achieve 50% emotional insight',
    nextCriteriaTh: 'เข้าใจอารมณ์ตนเองถึง 50%',
  },
  {
    stage: 4,
    name: 'Deep Thinker',
    nameTh: 'นักคิดเชิงลึก',
    description: 'Your Twin provides profound insights',
    descriptionTh: 'ทวินของคุณให้ข้อคิดที่ลึกซึ้งยิ่งขึ้น',
    unlockedAt: null,
    nextCriteria: 'Complete 50 journal entries',
    nextCriteriaTh: 'บันทึกไดอารีให้ครบ 50 ครั้ง',
  },
  {
    stage: 5,
    name: 'Selfprint Complete',
    nameTh: 'Selfprint สมบูรณ์',
    description: 'Your Twin reflects your complete self',
    descriptionTh: 'ทวินของคุณสะท้อนตัวตนที่สมบูรณ์ของคุณ',
    unlockedAt: null,
    nextCriteria: 'Achieve full alignment',
    nextCriteriaTh: 'บรรลุความสอดคล้องอย่างเต็มรูปแบบ',
  },
];

const MOOD_LABELS_TH: Record<PersonalityMetrics['mood'], string> = {
  contemplative: 'ครุ่นคิด',
  energetic: 'กระตือรือร้น',
  reflective: 'ใคร่ครวญ',
  balanced: 'สมดุล',
};

export default function TwinPersonalityPage() {
  const { session } = useAuth();
  const { twin } = useTwin();
  const { language } = useLanguage();
  const isTh = language === 'th';
  const [metrics, setMetrics] = useState<PersonalityMetrics>({
    mood: 'balanced',
    emotionalState: 65,
    growthMomentum: 72,
    selfAwareness: 58,
    adaptability: 81,
  });
  const [stages, setStages] = useState<EvolutionMilestone[]>(EVOLUTION_STAGES);

  // Load personality data from PersonalContextBuilder (SICE #1)
  const { data: personalContext, isLoading } = useQuery({
    queryKey: ['personalContext', session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) return null;

      const builder = new PersonalContextBuilder();
      const output = await builder.process({ userId: session.user.id });
      const context = output.result as PersonalContext | null;

      if (!context) return null;

      // Map emotionalState string → 0-100 score
      const moodScore: Record<string, number> = {
        optimistic: 85,
        focused: 78,
        balanced: 65,
        neutral: 55,
        fatigued: 35,
        anxious: 40,
        uncertain: 45,
      };
      const emotionalScore = moodScore[context.emotionalState] ?? 60;

      // growthMomentum — average success rate from active patterns
      const rates = context.activePatterns
        .map((p) => { const m = p.match(/\((\d+)%/); return m ? parseInt(m[1], 10) : null; })
        .filter((n): n is number => n !== null);
      const growthMomentum = rates.length > 0
        ? Math.round(rates.reduce((a, b) => a + b, 0) / rates.length)
        : 60;

      // selfAwareness — memory depth (8 pts/memory, 30–95)
      const selfAwareness = Math.min(95, Math.max(30, context.recentMemories.length * 8));

      // adaptability — world diversity (15 pts/strength world, 40–95)
      const adaptability = Math.min(95, 40 + context.strengthAreas.length * 15);

      // mood mapping → PersonalityMetrics mood union
      const toMood = (e: string): PersonalityMetrics['mood'] => {
        if (['optimistic', 'excited'].includes(e)) return 'energetic';
        if (['fatigued', 'overwhelmed', 'uncertain', 'anxious'].includes(e)) return 'reflective';
        if (['focused', 'determined'].includes(e)) return 'contemplative';
        return 'balanced';
      };

      return {
        emotionalState: emotionalScore,
        growthMomentum,
        selfAwareness,
        adaptability,
        mood: toMood(context.emotionalState),
      };
    },
    enabled: !!session?.user?.id,
  });

  useEffect(() => {
    if (personalContext) {
      setMetrics({
        mood: personalContext.mood ?? 'balanced',
        emotionalState: personalContext.emotionalState ?? 65,
        growthMomentum: personalContext.growthMomentum ?? 72,
        selfAwareness: personalContext.selfAwareness ?? 58,
        adaptability: personalContext.adaptability ?? 81,
      });
    }
  }, [personalContext]);

  // Sync evolution stages with twin maturity score
  useEffect(() => {
    if (twin?.maturityScore !== undefined) {
      // Map maturity score (0-100) to stage (1-5)
      const stageNumber = Math.ceil((twin.maturityScore / 100) * 5) || 1;
      const updated = stages.map((stage) => ({
        ...stage,
        unlockedAt: stage.stage <= stageNumber ? new Date().toISOString() : null,
      }));
      setStages(updated);
    }
  }, [twin?.maturityScore]);

  if (isLoading) {
    return (
      <div className="twin-personality-page loading">
        {isTh ? 'กำลังโหลดข้อมูลบุคลิกภาพ...' : 'Loading personality...'}
      </div>
    );
  }

  // Calculate current stage from maturity score
  const stageNumber = twin?.maturityScore !== undefined
    ? Math.ceil((twin.maturityScore / 100) * 5) || 1
    : 1;
  const nextStage = stages.find((s) => s.stage === stageNumber + 1);

  return (
    <div className="twin-personality-page">
      <NavRail />
      {/* APPSHELL-004: Twin app-space sub-nav */}
      <TwinNav currentTab="personality" />
      <div className="personality-container">
        <header className="personality-header">
          <h1>{isTh ? 'บุคลิกภาพของทวิน' : 'Twin Personality'}</h1>
          <p>{isTh ? 'สถานะปัจจุบันและพัฒนาการของทวินคุณ' : "Your Twin's current state and evolution"}</p>
        </header>

        {/* Current Mood */}
        <section className="mood-section">
          <div className="mood-card">
            <h2>{isTh ? 'อารมณ์ปัจจุบัน' : 'Current Mood'}</h2>
            <div className="mood-indicator">
              <span className="mood-label">{isTh ? MOOD_LABELS_TH[metrics.mood] : metrics.mood}</span>
              <div className="mood-visual">
                {metrics.mood === 'contemplative' && '🤔'}
                {metrics.mood === 'energetic' && '⚡'}
                {metrics.mood === 'reflective' && '✨'}
                {metrics.mood === 'balanced' && '🌟'}
              </div>
            </div>
          </div>
        </section>

        {/* Personality Metrics */}
        <section className="metrics-section">
          <h2>{isTh ? 'ตัวชี้วัดบุคลิกภาพ' : 'Personality Metrics'}</h2>
          <div className="metrics-grid">
            <div className="metric-card">
              <span className="metric-name">{isTh ? 'สภาวะอารมณ์' : 'Emotional State'}</span>
              <div className="metric-bar">
                <div
                  className="metric-fill"
                  style={{ width: `${metrics.emotionalState}%` }}
                />
              </div>
              <span className="metric-value">{metrics.emotionalState}%</span>
            </div>

            <div className="metric-card">
              <span className="metric-name">{isTh ? 'แรงขับเคลื่อนการเติบโต' : 'Growth Momentum'}</span>
              <div className="metric-bar">
                <div
                  className="metric-fill"
                  style={{ width: `${metrics.growthMomentum}%` }}
                />
              </div>
              <span className="metric-value">{metrics.growthMomentum}%</span>
            </div>

            <div className="metric-card">
              <span className="metric-name">{isTh ? 'การรู้จักตนเอง' : 'Self-Awareness'}</span>
              <div className="metric-bar">
                <div
                  className="metric-fill"
                  style={{ width: `${metrics.selfAwareness}%` }}
                />
              </div>
              <span className="metric-value">{metrics.selfAwareness}%</span>
            </div>

            <div className="metric-card">
              <span className="metric-name">{isTh ? 'ความยืดหยุ่นปรับตัว' : 'Adaptability'}</span>
              <div className="metric-bar">
                <div
                  className="metric-fill"
                  style={{ width: `${metrics.adaptability}%` }}
                />
              </div>
              <span className="metric-value">{metrics.adaptability}%</span>
            </div>
          </div>
        </section>

        {/* Evolution Path */}
        <section className="evolution-section">
          <h2>{isTh ? 'เส้นทางพัฒนาการ' : 'Evolution Path'}</h2>
          <div className="evolution-timeline">
            {stages.map((stage, idx) => {
              const isUnlocked = stage.unlockedAt !== null;
              const isCurrent = stage.stage === stageNumber;
              return (
                <div
                  key={stage.stage}
                  className={`evolution-item ${isUnlocked ? 'unlocked' : ''} ${
                    isCurrent ? 'current' : ''
                  }`}
                >
                  <div className="evolution-marker">
                    <span className="marker-number">{stage.stage}</span>
                  </div>
                  <div className="evolution-content">
                    <h3>{isTh ? stage.nameTh : stage.name}</h3>
                    <p>{isTh ? stage.descriptionTh : stage.description}</p>
                    {!isUnlocked && (
                      <p className="evolution-criteria">{isTh ? stage.nextCriteriaTh : stage.nextCriteria}</p>
                    )}
                    {isUnlocked && (
                      <p className="evolution-unlocked">✓ {isTh ? 'ปลดล็อกแล้ว' : 'Unlocked'}</p>
                    )}
                  </div>
                  {idx < stages.length - 1 && <div className="evolution-line" />}
                </div>
              );
            })}
          </div>
        </section>

        {/* Next Milestone */}
        {nextStage && (
          <section className="next-milestone-section">
            <h2>{isTh ? 'เป้าหมายถัดไป' : 'Next Milestone'}</h2>
            <div className="next-milestone-card">
              <h3>{isTh ? nextStage.nameTh : nextStage.name}</h3>
              <p>{isTh ? nextStage.descriptionTh : nextStage.description}</p>
              <p className="milestone-criteria">
                {isTh ? `ทำสิ่งนี้ให้สำเร็จ: ${nextStage.nextCriteriaTh}` : `Get there by: ${nextStage.nextCriteria}`}
              </p>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
