/**
 * VisualDNAService.ts
 *
 * Phase A: Generate and persist Visual DNA for Twins
 * Visual DNA = the unique visual characteristics that make a Twin recognizable
 *
 * Generated deterministically from:
 * - Birth date (via astrology calculations)
 * - Primary/secondary archetypes
 * - Personal intelligence insights
 *
 * Persisted to twin_visual_dna table so same Twin has consistent visuals across all worlds
 */

import { supabase } from './supabase-service';
import type { Archetype } from '../context/TwinContext';

export interface VisualDNA {
  colorPrimary: string; // Hex color
  colorSecondary: string; // Hex color
  colorAccent: string; // Hex color
  visualStyle: 'ethereal' | 'grounded' | 'vibrant' | 'subtle';
  accessories: Array<{
    name: string;
    color?: string;
    position?: string;
    opacity?: number;
  }>;
  baseExpression: 'serene' | 'curious' | 'contemplative' | 'bright';
  visualMetadata?: {
    animationSpeed?: number;
    particleIntensity?: number;
    glowIntensity?: number;
  };
}

/**
 * Generate Visual DNA deterministically from Twin's birth data and archetypes
 * Uses the same algorithms as visual components so Twin looks consistent
 */
export function generateVisualDNA(params: {
  birthDate: string; // YYYY-MM-DD
  primaryArchetype: Archetype;
  secondaryArchetype?: Archetype;
  maturityScore: number; // 0-100
}): VisualDNA {
  // Parse birth date for deterministic generation
  const [yearStr, monthStr, dayStr] = params.birthDate.split('-');
  const year = Number(yearStr);
  const month = Number(monthStr);
  const day = Number(dayStr);

  // Seed from birth data (deterministic: same date = same seed)
  const seed = (year * 10000 + month * 100 + day) % 360;

  // Map archetype to base color
  const archetypeColors: Record<Archetype, string> = {
    innocent: '#FFE5B4',
    explorer: '#4A90E2',
    sage: '#8E44AD',
    everyman: '#95A5A6',
    lover: '#E91E63',
    jester: '#FF9800',
    hero: '#E74C3C',
    outlaw: '#2C3E50',
    magician: '#9B59B6',
    caregiver: '#3498DB',
    creator: '#E67E22',
    ruler: '#F39C12',
    strategic_warrior: '#D32F2F',
    benevolent_leader: '#F57C00',
    visionary_artist: '#7B1FA2',
    wandering_rebel: '#00695C',
    warm_flirt: '#E91E63',
    relatable_neighbor: '#5C85D6',
  };

  const primaryColor = archetypeColors[params.primaryArchetype] || '#3498DB';
  const secondaryColor = params.secondaryArchetype
    ? archetypeColors[params.secondaryArchetype]
    : lightenColor(primaryColor, 30);

  // Generate accent color from seed
  const accentHue = seed;
  const accentColor = hslToHex(accentHue, 70, 55);

  // Map archetype to visual style
  const archetypeStyles: Record<Archetype, VisualDNA['visualStyle']> = {
    innocent: 'ethereal',
    explorer: 'vibrant',
    sage: 'subtle',
    everyman: 'grounded',
    lover: 'vibrant',
    jester: 'vibrant',
    hero: 'grounded',
    outlaw: 'grounded',
    magician: 'ethereal',
    caregiver: 'ethereal',
    creator: 'vibrant',
    ruler: 'grounded',
    strategic_warrior: 'grounded',
    benevolent_leader: 'ethereal',
    visionary_artist: 'ethereal',
    wandering_rebel: 'vibrant',
    warm_flirt: 'vibrant',
    relatable_neighbor: 'subtle',
  };

  const visualStyle = archetypeStyles[params.primaryArchetype] || 'subtle';

  // Generate accessories based on maturity and archetypes
  const accessories = generateAccessories({
    primaryArchetype: params.primaryArchetype,
    secondaryArchetype: params.secondaryArchetype,
    maturityScore: params.maturityScore,
    seed,
  });

  // Map archetype to expression
  const archetypeExpressions: Record<Archetype, VisualDNA['baseExpression']> = {
    innocent: 'bright',
    explorer: 'curious',
    sage: 'contemplative',
    everyman: 'serene',
    lover: 'bright',
    jester: 'curious',
    hero: 'bright',
    outlaw: 'contemplative',
    magician: 'contemplative',
    caregiver: 'serene',
    creator: 'curious',
    ruler: 'serene',
    strategic_warrior: 'contemplative',
    benevolent_leader: 'serene',
    visionary_artist: 'contemplative',
    wandering_rebel: 'curious',
    warm_flirt: 'bright',
    relatable_neighbor: 'serene',
  };

  const baseExpression = archetypeExpressions[params.primaryArchetype] || 'serene';

  // Visual metadata scales with maturity
  const animationSpeed = 0.8 + (params.maturityScore / 100) * 0.4; // 0.8-1.2x
  const particleIntensity = (params.maturityScore / 100) * 0.8; // 0-0.8
  const glowIntensity = (params.maturityScore / 100) * 1.0; // 0-1.0

  return {
    colorPrimary: primaryColor,
    colorSecondary: secondaryColor,
    colorAccent: accentColor,
    visualStyle,
    accessories,
    baseExpression,
    visualMetadata: {
      animationSpeed,
      particleIntensity,
      glowIntensity,
    },
  };
}

