/**
 * useWorldRecommendation.ts — Intelligent Contextual Environment
 *
 * Master Concept:
 *   User interaction / conversation
 *       ↓
 *   SICE / Context signals
 *       ↓
 *   Semantic understanding
 *       ↓
 *   World recommendation
 *       ↓
 *   WorldVisualState
 *       ↓
 *   Narrative World Transition
 *       ↓
 *   Twin enters World
 *
 * Instead of manual selection only, this hook analyzes conversation context
 * and recommends the most appropriate world based on:
 *   - Conversation sentiment/topic patterns
 *   - Twin's current evolution stage
 *   - World expertise alignment
 *   - Recent decision patterns
 *
 * The 144 transition rules in WorldTransitionEngine are preserved — they're
 * the transition grammar. What was missing was the intelligence to decide
 * which world to enter and when.
 */

import { useMemo } from 'react';
import type { FullAnalysisOutput } from '@/lib/intelligence/InsightEngine';

// ─── Topic/Sentiment Detection ──────────────────────────────────────────────

interface WorldSignal {
  /** Semantic topic detected in conversation */
  topic: 'reflection' | 'planning' | 'growth' | 'healing' | 'creativity' | 'social' | 'spiritual' | 'analytical';
  /** Confidence 0–1 */
  confidence: number;
  /** Source of this signal */
  source: 'conversation' | 'analysis' | 'evolution' | 'decision';
}

function detectTopicsFromMessages(messages: Array<{ role: string; content: string }>): WorldSignal[] {
  const signals: WorldSignal[] = [];
  const recent = messages.slice(-10); // Last 10 messages
  const text = recent.map(m => m.content.toLowerCase()).join(' ');

  // Reflection patterns
  const reflectionKeywords = ['reflect', 'self', 'pattern', 'behavior', 'habit', 'trigger', 'emotion', ' feeling', 'think about myself'];
  const reflectionScore = reflectionKeywords.filter(k => text.includes(k)).length;
  if (reflectionScore >= 2) {
    signals.push({ topic: 'reflection', confidence: Math.min(0.95, reflectionScore / 5), source: 'conversation' });
  }

  // Planning patterns
  const planningKeywords = ['plan', 'goal', 'future', 'target', 'objective', 'roadmap', 'milestone', 'strategy'];
  const planningScore = planningKeywords.filter(k => text.includes(k)).length;
  if (planningScore >= 2) {
    signals.push({ topic: 'planning', confidence: Math.min(0.95, planningScore / 4), source: 'conversation' });
  }

  // Growth patterns
  const growthKeywords = ['grow', 'improve', 'develop', 'learn', 'become', 'transform', 'evolve', 'better version'];
  const growthScore = growthKeywords.filter(k => text.includes(k)).length;
  if (growthScore >= 2) {
    signals.push({ topic: 'growth', confidence: Math.min(0.95, growthScore / 4), source: 'conversation' });
  }

  // Healing patterns
  const healingKeywords = ['heal', 'pain', 'trauma', 'recover', 'comfort', 'peace', 'calm', 'anxious', 'stressed', 'overwhelm'];
  const healingScore = healingKeywords.filter(k => text.includes(k)).length;
  if (healingScore >= 2) {
    signals.push({ topic: 'healing', confidence: Math.min(0.95, healingScore / 4), source: 'conversation' });
  }

  // Creativity patterns
  const creativityKeywords = ['create', 'art', 'music', 'write', 'design', 'imagine', 'inspire', 'visionary'];
  const creativityScore = creativityKeywords.filter(k => text.includes(k)).length;
  if (creativityScore >= 2) {
    signals.push({ topic: 'creativity', confidence: Math.min(0.95, creativityScore / 4), source: 'conversation' });
  }

  return signals;
}

function detectTopicsFromAnalysis(analysis?: FullAnalysisOutput | null): WorldSignal[] {
  const signals: WorldSignal[] = [];

  if (!analysis) return signals;

  // FutureSelf focus → planning/spiritual
  if (analysis.journey?.growing?.some((g: string) => g.toLowerCase().includes('future') || g.toLowerCase().includes('vision'))) {
    signals.push({ topic: 'planning', confidence: 0.7, source: 'analysis' });
    signals.push({ topic: 'spiritual', confidence: 0.5, source: 'analysis' });
  }

  // Behavioral patterns focus → reflection
  if (analysis.behavioralPatterns?.length && analysis.behavioralPatterns.length > 3) {
    signals.push({ topic: 'reflection', confidence: 0.6, source: 'analysis' });
  }

  // Focus areas → match to world themes
  const focusText = (analysis.focusAreas ?? []).join(' ').toLowerCase();
  if (focusText.includes('creative') || focusText.includes('art') || focusText.includes('express')) {
    signals.push({ topic: 'creativity', confidence: 0.65, source: 'analysis' });
  }
  if (focusText.includes('relat') || focusText.includes('social') || focusText.includes('connect')) {
    signals.push({ topic: 'social', confidence: 0.6, source: 'analysis' });
  }

  return signals;
}

