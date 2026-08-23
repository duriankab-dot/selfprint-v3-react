/**
 * Onboarding.tsx
 *
 * Phase 3 MEMO V4: Complete onboarding experience
 * 7 steps: Emotion → Nova Conversation → AI Creation → Blueprint → Fine-tune → Analysis → Home
 */

import { useState, useLayoutEffect, useRef, useEffect } from 'react';
import { useLangNavigate as useNavigate } from '../hooks/useLangNavigate';
import { useLifecycleStore } from '@/store/lifecycleStore';
import { useAuth } from '@/context/AuthContext';
import { EmotionSelector } from '@/components/features/EmotionSelector';
import { BirthdateInput } from '@/components/onboarding/BirthdateInput';
import { NovaConversation } from '@/components/onboarding/NovaConversation';
import { AICreationSequence } from '@/components/onboarding/AICreationSequence';
import { InitialBlueprint } from '@/components/onboarding/InitialBlueprint';
import { FinetuningQuestions } from '@/components/onboarding/FinetuningQuestions';
import { FullAnalysis } from '@/components/onboarding/FullAnalysis';
import { ClaimAccount } from '@/components/onboarding/ClaimAccount';
import type { PendingOnboardingData } from '@/components/onboarding/ClaimAccount';
import { useEmotion } from '@/context/EmotionContext';
import type { Mood } from '@/context/EmotionContext';
import { useUserStore } from '@/store/userStore';
import { calculateInitialDisciplines, getLifePathProfile } from '@/lib/astrology';
import type { InitialDisciplines } from '@/lib/astrology';
import { buildFallbackResponse } from '@/lib/astrovera-adapter';
import type { AnalysisResponse } from '@/lib/types/astrovera';
// GAP-2: Quick Analysis → Full Journey data continuity
import { useAnalysisStore } from '@/store/analysisStore';

// The standalone Express backend (server/, POST /api/intelligence) that this
// used to call has been retired — the 12-SICE analysis now runs client-side
// via src/services/sice/SICEOrchestrator.ts. This function always used to
// fail in production anyway (VITE_BACKEND_URL was never set, so it fell
// back to http://localhost:3001, which every visitor's browser refused to
// connect to). Confirmed with the project owner 2026-08-22 that the old
// backend is not coming back. Removed the dead network call entirely —
// callers already fall back to buildFallbackResponse(), so behavior for the
// end user is unchanged, just without the wasted round trip and console
// error on every onboarding.
async function analyzeWithAstrovera(
  _answers: Record<string, string>,
  _mood: Mood,
  _birthDate: string
): Promise<AnalysisResponse | null> {
  return null;
}

/**
 * ONBOARDING-LOOP-001: lifecycleStore.transitionTo() never rejects — on
 * failure it catches internally and sets `error` on the store instead
 * (see src/store/lifecycleStore.ts). handleComplete() previously called it
 * fire-and-forget and navigated to /core-awakening regardless, so a failed
 * write (backend slow/timeout — confirmed via live testing, multiple 504s
 * across /api/profile, /api/blueprint, /api/stripe/subscription at the same
 * time) left user_lifecycle.status stuck at 'ONBOARDING' in the database
 * while the UI had already moved on. Any later fresh app mount (magic-link
 * email opened in a new tab, mobile tab reload, hard refresh) re-fires
 * useRecoveryRoute.ts, which reads that stale DB status and sends the user
 * straight back to /onboarding — this is the "onboarding วนซ้ำ ข้ามไม่ได้"
 * loop reported during testing.
 *
 * Retries a few times (transient timeouts are exactly what's happening
 * right now) before surfacing a visible retry UI — never silently
 * navigating forward on a write we don't actually know succeeded.
 */
async function withLifecycleRetry(attempt: () => Promise<void>, maxAttempts = 3): Promise<boolean> {
  for (let i = 0; i < maxAttempts; i++) {
    await attempt();
    if (!useLifecycleStore.getState().error) return true;
    if (i < maxAttempts - 1) await new Promise((resolve) => setTimeout(resolve, 600));
  }
  return false;
}

