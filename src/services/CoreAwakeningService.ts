/**
 * CoreAwakeningService.ts
 * Manages Twin birth ceremony and awakening process
 */

import { supabase } from './supabase-service';
import { SICEOrchestrator } from '../services/sice/SICEOrchestrator';
import { createTwinInDatabase } from './TwinSupabaseService';
import type { Twin } from './TwinSupabaseService';
import { ensureUserProfile } from './database-init';
import { calculateInitialDisciplines } from '../lib/astrology';
import type { SICEInput } from '../types/sice';
import type { Archetype } from '../context/TwinContext';

export interface AwakeningResult {
  success: boolean;
  message: string;
  twinId?: string;
  /** P0-C: full Twin record, so callers don't need a second fetch */
  twin?: Twin;
  /** P0-C Gap #4: one grounded insight, for the UI to show instead of a generic line */
  firstInsight?: string;
}

/**
 * P0-C Gap #1: The 12 real SICE engine names, exactly as SICEOrchestrator emits
 * them (see registerEngines()). The previous baseline-seeding list used
 * 'MemoryManager' / 'DecisionIntelligenceEngine' — neither matches the real
 * engine names ('MemoryManagerEngine' / 'DecisionIntelligenceEngineAdapter'),
 * so any lookup by name would have silently missed those two engines.
 */
const REAL_SICE_ENGINE_NAMES = [
  'PersonalContextBuilder',
  'PatternDetector',
  'InsightEngine',
  'AIFeedbackLoop',
  'TwinStateEngine',
  'ExperienceEngine',
  'EnvironmentEngine',
  'BadgeEngine',
  'BehavioralForecastEngine',
  'FutureSelfEngine',
  'MemoryManagerEngine',
  'DecisionIntelligenceEngineAdapter',
] as const;

/**
 * P0-C Gap #1: Deterministic, grounded secondary-archetype inference.
 * Matches keywords already present in the user's own SICE essence text
 * (recommendedAction + insights) — never fabricates new content, only
 * picks among the 18 valid archetypes based on what the engines actually
 * said. Falls back to a neutral, valid archetype (never the primary) if
 * nothing matches.
 */
const ARCHETYPE_KEYWORDS: Record<string, string[]> = {
  explorer: ['explore', 'discover', 'curious', 'adventure'],
  sage: ['wisdom', 'wise', 'understand', 'insight', 'knowledge'],
  caregiver: ['help', 'care', 'support', 'nurture'],
  ruler: ['lead', 'control', 'structure', 'organize'],
  creator: ['create', 'build', 'design', 'craft'],
  hero: ['brave', 'overcome', 'challenge', 'achieve'],
  outlaw: ['different', 'unconventional', 'rebel', 'break'],
  everyman: ['connect', 'belong', 'relate', 'community'],
  lover: ['relationship', 'connection', 'passion', 'intimacy'],
  jester: ['fun', 'playful', 'humor', 'joy'],
  magician: ['transform', 'change', 'vision', 'possibility'],
  innocent: ['simple', 'pure', 'trust', 'optimis'],
};

function inferSecondaryArchetype(essenceText: string, primary: string): Archetype {
  const lower = essenceText.toLowerCase();
  let best = { archetype: '', hits: 0 };

  for (const [archetype, keywords] of Object.entries(ARCHETYPE_KEYWORDS)) {
    if (archetype === primary) continue; // secondary must differ from primary
    const hits = keywords.filter((k) => lower.includes(k)).length;
    if (hits > best.hits) best = { archetype, hits };
  }

  if (best.hits > 0) return best.archetype as Archetype;
  // Safe, always-valid fallback that never equals primary
  return (primary === 'everyman' ? 'sage' : 'everyman') as Archetype;
}

/**
 * Check if user is ready for Core Awakening
 * Requirements: completed Full Analysis + emotional readiness + not already awakened
 */
