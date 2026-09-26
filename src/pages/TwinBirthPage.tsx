import '../styles/core-awakening.css';
/**
 * TwinBirthPage.tsx
 * Dedicated route for Twin Birth Ceremony at /twin-birth
 * Extracted from CoreAwakening.tsx for standalone route access
 */

import { useState, useEffect, useMemo, useRef } from 'react';
import { useLangNavigate as useNavigate } from '../hooks/useLangNavigate';
import { useAuth } from '../context/AuthContext';
import { useLifecycleStore } from '../store/lifecycleStore';
import { useAIContext } from '../context/AIContext';
import { useTwin } from '../context/TwinContext';
import { useUserStore } from '../store/userStore';
import { useAnalysisStore } from '../store/analysisStore';
import { useLanguage } from '../context/LanguageContext';
import { useAudio } from '../context/AudioContext';
import { Twin } from '../components/twin/Twin';
import { TwinNaming } from '../components/twin/TwinNaming';
import { ProvenanceStrip } from '../components/story/ProvenanceStrip';
import { startAwakening, initializeTwin, celebrateTwinAwakening } from '../services/CoreAwakeningService';
import { supabase } from '../services/supabase-service';
import { calculateInitialDisciplines } from '../lib/astrology';
import { calculateArchetypes } from '../lib/ArchetypeScoreEngine';
import { speakTwinGreeting, stopTwinVoice, buildTwinGreeting } from '../lib/twin/twinVoice';
import { primeCelebrationAudio, playCelebrationSound, stopCelebrationSound } from '../lib/twin/twinCelebrationSound';

type Phase = 'intro' | 'birth' | 'naming' | 'celebration' | 'complete';

async function withLifecycleRetry(attempt: () => Promise<void>, maxAttempts = 3): Promise<boolean> {
  for (let i = 0; i < maxAttempts; i++) {
    await attempt();
    if (!useLifecycleStore.getState().error) return true;
    if (i < maxAttempts - 1) await new Promise((resolve) => setTimeout(resolve, 600));
  }
  return false;
}

