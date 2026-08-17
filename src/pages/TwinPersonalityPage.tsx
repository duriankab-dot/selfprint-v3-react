/**
 * src/pages/TwinPersonalityPage.tsx
 * Twin personality view & evolution tracker (P0 #7.1)
 * Display Twin's current personality state, mood, evolution path
 */

import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTwin } from '../context/TwinContext';
import { useQuery } from '@tanstack/react-query';
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
  description: string;
  unlockedAt: string | null;
  nextCriteria: string;
}

const EVOLUTION_STAGES: EvolutionMilestone[] = [
  {
    stage: 1,
    name: 'Twin Awakening',
    description: 'Your Twin is aware and ready to listen',
    unlockedAt: null,
    nextCriteria: 'Complete first journal entry',
  },
  {
    stage: 2,
    name: 'Pattern Finder',
    description: 'Your Twin recognizes your patterns',
    unlockedAt: null,
    nextCriteria: 'Complete 10 journal entries',
  },
  {
    stage: 3,
    name: 'Journey Explorer',
    description: 'Your Twin explores your deeper journey',
    unlockedAt: null,
    nextCriteria: 'Achieve 50% emotional insight',
  },
  {
    stage: 4,
    name: 'Deep Thinker',
    description: 'Your Twin provides profound insights',
    unlockedAt: null,
    nextCriteria: 'Complete 50 journal entries',
  },
  {
    stage: 5,
    name: 'Selfprint Complete',
    description: 'Your Twin reflects your complete self',
    unlockedAt: null,
    nextCriteria: 'Achieve full alignment',
  },
];

export default function TwinPersonalityPage() {
  const { session } = useAuth();
  const { twin } = useTwin();
  const [metrics, setMetrics] = useState<PersonalityMetrics>({
    mood: 'balanced',
    emotionalState: 65,
    growthMomentum: 72,
    selfAwareness: 58,
    adaptability: 81,
  });
  const [stages, setStages] = useState<EvolutionMilestone[]>(EVOLUTION_STAGES);

  // Load personality data from personal context
  const { data: personalContext, isLoading } = useQuery({
    queryKey: ['personalContext', session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) return null;

      // TODO: Replace with actual PersonalContextBuilder call
      // const context = await new PersonalContextBuilder().getContext(session.user.id);
      // return context;

      // TODO: Replace with actual metrics from PersonalContext
      return {
        emotionalState: 65,
        growthMomentum: 72,
        selfAwareness: 58,
        adaptability: 81,
      };
    },
    enabled: !!session?.user?.id,
  });

  useEffect(() => {
    if (personalContext) {
      setMetrics({
        mood: 'balanced',
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
    return <div className="twin-personality-page loading">Loading personality...</div>;
  }

  // Calculate current stage from maturity score
  const stageNumber = twin?.maturityScore !== undefined
    ? Math.ceil((twin.maturityScore / 100) * 5) || 1
    : 1;
  const nextStage = stages.find((s) => s.stage === stageNumber + 1);

  return (
    <div className="twin-personality-page">
      <div className="personality-container">
        <header className="personality-header">
          <h1>Twin Personality</h1>
          <p>Your Twin's current state and evolution</p>
        </header>

        {/* Current Mood */}
        <section className="mood-section">
          <div className="mood-card">
            <h2>Current Mood</h2>
            <div className="mood-indicator">
              <span className="mood-label">{metrics.mood}</span>
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
          <h2>Personality Metrics</h2>
          <div className="metrics-grid">
            <div className="metric-card">
              <span className="metric-name">Emotional State</span>
              <div className="metric-bar">
                <div
                  className="metric-fill"
                  style={{ width: `${metrics.emotionalState}%` }}
                />
              </div>
              <span className="metric-value">{metrics.emotionalState}%</span>
            </div>

            <div className="metric-card">
              <span className="metric-name">Growth Momentum</span>
              <div className="metric-bar">
                <div
                  className="metric-fill"
                  style={{ width: `${metrics.growthMomentum}%` }}
                />
              </div>
              <span className="metric-value">{metrics.growthMomentum}%</span>
            </div>

            <div className="metric-card">
              <span className="metric-name">Self-Awareness</span>
              <div className="metric-bar">
                <div
                  className="metric-fill"
                  style={{ width: `${metrics.selfAwareness}%` }}
                />
              </div>
              <span className="metric-value">{metrics.selfAwareness}%</span>
            </div>

            <div className="metric-card">
              <span className="metric-name">Adaptability</span>
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
          <h2>Evolution Path</h2>
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
                    <h3>{stage.name}</h3>
                    <p>{stage.description}</p>
                    {!isUnlocked && (
                      <p className="evolution-criteria">{stage.nextCriteria}</p>
                    )}
                    {isUnlocked && (
                      <p className="evolution-unlocked">✓ Unlocked</p>
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
            <h2>Next Milestone</h2>
            <div className="next-milestone-card">
              <h3>{nextStage.name}</h3>
              <p>{nextStage.description}</p>
              <p className="milestone-criteria">Get there by: {nextStage.nextCriteria}</p>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