// ─── World Expertise Scoring ────────────────────────────────────────────────

interface WorldScore {
  worldId: string;
  score: number;
  reason: string;
}

const WORLD_TOPIC_ALIGNMENT: Record<string, Record<string, number>> = {
  self: { reflection: 1.0, healing: 0.8, analytical: 0.7 },
  future: { planning: 1.0, spiritual: 0.9, growth: 0.7 },
  inner: { reflection: 0.9, healing: 1.0, creative: 0.6 },
  outer: { social: 0.9, planning: 0.6, analytical: 0.7 },
  shadow: { reflection: 1.0, healing: 0.8, analytical: 0.9 },
  celestial: { spiritual: 1.0, reflection: 0.7, creative: 0.8 },
  elemental: { creative: 0.9, healing: 0.7, growth: 0.6 },
  archetypal: { reflection: 0.8, analytical: 0.9, growth: 0.7 },
  liminal: { healing: 0.9, spiritual: 0.8, creative: 0.7 },
  mirror: { reflection: 1.0, analytical: 0.8, social: 0.6 },
  void: { spiritual: 0.9, creative: 0.8, reflection: 0.6 },
  genesis: { growth: 1.0, planning: 0.8, creative: 0.7 },
};

function scoreWorlds(signals: WorldSignal[], currentWorld: string | null, evolutionStage?: number): WorldScore[] {
  const scored: WorldScore[] = [];

  for (const [worldId, alignment] of Object.entries(WORLD_TOPIC_ALIGNMENT)) {
    let totalScore = 0;
    let bestTopic = '';
    let bestWeight = 0;

    for (const signal of signals) {
      const weight = alignment[signal.topic] ?? 0;
      if (weight > 0 && weight * signal.confidence > bestWeight) {
        bestWeight = weight * signal.confidence;
        bestTopic = signal.topic;
      }
      totalScore += weight * signal.confidence;
    }

    // Boost current world for continuity (unless score is very low)
    const isCurrent = worldId === currentWorld;
    const continuityBonus = isCurrent && totalScore > 0.3 ? 0.15 : 0;

    // Evolution stage bonus — higher stages unlock more worlds
    const stageBonus = evolutionStage && evolutionStage >= 3 && (worldId === 'celestial' || worldId === 'void') ? 0.1 : 0;

    const finalScore = totalScore + continuityBonus + stageBonus;

    if (finalScore > 0.2) {
      scored.push({
        worldId,
        score: Math.round(finalScore * 100) / 100,
        reason: `${bestTopic || 'neutral'} alignment`,
      });
    }
  }

  return scored.sort((a, b) => b.score - a.score);
}

// ─── Hook ───────────────────────────────────────────────────────────────────

export function useWorldRecommendation({
  messages,
  analysis,
  currentWorld,
  evolutionStage,
}: {
  messages: Array<{ role: string; content: string }>;
  analysis?: FullAnalysisOutput | null;
  currentWorld: string | null;
  evolutionStage?: number;
}) {
  return useMemo(() => {
    // Gather all signals
    const conversationSignals = detectTopicsFromMessages(messages);
    const analysisSignals = detectTopicsFromAnalysis(analysis);
    const allSignals = [...conversationSignals, ...analysisSignals];

    // If no signals, don't recommend (let user choose manually)
    if (allSignals.length === 0) {
      return { recommendedWorld: null, signals: [], shouldAutoSwitch: false };
    }

    // Score all worlds
    const scores = scoreWorlds(allSignals, currentWorld, evolutionStage);
    const best = scores[0];

    if (!best) {
      return { recommendedWorld: null, signals: allSignals, shouldAutoSwitch: false };
    }

    // Auto-switch if confidence is high enough AND it's not the current world
    // Threshold: score > 0.6 and different from current
    const shouldAutoSwitch = best.score > 0.65 && best.worldId !== currentWorld;

    return {
      recommendedWorld: shouldAutoSwitch ? best.worldId : null,
      suggestedWorld: best.worldId, // Always show suggestion even if not auto-switching
      signals: allSignals,
      scores: scores.slice(0, 3), // Top 3
      shouldAutoSwitch,
      reason: best.reason,
    };
  }, [messages, analysis, currentWorld, evolutionStage]);
}

export type WorldRecommendation = ReturnType<typeof useWorldRecommendation>;