type OnboardingStep =
  | 'emotion'
  | 'nova-conversation'
  | 'ai-creation'
  | 'birthdate'
  | 'sice-result'
  | 'fine-tune'
  | 'complete'
  | 'claim-account';

interface OnboardingProps {
  onComplete?: () => void;
}

export default function Onboarding({ onComplete }: OnboardingProps) {
  const navigate = useNavigate();
  const { mood, hasCheckedIn } = useEmotion();
  const { updateProfile, profile } = useUserStore();
  const { session } = useAuth();
  const transitionTo = useLifecycleStore((state) => state.transitionTo);

  // Guard against re-entry — if user already passed ONBOARDING, redirect.
  // LOOP-002 FIX: this used to depend on [status, navigate] and re-fire on
  // EVERY status change, not just check once on arrival. lifecycleStore's
  // status is loaded async (starts at the store's default, then updates
  // once loadLifecycle() resolves) — reacting to every change meant that if
  // status ever briefly disagreed with "still onboarding" while the person
  // was actively answering questions, this bounced them to /analysis mid
  // quiz, and the guard on /analysis had nothing to show yet (analysis
  // data lives in this component's own local state), producing the
  // reported back-and-forth loop between onboarding and analysis. Now it
  // only checks once, right when the page first has a real status.
  const status = useLifecycleStore((state) => state.status);
  const isLifecycleLoading = useLifecycleStore((state) => state.isLoading);
  const hasCheckedReentry = useRef(false);
  useEffect(() => {
    if (isLifecycleLoading || hasCheckedReentry.current) return;
    hasCheckedReentry.current = true;
    if (status && status !== 'ONBOARDING') {
      navigate('/analysis', { replace: true });
    }
  }, [status, isLifecycleLoading, navigate]);

  const [step, setStep] = useState<OnboardingStep>('emotion');
  const [siceResult, setSiceResult] = useState<{
    accuracy: number;
    disciplines: InitialDisciplines;
    finetuned?: boolean;
  } | null>(null);
  const [birthData, setBirthData] = useState<{
    dob: string;
    time?: string;
    place?: string;
  } | null>(null);
  const [analysisProfile, setAnalysisProfile] = useState<AnalysisResponse | null>(null);

  // GAP-2: Quick Analysis → Full Journey data continuity
  // If the user completed a Quick Analysis (AnalysisPage → analysisStore) before
  // entering the Full Onboarding, we can skip the analysis re-generation step
  // and pre-populate disciplines. This runs once on mount.
  const quickAnalysisData = useAnalysisStore((state) => state.currentAnalysis);
  const hasInitializedFromQuick = useRef(false);
  useEffect(() => {
    if (hasInitializedFromQuick.current) return;
    if (!quickAnalysisData) return;
    hasInitializedFromQuick.current = true;

    // Transfer birth data from userStore if available (set during quick analysis BirthDataInput)
    const storedDob = profile.birthDate ?? localStorage.getItem('birth_dob') ?? '';
    if (storedDob && !birthData) {
      setBirthData({
        dob: storedDob,
        time: profile.birthTime ?? localStorage.getItem('birth_time') ?? undefined,
        place: profile.birthPlace ?? localStorage.getItem('birth_place') ?? undefined,
      });
    }

    // Pre-populate siceResult from quick analysis confidence so onboarding
    // shows the user's real accuracy level instead of the default 60%.
    const disciplines = calculateInitialDisciplines(profile.birthDate ?? storedDob);
    const accuracy = Math.round((quickAnalysisData as { confidence?: number }).confidence ?? 0.6 * 100);
    setSiceResult({ accuracy, disciplines });
    // Note: setAnalysisProfile not populated here — AnalysisResponse ≠ FullAnalysisOutput.
    // The user will still go through fine-tuning for maximum accuracy.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // GAP-RESUME: Persist step so user can resume onboarding from where they left off.
  // Saves a lightweight snapshot whenever step advances; restores it on mount
  // for returning ONBOARDING-status users who closed mid-flow.
  const RESUME_STORAGE_KEY = 'selfprint_onboarding_resume';
  const hasRestoredStep = useRef(false);

  // Save step + birth data on every step change (skip initial 'emotion' state — nothing to resume from there)
  useEffect(() => {
    if (step === 'emotion') return;
    try {
      localStorage.setItem(RESUME_STORAGE_KEY, JSON.stringify({
        step,
        dob: birthData?.dob ?? profile.birthDate ?? '',
        time: birthData?.time ?? profile.birthTime,
        place: birthData?.place ?? profile.birthPlace,
        accuracy: siceResult?.accuracy,
      }));
    } catch { /* storage unavailable — silent ignore */ }
  }, [step]); // eslint-disable-line react-hooks/exhaustive-deps

  // Restore saved step on mount. Skips if GAP-2 quick-analysis init already populated state.
  // Only restores steps that have enough prior state data (sice-result, fine-tune, complete).
  useEffect(() => {
    if (hasRestoredStep.current || hasInitializedFromQuick.current) return;
    hasRestoredStep.current = true;
    try {
      const saved = localStorage.getItem(RESUME_STORAGE_KEY);
      if (!saved) return;
      const data = JSON.parse(saved) as {
        step: OnboardingStep; dob?: string; time?: string; place?: string; accuracy?: number;
      };
      const resumable: OnboardingStep[] = ['sice-result', 'fine-tune', 'complete'];
      if (!resumable.includes(data.step)) return;
      const dob = data.dob || profile.birthDate || localStorage.getItem('birth_dob') || '';
      if (!dob) return;
      if (!birthData) setBirthData({ dob, time: data.time, place: data.place });
      if (!siceResult) setSiceResult({ accuracy: data.accuracy ?? 65, disciplines: calculateInitialDisciplines(dob) });
      setStep(data.step);
    } catch { /* corrupted data — start fresh */ }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ONBOARDING-LOOP-001: see withLifecycleRetry() above.
  const [lifecycleError, setLifecycleError] = useState<string | null>(null);
  const [isCompletingLifecycle, setIsCompletingLifecycle] = useState(false);

  // Handle emotion selection and proceed to Nova.
  // If the person already gave their birth date on the landing page
  // (BirthDataInput at the bottom of "/"), skip re-asking via Nova and go
  // straight to the AI Creation animation with that data.
  const handleEmotionSelected = () => {
    if (profile.birthDate) {
      setBirthData({
        dob: profile.birthDate,
        time: profile.birthTime,
        place: profile.birthPlace,
      });
      setStep('ai-creation');
    } else {
      setStep('nova-conversation');
    }
  };

  // ถ้าผู้ใช้เช็คอินอารมณ์มาแล้ว (เช่นจากหน้าแรก) ไม่ต้องถามซ้ำใน onboarding
 // ถ้าผู้ใช้ใาข้อมูลวันเกิดมาแล้ว (เช่นจากหน้าแรก) ไม่ต้องถามซ้ำใน onboarding
  // ข้าม step 'emotion' ไปเลย ด้วย logic เดียวกับตอนกดปุ่ม "ไปต่อ" เอง
  // ใช้ useLayoutEffect (รันก่อน paint) + ref กันไม่ให้ยิงซ้ำ เพื่อไม่ให้เห็นหน้าจอกระพริบ
  const hasAutoSkippedEmotion = useRef(false);
  useLayoutEffect(() => {
    if (hasCheckedIn && step === 'emotion' && !hasAutoSkippedEmotion.current) {
      hasAutoSkippedEmotion.current = true;
      handleEmotionSelected();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasCheckedIn]);

  // Handle Nova conversation completion
  const handleNovaComplete = (data: {
    dob: string;
    time?: string;
    place?: string;
  }) => {
    setBirthData(data);
    updateProfile({
      birthDate: data.dob,
      birthTime: data.time,
      birthPlace: data.place,
    });
    // Show AI Creation Sequence animation
    setStep('ai-creation');
  };

  // Handle AI Creation Sequence completion — compute the initial 60%
  // blueprint from real numerology/zodiac, not placeholder data.
  // calculateInitialDisciplines tolerates a missing/unparseable dob (falls
  // back to today's date internally) so this always advances the flow —
  // it must never leave the user stuck on the animation screen.
  const handleAICreationComplete = () => {
    const disciplines = calculateInitialDisciplines(birthData?.dob);
    setSiceResult({ accuracy: 60, disciplines });
    setAnalysisProfile(
      buildFallbackResponse({ mood, birthDate: birthData?.dob ?? '', finetuneAnswers: {} })
    );
    setStep('sice-result');
  };

  // Handle birthdate form submit (legacy fallback)
  const handleBirthdateSubmit = () => {
    if (!birthData) return;

    updateProfile({
      birthDate: birthData.dob,
      birthTime: birthData.time,
      birthPlace: birthData.place,
    });

    const disciplines = calculateInitialDisciplines(birthData.dob);
    setSiceResult({ accuracy: 60, disciplines });
    setAnalysisProfile(
      buildFallbackResponse({ mood, birthDate: birthData.dob, finetuneAnswers: {} })
    );
    setStep('sice-result');
  };

  // Handle fine-tuning completion
  const handleFinetuneSubmit = async (answers: Record<string, string>) => {
    // Store fine-tuning answers for analysis
    const finetuneData = {
      answers,
      timestamp: new Date().toISOString(),
    };
    localStorage.setItem('finetune_answers', JSON.stringify(finetuneData));

    // Call /api/intelligence (Astrovera Psychology, Phase 5.2) for a real
    // blueprint analysis; fall back to the numerology-based profile if the
    // call fails at the network level (never a generic, identical-for-
    // everyone placeholder).
    const birthDate = birthData?.dob ?? '';
    const refined = await analyzeWithAstrovera(answers, mood, birthDate);
    const result =
      refined ?? buildFallbackResponse({ mood, birthDate, finetuneAnswers: answers });
    setAnalysisProfile(result);

    // Accuracy now reflects the real confidence from the analysis (0.6 for
    // the Life Path fallback, whatever Claude/Astrovera returned otherwise)
    // instead of a hardcoded 85% regardless of outcome.
    const accuracy = Math.round(result.confidence * 100);
    setSiceResult((prev) => (prev ? { ...prev, accuracy, finetuned: true } : prev));
    setStep('complete');
  };

  const pendingOnboardingData: PendingOnboardingData = {
    profile: {
      dateOfBirth: birthData?.dob,
      timeOfBirth: birthData?.time,
      placeOfBirth: birthData?.place,
      initialMood: mood,
    },
    blueprint: {
      accuracyLevel: siceResult?.accuracy || 85,
      decisionStyle: analysisProfile?.decisionStyle,
      strengths: analysisProfile?.strengths,
      insights: analysisProfile?.insights,
      opportunities: analysisProfile?.opportunities,
      blindSpots: analysisProfile?.blindSpots,
      prototypeCore: siceResult?.disciplines.prototypeCore,
      source: siceResult?.finetuned ? 'refined' : 'initial',
    },
  };

  // Handle completion — take the person into Core Awakening (wow2: "your
  // intelligence awakens" -> wow3: Twin birth ceremony), not straight to
  // the dashboard. WOW-CONNECT-001 FIX: this used to skip Core Awakening
  // entirely and land on an empty dashboard with no Twin, even though
  // CoreAwakening.tsx (intro -> HologramBirth -> naming -> celebration,
  // full-screen) was already fully built — nothing ever routed here after
  // onboarding finished. CoreAwakening.tsx's own guard already handles the
  // ANALYSIS -> AWAKENING transition on arrival and won't downgrade a user
  // who's already past this stage (TWIN_ALIVE/WORLD_ACTIVE), so this
  // handler only needs to get them there.
  const handleComplete = async () => {
    // GAP-RESUME: onboarding done — clear the resume snapshot so a future visit starts fresh
    try { localStorage.removeItem(RESUME_STORAGE_KEY); } catch { /* ignore */ }

    // LIFECYCLE-002 FIX: nothing anywhere in the onboarding -> claim-account
    // path ever advanced user_lifecycle.status past 'ONBOARDING'. That
    // meant useRecoveryRoute — which faithfully sends the user to
    // routeMap[status] once per fresh page load — kept bouncing people
    // right back to /onboarding on every refresh even after they'd
    // finished the wizard, because the DB record genuinely still said
    // ONBOARDING. Advancing to ANALYSIS here (mirroring the ONBOARDING ->
    // ANALYSIS -> AWAKENING -> TWIN_ALIVE -> WORLD_ACTIVE machine in
    // lifecycleStore.ts) is what should have happened the moment
    // onboarding actually completed.
    //
    // ONBOARDING-LOOP-001 FIX: this used to fire transitionTo() and
    // navigate() immediately regardless of whether the write succeeded —
    // see withLifecycleRetry()'s comment above for the full loop this
    // caused. Now it retries, and only navigates once the write is
    // confirmed (or gives the user a visible, retryable error instead of
    // silently proceeding into a state the database doesn't reflect).
    setLifecycleError(null);

    if (session?.user?.id) {
      setIsCompletingLifecycle(true);
      const ok = await withLifecycleRetry(() => transitionTo(session.user.id, 'ANALYSIS'));
      setIsCompletingLifecycle(false);

      if (!ok) {
        setLifecycleError(
          useLifecycleStore.getState().error || 'ไม่สามารถบันทึกความคืบหน้าได้ กรุณาลองอีกครั้ง'
        );
        return;
      }
    }

    if (onComplete) {
      onComplete();
    } else {
      navigate('/core-awakening');
    }
  };

  // ONBOARDING-LOOP-001: shown instead of the claim-account step when the
  // lifecycle write fails even after retries — visible + retryable, not a
  // silent forward-navigation into a state the database doesn't reflect.
  if (lifecycleError) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '48px 24px',
          textAlign: 'center',
          backgroundColor: 'var(--color-bg-primary)',
          color: 'var(--color-text-primary)',
        }}
      >
        <div style={{ maxWidth: '440px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '12px' }}>
            บันทึกความคืบหน้าไม่สำเร็จ
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', marginBottom: '24px' }}>
            {lifecycleError} — เชื่อมต่อกับเซิร์ฟเวอร์ช้าหรือขาดหาย ข้อมูล AI Twin ของคุณยังอยู่
            ลองอีกครั้งได้เลย
          </p>
          <button
            onClick={handleComplete}
            disabled={isCompletingLifecycle}
            style={{
              padding: '12px 32px',
              borderRadius: '8px',
              border: 'none',
              background: 'var(--color-accent-primary)',
              color: 'white',
              fontWeight: 600,
              cursor: isCompletingLifecycle ? 'not-allowed' : 'pointer',
              fontSize: '15px',
              opacity: isCompletingLifecycle ? 0.7 : 1,
            }}
          >
            {isCompletingLifecycle ? 'กำลังลองอีกครั้ง...' : 'ลองอีกครั้ง'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: 'var(--color-bg-primary)',
        color: 'var(--color-text-primary)',
        fontFamily: "'Inter', 'Noto Sans Thai', sans-serif",
        transition: 'background-color 0.3s ease',
      }}
    >
      {/* ทางออกเล็กๆ กลับหน้าแรก — ตั้งใจไม่ใส่ NavBar เต็มรูปแบบเพื่อไม่ให้
          รบกวน flow แบบมีสมาธิของ onboarding แต่ยังต้องมีทางออกกรณีอยากออก */}
      <a
        href="/"
        style={{
          position: 'fixed',
          top: '16px',
          left: '16px',
          zIndex: 300,
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          padding: '6px 12px',
          borderRadius: '8px',
          background: 'var(--color-bg-secondary)',
          border: '1px solid var(--color-border)',
          color: 'var(--color-text-secondary)',
          fontSize: '13px',
          fontWeight: 600,
          textDecoration: 'none',
          opacity: 0.85,
        }}
      >
        <img src="/favicon.svg" alt="" width={16} height={16} style={{ display: 'block' }} />
        SelfPrint
      </a>

      {/* STEP 1: Emotion Selector */}
      {step === 'emotion' && (
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '48px 24px',
          }}
        >
          <div style={{ maxWidth: '600px', width: '100%' }}>
            <div style={{ textAlign: 'center', marginBottom: '48px' }}>
              <h1
                style={{
                  fontSize: '28px',
                  fontWeight: 700,
                  marginBottom: '16px',
                }}
              >
                วันนี้คุณรู้สึกยังไง?
              </h1>
              <p
                style={{
                  fontSize: '16px',
                  color: 'var(--color-text-secondary)',
                  lineHeight: 1.6,
                }}
              >
                อารมณ์ตอนนี้ของคุณจะช่วยให้ ฝาแฝด เข้าใจคุณได้ดีขึ้นตั้งแต่แรก
              </p>
            </div>
            <EmotionSelector />
            <div style={{ marginTop: '32px', textAlign: 'center' }}>
              <button
                onClick={() => handleEmotionSelected()}
                style={{
                  padding: '12px 32px',
                  borderRadius: '8px',
                  border: 'none',
                  background: 'var(--color-accent-primary)',
                  color: 'white',
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontSize: '16px',
                  transition: 'opacity 0.2s',
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.opacity = '0.8')
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.opacity = '1')
                }
              >
                ไปต่อ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STEP 2: Nova Conversation */}
      {step === 'nova-conversation' && (
        <div style={{ paddingTop: '0' }}>
          <NovaConversation
            mood={mood}
            onComplete={handleNovaComplete}
          />
        </div>
      )}

      {/* STEP 3: AI Creation Sequence Animation (2-3 sec) */}
      {step === 'ai-creation' && (
        <div style={{ paddingTop: '0' }}>
          <AICreationSequence onComplete={handleAICreationComplete} />
        </div>
      )}

      {/* STEP 4: Birth Date (Legacy - shown if needed) */}
      {step === 'birthdate' && (
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '48px 24px',
          }}
        >
          <BirthdateInput onSubmit={handleBirthdateSubmit} />
        </div>
      )}

      {/* STEP 5: Initial Blueprint (60-70% Accuracy) */}
      {step === 'sice-result' && siceResult && (
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'var(--color-bg-primary)',
          }}
        >
          <InitialBlueprint
            profile={{
              decisionStyle:
                getLifePathProfile(siceResult.disciplines.lifePathNumber).decisionStyle,
              strengths: getLifePathProfile(siceResult.disciplines.lifePathNumber).strengths.slice(0, 2),
              blindSpot: getLifePathProfile(siceResult.disciplines.lifePathNumber).blindSpots[0],
            }}
            prototypeCore={siceResult.disciplines.prototypeCore}
            accuracy={60}
            ctaSource={localStorage.getItem('landing_cta_source') || undefined}
            onContinue={() => setStep('fine-tune')}
            onSkip={() => setStep('fine-tune')}
          />
        </div>
      )}

      {/* STEP 6: Fine-tuning (5 Questions) */}
      {step === 'fine-tune' && (
        <div
          style={{
            minHeight: '100vh',
            padding: '48px 24px',
          }}
        >
          <FinetuningQuestions
            onSubmit={handleFinetuneSubmit}
            onSkip={() => {
              // GAP-RESUME fix: when restored from localStorage, analysisProfile is null
              // (not persisted — AnalysisResponse is too complex). Generate a fallback
              // before advancing so the 'complete' step always has a profile to render.
              if (!analysisProfile) {
                const birthDate = birthData?.dob ?? '';
                setAnalysisProfile(
                  buildFallbackResponse({ mood, birthDate, finetuneAnswers: {} })
                );
              }
              setStep('complete');
            }}
          />
        </div>
      )}

      {/* STEP 7: Complete (Full Analysis - 85%+ Accuracy) */}
      {step === 'complete' && siceResult && analysisProfile && (
        <FullAnalysis
          profile={analysisProfile}
          prototypeCore={siceResult.disciplines.prototypeCore}
          accuracy={siceResult.accuracy || 85}
          onHome={() => setStep('claim-account')}
        />
      )}

      {/* STEP 8: Claim Account (magic link + save profile/blueprint) */}
      {step === 'claim-account' && (
        <ClaimAccount data={pendingOnboardingData} onDone={handleComplete} />
      )}
    </div>
  );
}
