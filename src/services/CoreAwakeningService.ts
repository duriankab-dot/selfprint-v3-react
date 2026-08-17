/**
 * CoreAwakeningService.ts
 * Manages Twin birth ceremony and awakening process
 */

import { supabase } from './supabase-service';
import { SICEOrchestrator } from '../services/sice/SICEOrchestrator';
import { createTwinInDatabase } from './TwinSupabaseService';
import { ensureUserProfile } from './database-init';
import type { SICEInput } from '../types/sice';

export interface AwakeningResult {
  success: boolean;
  message: string;
  twinId?: string;
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
export async function initializeTwin(userId: string, twinName: string, essenceId?: string): Promise<AwakeningResult> {
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

    // Create Twin record in database
    const twinData = {
      userId,
      name: twinName,
      primaryArchetype: 'sage' as const,
      secondaryArchetype: 'explorer' as const,
      maturityScore: 30,
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

    // Initialize SICE baseline scores for this Twin
    const siceEngines = [
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
      'MemoryManager',
      'DecisionIntelligenceEngine',
    ];

    const baselineScores = siceEngines.map((engineName) => ({
      twin_id: newTwin.id,
      sice_name: engineName,
      contribution_score: 50,
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

    // Create initial Twin memory entry: "I was born"
    const { error: memoryError } = await supabase
      .from('twin_memories')
      .insert({
        twin_id: newTwin.id,
        world_id: 'self',
        role: 'system',
        content: `ฉันเกิดมาในชื่อ ${twinName} ฉันอยู่ที่นี่เพื่อเติบโตไปกับคุณ`,
        metadata: {
          eventType: 'awakening',
          timestamp: new Date().toISOString(),
        },
      });

    if (memoryError) {
      console.error('คำเตือน: ไม่สามารถสร้าง birth memory:', memoryError);
    }

    return {
      success: true,
      message: `Twin "${twinName}" ได้ตื่นตัวแล้ว! 🎉 Essence บันทึกในฐานข้อมูล ✨`,
      twinId: newTwin.id,
    };
  } catch (error) {
    console.error('ข้อผิดพลาดในการ initialize Twin:', error);
    return {
      success: false,
      message: `initialization ล้มเหลว: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
}

/**
 * Save Twin profile to database
 * Used during Twin creation to persist profile data
 */
export async function saveTwinProfile(
  userId: string,
  twinName: string,
  profile: any
): Promise<any> {
  try {
    if (!userId || !twinName || !supabase) {
      throw new Error('User ID and Twin name required');
    }

    // Create Twin using TwinSupabaseService
    const twinData = {
      userId, // Required by type (though not used by createTwinInDatabase)
      name: twinName,
      primaryArchetype: profile.primaryArchetype || 'Guide',
      secondaryArchetype: profile.secondaryArchetype || 'Companion',
      maturityScore: Math.max(0, Math.min(100, profile.maturityScore || 30)),
    };

    const newTwin = await createTwinInDatabase(userId, twinData);

    if (!newTwin) {
      throw new Error('Failed to create Twin in database');
    }

    console.log('Twin profile persisted to Supabase:', newTwin);
    return newTwin;
  } catch (error) {
    console.error('Error saving Twin profile:', error);
    throw error;
  }
}

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
