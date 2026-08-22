/**
 * twinVisualDNA.ts
 *
 * UNIFIED ARCHITECTURE DIRECTIVE §6.2 "Visual DNA" — a deterministic,
 * per-archetype visual identity for the Twin, covering the four axes the
 * directive requires at minimum:
 *   Identity            → archetype id (kept, never rendered as an image)
 *   Appearance           → coreColor / auraColor / coreShape
 *   Visual Language       → auraStyle (a short descriptor, also usable in UI)
 *   Motion Characteristics → motionSpeed multiplier
 *
 * §9 "AI Generates Parameters, Not Pictures" — this is a static lookup
 * table, not an AI/image-generation call. Every value is procedural
 * (color + shape + a speed number), consumed by TwinPresence.tsx to render
 * an SVG glow, matching the rest of this codebase's existing
 * procedural-first pattern (see WorldEnvironment.tsx's ArchetypePattern).
 *
 * §34 "World-Aware Twin" — Core Visual DNA (this table) must NOT change
 * when the user switches World; only contextual layers (lighting, mood,
 * aura tint, motion) change per world. TwinPresence.tsx enforces this by
 * only ever reading `worldColor` for a thin aura tint, never for
 * `coreColor`.
 *
 * §48/§49/§50 (Existing Code First / Required Audit / No Duplicate
 * Engines) — audited before writing: no `visualDNA`/`VisualDNA` concept
 * existed anywhere in this codebase prior to this file (confirmed via
 * repo-wide grep). `TwinAvatar.tsx` (components/features) is a related but
 * distinct, unused, mood/stage-driven small orb — left untouched, not
 * extended, since it solves a different problem (a small inline avatar,
 * not a full-screen in-world presence) and touching it risks its existing
 * test (`Avatars.test.tsx`).
 */

import type { Archetype } from '@/context/TwinContext';

export type TwinCoreShape = 'sphere' | 'crystal' | 'ring' | 'diamond' | 'bloom' | 'wave';

export interface TwinVisualDNA {
  archetype: Archetype;
  /** Fixed, per-archetype core color — Identity, never blended with world color. */
  coreColor: string;
  /** Soft outer aura color — Identity's own aura, before any world tint. */
  auraColor: string;
  coreShape: TwinCoreShape;
  /** Short Thai descriptor of this archetype's visual language (for UI/labels). */
  auraStyle: string;
  /** 0.7–1.3 — relative motion/breathing speed multiplier. */
  motionSpeed: number;
}

