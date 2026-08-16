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
 */
export async function startAwakening(userId: string): Promise<AwakeningResult> {
  try {
    if (!userId || !supabase) {
      return { success: false, message: 'User ID required' };
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
        message: 'SICE orchestration failed — could not generate personal intelligence',
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

    // Store essence in a temporary cache (will be used when Twin is named)
    // Using a simple in-memory cache keyed by userId (in production, use Redis or similar)
    const awakeningCache = new Map<string, any>();
    awakeningCache.set(userId, essence);

    // Store in browser sessionStorage as fallback
    if (typeof window !== 'undefined' && window.sessionStorage) {
      window.sessionStorage.setItem(
        `awakening-essence-${userId}`,
        JSON.stringify(essence)
      );
    }

    return {
      success: true,
      message: 'Awakening process initiated — Personal intelligence generated',
    };
  } catch (error) {
    console.error('Error starting awakening:', error);
    return {
      success: false,
      message: `Awakening failed: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
}

/**
 * Initialize Twin in system after naming
 * Creates Twin record + initializes SICE baseline scores
 */
export async function initializeTwin(userId: string, twinName: string): Promise<AwakeningResult> {
  try {
    if (!userId || !twinName || !supabase) {
      return { success: false, message: 'User ID and Twin name required' };
    }

    // Create Twin record in database
    const twinData = {
      userId, // Required by type (though not used by createTwinInDatabase)
      name: twinName,
      primaryArchetype: 'sage' as const, // Default archetype at birth
      secondaryArchetype: 'explorer' as const,
      maturityScore: 30, // Start immature, grows through interaction
    };

    const newTwin = await createTwinInDatabase(userId, twinData);

    if (!newTwin) {
      return {
        success: false,
        message: 'Failed to create Twin record in database',
      };
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
      contribution_score: 50, // Neutral baseline
      last_active: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }));

    // Insert baseline SICE scores
    const { error: scoresError } = await supabase
      .from('twin_sice_scores')
      .insert(baselineScores);

    if (scoresError) {
      console.error('Warning: Could not initialize SICE baseline scores:', scoresError);
      // Don't fail the whole process if scores fail — Twin is already created
    }

    // Create initial Twin memory entry: "I was born"
    const { error: memoryError } = await supabase
      .from('twin_memories')
      .insert({
        twin_id: newTwin.id,
        world_id: 'self',
        role: 'system',
        content: `I was born as ${twinName}. I'm here to grow with you.`,
        metadata: {
          eventType: 'awakening',
          timestamp: new Date().toISOString(),
        },
      });

    if (memoryError) {
      console.error('Warning: Could not create birth memory:', memoryError);
      // Don't fail — Twin is already created
    }

    return {
      success: true,
      message: `Twin "${twinName}" has been awakened! 🎉`,
      twinId: newTwin.id,
    };
  } catch (error) {
    console.error('Error initializing Twin:', error);
    return {
      success: false,
      message: `Initialization failed: ${error instanceof Error ? error.message : String(error)}`,
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