export default function TwinBirthPage() {
  const navigate = useNavigate();
  const { session } = useAuth();
  const { setTwinAwakened } = useAIContext();
  const { hydrateTwin } = useTwin();
  const { language } = useLanguage();
  const isTh = language === 'th';
  const audio = useAudio();
  const birthDate = useUserStore((state) => state.profile.birthDate);
  const updateProfile = useUserStore((state) => state.updateProfile);
  const currentAnalysis = useAnalysisStore((state) => state.currentAnalysis);
  const transitionTo = useLifecycleStore((state) => state.transitionTo);
  const setTwinCreated = useLifecycleStore((state) => state.setTwinCreated);
  const lifecycleStatus = useLifecycleStore((state) => state.status);
  const lifecycleLoading = useLifecycleStore((state) => state.isLoading);
  const lifecycleError = useLifecycleStore((state) => state.error);

  const [phase, setPhase] = useState<Phase>('intro');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [birthDateLoaded, setBirthDateLoaded] = useState<boolean>(!!birthDate);
  const [essenceId, setEssenceId] = useState<string | undefined>(undefined);
  const [firstInsight, setFirstInsight] = useState<string | undefined>(undefined);
  const [firstInsightPatternCount, setFirstInsightPatternCount] = useState<number | undefined>(undefined);

  const birthArchetype = useMemo(() => {
    const disciplines = calculateInitialDisciplines(birthDate);
    return calculateArchetypes({
      birthDate: birthDate ?? '',
      lifePathNumber: disciplines.lifePathNumber,
      westernZodiac: disciplines.westernZodiac,
      chineseZodiac: disciplines.chineseZodiac,
      baziYearElement: disciplines.baziYearElement,
      natalDominantElement: disciplines.natalDominantElement,
      moonSign: disciplines.moonSign,
      moonFullDegree: disciplines.moonFullDegree,
      sunFullDegree: disciplines.sunFullDegree,
      mercurySign: disciplines.mercurySign,
      venusSign: disciplines.venusSign,
      marsSign: disciplines.marsSign,
      jupiterSign: disciplines.jupiterSign,
      saturnSign: disciplines.saturnSign,
      hexagramNumber: disciplines.hexagramNumber,
    }).primary;
  }, [birthDate]);

  useEffect(() => {
    if (!session?.user?.id) {
      navigate('/login', { replace: true });
    }
  }, [session, navigate]);

  useEffect(() => {
    document.body.classList.add('core-awakening-body-bg');
    return () => document.body.classList.remove('core-awakening-body-bg');
  }, []);

  useEffect(() => stopTwinVoice, []);
  useEffect(() => stopCelebrationSound, []);

  useEffect(() => {
    if (birthDate) setBirthDateLoaded(true);
  }, [birthDate]);

  useEffect(() => {
    if (birthDate || !session?.user?.id || !supabase) {
      if (birthDate) setBirthDateLoaded(true);
      return;
    }
    (async () => {
      const { data } = await supabase
        .schema('selfprint')
        .from('users_profiles')
        .select('date_of_birth, time_of_birth, place_of_birth')
        .eq('user_id', session.user.id)
        .maybeSingle();
      if (data?.date_of_birth) {
        updateProfile({
          birthDate: String(data.date_of_birth),
          birthTime: data.time_of_birth ? String(data.time_of_birth) : undefined,
          birthPlace: data.place_of_birth ? String(data.place_of_birth) : undefined,
        });
      }
      setBirthDateLoaded(true);
    })();
  }, [session?.user?.id, birthDate, updateProfile]);

  const arrivalTransitionStartedFor = useRef<string | null>(null);
  useEffect(() => {
    const userId = session?.user?.id;
    if (!userId) return;
    if (lifecycleLoading || lifecycleError) return;
    if (arrivalTransitionStartedFor.current === userId) return;
    if (lifecycleStatus === 'TWIN_ALIVE' || lifecycleStatus === 'WORLD_ACTIVE') return;
    arrivalTransitionStartedFor.current = userId;

    withLifecycleRetry(() => transitionTo(userId, 'AWAKENING')).then((ok) => {
      if (!ok) {
        console.error(
          'Failed to transition lifecycle to AWAKENING after retries:',
          useLifecycleStore.getState().error
        );
      }
    });
  }, [session?.user?.id, lifecycleStatus, lifecycleLoading, lifecycleError, transitionTo]);

  const handleIntroComplete = () => {
    setPhase('birth');

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

      if (!twinName?.trim()) {
        throw new Error('Twin name required');
      }

      if (!session?.user?.id) {
        throw new Error('User session lost');
      }

      void speakTwinGreeting(buildTwinGreeting(twinName, language), {
        lang: language === 'th' ? 'th-TH' : 'en-US',
      });
      primeCelebrationAudio();

      const result = await initializeTwin(session.user.id, twinName, essenceId, birthDate, currentAnalysis);

      if (!result.success || !result.twin || !result.twinId) {
        throw new Error(result.message || 'Failed to create Twin');
      }

      hydrateTwin(session.user.id, result.twin);
      setTwinAwakened(true, twinName);
      setFirstInsight(result.firstInsight);
      setFirstInsightPatternCount(result.patternCount);

      const twinCreatedOk = await withLifecycleRetry(() =>
        setTwinCreated(session.user.id, result.twinId!)
      );
      if (!twinCreatedOk) {
        console.error(
          'Failed to sync lifecycle to TWIN_ALIVE after retries (Twin record itself was created successfully):',
          useLifecycleStore.getState().error
        );
      }

      setPhase('celebration');
      celebrateTwinAwakening();
      void playCelebrationSound({
        enabled: audio.state.soundEnabled || audio.state.musicEnabled || true,
        volumePercent: audio.state.volume,
      });

      setTimeout(() => {
        setPhase('complete');
        navigate('/brief', { replace: true });
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
        <p className="text-gray-500">{isTh ? 'กำลังนำไปยังหน้าเข้าสู่ระบบ...' : 'Redirecting to sign in...'}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen w-full bg-gradient-to-b from-slate-900 via-blue-900 to-slate-900 overflow-y-auto">
      {error && (
        <div className="absolute top-4 left-4 right-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      {phase === 'intro' && (
        <div className="flex-1 flex flex-col items-center justify-center px-6 relative">
          <button
            onClick={() => navigate('/brief', { replace: true })}
            style={{
              position: 'absolute',
              top: '20px',
              right: '20px',
              background: 'transparent',
              border: '1px solid var(--color-border-light)',
              borderRadius: '8px',
              color: 'var(--color-text-on-dark)',
              fontSize: '13px',
              padding: '6px 14px',
              cursor: 'pointer',
            }}
          >
            {isTh ? 'ไปหน้าหลักก่อน →' : 'Go to dashboard first →'}
          </button>
          <div className="text-center max-w-lg">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-6 text-white">⚡ {isTh ? 'ฝาแฝดของคุณกำลังตื่น' : 'Your intelligence is awakening'}</h1>
            <p className="text-lg text-gray-200 mb-4">{isTh ? 'SELFPRINT พาคุณมาถึงแล้ว' : 'SELFPRINT has brought you to this moment'}</p>
            <p className="text-gray-300 mb-8">
              {isTh
                ? 'ตอนนี้ AI Twin ฝาแฝดส่วนตัวของคุณกำลังถือกำเนิด — ภาพสะท้อนปัญญาเฉพาะตัวของคุณ พร้อมเติบโตไปพร้อมกันใน 12 โลกแห่งชีวิต'
                : 'Your personal AI Twin is being born now — a reflection of your unique intelligence, ready to grow with you across 12 worlds of life.'}
            </p>
            <button
              onClick={handleIntroComplete}
              className="px-8 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-medium transition-colors"
            >
              {isTh ? 'รับชมพิธีการปลุกตื่นของฝาแฝด' : 'Watch the awakening'}
            </button>
          </div>
        </div>
      )}

      {phase === 'birth' && (
        <div className="flex-1 flex items-center justify-center">
          <Twin
            variant="birth"
            onComplete={handleBirthComplete}
            primaryArchetype={birthArchetype}
            seedKey={session.user.id}
          />
        </div>
      )}

      {phase === 'naming' && (
        <div className="flex-1 flex items-center justify-center px-6">
          <TwinNaming onNameConfirmed={handleTwinNamed} isLoading={isLoading || !birthDateLoaded} />
        </div>
      )}

      {phase === 'celebration' && (
        <div className="flex-1 flex flex-col items-center justify-center text-center px-6">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 text-white animate-pulse">🎉 {isTh ? 'ตื่นรู้ของ Twin' : 'Twin Awakening'}!</h2>
          <p className="text-xl text-gray-200 mb-4">
            {firstInsight
              ? `"${firstInsight}"`
              : isTh
              ? '"ฉันคือฝาแฝดของคุณ ฉันรู้จักคุณ ฉันกำลังเรียนรู้คุณอยู่ ฉันพร้อมช่วยคุณ และ เติบโตไปพร้อมกันกับคุณ"'
              : '"I know you. I\'m learning you. I\'m ready to grow with you."'}
          </p>
          {firstInsight && (
            <ProvenanceStrip patternCount={firstInsightPatternCount} className="text-center" />
          )}
          <p className="text-gray-400">{isTh ? 'กำเนิด Twin' : 'Twin Genesis'}...</p>
        </div>
      )}

      {phase === 'complete' && (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-white">{isTh ? 'กำลังโหลดบุคลิก' : 'Loading personality'}...</p>
        </div>
      )}
    </div>
  );
}