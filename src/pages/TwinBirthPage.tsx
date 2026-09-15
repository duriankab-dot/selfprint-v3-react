/**
 * TwinBirthPage.tsx — /twin-birth
 * 
 * Dedicated Twin Birth Ceremony route
 * Shows the full awakening/birth experience as a standalone journey
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTwin } from '../context/TwinContext';
import { useLifecycleStore } from '../store/lifecycleStore';
import { useUserStore } from '../store/userStore';
import { useAIContext } from '../context/AIContext';
import { useLanguage } from '../context/LanguageContext';
import { AppShell } from '@/components/layout/AppShell';
import { Twin } from '@/components/twin/Twin';
import { HologramBirth } from '@/components/twin/HologramBirth';
import { TwinNaming } from '@/components/twin/TwinNaming';
import { ProvenanceStrip } from '@/components/story/ProvenanceStrip';
import { startAwakening, initializeTwin, celebrateTwinAwakening } from '../services/CoreAwakeningService';
import { supabase } from '../services/supabase-service';
import { speakTwinGreeting, buildTwinGreeting } from '../lib/twin/twinVoice';
import { primeCelebrationAudio, playCelebrationSound } from '../lib/twin/twinCelebrationSound';
import '../styles/core-awakening.css';

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
  
  const birthDate = useUserStore((state) => state.profile.birthDate);
  const transitionTo = useLifecycleStore((state) => state.transitionTo);
  const setTwinCreated = useLifecycleStore((state) => state.setTwinCreated);

  const [phase, setPhase] = useState<Phase>('intro');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [twinName, setTwinName] = useState('');

  useEffect(() => {
    if (!session?.user?.id) {
      navigate('/login');
      return;
    }
  }, [session, navigate]);

  const handleStartAwakening = async () => {
    if (!session?.user?.id || !birthDate) {
      setError(isTh ? 'กรุณากรอกข้อมูลครบถ้วนก่อนเริ่มต้น' : 'Please complete your baseline first');
      return;
    }

    setIsLoading(true);
    setError(null);
    setPhase('birth');

    try {
      const userId = session.user.id;
      
      // Start awakening process
      const result = await startAwakening(userId, birthDate);
      
      if (!result.success) {
        setError(result.message || (isTh ? 'การเริ่มต้นล้มเหลว' : 'Awakening failed'));
        setPhase('intro');
        return;
      }

      setAwakeningResult(result);

      // Initialize twin in database
      const initSuccess = await withLifecycleRetry(async () => {
        await initializeTwin({
          userId,
          birthDate,
          analysis: result.analysis,
        });
      });

      if (!initSuccess) {
        setError(isTh ? 'การสร้าง Twin ล้มเหลว' : 'Twin creation failed');
        setPhase('intro');
        return;
      }

      // Transition lifecycle
      await withLifecycleRetry(async () => {
        await transitionTo('AWAKENING');
      });

      setTwinCreated();
      setTwinAwakened(true);
      
      // Hydrate twin context
      const { data: twinData } = await supabase
        .from('twins')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (twinData) {
        hydrateTwin(twinData);
        setPhase('naming');
      } else {
        setPhase('celebration');
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg || (isTh ? 'เกิดข้อผิดพลาด' : 'An error occurred'));
      setPhase('intro');
    } finally {
      setIsLoading(false);
    }
  };

  const handleNamingComplete = async (name: string) => {
    setTwinName(name);
    setPhase('celebration');
    
    try {
      // Play celebration sounds
      await primeCelebrationAudio();
      playCelebrationSound();
      
      // Speak twin greeting
      const greeting = buildTwinGreeting(name, isTh);
      speakTwinGreeting(greeting);

      // Celebrate
      await celebrateTwinAwakening(session!.user.id);

      // Transition to active
      await withLifecycleRetry(async () => {
        await transitionTo('TWIN_ALIVE');
      });

      setPhase('complete');
    } catch (err) {
      console.error('Celebration error:', err);
      setPhase('complete');
    }
  };

  const handleContinue = () => {
    navigate('/dashboard');
  };

  if (!session?.user?.id) {
    return null;
  }

  const t = {
    intro: isTh ? 'พิธีเกิดของ Twin คุณ' : 'Your Twin Birth Ceremony',
    introDesc: isTh ? 'ทุกสิ่งเริ่มจากการตื่นรู้ — พร้อมเริ่มต้นหรือยัง?' : 'Everything begins with awakening — are you ready?',
    start: isTh ? 'เริ่มต้นพิธีเกิด' : 'Begin Birth Ceremony',
    namingTitle: isTh ? 'ตั้งชื่อ Twin ของคุณ' : 'Name Your Twin',
    namingDesc: isTh ? 'ชื่อนี้จะสื่อถึงตัวตนที่ Twin สะท้อนกลับให้คุณ' : 'This name will represent the identity Twin reflects back to you',
    celebrationTitle: isTh ? '🎉 พิธีฉลองการเกิด!' : '🎉 Birth Celebration!',
    celebrationDesc: isTh ? 'Twin ของคุณ telahเกิดแล้ว พร้อมที่จะเติบโตไปพร้อมกับคุณ' : 'Your Twin has been born, ready to grow with you',
    completeTitle: isTh ? 'Twin เกิดสมบูรณ์แล้ว!' : 'Twin Born Successfully!',
    completeDesc: isTh ? 'พร้อมสำรวจโลกใหม่ вместе กับ Twin ของคุณ' : 'Ready to explore new worlds with your Twin',
    continue: isTh ? 'ไปที่ Dashboard' : 'Go to Dashboard',
  };

  return (
    <AppShell>
      <div className="core-awakening-page">
        {phase === 'intro' && (
          <div className="ca-intro">
            <h1>{t.intro}</h1>
            <p className="ca-subtitle">{t.introDesc}</p>
            <div className="ca-twin-preview" style={{ margin: '2rem 0' }}>
              <Twin variant="birth" size={200} />
            </div>
            <button
              className="ca-start-btn"
              onClick={handleStartAwakening}
              disabled={isLoading}
            >
              {isLoading ? (isTh ? 'กำลังเตรียม...' : 'Preparing...') : t.start}
            </button>
            {error && <p className="ca-error">{error}</p>}
          </div>
        )}

        {phase === 'birth' && (
          <div className="ca-birth">
            <h1>{t.intro}</h1>
            <div className="ca-hologram">
              <HologramBirth />
            </div>
            <p className="ca-loading">
              {isTh ? 'กำลังสร้าง Twin ของคุณ...' : 'Creating your Twin...'}
            </p>
          </div>
        )}

        {phase === 'naming' && (
          <div className="ca-naming">
            <h1>{t.namingTitle}</h1>
            <p className="ca-subtitle">{t.namingDesc}</p>
            <TwinNaming onComplete={handleNamingComplete} />
          </div>
        )}

        {phase === 'celebration' && (
          <div className="ca-celebration">
            <h1>{t.celebrationTitle}</h1>
            <p className="ca-subtitle">{t.celebrationDesc}</p>
            <div className="ca-twin-reveal">
              <Twin variant="birth" size={250} />
            </div>
            {twinName && (
              <ProvenanceStrip
                title={twinName}
                source="Twin Birth Ceremony"
                confidence={0.95}
              />
            )}
          </div>
        )}

        {phase === 'complete' && (
          <div className="ca-complete">
            <h1>{t.completeTitle}</h1>
            <p className="ca-subtitle">{t.completeDesc}</p>
            <div className="ca-twin-final">
              <Twin variant="alive" size={200} />
            </div>
            <button className="ca-continue-btn" onClick={handleContinue}>
              {t.continue}
            </button>
          </div>
        )}
      </div>
    </AppShell>
  );
}