// 18 archetypes (12 base + 6 hybrid, see TwinContext.ARCHETYPES) — each gets
// a distinct color pair; shape families are intentionally reused across a
// few archetypes (same reuse pattern as WorldEnvironment's spin/pulse/drift
// classes) since color + shape together still identify each archetype
// uniquely.
export const TWIN_VISUAL_DNA: Record<Archetype, TwinVisualDNA> = {
  innocent:   { archetype: 'innocent',   coreColor: '#FDE68A', auraColor: '#FEF3C7', coreShape: 'sphere',  auraStyle: 'นุ่มนวล บริสุทธิ์',   motionSpeed: 0.8  },
  explorer:   { archetype: 'explorer',   coreColor: '#22D3EE', auraColor: '#67E8F9', coreShape: 'ring',    auraStyle: 'เปิดกว้าง เคลื่อนไหว', motionSpeed: 1.1  },
  sage:       { archetype: 'sage',       coreColor: '#6366F1', auraColor: '#A5B4FC', coreShape: 'crystal', auraStyle: 'คมชัด ลึกซึ้ง',       motionSpeed: 0.85 },
  everyman:   { archetype: 'everyman',   coreColor: '#94A3B8', auraColor: '#CBD5E1', coreShape: 'sphere',  auraStyle: 'เรียบง่าย อบอุ่น',    motionSpeed: 0.9  },
  lover:      { archetype: 'lover',      coreColor: '#EC4899', auraColor: '#F9A8D4', coreShape: 'bloom',   auraStyle: 'อบอุ่น อ่อนโยน',     motionSpeed: 0.85 },
  jester:     { archetype: 'jester',     coreColor: '#F59E0B', auraColor: '#FCD34D', coreShape: 'wave',    auraStyle: 'ลื่นไหล เล่นสนุก',    motionSpeed: 1.25 },
  hero:       { archetype: 'hero',       coreColor: '#EF4444', auraColor: '#FCA5A5', coreShape: 'diamond', auraStyle: 'พลัง เด็ดเดี่ยว',     motionSpeed: 1.2  },
  outlaw:     { archetype: 'outlaw',     coreColor: '#7C3AED', auraColor: '#C4B5FD', coreShape: 'diamond', auraStyle: 'คมชัด ท้าทาย',       motionSpeed: 1.15 },
  magician:   { archetype: 'magician',   coreColor: '#A855F7', auraColor: '#D8B4FE', coreShape: 'crystal', auraStyle: 'แปรเปลี่ยน ลึกลับ',   motionSpeed: 1.0  },
  caregiver:  { archetype: 'caregiver',  coreColor: '#10B981', auraColor: '#6EE7B7', coreShape: 'bloom',   auraStyle: 'โอบอุ้ม อบอุ่น',     motionSpeed: 0.8  },
  creator:    { archetype: 'creator',    coreColor: '#F97316', auraColor: '#FDBA74', coreShape: 'wave',    auraStyle: 'ลื่นไหล สร้างสรรค์',  motionSpeed: 1.1  },
  ruler:      { archetype: 'ruler',      coreColor: '#EAB308', auraColor: '#FDE047', coreShape: 'ring',    auraStyle: 'สมดุล ทรงพลัง',      motionSpeed: 0.9  },
  alchemist:  { archetype: 'alchemist',  coreColor: '#8B5CF6', auraColor: '#C4B5FD', coreShape: 'crystal', auraStyle: 'แปรเปลี่ยน คมชัด',   motionSpeed: 1.0  },
  dreamer:    { archetype: 'dreamer',    coreColor: '#C084FC', auraColor: '#E9D5FF', coreShape: 'bloom',   auraStyle: 'ฝัน อ่อนโยน',       motionSpeed: 0.75 },
  maverick:   { archetype: 'maverick',   coreColor: '#FB7185', auraColor: '#FDA4AF', coreShape: 'diamond', auraStyle: 'อิสระ คมชัด',        motionSpeed: 1.3  },
  strategist: { archetype: 'strategist', coreColor: '#3B82F6', auraColor: '#93C5FD', coreShape: 'crystal', auraStyle: 'เป็นระบบ มั่นคง',    motionSpeed: 0.85 },
  diplomat:   { archetype: 'diplomat',   coreColor: '#2DD4BF', auraColor: '#99F6E4', coreShape: 'ring',    auraStyle: 'สมดุล ประสาน',       motionSpeed: 0.9  },
  artisan:    { archetype: 'artisan',    coreColor: '#D97706', auraColor: '#FBBF24', coreShape: 'wave',    auraStyle: 'ลื่นไหล ประณีต',     motionSpeed: 0.95 },
};

/** Universal fallback — used when a Twin has no primaryArchetype yet
 *  (shouldn't happen post-birth, but keeps TwinPresence null-safe). */
export const DEFAULT_TWIN_VISUAL_DNA: TwinVisualDNA = {
  archetype: 'everyman',
  coreColor: '#38BDF8',
  auraColor: '#7DD3FC',
  coreShape: 'sphere',
  auraStyle: 'เป็นกลาง',
  motionSpeed: 1.0,
};

/**
 * Resolve a Twin's Visual DNA from its primary (and optionally secondary)
 * archetype. Secondary archetype only lightly informs the aura color blend
 * — primary archetype's coreColor/coreShape always defines core Identity,
 * per §34 ("Core Visual DNA" must stay constant).
 */
export function getTwinVisualDNA(
  primaryArchetype?: Archetype,
  secondaryArchetype?: Archetype
): TwinVisualDNA & { blendAuraColor?: string } {
  const base = primaryArchetype ? TWIN_VISUAL_DNA[primaryArchetype] : DEFAULT_TWIN_VISUAL_DNA;
  const secondary = secondaryArchetype ? TWIN_VISUAL_DNA[secondaryArchetype] : undefined;
  return {
    ...base,
    blendAuraColor: secondary?.auraColor,
  };
}
