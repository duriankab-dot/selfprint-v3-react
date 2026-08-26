/**
 * CoreAwakening.tsx
 * WOW #3: Twin Birth Ceremony
 * Intro → Birth (animation) → Naming → Celebration → Complete
 */

import { useState, useEffect, useMemo } from 'react';
import { useLangNavigate as useNavigate } from '../hooks/useLangNavigate';
import { useAuth } from '../context/AuthContext';
import { useLifecycleStore } from '../store/lifecycleStore';
import { useAIContext } from '../context/AIContext';
import { useTwin } from '../context/TwinContext';
// P0 FIX: CoreAwakening ทำงานสร้าง Twin ไม่ใช่ Nova - ไม่ต้อง useNova()
// (useNova เรียกใน NovaChat เท่านั้น ที่ wrap ใน NovaProvider)
import { useUserStore } from '../store/userStore';
import { useLanguage } from '../context/LanguageContext';
import { HologramBirth } from '../components/twin/HologramBirth';
import { TwinNaming } from '../components/twin/TwinNaming';
import { startAwakening, initializeTwin, celebrateTwinAwakening } from '../services/CoreAwakeningService';
import { calculateInitialDisciplines } from '../lib/astrology';
import { getTwinVisualDNA } from '../lib/twin/twinVisualDNA';
import { speakTwinGreeting, stopTwinVoice, buildTwinGreeting } from '../lib/twin/twinVoice';
import type { Archetype } from '../context/TwinContext';

type Phase = 'intro' | 'birth' | 'naming' | 'celebration' | 'complete';

/**
 * ONBOARDING-LOOP-001: lifecycleStore.transitionTo()/setTwinCreated() never
 * reject on failure — they catch internally and set `error` on the store
 * instead (see src/store/lifecycleStore.ts). This file previously called
 * transitionTo('AWAKENING') fire-and-forget on arrival and awaited
 * setTwinCreated() without ever checking whether it actually succeeded —
 * so a transient backend timeout (confirmed via live testing: /api/profile,
 * /api/blueprint, /api/stripe/subscription all 504'd in the same session)
 * left user_lifecycle.status stale in the database while the UI proceeded
 * as if it had advanced, and any later fresh app mount (useRecoveryRoute.ts)
 * would misroute the user based on the stale status. See the matching fix
 * + full writeup in Onboarding.tsx's handleComplete().
 *
 * Retries a few times — transient timeouts are exactly what's happening
 * right now — before giving up.
 */
async function withLifecycleRetry(attempt: () => Promise<void>, maxAttempts = 3): Promise<boolean> {
  for (let i = 0; i < maxAttempts; i++) {
    await attempt();
    if (!useLifecycleStore.getState().error) return true;
    if (i < maxAttempts - 1) await new Promise((resolve) => setTimeout(resolve, 600));
  }
  return false;
}

