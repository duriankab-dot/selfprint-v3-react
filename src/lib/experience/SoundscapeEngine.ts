/**
 * SoundscapeEngine.ts
 *
 * Master Direction §46 — Advanced Adaptive Environments
 * Sub-feature: Personalized Soundscapes
 *
 * Recommends a named soundscape based on:
 *   - World (user's current world — WorldId, see src/constants/worlds.ts)
 *   - Mood (user's emotional state)
 *   - TimePeriod (morning / afternoon / evening / night)
 *
 * ไม่ได้เล่น audio จริง — แค่ recommend SoundscapeConfig ที่ส่งต่อให้
 * AudioContext.setExperience() และ UI แสดงชื่อ soundscape
 *
 * Mapping logic:
 *   Priority 1: exact (world × mood × period) match
 *   Priority 2: (world × mood) match — ignore period
 *   Priority 3: (mood × period) match — ignore world
 *   Priority 4: fallback to 'ambient-minimal'
 *
 * P0-H: previously keyed to `Hub` (src/context/HubContext.tsx) — a 15-id
 * taxonomy ('identity', 'money', 'ai-twin', …) completely separate from the
 * 12-id `WorldId` actually used by live routing/AI (/worlds/:worldId,
 * TwinChat.tsx's ?world= param, WorldContext.currentWorld). HubContext was
 * traced end to end and found unreachable from any live route — this engine
 * was correct in design but silently disconnected from the real app.
 * Rekeyed to WorldId so it can actually be driven by the real world state.
 * `matchHubs` entries below were remapped by closest concept (e.g.
 * 'money'→'wealth', 'identity'→'self', 'health'→'wellbeing'); ids with no
 * real-world equivalent ('ai-twin', 'activities') were dropped rather than
 * force-mapped.
 */

import type { WorldId } from '@/constants/worlds';
import type { Mood } from '@/context/EmotionContext';
import type { MusicExperience } from '@/context/AudioContext';
import type { TimePeriod, AudioCharacter } from './TimeOfDayEngine';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface SoundscapeConfig {
  /** ชื่อ unique ID */
  id: string;
  /** ชื่อภาษาไทยสำหรับ UI */
  labelThai: string;
  /** คำอธิบายบรรยากาศ */
  descriptionThai: string;
  /** Emoji สำหรับ UI */
  emoji: string;
  /** Maps to AudioContext MusicExperience (เดิมที่มีอยู่แล้ว) */
  musicExperience: MusicExperience;
  /** AudioCharacter จาก TimeOfDayEngine */
  audioCharacter: AudioCharacter;
  /** ชื่อประเภทเสียงในเชิง audio design */
  audioStyle: string;
  /** Mood ที่เหมาะสม */
  matchMoods: Mood[];
  /** World ที่เหมาะสม (undefined = match any world) */
  matchHubs?: WorldId[];
  /** TimePeriod ที่เหมาะสม (undefined = match any period) */
  matchPeriods?: TimePeriod[];
}

// ─── Soundscape Library ───────────────────────────────────────────────────────
// 24 curated soundscapes ครอบคลุม mood × hub × period combinations หลักๆ

