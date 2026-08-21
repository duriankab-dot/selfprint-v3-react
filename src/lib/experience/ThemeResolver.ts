/**
 * ThemeResolver.ts
 *
 * Master Direction §17 — Theme System (66–72 Themes)
 *
 * Resolves Emotion × Hub → ThemeResolution.
 *
 * The 72 base CSS themes already exist in:
 *   src/styles/hub-themes.css   (12 hub × --color-accent-primary, --hub-bg-gradient)
 *   src/styles/mood-themes.css  (6 moods × --saturation, --brightness, --duration-mood)
 *
 * This engine does NOT generate new themes. It:
 *   1. Selects which hub + mood data-attributes to activate.
 *   2. Adds supplementary --exp-* CSS custom properties that overlay the theme:
 *      --exp-motion-multiplier   (float: speed modifier on animation durations)
 *      --exp-particle-density    (1-5: number of particles visible in Twin)
 *      --exp-twin-glow           (CSS color: glow ring color for Living Twin orb)
 *      --exp-atmosphere          (string label — used for audio / debug)
 *
 * Rule from §17: "AI ไม่ควร generate theme ใหม่เอง แต่เลือก Theme จาก library ที่มีอยู่"
 * Rule from §19: User Preference > AI Personalization (never override explicit user choice)
 */

import type { Hub } from '../../context/HubContext';
import type { Mood } from '../../context/EmotionContext';
import type { Atmosphere } from './EmotionSignalEngine';

// ============================================================================
// Types
// ============================================================================

export interface ThemeResolution {
  hub: Hub;
  mood: Mood;
  motionMultiplier: number;   // multiplies --duration-hub animation speeds
  particleDensity: 1 | 2 | 3 | 4 | 5;
  twinGlowColor: string;      // CSS color for Living Twin glow ring
  atmosphereLabel: Atmosphere;
  cssVars: Record<string, string>; // additional --exp-* vars to set
}

// ============================================================================
// Hub → primary glow color
// Must match hub-themes.css --color-accent-primary values
// ============================================================================

const HUB_GLOW_COLOR: Record<Hub, string> = {
  identity:     'rgba(91, 92, 235, 0.65)',
  decision:     'rgba(37, 99, 235, 0.65)',
  relationship: 'rgba(225, 29, 72, 0.65)',
  career:       'rgba(5, 150, 105, 0.65)',
  health:       'rgba(6, 182, 212, 0.65)',
  money:        'rgba(217, 119, 6, 0.65)',
  'ai-twin':    'rgba(29, 78, 216, 0.70)',
  learning:     'rgba(79, 70, 229, 0.65)',
  creativity:   'rgba(234, 88, 12, 0.65)',
  spirituality: 'rgba(167, 139, 250, 0.65)',
  impact:       'rgba(20, 184, 166, 0.65)',
  activities:   'rgba(245, 158, 11, 0.65)',
  finance:      'rgba(34, 197, 94, 0.65)',
  adventure:    'rgba(168, 85, 247, 0.65)',
  community:    'rgba(59, 130, 246, 0.65)',
};

// ============================================================================
// Mood → motion + particle characteristics
// ============================================================================

interface MoodCharacteristics {
  motionMultiplier: number;
  particleDensity: 1 | 2 | 3 | 4 | 5;
  atmosphereLabel: Atmosphere;
}

const MOOD_CHARACTERISTICS: Record<Mood, MoodCharacteristics> = {
  stressed:   { motionMultiplier: 1.5,  particleDensity: 2, atmosphereLabel: 'minimal' },
  confused:   { motionMultiplier: 1.2,  particleDensity: 2, atmosphereLabel: 'ambient' },
  confident:  { motionMultiplier: 0.7,  particleDensity: 4, atmosphereLabel: 'energetic' },
  drained:    { motionMultiplier: 1.8,  particleDensity: 1, atmosphereLabel: 'minimal' },
  ready:      { motionMultiplier: 0.8,  particleDensity: 4, atmosphereLabel: 'energetic' },
  reflective: { motionMultiplier: 1.3,  particleDensity: 3, atmosphereLabel: 'ambient' },
};

// ============================================================================
// Resolver
// ============================================================================

export class ThemeResolver {
  /**
   * Given a hub and mood, return a ThemeResolution that:
   * - Activates the existing CSS theme via data-hub + data-mood
   * - Adds supplementary --exp-* CSS vars
   */
  resolve(hub: Hub, mood: Mood): ThemeResolution {
    const moodChar = MOOD_CHARACTERISTICS[mood];
    const glowColor = HUB_GLOW_COLOR[hub];

    const cssVars: Record<string, string> = {
      '--exp-motion-multiplier': String(moodChar.motionMultiplier),
      '--exp-particle-density':  String(moodChar.particleDensity),
      '--exp-twin-glow':          glowColor,
      '--exp-atmosphere':         moodChar.atmosphereLabel,
    };

    return {
      hub,
      mood,
      motionMultiplier: moodChar.motionMultiplier,
      particleDensity: moodChar.particleDensity,
      twinGlowColor: glowColor,
      atmosphereLabel: moodChar.atmosphereLabel,
      cssVars,
    };
  }

  /**
   * Get all 72 possible resolutions — useful for debug / admin view.
   */
  getAllResolutions(hubs: Hub[], moods: Mood[]): ThemeResolution[] {
    const results: ThemeResolution[] = [];
    for (const hub of hubs) {
      for (const mood of moods) {
        results.push(this.resolve(hub, mood));
      }
    }
    return results;
  }
}

export default ThemeResolver;