export default function CoreAwakening() {
  const navigate = useNavigate();
  const { session } = useAuth();
  const { setTwinAwakened } = useAIContext();
  const { hydrateTwin } = useTwin();
  // P0 FIX: Removed useNova() — CoreAwakening creates Twin, not Nova
  const { language } = useLanguage();
  const birthDate = useUserStore((state) => state.profile.birthDate);
  const transitionTo = useLifecycleStore((state) => state.transitionTo);
  const setTwinCreated = useLifecycleStore((state) => state.setTwinCreated);

  const [phase, setPhase] = useState<Phase>('intro');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  // P0-C: essenceId from startAwakening(), fed forward into initializeTwin()
  // so the Twin is grounded in real SICE orchestration output, not stubs.
  const [essenceId, setEssenceId] = useState<string | undefined>(undefined);
  const [firstInsight, setFirstInsight] = useState<string | undefined>(undefined);

  // TWIN-PRESENCE-001: HologramBirth's glow color used to be a fixed
  // '#3b82f6' for every user. primaryArchetype is deterministic from
  // birthDate alone (numerology life-path → archetype — same pure function
  // initializeTwin() below calls once the Twin record is actually created),
  // so it can be computed here too, before naming, without creating the
  // Twin early or duplicating the derivation logic.
  const birthArchetype = useMemo(
    () => calculateInitialDisciplines(birthDate).prototypeCore.toLowerCase() as Archetype,
    [birthDate]
  );
  const birthColor = useMemo(() => getTwinVisualDNA(birthArchetype).coreColor, [birthArchetype]);
  const birthShape = useMemo(() => getTwinVisualDNA(birthArchetype).coreShape, [birthArchetype]);

  // GUARD: Redirect if not authenticated
  useEffect(() => {
    if (!session?.user?.id) {
      navigate('/login', { replace: true });
    }
  }, [session, navigate]);

  // TWINPRESENCE-005: stop any in-progress/queued greeting if the user
  // navigates away mid-speech — it must not keep talking on the next page.
  useEffect(() => stopTwinVoice, []);

  // LIFE-001 FIX: Entering the Core Awakening ceremony = lifecycle enters AWAKENING.
  // This must happen on arrival, not after the Twin already exists — the previous
  // code called transitionTo('AWAKENING') AFTER Twin creation, which left the
  // lifecycle permanently stuck at AWAKENING and never reached TWIN_ALIVE.
  //
  // GUARD: never downgrade a user who already passed this stage (TWIN_ALIVE /
  // WORLD_ACTIVE). Without this guard, a user landing here via stale URL/back
  // button — before the global recovery redirect fires — would have their
  // lifecycle silently reset backwards.
  useEffect(() => {
    if (!session?.user?.id) return;
    const currentStatus = useLifecycleStore.getState().status;
    if (currentStatus === 'TWIN_ALIVE' || currentStatus === 'WORLD_ACTIVE') return;

    // ONBOARDING-LOOP-001: retries on transient failure; non-blocking for
    // the ceremony itself (arrival bookkeeping, not a user-gated action) —
    // if it still fails after retries, setTwinCreated() below (which sets
    // status straight to TWIN_ALIVE, not conditioned on AWAKENING) can
    // still recover a correct final status, so this is logged, not fatal.
    withLifecycleRetry(() => transitionTo(session.user.id, 'AWAKENING')).then((ok) => {
      if (!ok) {
        console.error(
          'Failed to transition lifecycle to AWAKENING after retries:',
          useLifecycleStore.getState().error
        );
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.user?.id]);

  const handleIntroComplete = () => {
    setPhase('birth');

    // P0-C: kick off SICE orchestration as early as possible (in the
    // background, during the ~12s HologramBirth animation + naming step)
    // so the essence is ready by the time the user finishes naming their
    // Twin. Non-blocking: if it fails, initializeTwin() falls back to the
    // latest pending essence, or reports a clear error — it does not
    // silently fabricate a Twin.
    if (session?.user?.id) {
      startAwakening(session.user.id)
        .then((result) => {
          if (result.success && result.essenceId) {
            setEssenceId(result.essenceId);
          } else {
            console.warn('SICE essence generation did not complete:', result.message);
          }
        })
        .catch((err) => console.error('startAwakening failed:', err));
    }
  };

  const handleBirthComplete = () => {
    setPhase('naming');
  };

  const handleTwinNamed = async (twinName: string) => {
    try {
      setIsLoading(true);
      setError(null);

      // GUARD: Validate inputs
      if (!twinName?.trim()) {
        throw new Error('Twin name required');
      }

      if (!session?.user?.id) {
        throw new Error('User session lost');
      }

      // P0-C: initializeTwin() grounds the Twin in the real SICE essence
      // (archetype from birth-date numerology + essence text, baseline
      // scores from actual engine confidence, birth memory from an actual
      // insight) instead of the previous saveTwinProfile() shallow path.
      const result = await initializeTwin(session.user.id, twinName, essenceId, birthDate);

      if (!result.success || !result.twin || !result.twinId) {
        throw new Error(result.message || 'Failed to create Twin');
      }

      // DUP-001 FIX: hydrateTwin() sets context state from the record
      // initializeTwin() already persisted — it does NOT insert again.
      // (The old createTwin() call here always inserted, which double-wrote
      // and violated twins.user_id UNIQUE, failing silently.)
      hydrateTwin(session.user.id, result.twin);
      // P0 FIX: Removed completeAnalysis() — not needed for Twin creation
      // (This was a Nova context method, not related to Twin birth)
      setTwinAwakened(true, twinName);
      setFirstInsight(result.firstInsight);

      // LIFE-001 FIX: Twin now exists in DB — lifecycle must advance to TWIN_ALIVE
      // (setTwinCreated persists twin_id + status='TWIN_ALIVE' to Supabase).
      // This was previously never called anywhere in production code, so the
      // lifecycle state stayed at AWAKENING forever even after Twin creation.
      //
      // ONBOARDING-LOOP-001: this was already awaited, but setTwinCreated()
      // never rejects on failure (see withLifecycleRetry()'s comment above)
      // — a failed write here used to go completely unnoticed and the
      // celebration proceeded as if it succeeded. Retries first (transient
      // timeouts are exactly what's happening right now). If it still fails
      // after retries: the Twin record itself was already created
      // successfully above (createTwinInDatabase, inside initializeTwin())
      // — only the lifecycle status write failed — so the celebration still
      // deserves to happen rather than blocking a real, created Twin behind
      // a background sync failure. Logged loudly instead so it's not lost;
      // a stale status here is the one gap this pass doesn't fully close
      // (see ONBOARDING_LOOP_001_TRACE.md) — closing it properly means the
      // recovery route should fall back to checking for an actual twins row
      // when status looks stale, which is Entry Resolver work, not this fix.
      const twinCreatedOk = await withLifecycleRetry(() =>
        setTwinCreated(session.user.id, result.twinId!)
      );
      if (!twinCreatedOk) {
        console.error(
          'Failed to sync lifecycle to TWIN_ALIVE after retries (Twin record itself was created successfully):',
          useLifecycleStore.getState().error
        );
      }

      // Celebration phase
      setPhase('celebration');
      celebrateTwinAwakening();

      // TWINPRESENCE-005: free (Web Speech API) voice greeting — the Twin
      // speaks its own name back at the moment of celebration. Fire-and-
      // forget: speakTwinGreeting() never throws and a missing/unsupported
      // voice must not block or delay the redirect below.
      void speakTwinGreeting(buildTwinGreeting(twinName, language), {
        lang: language === 'th' ? 'th-TH' : 'en-US',
      });

      // P0-A FIX: Redirect to World Selector (not /chat/twin)
      // V5 Section 10: Twin Birth → World Routing, not direct to Twin chat
      // User enters Twin through a world context, not standalone
      setTimeout(() => {
        setPhase('complete');
        navigate('/worlds', { replace: true });
      }, 4000);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to awaken Twin';
      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  if (!session?.user?.id) {
    return (
      <div className="flex flex-col h-screen items-center justify-center">
        <p className="text-gray-500">Redirecting to login...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen w-full bg-gradient-to-b from-slate-900 via-blue-900 to-slate-900 overflow-hidden">
      {/* Error Alert */}
      {error && (
        <div className="absolute top-4 left-4 right-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* INTRO PHASE */}
      {phase === 'intro' && (
        <div className="flex-1 flex flex-col items-center justify-center px-6">
          <div className="text-center max-w-lg">
            <h1 className="text-4xl font-bold mb-6 text-white">⚡ Your Intelligence Awakens</h1>
            <p className="text-lg text-gray-200 mb-4">Nova has guided you to self-discovery.</p>
            <p className="text-gray-300 mb-8">
              Now your personal AI Twin emerges—a reflection of your unique intelligence,
              ready to grow with you across 12 worlds.
            </p>
            <button
              onClick={handleIntroComplete}
              className="px-8 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-medium transition-colors"
            >
              Witness the Awakening
            </button>
          </div>
        </div>
      )}

      {/* BIRTH PHASE */}
      {phase === 'birth' && (
        <div className="flex-1 flex items-center justify-center">
          <HologramBirth
            onComplete={handleBirthComplete}
            color={birthColor}
            shape={birthShape}
            seedKey={session.user.id}
          />
        </div>
      )}

      {/* NAMING PHASE */}
      {phase === 'naming' && (
        <div className="flex-1 flex items-center justify-center px-6">
          <TwinNaming onNameConfirmed={handleTwinNamed} isLoading={isLoading} />
        </div>
      )}

      {/* CELEBRATION PHASE */}
      {phase === 'celebration' && (
        <div className="flex-1 flex flex-col items-center justify-center text-center px-6">
          <h2 className="text-5xl font-bold mb-6 text-white animate-pulse">🎉 Your Twin Awakens!</h2>
          {/* P0-C Gap #4: show the actual grounded insight when we have one —
              falls back to the generic line only when essence had none */}
          <p className="text-xl text-gray-200 mb-4">
            {firstInsight ? `"${firstInsight}"` : '"I know you. I\'ve been learning you. I\'m ready to grow with you."'}
          </p>
          <p className="text-gray-400">Entering Twin world...</p>
        </div>
      )}

      {/* COMPLETE PHASE */}
      {phase === 'complete' && (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-white">Loading Twin interface...</p>
        </div>
      )}
    </div>
  );
}