const SOUNDSCAPE_LIBRARY: SoundscapeConfig[] = [
  // ── Morning Awakening ──────────────────────────────────────────────────────
  {
    id: 'morning-forest',
    labelThai: 'ป่ายามเช้า',
    descriptionThai: 'เสียงนกร้อง ลมเบา เหมาะกับการเริ่มต้นวันอย่างสงบ',
    emoji: '🌿',
    musicExperience: 'reflection',
    audioCharacter: 'ambient-warm',
    audioStyle: 'nature-ambient',
    matchMoods: ['reflective', 'ready', 'confident'],
    matchPeriods: ['morning'],
  },
  {
    id: 'morning-focus',
    labelThai: 'โฟกัสยามเช้า',
    descriptionThai: 'เสียง lo-fi ผสม acoustic เบาๆ เตรียมพร้อมทำงาน',
    emoji: '☕',
    musicExperience: 'focus',
    audioCharacter: 'ambient-warm',
    audioStyle: 'lofi-acoustic',
    matchMoods: ['confident', 'ready'],
    matchPeriods: ['morning'],
    matchHubs: ['career', 'decision', 'growth', 'wealth'],
  },
  {
    id: 'morning-gentle',
    labelThai: 'ตื่นนอนเบาๆ',
    descriptionThai: 'เสียงเบา warm pad สำหรับวันที่เริ่มช้าๆ',
    emoji: '🌤️',
    musicExperience: 'reflection',
    audioCharacter: 'ambient-warm',
    audioStyle: 'soft-pads',
    matchMoods: ['stressed', 'drained', 'confused'],
    matchPeriods: ['morning'],
  },

  // ── Afternoon Focus ────────────────────────────────────────────────────────
  {
    id: 'deep-work',
    labelThai: 'Deep Work',
    descriptionThai: 'เสียง minimal pulse ไม่มีคำร้อง เพิ่มสมาธิสูงสุด',
    emoji: '🎯',
    musicExperience: 'focus',
    audioCharacter: 'energetic',
    audioStyle: 'minimal-pulse',
    matchMoods: ['confident', 'ready'],
    matchPeriods: ['afternoon'],
    matchHubs: ['career', 'decision', 'growth', 'wealth'],
  },
  {
    id: 'afternoon-creative',
    labelThai: 'ความคิดสร้างสรรค์',
    descriptionThai: 'เสียง upbeat ผสม synth ส่งเสริมความคิดสร้างสรรค์',
    emoji: '✨',
    musicExperience: 'discovery',
    audioCharacter: 'energetic',
    audioStyle: 'indie-synth',
    matchMoods: ['confident', 'ready'],
    matchPeriods: ['afternoon'],
    matchHubs: ['growth', 'purpose'],
  },
  {
    id: 'afternoon-calm',
    labelThai: 'สงบกลางวัน',
    descriptionThai: 'เสียง ambient เบาสำหรับวันที่รู้สึกหนัก',
    emoji: '🌊',
    musicExperience: 'reflection',
    audioCharacter: 'energetic',
    audioStyle: 'ambient-steady',
    matchMoods: ['stressed', 'drained', 'confused'],
    matchPeriods: ['afternoon'],
  },
  {
    id: 'discovery-mode',
    labelThai: 'สำรวจ & ค้นพบ',
    descriptionThai: 'เสียง cosmic ambient กว้างขวาง เหมาะกับการเรียนรู้',
    emoji: '🔭',
    musicExperience: 'discovery',
    audioCharacter: 'energetic',
    audioStyle: 'cosmic-ambient',
    matchMoods: ['confident', 'ready', 'reflective'],
    matchPeriods: ['afternoon'],
    matchHubs: ['growth', 'purpose', 'self'],
  },

  // ── Evening Wind-Down ──────────────────────────────────────────────────────
  {
    id: 'evening-reflection',
    labelThai: 'สะท้อนยามเย็น',
    descriptionThai: 'เสียง piano เบาๆ เหมาะกับการทบทวนวัน',
    emoji: '🌇',
    musicExperience: 'deep_reflection',
    audioCharacter: 'calm',
    audioStyle: 'solo-piano',
    matchMoods: ['reflective', 'confident', 'ready'],
    matchPeriods: ['evening'],
  },
  {
    id: 'relationship-evening',
    labelThai: 'ช่วงเวลาพิเศษ',
    descriptionThai: 'เสียง warm acoustic เหมาะกับช่วงเวลากับคนที่รัก',
    emoji: '❤️',
    musicExperience: 'reflection',
    audioCharacter: 'calm',
    audioStyle: 'warm-acoustic',
    matchMoods: ['reflective', 'ready', 'confident'],
    matchPeriods: ['evening'],
    matchHubs: ['relationship', 'wellbeing', 'life'],
  },
  {
    id: 'evening-release',
    labelThai: 'ปล่อยวาง',
    descriptionThai: 'เสียง ambient อ่อนโยน สำหรับคลายความเครียดหลังงาน',
    emoji: '🍃',
    musicExperience: 'deep_reflection',
    audioCharacter: 'calm',
    audioStyle: 'sparse-ambient',
    matchMoods: ['stressed', 'drained'],
    matchPeriods: ['evening'],
  },
  {
    id: 'spiritual-evening',
    labelThai: 'ใคร่ครวญจิตใจ',
    descriptionThai: 'เสียงสงบ ลึก เหมาะกับการทำสมาธิและครุ่นคิด',
    emoji: '🕯️',
    musicExperience: 'deep_reflection',
    audioCharacter: 'calm',
    audioStyle: 'meditative',
    matchMoods: ['reflective', 'confused'],
    matchPeriods: ['evening'],
    matchHubs: ['purpose', 'self'],
  },

  // ── Night Deep ─────────────────────────────────────────────────────────────
  {
    id: 'night-ambient',
    labelThai: 'ยามค่ำคืน',
    descriptionThai: 'เสียง dark ambient สงบ เหมาะกับการใคร่ครวญลึกๆ',
    emoji: '🌙',
    musicExperience: 'deep_reflection',
    audioCharacter: 'deep',
    audioStyle: 'dark-ambient',
    matchMoods: ['reflective', 'drained', 'confused'],
    matchPeriods: ['night'],
  },
  {
    id: 'night-focus',
    labelThai: 'โฟกัสยามดึก',
    descriptionThai: 'เสียง minimal electronic สำหรับ night owl ที่ทำงานดึก',
    emoji: '🦉',
    musicExperience: 'focus',
    audioCharacter: 'deep',
    audioStyle: 'minimal-electronic',
    matchMoods: ['confident', 'ready'],
    matchPeriods: ['night'],
    matchHubs: ['career', 'growth', 'decision'],
  },
  {
    id: 'night-identity',
    labelThai: 'ค้นหาตัวเอง',
    descriptionThai: 'เสียง sparse ambient กว้างๆ เหมาะกับการถามตัวเองลึกๆ',
    emoji: '🌌',
    musicExperience: 'deep_reflection',
    audioCharacter: 'deep',
    audioStyle: 'sparse-cosmic',
    matchMoods: ['reflective', 'confused'],
    matchPeriods: ['night'],
    matchHubs: ['self', 'purpose'],
  },
  {
    id: 'night-wind-down',
    labelThai: 'ผ่อนคลายก่อนนอน',
    descriptionThai: 'เสียง drone เบา ช้า เหมาะกับเตรียมตัวนอนหลับ',
    emoji: '😴',
    musicExperience: 'deep_reflection',
    audioCharacter: 'deep',
    audioStyle: 'sleep-drone',
    matchMoods: ['drained', 'stressed'],
    matchPeriods: ['night'],
  },

  // ── Celebration (any time) ─────────────────────────────────────────────────
  {
    id: 'celebration',
    labelThai: 'ฉลองความสำเร็จ',
    descriptionThai: 'เสียง cinematic uplift เฉลิมฉลองทุกความสำเร็จ',
    emoji: '🎉',
    musicExperience: 'celebration',
    audioCharacter: 'energetic',
    audioStyle: 'cinematic-uplift',
    matchMoods: ['confident', 'ready'],
  },

  // ── Hub-Specific Fallbacks ─────────────────────────────────────────────────
  {
    id: 'health-nature',
    labelThai: 'ธรรมชาติบำบัด',
    descriptionThai: 'เสียงธรรมชาติ น้ำไหล ลม เหมาะกับ hub สุขภาพ',
    emoji: '🌿',
    musicExperience: 'reflection',
    audioCharacter: 'ambient-warm',
    audioStyle: 'nature-healing',
    matchMoods: ['stressed', 'drained', 'reflective', 'confident', 'ready', 'confused'],
    matchHubs: ['wellbeing'],
  },
  {
    id: 'money-clarity',
    labelThai: 'ความชัดเจนทางการเงิน',
    descriptionThai: 'เสียง clean minimal เหมาะกับการวางแผนการเงิน',
    emoji: '💰',
    musicExperience: 'focus',
    audioCharacter: 'energetic',
    audioStyle: 'minimal-clean',
    matchMoods: ['confident', 'ready', 'stressed'],
    matchHubs: ['wealth'],
  },
  {
    id: 'creativity-flow',
    labelThai: 'Flow State',
    descriptionThai: 'เสียง ambient ผสม melody เบาๆ เข้าสู่ flow state',
    emoji: '🎨',
    musicExperience: 'discovery',
    audioCharacter: 'energetic',
    audioStyle: 'creative-ambient',
    matchMoods: ['confident', 'ready', 'reflective'],
    matchHubs: ['growth', 'purpose'],
  },

  // ── Universal Fallbacks ────────────────────────────────────────────────────
  {
    id: 'ambient-minimal',
    labelThai: 'Ambient เบาๆ',
    descriptionThai: 'เสียง ambient สากลเหมาะกับทุกช่วงเวลา',
    emoji: '〰️',
    musicExperience: 'idle',
    audioCharacter: 'ambient-warm',
    audioStyle: 'neutral-ambient',
    matchMoods: ['stressed', 'confused', 'confident', 'drained', 'ready', 'reflective'],
  },
  {
    id: 'deep-reflection-universal',
    labelThai: 'ไตร่ตรองลึก',
    descriptionThai: 'เสียง deep reflection สำหรับการสำรวจตัวเองอย่างจริงจัง',
    emoji: '🪞',
    musicExperience: 'deep_reflection',
    audioCharacter: 'calm',
    audioStyle: 'contemplative',
    matchMoods: ['reflective', 'confused', 'drained'],
  },
];

