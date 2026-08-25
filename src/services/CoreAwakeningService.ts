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
import { calculateMaturityScore, calculateSICEEngineScore, calculateAnalysisDepth } from './DynamicValueCalculator';
import { generateVisualDNA, saveVisualDNA } from './VisualDNAService';
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

  // P0 FIX: Fallback to random secondary ≠ primary (not hardcoded)
  const candidates = Object.keys(ARCHETYPE_KEYWORDS).filter((a) => a !== primary);
  const randomIdx = Math.floor(Math.random() * candidates.length);
  return candidates[randomIdx] as Archetype;
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

    // maturityScore: Phase A.1 - Dynamic calculation instead of hardcoded 30
    // Calculate from: userUnderstanding, analysis depth, insight count, coherence
    const analysisDepth = calculateAnalysisDepth({
      insightCount: personalIntel?.insights?.length ?? 0,
      analysisTimeMs: essence.execution_time ?? 0,
    });
    const maturityScore = calculateMaturityScore({
      userUnderstanding: personalIntel?.userUnderstanding,
      analysisInsightCount: personalIntel?.insights?.length,
      analysisCoherence: analysisDepth,
    });

    // Create Twin record in database
    const twinData = {
      userId,
      name: twinName,
      primaryArchetype,
      secondaryArchetype,
      maturityScore,
    };

    let newTwin: Twin | null = null;
    try {
      newTwin = await createTwinInDatabase(userId, twinData);
    } catch (twinCreateError) {
      console.error('❌ Twin creation failed:', twinCreateError);
      return {
        success: false,
        message: `Twin record creation failed: ${twinCreateError instanceof Error ? twinCreateError.message : String(twinCreateError)}`,
      };
    }

    if (!newTwin) {
      return {
        success: false,
        message: 'ไม่สามารถสร้าง Twin record ใน database (returned null)',
      };
    }

    // ✅ P5 STEP 1: PARALLELIZATION
    // Instead of sequential operations, start all independent database
    // operations at the same time. This reduces latency from 1.0s (5 serial
    // queries @ 200ms each) to ~0.2s (all 4 in parallel on 1 round-trip).

    // Prepare all operations upfront
    const groundedInsight = personalIntel?.insights?.[0];
    const memoryContent = groundedInsight
      ? `ฉันเกิดมาในชื่อ ${twinName} ฉันรู้แล้วว่า: ${groundedInsight} ฉันพร้อมเติบโตไปกับคุณ`
      : `ฉันเกิดมาในชื่อ ${twinName} ฉันอยู่ที่นี่เพื่อเติบโตไปกับคุณ`;

    // P0-C Gap #2: baseline SICE scores
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

    // Phase A.1: Dynamic SICE scores instead of hardcoded 50
    const baselineScores = REAL_SICE_ENGINE_NAMES.map((engineName) => ({
      twin_id: newTwin.id,
      sice_name: engineName,
      contribution_score: calculateSICEEngineScore({
        engineName,
        engineConfidence: confidenceByEngine.get(engineName),
        analysisDepth,
        userUnderstanding: personalIntel?.userUnderstanding,
      }),
      last_active: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }));

    // Phase A: Generate Visual DNA for consistent rendering across worlds
    const visualDNA = generateVisualDNA({
      birthDate: birthDate || new Date().toISOString().split('T')[0],
      primaryArchetype,
      secondaryArchetype,
      maturityScore,
    });

    // ✅ PHASE A.1 COMPLETE: ALL 9 OPERATIONS IN PARALLEL (Promise.allSettled)
    // Operations 1-5: Essence, Context, SICE Scores, Birth Memory, Visual DNA
    // Operations 6-9: Twin State, World Preferences, Twin Personality, Twin Capabilities

    const now = new Date().toISOString();

    // Helper: Derive stage from maturityScore
    const getInitialStage = (score: number): 'seed' | 'awakening' | 'growing' | 'advanced' | 'complete' => {
      if (score < 20) return 'seed';
      if (score < 40) return 'awakening';
      if (score < 60) return 'growing';
      if (score < 80) return 'advanced';
      return 'complete';
    };

    // Helper: Derive consciousness level (1-5) from maturityScore (0-100)
    const getConsciousnessLevel = (score: number): number => {
      return Math.max(1, Math.min(5, Math.ceil(score / 20)));
    };

    // Helper: Build personality prompt from archetypes
    const buildPersonalityPrompt = (primary: string, secondary: string): string => {
      return `You are a Twin with primary archetype ${primary} and secondary archetype ${secondary}. ` +
        `You are thoughtful, curious, and warm-authentic. Speak with wisdom grounded in both introspection and lived experience. ` +
        `Help your human understand themselves better across all 12 intelligence worlds.`;
    };

    // Prepare all 12 worlds for world_preferences
    // ✅ PHASE A.1: Include archetype columns for persistence
    const worldsList = [
      'self', 'mind', 'relationship', 'love', 'career', 'wealth',
      'life', 'growth', 'decision', 'purpose', 'wellbeing', 'future'
    ];
    const worldPreferencesRecords = worldsList.map(world => ({
      user_id: userId,
      world_id: world,
      primary_archetype: primaryArchetype,  // ✅ NEW: Persist primary archetype
      secondary_archetype: secondaryArchetype,  // ✅ NEW: Persist secondary archetype
      is_favorite: false,
      last_accessed: now,
      engagement_score: 0,
      created_at: now,
      updated_at: now,
    }));

    // ✅ START ALL 9 OPERATIONS IN PARALLEL
    const [
      essenceResult,
      ,
      scoresResult,
      memoryResult,
      visualDnaResult,
      stateResult,
      worldPrefsResult,
      personalityResult,
      capabilitiesResult
    ] = await Promise.allSettled([
      // Operation 1: Update essence to mark as used
      supabase
        .from('awakening_essence')
        .update({
          twin_id: newTwin.id,
          status: 'used',
          used_at: now,
        })
        .eq('id', essence.id),

      // Operation 2: Get & update personal_context
      (async () => {
        try {
          const { data: personalContext } = await supabase
            .from('personal_contexts')
            .select('id')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

          if (personalContext) {
            return await supabase
              .from('personal_contexts')
              .update({
                awakening_essence_id: essence.id,
              })
              .eq('id', personalContext.id);
          }
        } catch (contextError) {
          console.warn('คำเตือน: ไม่สามารถ link personal context:', contextError);
        }
      })(),

      // Operation 3: Insert SICE baseline scores
      supabase.from('twin_sice_scores').insert(baselineScores),

      // Operation 4: Insert birth memory
      supabase.from('twin_memories').insert({
        twin_id: newTwin.id,
        world_id: 'self',
        role: 'system',
        content: memoryContent,
        metadata: {
          eventType: 'awakening',
          timestamp: now,
          grounded: Boolean(groundedInsight),
        },
      }),

      // Operation 5: Save Visual DNA for consistent Twin visuals
      saveVisualDNA(userId, newTwin.id, visualDNA),

      // ✨ NEW Operation 6: Create twin_state (PHASE A.1)
      supabase.from('twin_state').insert({
        twin_id: newTwin.id,
        user_id: userId,
        current_stage: getInitialStage(maturityScore),
        consciousness_level: getConsciousnessLevel(maturityScore),
        data: {
          birthDate: birthDate || new Date().toISOString().split('T')[0],
          maturityScore,
          archetypes: { primary: primaryArchetype, secondary: secondaryArchetype },
        },
        created_at: now,
        updated_at: now,
      }),

      // ✨ NEW Operation 7: Create world_preferences for all 12 worlds (PHASE A.1)
      supabase.from('world_preferences').insert(worldPreferencesRecords),

      // ✨ NEW Operation 8: Create twin_personality (PHASE A.1)
      supabase.from('twin_personality').insert({
        twin_id: newTwin.id,
        user_id: userId,
        base_personality: buildPersonalityPrompt(primaryArchetype, secondaryArchetype),
        communication_style: 'thoughtful-curious',
        tone: 'warm-authentic',
        expertise_areas: {
          archetypes: [primaryArchetype, secondaryArchetype],
          maturityScore,
          focusAreas: groundedInsight ? [groundedInsight] : [],
        },
        created_at: now,
        updated_at: now,
      }),

      // ✨ NEW Operation 9: Create twin_capabilities (PHASE A.1)
      supabase.from('twin_capabilities').insert({
        twin_id: newTwin.id,
        user_id: userId,
        stage: getInitialStage(maturityScore),
        unlocked_features: ['basic-chat', 'simple-advice', 'world-navigation'],
        locked_features: ['advanced-synthesis', 'predictive-guidance', 'decision-oracle', 'essence-mapping', 'timeline-projection', 'archive-mastery'],
        created_at: now,
        updated_at: now,
      }),
    ]);

    // ✅ LOG ALL RESULTS (non-blocking)
    if (essenceResult.status === 'rejected' || (essenceResult.status === 'fulfilled' && essenceResult.value.error)) {
      console.error('❌ ไม่สามารถอัพเดท essence status:', essenceResult.status === 'rejected' ? essenceResult.reason : essenceResult.value.error);
    }
    if (scoresResult.status === 'rejected' || (scoresResult.status === 'fulfilled' && scoresResult.value.error)) {
      console.error('❌ ไม่สามารถเตรียม SICE baseline scores:', scoresResult.status === 'rejected' ? scoresResult.reason : scoresResult.value.error);
    }
    if (memoryResult.status === 'rejected' || (memoryResult.status === 'fulfilled' && memoryResult.value.error)) {
      console.error('❌ ไม่สามารถสร้าง birth memory:', memoryResult.status === 'rejected' ? memoryResult.reason : memoryResult.value.error);
    }
    if (visualDnaResult.status === 'rejected' || (visualDnaResult.status === 'fulfilled' && !visualDnaResult.value?.success)) {
      const reason = visualDnaResult.status === 'rejected' ? visualDnaResult.reason : visualDnaResult.value?.error;
      console.error('❌ ไม่สามารถบันทึก Visual DNA:', reason);
    }
    if (stateResult.status === 'rejected' || (stateResult.status === 'fulfilled' && stateResult.value.error)) {
      console.error('❌ ไม่สามารถสร้าง twin_state:', stateResult.status === 'rejected' ? stateResult.reason : stateResult.value.error);
    }
    if (worldPrefsResult.status === 'rejected' || (worldPrefsResult.status === 'fulfilled' && worldPrefsResult.value.error)) {
      console.error('❌ ไม่สามารถสร้าง world_preferences (12 worlds):', worldPrefsResult.status === 'rejected' ? worldPrefsResult.reason : worldPrefsResult.value.error);
    }
    if (personalityResult.status === 'rejected' || (personalityResult.status === 'fulfilled' && personalityResult.value.error)) {
      console.error('❌ ไม่สามารถสร้าง twin_personality:', personalityResult.status === 'rejected' ? personalityResult.reason : personalityResult.value.error);
    }
    if (capabilitiesResult.status === 'rejected' || (capabilitiesResult.status === 'fulfilled' && capabilitiesResult.value.error)) {
      console.error('❌ ไม่สามารถสร้าง twin_capabilities:', capabilitiesResult.status === 'rejected' ? capabilitiesResult.reason : capabilitiesResult.value.error);
    }

    // ✨ Check if critical operations failed
    const criticalFailures = [
      { name: 'world_preferences', result: worldPrefsResult },
      { name: 'twin_personality', result: personalityResult },
      { name: 'twin_state', result: stateResult },
      { name: 'twin_capabilities', result: capabilitiesResult },
    ];

    const failedOps = criticalFailures.filter(op =>
      op.result.status === 'rejected' || (op.result.status === 'fulfilled' && op.result.value?.error)
    );

    if (failedOps.length > 0) {
      console.warn(`⚠️ PHASE A.1 CRITICAL: ${failedOps.length} operation(s) failed:`, failedOps.map(f => f.name).join(', '));
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
    // SCHEMA FIX: analytics_events is keyed by user_id with an event_data
    // jsonb column (supabase/migrations/007_analytics_events.sql) — there is
    // no twin_id/world_id/metadata column. The old insert here used a
    // different, never-applied schema (src/services/supabase-schema.sql's
    // version) and would have failed silently against the real table.
    const { error: analyticsError } = await supabase
      .from('analytics_events')
      .insert({
        user_id: userId,
        event_type: 'twin_awakened',
        event_data: {
          twinId: twin.id,
          twinName,
          worldId: 'self',
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