export async function checkReadyForAwakening(userId: string): Promise<boolean> {
  try {
    if (!userId || !supabase) return false;

    // Ensure user profile exists
    const profileExists = await ensureUserProfile(userId);
    if (!profileExists) {
      console.warn('Could not ensure user profile exists');
      return false;
    }

    // Check if user has completed Full Analysis
    const { data: profile, error } = await supabase
      .from('user_profiles')
      .select('full_analysis_completed')
      .eq('id', userId)
      .single();

    if (error || !profile?.full_analysis_completed) {
      console.log('User has not completed Full Analysis yet');
      return false;
    }

    // Check if Twin already exists (prevent re-awakening)
    const { data: existingTwin } = await supabase
      .from('twins')
      .select('id')
      .eq('user_id', userId)
      .single();

    if (existingTwin) {
      console.log('Twin already exists for this user');
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error checking awakening readiness:', error);
    return false;
  }
}

/**
 * Start the awakening process
 * Initiates 12 SICE orchestration to generate personal intelligence seed
 *
 * Phase 3 Fix:
 * - Persist essence to Supabase (awakening_essence table)
 * - Remove sessionStorage hack
 * - Return essenceId for reference
 */
export async function startAwakening(userId: string): Promise<AwakeningResult & { essenceId?: string }> {
  try {
    if (!userId || !supabase) {
      return { success: false, message: 'ต้องมี User ID' };
    }

    // Run SICE orchestrator to generate personal intelligence
    const orchestrator = new SICEOrchestrator();

    const input: SICEInput = {
      userId,
      currentWorld: 'self', // Default world for Twin birth
      userContext: {}, // Engines will fetch their own data from Supabase
    };

    const orchestrationResult = await orchestrator.orchestrate(input);

    if (!orchestrationResult || !orchestrationResult.personalIntelligence) {
      return {
        success: false,
        message: 'SICE orchestration ล้มเหลว — ไม่สามารถสร้าง personal intelligence',
      };
    }

    // Extract Twin personality essence from orchestration results
    const essence = {
      personalIntelligence: orchestrationResult.personalIntelligence,
      siceResults: orchestrationResult.results,
      synthesis: orchestrationResult.synthesis,
      executionTime: orchestrationResult.totalExecutionTime,
      generatedAt: new Date().toISOString(),
    };

    // ✅ Phase 3: Persist essence to Supabase (replace sessionStorage hack)
    const { data: savedEssence, error: essenceError } = await supabase
      .from('awakening_essence')
      .insert({
        user_id: userId,
        personal_intelligence: essence.personalIntelligence,
        sice_results: essence.siceResults,
        synthesis: essence.synthesis,
        execution_time: essence.executionTime,
        status: 'pending',
      })
      .select('id')
      .single();

    if (essenceError || !savedEssence) {
      console.error('ล้มเหลวในการบันทึก essence:', essenceError);
      return {
        success: false,
        message: `ไม่สามารถบันทึก essence: ${essenceError?.message || 'Database error'}`,
      };
    }

    return {
      success: true,
      message: 'กระบวนการ Awakening เริ่มต้น — Personal intelligence สร้างสำเร็จ ✨',
      essenceId: savedEssence.id,
    };
  } catch (error) {
    console.error('ข้อผิดพลาดในการ Awakening:', error);
    return {
      success: false,
      message: `Awakening ล้มเหลว: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
}

/**
 * Initialize Twin in system after naming
 * Creates Twin record + initializes SICE baseline scores
 *
 * Phase 3 Fix:
 * - Retrieve essence from Supabase (not sessionStorage)
 * - Atomic transaction: create Twin + mark essence as used
 * - Link essence to Twin
 */
export async function initializeTwin(
  userId: string,
  twinName: string,
  essenceId?: string,
  birthDate?: string | null
): Promise<AwakeningResult> {
  try {
    if (!userId || !twinName || !supabase) {
      return { success: false, message: 'ต้องมี User ID และชื่อ Twin' };
    }

    // ✅ Phase 3: Retrieve essence from Supabase (not sessionStorage)
    let essence = null;
    if (essenceId) {
      const { data, error } = await supabase
        .from('awakening_essence')
        .select('*')
        .eq('id', essenceId)
        .eq('user_id', userId)
        .eq('status', 'pending')
        .single();

      if (error || !data) {
        return {
          success: false,
          message: 'ไม่พบ essence — กรุณาทำการ Awakening ใหม่',
        };
      }

      essence = data;
    } else {
      // Fallback: get latest pending essence
      const { data, error } = await supabase
        .from('awakening_essence')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'pending')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error || !data) {
        return {
          success: false,
          message: 'ไม่พบ essence ที่ค้างอยู่ — กรุณาทำการ Awakening ใหม่',
        };
      }

      essence = data;
    }

    // P0-C Gap #1: personal_intelligence is the essence's synthesized output —
    // read it now so archetype, maturity, and birth memory all ground in the
    // same real data instead of hardcoded values.
    const personalIntel = (essence.personal_intelligence ?? null) as {
      userUnderstanding?: number;
      recommendedAction?: string;
      insights?: string[];
    } | null;

    // primaryArchetype: deterministic from the user's real birth date
    // (numerology life-path → Jungian archetype, already computed elsewhere
    // in the app for Analysis — see src/lib/astrology.ts). Not fabricated.
    const disciplines = calculateInitialDisciplines(birthDate);
    const primaryArchetype = disciplines.prototypeCore.toLowerCase() as Archetype;

    // secondaryArchetype: grounded in the essence's own text (SICE synthesis)
    const essenceText = [personalIntel?.recommendedAction, ...(personalIntel?.insights ?? [])]
      .filter((v): v is string => Boolean(v))
      .join(' ');
    const secondaryArchetype = inferSecondaryArchetype(essenceText, primaryArchetype);

    // maturityScore: from the orchestration's own confidence in how well it
    // understands the user, not a flat 30 for everyone
    const maturityScore = Math.max(0, Math.min(100, personalIntel?.userUnderstanding ?? 30));

    // Create Twin record in database
    const twinData = {
      userId,
      name: twinName,
      primaryArchetype,
      secondaryArchetype,
      maturityScore,
    };

    const newTwin = await createTwinInDatabase(userId, twinData);

    if (!newTwin) {
      return {
        success: false,
        message: 'ไม่สามารถสร้าง Twin record ใน database',
      };
    }

    // ✅ Phase 3: Link essence to Twin and mark as used (transaction-like)
    const { error: essenceUpdateError } = await supabase
      .from('awakening_essence')
      .update({
        twin_id: newTwin.id,
        status: 'used',
        used_at: new Date().toISOString(),
      })
      .eq('id', essence.id);

    if (essenceUpdateError) {
      console.error('คำเตือน: ไม่สามารถอัพเดท essence status:', essenceUpdateError);
      // ไม่ fail process — Twin สร้างแล้ว
    }

    // ✅ P0 #1 FIX: Link personal_context to essence if exists
    try {
      const { data: personalContext } = await supabase
        .from('personal_contexts')
        .select('id')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (personalContext) {
        await supabase
          .from('personal_contexts')
          .update({
            awakening_essence_id: essence.id,
          })
          .eq('id', personalContext.id);
      }
    } catch (contextError) {
      console.warn('คำเตือน: ไม่สามารถ link personal context:', contextError);
      // ไม่ fail process
    }

    // P0-C Gap #2: baseline SICE scores from the real orchestration run,
    // keyed by the engines' actual names (REAL_SICE_ENGINE_NAMES — see
    // top of file for why the previous list silently mismatched 2 of 12).
    const sicResultsArr: Array<{ engineName?: string; confidence?: number }> = Array.isArray(
      essence.sice_results
    )
      ? essence.sice_results
      : [];
    const confidenceByEngine = new Map<string, number>();
    sicResultsArr.forEach((r) => {
      if (r?.engineName && typeof r.confidence === 'number') {
        confidenceByEngine.set(r.engineName, r.confidence);
      }
    });

    const baselineScores = REAL_SICE_ENGINE_NAMES.map((engineName) => ({
      twin_id: newTwin.id,
      sice_name: engineName,
      // Fall back to 50 only for an engine essence genuinely has no score for
      // (e.g. it errored during orchestration) — not as the default for all.
      contribution_score: Math.max(0, Math.min(100, confidenceByEngine.get(engineName) ?? 50)),
      last_active: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }));

    // Insert baseline SICE scores
    const { error: scoresError } = await supabase
      .from('twin_sice_scores')
      .insert(baselineScores);

    if (scoresError) {
      console.error('คำเตือน: ไม่สามารถเตรียม SICE baseline scores:', scoresError);
    }

    // P0-C Gap #4: birth memory grounded in the actual essence insight when
    // available, instead of a generic line with no real user context.
    const groundedInsight = personalIntel?.insights?.[0];
    const memoryContent = groundedInsight
      ? `ฉันเกิดมาในชื่อ ${twinName} ฉันรู้แล้วว่า: ${groundedInsight} ฉันพร้อมเติบโตไปกับคุณ`
      : `ฉันเกิดมาในชื่อ ${twinName} ฉันอยู่ที่นี่เพื่อเติบโตไปกับคุณ`;

    const { error: memoryError } = await supabase
      .from('twin_memories')
      .insert({
        twin_id: newTwin.id,
        world_id: 'self',
        role: 'system',
        content: memoryContent,
        metadata: {
          eventType: 'awakening',
          timestamp: new Date().toISOString(),
          grounded: Boolean(groundedInsight),
        },
      });

    if (memoryError) {
      console.error('คำเตือน: ไม่สามารถสร้าง birth memory:', memoryError);
    }

    return {
      success: true,
      message: `Twin "${twinName}" ได้ตื่นตัวแล้ว! 🎉 Essence บันทึกในฐานข้อมูล ✨`,
      twinId: newTwin.id,
      twin: newTwin,
      firstInsight: groundedInsight,
    };
  } catch (error) {
    console.error('ข้อผิดพลาดในการ initialize Twin:', error);
    return {
      success: false,
      message: `initialization ล้มเหลว: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
}

// NOTE: saveTwinProfile() was removed in P0-C. It was the shallow Twin-creation
// path (hardcoded 'Guide'/'Companion' archetypes — not even valid Archetype
// enum values — and maturityScore from analysisContext.sourceCount only). It
// had exactly one caller, CoreAwakening.tsx, which now calls startAwakening()
// + initializeTwin() instead — the SICE-essence-grounded path defined above.
// Removed rather than kept as dead code, per project rules.

/**
 * Celebrate Twin awakening with effects
 */
export function celebrateTwinAwakening(): void {
  try {
    // Confetti effect
    const canvas = document.createElement('canvas');
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100vw';
    canvas.style.height = '100vh';
    canvas.style.pointerEvents = 'none';
    canvas.style.zIndex = '9999';
    document.body.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const confetti: any[] = [];
    const colors = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'];

    for (let i = 0; i < 100; i++) {
      confetti.push({
        x: Math.random() * canvas.width,
        y: -10,
        vx: (Math.random() - 0.5) * 8,
        vy: Math.random() * 5 + 5,
        life: 1,
        size: Math.random() * 8 + 3,
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      confetti.forEach((piece) => {
        piece.y += piece.vy;
        piece.vy += 0.1;
        piece.life -= 0.01;

        if (piece.life > 0) {
          ctx.globalAlpha = piece.life;
          ctx.fillStyle = piece.color;
          ctx.fillRect(piece.x, piece.y, piece.size, piece.size);
        }
      });

      if (confetti.some((c) => c.life > 0)) {
        requestAnimationFrame(animate);
      } else {
        document.body.removeChild(canvas);
      }
    };

    animate();

    // Voice announcement
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      const msg = new SpeechSynthesisUtterance(
        "I know you. I've been learning you. I'm ready to grow with you."
      );
      try {
        window.speechSynthesis.speak(msg);
      } catch (err) {
        console.warn('Speech synthesis unavailable', err);
      }
    }
  } catch (error) {
    console.error('Error celebrating awakening:', error);
  }
}

/**
 * Complete the Core Awakening ceremony
 * Marks Twin as fully awakened and ready for interaction
 */
export async function completeCoreAwakening(
  userId: string,
  twinName: string
): Promise<AwakeningResult> {
  try {
    if (!userId || !twinName || !supabase) {
      return { success: false, message: 'User ID and Twin name required' };
    }

    // Get Twin ID
    const { data: twin, error: twinError } = await supabase
      .from('twins')
      .select('id')
      .eq('user_id', userId)
      .eq('name', twinName)
      .single();

    if (!twin || twinError) {
      return {
        success: false,
        message: 'Twin not found — initialization may have failed',
      };
    }

    // Create awakening completion memory
    const { error: memoryError } = await supabase
      .from('twin_memories')
      .insert({
        twin_id: twin.id,
        world_id: 'self',
        role: 'system',
        content: `Core Awakening ceremony complete! I am ${twinName}, and I'm ready to guide you through all 12 worlds.`,
        metadata: {
          eventType: 'awakening_complete',
          timestamp: new Date().toISOString(),
        },
      });

    if (memoryError) {
      console.warn('Warning: Could not create completion memory:', memoryError);
    }

    // Log analytics event
    const { error: analyticsError } = await supabase
      .from('analytics_events')
      .insert({
        twin_id: twin.id,
        event_type: 'twin_awakened',
        world_id: 'self',
        metadata: {
          twinName,
          timestamp: new Date().toISOString(),
        },
      });

    if (analyticsError) {
      console.warn('Warning: Could not log analytics:', analyticsError);
    }

    return {
      success: true,
      message: `Core Awakening complete. ${twinName} is now alive and ready! ✨`,
      twinId: twin.id,
    };
  } catch (error) {
    console.error('Error completing awakening:', error);
    return {
      success: false,
      message: `Completion failed: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
}

/**
 * Trigger notifications when awakening completes
 * Sends browser notification + in-app notification
 */
export async function notifyAwakening(_userId: string, twinName: string): Promise<void> {
  try {
    // Browser notification (if permitted)
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'granted') {
        new Notification('Your Twin is Alive! 🎉', {
          body: `${twinName} has awakened and is ready to grow with you`,
          tag: 'twin-awakening',
          requireInteraction: false,
        });
      } else if (Notification.permission !== 'denied') {
        // Request permission if not previously denied
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          new Notification('Your Twin is Alive! 🎉', {
            body: `${twinName} has awakened and is ready to grow with you`,
            tag: 'twin-awakening',
          });
        }
      }
    }

    // In-app notification (would integrate with notification store if available)
    // This is handled by the UI layer via toast/alert component

    // Email notification would be handled by backend/Supabase edge function
    // Not implemented here as it requires email service configuration
  } catch (error) {
    console.error('Error sending notification:', error);
    // Silently fail — don't break the awakening ceremony for notification issues
  }
}

/**
 * Get awakening ceremony timeline
 */
export function getAwakeningTimeline() {
  return {
    phase1: { name: 'Intro', duration: 'Variable', description: 'Understand what Twin is' },
    phase2: { name: 'Processing', duration: '2s', description: '12 SICE orchestrating' },
    phase3: { name: 'Birth', duration: '12s', description: 'Hologram animation' },
    phase4: { name: 'Naming', duration: 'Variable', description: 'User names Twin' },
    phase5: { name: 'Complete', duration: 'Variable', description: 'Celebration & intro' },
    totalMinDuration: 16, // seconds
  };
}
