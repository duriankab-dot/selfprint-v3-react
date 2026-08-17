/**
 * EmotionSignalEngine.ts
 *
 * Master Direction §18 — Emotion Engine
 *
 * Maps PersonalContext.emotionalRange (free-form strings from AI analysis)
 * to the app's 6 discrete Mood types used by EmotionContext + CSS themes.
 *
 * These are SOFT SIGNALS — used only for Experience Personalization.
 * Never used to diagnose emotions or health. (§18 rule)
 *
 * Pipeline:
 *   PersonalContext.emotionalRange.primaryMoods
 *     ↓
 *   EmotionSignalEngine.resolve()
 *     ↓
 *   EmotionSignal { dominantMood, confidence, intensity, motionSpeed, atmosphere }
 */

import type { Mood } from '../../context/EmotionContext';
import type { EmotionalRange } from '../intelligence/types';

// ============================================================================
// Types
// ============================================================================

export type MotionSpeed = 'slow' | 'normal' | 'fast';
export type Atmosphere = 'cosmic' | 'ambient' | 'energetic' | 'minimal';

export interface EmotionSignal {
  dominantMood: Mood;
  confidence: number;     // 0–1: how confident we are in this mapping
  intensity: number;      // 0–1: how dramatic the experience should be
  motionSpeed: MotionSpeed;
  atmosphere: Atmosphere;
}

// ============================================================================
// Free-form word → Mood mapping
// PersonalContext uses open-ended mood strings from AI analysis.
// We normalise them into our 6 CSS-backed Mood types.
// ============================================================================

const MOOD_KEYWORDS: Record<string, Mood> = {
  // reflective (default / introspective)
  calm: 'reflective',
  peaceful: 'reflective',
  thoughtful: 'reflective',
  meditative: 'reflective',
  introspective: 'reflective',
  serene: 'reflective',
  quiet: 'reflective',
  contemplative: 'reflective',
  pensive: 'reflective',

  // ready (action-oriented, energised)
  ambitious: 'ready',
  energetic: 'ready',
  motivated: 'ready',
  focused: 'ready',
  determined: 'ready',
  excited: 'ready',
  enthusiastic: 'ready',
  driven: 'ready',
  purposeful: 'ready',

  // confident (self-assured, empowered)
  happy: 'confident',
  confident: 'confident',
  empowered: 'confident',
  proud: 'confident',
  strong: 'confident',
  optimistic: 'confident',
  positive: 'confident',
  grateful: 'confident',
  fulfilled: 'confident',

  // stressed (pressure, urgency)
  anxious: 'stressed',
  stressed: 'stressed',
  overwhelmed: 'stressed',
  worried: 'stressed',
  nervous: 'stressed',
  tense: 'stressed',
  restless: 'stressed',
  pressured: 'stressed',

  // confused (uncertain, searching)
  uncertain: 'confused',
  confused: 'confused',
  lost: 'confused',
  unsure: 'confused',
  unclear: 'confused',
  questioning: 'confused',
  hesitant: 'confused',
  doubting: 'confused',

  // drained (low energy, depleted)
  tired: 'drained',
  drained: 'drained',
  exhausted: 'drained',
  burnout: 'drained',
  depleted: 'drained',
  fatigued: 'drained',
  low: 'drained',
  unmotivated: 'drained',
};

// Mood → experience characteristics
const MOOD_EXPERIENCE: Record<Mood, Pick<EmotionSignal, 'intensity' | 'motionSpeed' | 'atmosphere'>> = {
  reflective: { intensity: 0.6, motionSpeed: 'slow',   atmosphere: 'ambient' },
  ready:      { intensity: 0.8, motionSpeed: 'fast',   atmosphere: 'energetic' },
  confident:  { intensity: 0.9, motionSpeed: 'fast',   atmosphere: 'energetic' },
  stressed:   { intensity: 0.7, motionSpeed: 'slow',   atmosphere: 'minimal' },
  confused:   { intensity: 0.4, motionSpeed: 'normal', atmosphere: 'ambient' },
  drained:    { intensity: 0.3, motionSpeed: 'slow',   atmosphere: 'minimal' },
};

// ============================================================================
// Engine
// ============================================================================

export class EmotionSignalEngine {
  /**
   * Resolve EmotionSignal from PersonalContext's emotionalRange.
   * Falls back to the user's currently active Mood if no match found.
   */
  resolve(
    emotionalRange: EmotionalRange | undefined | null,
    fallbackMood: Mood
  ): EmotionSignal {
    if (!emotionalRange?.primaryMoods?.length) {
      return this.buildSignal(fallbackMood, 0.3);
    }

    // Count votes from each primary mood keyword
    const votes: Partial<Record<Mood, number>> = {};
    for (const rawMood of emotionalRange.primaryMoods) {
      const normalized = rawMood.toLowerCase().trim();
      const mapped = MOOD_KEYWORDS[normalized];
      if (mapped) {
        votes[mapped] = (votes[mapped] ?? 0) + 1;
      }
    }

    const entries = Object.entries(votes) as [Mood, number][];
    if (entries.length === 0) {
      // No keywords matched — use fallback with low confidence
      return this.buildSignal(fallbackMood, 0.2);
    }

    // Pick the mood with the most votes
    entries.sort((a, b) => b[1] - a[1]);
    const [winnerMood, winnerCount] = entries[0];
    const confidence = Math.min(0.9, winnerCount / emotionalRange.primaryMoods.length);

    // Blend confidence with emotionalRange.confidence
    const blendedConfidence = (confidence + (emotionalRange.confidence ?? 0.5)) / 2;

    return this.buildSignal(winnerMood, blendedConfidence);
  }

  /**
   * Apply time-of-day modulation to an existing signal.
   * Morning → energise (ready), night → calm down (reflective/drained)
   */
  applyTimeModulation(signal: EmotionSignal): EmotionSignal {
    const hour = new Date().getHours();

    // Morning (6-10): nudge toward ready
    if (hour >= 6 && hour < 10 && signal.dominantMood === 'reflective') {
      return { ...signal, dominantMood: 'ready', confidence: signal.confidence * 0.7 };
    }

    // Late night (22-5): nudge toward reflective/drained
    if ((hour >= 22 || hour < 5) && signal.dominantMood === 'ready') {
      return { ...signal, dominantMood: 'reflective', confidence: signal.confidence * 0.8 };
    }

    return signal;
  }

  private buildSignal(mood: Mood, confidence: number): EmotionSignal {
    const exp = MOOD_EXPERIENCE[mood];
    return {
      dominantMood: mood,
      confidence,
      ...exp,
    };
  }
}

export default EmotionSignalEngine;