// ─── SoundscapeEngine ─────────────────────────────────────────────────────────

export class SoundscapeEngine {

  /**
   * หา SoundscapeConfig ที่ match ที่สุด
   * Priority: exact(world+mood+period) > (world+mood) > (mood+period) > (mood only) > fallback
   */
  recommend(worldId: WorldId, mood: Mood, period: TimePeriod): SoundscapeConfig {
    // Pass 1: world + mood + period ตรงทั้งหมด
    const exactMatch = SOUNDSCAPE_LIBRARY.find((s) =>
      s.matchMoods.includes(mood) &&
      s.matchHubs?.includes(worldId) &&
      s.matchPeriods?.includes(period)
    );
    if (exactMatch) return exactMatch;

    // Pass 2: world + mood (ไม่ต้อง period ตรง)
    const hubMoodMatch = SOUNDSCAPE_LIBRARY.find((s) =>
      s.matchMoods.includes(mood) &&
      s.matchHubs?.includes(worldId) &&
      !s.matchPeriods
    );
    if (hubMoodMatch) return hubMoodMatch;

    // Pass 3: mood + period (ไม่ต้อง world ตรง, ไม่มี matchHubs)
    const moodPeriodMatch = SOUNDSCAPE_LIBRARY.find((s) =>
      s.matchMoods.includes(mood) &&
      s.matchPeriods?.includes(period) &&
      !s.matchHubs
    );
    if (moodPeriodMatch) return moodPeriodMatch;

    // Pass 4: mood only (universal)
    const moodMatch = SOUNDSCAPE_LIBRARY.find((s) =>
      s.matchMoods.includes(mood) &&
      !s.matchPeriods &&
      !s.matchHubs
    );
    if (moodMatch) return moodMatch;

    // Pass 5: ultimate fallback
    return SOUNDSCAPE_LIBRARY.find((s) => s.id === 'ambient-minimal')!;
  }

  /**
   * Get all soundscapes (for debug / settings UI)
   */
  getAll(): SoundscapeConfig[] {
    return SOUNDSCAPE_LIBRARY;
  }

  /**
   * Get by ID
   */
  getById(id: string): SoundscapeConfig | undefined {
    return SOUNDSCAPE_LIBRARY.find((s) => s.id === id);
  }
}

export default SoundscapeEngine;
