/**
 * Onboarding.tsx
 *
 * Phase 3 MEMO V4: Complete onboarding experience
 * 7 steps: Emotion → Nova Conversation → AI Creation → Blueprint → Fine-tune → Analysis → Home
 */

import { useState, useLayoutEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { EmotionSelector } from '@/components/features/EmotionSelector';
import { BirthdateInput } from '@/components/onboarding/BirthdateInput';
import { NovaConversation } from '@/components/onboarding/NovaConversation';
import { AICreationSequence } from '@/components/onboarding/AICreationSequence';
import { InitialBlueprint } from '@/components/onboarding/InitialBlueprint';
import { FinetuningQuestions, QUESTIONS } from '@/components/onboarding/FinetuningQuestions';
import { FullAnalysis } from '@/components/onboarding/FullAnalysis';
import { ClaimAccount } from '@/components/onboarding/ClaimAccount';
import type { PendingOnboardingData } from '@/components/onboarding/ClaimAccount';
import { useEmotion } from '@/context/EmotionContext';
import type { Mood } from '@/context/EmotionContext';
import { useUserStore } from '@/store/userStore';
import { calculateInitialDisciplines, getLifePathProfile } from '@/lib/astrology';
import type { InitialDisciplines } from '@/lib/astrology';

interface AnalysisProfile {
  decisionStyle: string;
  strengths: string[];
  insights: string[];
  opportunities: string[];
  blindSpots: string[];
}

// Used before/instead of a successful /api/nova call (initial blueprint,
// skipped fine-tuning, or a failed API call). Derived from the person's own
// Life Path Number (real numerology calculation, see src/lib/astrology.ts)
// rather than a generic placeholder — onboarding must never get stuck or
// show identical content for every user.
function buildFallbackAnalysisProfile(lifePathNumber: number): AnalysisProfile {
  const p = getLifePathProfile(lifePathNumber);
  return {
    decisionStyle: p.decisionStyle,
    strengths: p.strengths,
    insights: p.insights,
    opportunities: p.opportunities,
    blindSpots: p.blindSpots,
  };
}

// Calls /api/nova (Brain Gateway) to turn the 4 fine-tuning answers into a
// real personality blueprint. Returns null on any failure so the caller can
// fall back to FALLBACK_ANALYSIS_PROFILE instead of breaking onboarding.
async function analyzeFinetuneAnswers(
  answers: Record<string, string>,
  mood: Mood
): Promise<AnalysisProfile | null> {
  try {
    const qaText = QUESTIONS.map(
      (q) => `- ${q.text} → ${answers[q.id] || '(skipped)'}`
    ).join('\n');

    const prompt = `Based on these fine-tuning answers, analyze this person's decision-making style. Write every value in Thai (ภาษาไทย) — decisionStyle, strengths, insights, opportunities, and blindSpots must all be in Thai, not English. Reply with ONLY valid JSON (no markdown fences, no extra text) in exactly this shape:
{"decisionStyle":"<คำอธิบายรูปแบบสั้นๆ 2-4 คำ ภาษาไทย>","strengths":["...","...","...","..."],"insights":["...","...","..."],"opportunities":["...","...","..."],"blindSpots":["...","..."]}

Answers:
${qaText}`;

    const res = await fetch('/api/nova', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [{ role: 'user', content: prompt }],
        hub: 'identity',
        mood,
        autonomy: 50,
      }),
      signal: AbortSignal.timeout(15000),
    });

    if (!res.ok) return null;

    const data = await res.json();
    const raw: string = data.content || '';
    const match = raw.match(/\{[\s\S]*\}/);
    if (!match) return null;

    const parsed = JSON.parse(match[0]);
    if (
      typeof parsed.decisionStyle !== 'string' ||
      !Array.isArray(parsed.strengths) ||
      !Array.isArray(parsed.insights) ||
      !Array.isArray(parsed.opportunities)
    ) {
      return null;
    }

    return {
      decisionStyle: parsed.decisionStyle,
      strengths: parsed.strengths,
      insights: parsed.insights,
      opportunities: parsed.opportunities,
      blindSpots: Array.isArray(parsed.blindSpots) ? parsed.blindSpots : [],
    };
  } catch {
    return null;
  }
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
  const [analysisProfile, setAnalysisProfile] = useState<AnalysisProfile | null>(null);

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
    setAnalysisProfile(buildFallbackAnalysisProfile(disciplines.lifePathNumber));
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
    setAnalysisProfile(buildFallbackAnalysisProfile(disciplines.lifePathNumber));
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

    // Call Brain Gateway (/api/nova) for a real blueprint analysis; fall
    // back to the numerology-based profile if the call fails or is
    // unparseable (never a generic, identical-for-everyone placeholder).
    const refined = await analyzeFinetuneAnswers(answers, mood);
    const lifePathNumber = siceResult?.disciplines.lifePathNumber ?? 1;
    setAnalysisProfile(refined ?? buildFallbackAnalysisProfile(lifePathNumber));

    // Update accuracy to 85%
    setSiceResult((prev) =>
      prev ? { ...prev, accuracy: 85, finetuned: true } : prev
    );
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

  // Handle completion — take the person to the Dashboard so they land on
  // the AI Twin they just built (the "Go to Your Dashboard" button in
  // FullAnalysis promises exactly this). Previously this navigated to
  // /chat instead, which skipped the payoff screen entirely.
  const handleComplete = () => {
    if (onComplete) {
      onComplete();
    } else {
      navigate('/dashboard');
    }
  };

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
                อารมณ์ตอนนี้ของคุณช่วยให้ AI Twin เข้าใจคุณได้ดีขึ้นตั้งแต่แรก
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

      {/* STEP 6: Fine-tuning (4 Questions) */}
      {step === 'fine-tune' && (
        <div
          style={{
            minHeight: '100vh',
            padding: '48px 24px',
          }}
        >
          <FinetuningQuestions
            onSubmit={handleFinetuneSubmit}
            onSkip={() => setStep('complete')}
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