/**
 * Generate accessories array based on archetype and maturity
 */
function generateAccessories(params: {
  primaryArchetype: Archetype;
  secondaryArchetype?: Archetype;
  maturityScore: number;
  seed: number;
}): VisualDNA['accessories'] {
  const accessories: VisualDNA['accessories'] = [];

  // Base accessories by archetype
  const archetypeAccessories: Record<Archetype, string[]> = {
    innocent: ['flower-crown', 'light-aura'],
    explorer: ['compass', 'travel-cloak'],
    sage: ['book-of-wisdom', 'star-crown'],
    everyman: ['comfort-pendant'],
    lover: ['heart-amulet', 'rose-accent'],
    jester: ['bells', 'prism-orb'],
    hero: ['sword-emblem', 'warrior-band'],
    outlaw: ['shadow-cloak'],
    magician: ['staff-orb', 'mystical-aura'],
    caregiver: ['healing-hands-glow', 'nurture-pendant'],
    creator: ['brush-aura', 'creative-spark'],
    ruler: ['crown', 'scepter-aura'],
    strategic_warrior: ['war-sigil', 'wisdom-crown'],
    benevolent_leader: ['blessing-hands', 'ruler-aura'],
    visionary_artist: ['dream-brush', 'creation-spark'],
    wandering_rebel: ['rebel-compass', 'freedom-cloak'],
    warm_flirt: ['heart-bells', 'flirt-aura'],
    relatable_neighbor: ['warmth-pendant', 'simple-light'],
  };

  const primaryAccs = archetypeAccessories[params.primaryArchetype] || [];
  const secondaryAccs = params.secondaryArchetype
    ? archetypeAccessories[params.secondaryArchetype]
    : [];

  // Include primary archetype's main accessory
  if (primaryAccs.length > 0) {
    accessories.push({
      name: primaryAccs[0],
      opacity: 0.9,
    });
  }

  // Include secondary archetype's accessory if maturity high enough
  if (secondaryAccs.length > 0 && params.maturityScore >= 40) {
    accessories.push({
      name: secondaryAccs[0],
      opacity: 0.6,
    });
  }

  // Add maturity-based accessory unlocks
  if (params.maturityScore >= 60 && primaryAccs.length > 1) {
    accessories.push({
      name: primaryAccs[1],
      opacity: 0.5,
    });
  }

  return accessories;
}

/**
 * Save Visual DNA to database at Twin birth
 */
// VISUALDNA-TABLE-001 FIX: 'twin_visual_dna' was never a real table —
// verified against a live pg_tables dump (PostgREST 404, hint "Perhaps you
// meant 'public.twin_state'"). Twin birth now writes visualDNA straight into
// twin_state.data (see CoreAwakeningService.ts Operation 6). These two
// functions are kept for any other caller, but now read/write the same
// twin_state.data.visualDNA path instead of the non-existent table.
export async function saveVisualDNA(
  _userId: string,
  twinId: string,
  visualDNA: VisualDNA
): Promise<{ success: boolean; error?: string }> {
  try {
    const { data: existing } = await supabase
      .from('twin_state')
      .select('data')
      .eq('twin_id', twinId)
      .maybeSingle();

    if (!existing) {
      // No twin_state row yet for this twin — nothing to merge into safely
      // (current_stage/consciousness_level are required, non-nullable
      // columns this function doesn't own). Report clearly instead of
      // guessing values.
      return { success: false, error: 'twin_state row not found for this twin' };
    }

    const { error } = await supabase
      .from('twin_state')
      .update({
        data: { ...(existing.data || {}), visualDNA },
        updated_at: new Date().toISOString(),
      })
      .eq('twin_id', twinId);

    if (error) {
      console.error('Failed to save Visual DNA:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error';
    console.error('Error saving Visual DNA:', errorMsg);
    return { success: false, error: errorMsg };
  }
}

/**
 * Retrieve Visual DNA for a Twin
 */
export async function getVisualDNA(
  twinId: string
): Promise<VisualDNA | null> {
  try {
    const { data, error } = await supabase
      .from('twin_state')
      .select('data')
      .eq('twin_id', twinId)
      .maybeSingle();

    if (error) {
      console.warn('No Visual DNA found for Twin:', error);
      return null;
    }

    const visualDNA = data?.data?.visualDNA;
    return visualDNA ?? null;
  } catch (err) {
    console.error('Error retrieving Visual DNA:', err);
    return null;
  }
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Convert HSL to Hex color
 */
function hslToHex(h: number, s: number, l: number): string {
  const a = (s * Math.min(l, 100 - l)) / 100;
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1));
    return Math.round(255 * color)
      .toString(16)
      .padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

/**
 * Lighten a hex color
 */
function lightenColor(hex: string, percent: number): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;

  const lightened = {
    r: Math.min(255, rgb.r + Math.round((255 - rgb.r) * (percent / 100))),
    g: Math.min(255, rgb.g + Math.round((255 - rgb.g) * (percent / 100))),
    b: Math.min(255, rgb.b + Math.round((255 - rgb.b) * (percent / 100))),
  };

  return rgbToHex(lightened.r, lightened.g, lightened.b);
}

/**
 * Convert hex to RGB
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

/**
 * Convert RGB to hex
 */
function rgbToHex(r: number, g: number, b: number): string {
  return `#${[r, g, b].map((x) => x.toString(16).padStart(2, '0')).join('')}`;
}
