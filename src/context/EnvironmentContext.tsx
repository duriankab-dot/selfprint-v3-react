/**
 * EnvironmentContext.tsx
 *
 * Master Direction §46 — Advanced Adaptive Environments
 *
 * React context layer ที่ขับเคลื่อน EnvironmentEngine
 *
 * ทำหน้าที่:
 *   1. คำนวณ EnvironmentConfig จาก hub + mood + time (ทุก 60 วินาที)
 *   2. Inject --tod-* / --env-* / --lighting-* / --particles-* / --twin-* CSS vars ลงใน :root
 *   3. Set data-tod attribute บน <html> (สำหรับ time-of-day CSS selectors)
 *   4. Set data-twin-state attribute บน <html> (สำหรับ Twin avatar styling)
 *   5. Sync recommendedExperience ไปยัง AudioContext.setExperience()
 *      — เฉพาะเมื่อ period เปลี่ยน (contextual transition)
 *      — ไม่ override ถ้า user ปิด music (musicEnabled = false)
 *   6. Expose useEnvironment() hook สำหรับ components
 *
 * §19 Rule: User Preference > AI Personalization
 *   - ไม่ force-set audio ถ้า musicEnabled = false
 *   - soundscape เป็นแค่ recommendation — user ควบคุม on/off ได้ใน AudioContext
 */

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useMemo,
  useCallback,
} from 'react';
import type { ReactNode } from 'react';

import { useHub } from './HubContext';
import { useEmotion } from './EmotionContext';
import { useAudio } from './AudioContext';
import { EnvironmentEngine } from '@/lib/experience/EnvironmentEngine';
import type { EnvironmentConfig } from '@/lib/experience/EnvironmentEngine';
import type { TimePeriod } from '@/lib/experience/TimeOfDayEngine';

// ─── Context Type ─────────────────────────────────────────────────────────────

interface EnvironmentContextType {
  /** Full environment config — null หากยังไม่ compute ครั้งแรก */
  environment: EnvironmentConfig | null;
  /**
   * true ระหว่าง transition animation (ระยะ 800ms)
   * Components ที่ต้องการ fade/transition ใช้ flag นี้ได้
   */
  isTransitioning: boolean;
  /** Force recompute ทันที (เช่น user เปลี่ยน hub/mood ด้วยตัวเอง) */
  refresh: () => void;
}

const EnvironmentContext = createContext<EnvironmentContextType>({
  environment: null,
  isTransitioning: false,
  refresh: () => {},
});

// ─── Provider ─────────────────────────────────────────────────────────────────

/** Tick interval: ตรวจ period ทุก 60 วินาที */
const TICK_INTERVAL_MS = 60_000;

/** Transition animation duration: 800ms */
const TRANSITION_DURATION_MS = 800;

export function EnvironmentProvider({ children }: { children: ReactNode }) {
  const { currentHub } = useHub();
  const { mood } = useEmotion();
  const audio = useAudio();

  const engine = useMemo(() => new EnvironmentEngine(), []);

  const [environment, setEnvironment] = useState<EnvironmentConfig | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // ค่า prevPeriod — ใช้เปรียบเทียบ transition
  const prevPeriodRef = useRef<TimePeriod | undefined>(undefined);
  // timer cleanup
  const tickTimerRef  = useRef<ReturnType<typeof setInterval> | null>(null);
  // transition animation cleanup
  const transTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ─── Core compute function ─────────────────────────────────────────────────

  const compute = useCallback(() => {
    const config = engine.compute({
      hub:        currentHub,
      mood,
      prevPeriod: prevPeriodRef.current,
    });

    // Apply CSS vars to :root (merged from all engines)
    const root = document.documentElement;
    for (const [key, value] of Object.entries(config.cssVars)) {
      root.style.setProperty(key, value);
    }

    // Set data-tod for time-of-day CSS selectors
    root.setAttribute('data-tod', config.timePeriod);

    // Set data-twin-state for Twin avatar styling
    // Format: "period-expression" (e.g. "awake-joyful", "dreaming-tired")
    const twinStateAttr = `${config.twinState.posture}-${config.twinState.expression}`;
    root.setAttribute('data-twin-state', twinStateAttr);

    // Handle period transition
    if (config.shouldTransition) {
      setIsTransitioning(true);
      // clear old transition timer
      if (transTimerRef.current) clearTimeout(transTimerRef.current);
      transTimerRef.current = setTimeout(() => {
        setIsTransitioning(false);
      }, TRANSITION_DURATION_MS);

      // Sync audio experience on period change — เฉพาะถ้า user เปิด music อยู่
      if (audio.state.musicEnabled) {
        audio.setExperience(config.recommendedExperience);
      }
    }

    prevPeriodRef.current = config.timePeriod;
    setEnvironment(config);
  }, [engine, currentHub, mood, audio]);

  // ─── Initial compute + periodic tick ──────────────────────────────────────

  useEffect(() => {
    // คำนวณทันที
    compute();

    // Tick ทุก 60 วินาที
    tickTimerRef.current = setInterval(compute, TICK_INTERVAL_MS);

    return () => {
      if (tickTimerRef.current)  clearInterval(tickTimerRef.current);
      if (transTimerRef.current) clearTimeout(transTimerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // mount only — recompute via hub/mood effects below

  // ─── Recompute on hub/mood change ─────────────────────────────────────────
  // (period transitions already handled by timer; hub/mood changes recompute immediately)

  useEffect(() => {
    if (environment !== null) {
      compute();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentHub, mood]);

  // ─── Sync initial audio experience on first mount ─────────────────────────
  // (ไม่ใช่ transition — แค่ set initial experience ถ้า user เปิด music)

  useEffect(() => {
    if (environment && audio.state.musicEnabled) {
      audio.setExperience(environment.recommendedExperience);
    }
    // Only run when musicEnabled first turns on — ไม่ต้อง run ทุก environment change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [audio.state.musicEnabled]);

  // ─── Context value ─────────────────────────────────────────────────────────

  const value: EnvironmentContextType = {
    environment,
    isTransitioning,
    refresh: compute,
  };

  return (
    <EnvironmentContext.Provider value={value}>
      {children}
    </EnvironmentContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useEnvironment(): EnvironmentContextType {
  return useContext(EnvironmentContext);
}
