import React, { createContext, useState, useCallback, useEffect, useContext } from 'react';
import type { ReactNode } from 'react';
import { AuthContext } from './AuthContext';
import { logEvent } from '../services/analytics';

export const MOODS = ['stressed', 'confused', 'confident', 'drained', 'ready', 'reflective'] as const;
export type Mood = typeof MOODS[number];

interface MoodLog {
  mood: Mood;
  timestamp: number;
  hub?: string;
}

interface EmotionContextType {
  mood: Mood;
  moodHistory: MoodLog[];
  updateMood: (newMood: Mood) => void;
  /** true ถ้าผู้ใช้เคยเช็คอินอารมณ์มาแล้ว (ที่ไหนก็ได้ในเว็บ รวมทั้ง session ก่อนหน้า) — ใช้ข้ามหน้าจอเช็คอินซ้ำ */
  hasCheckedIn: boolean;
}

const MOOD_STORAGE_KEY = 'selfprint_mood';

function getStoredMood(): Mood | null {
  if (typeof window === 'undefined') return null;
  const stored = window.localStorage.getItem(MOOD_STORAGE_KEY);
  return stored && (MOODS as readonly string[]).includes(stored) ? (stored as Mood) : null;
}

const EmotionContext = createContext<EmotionContextType | undefined>(undefined);

export function EmotionProvider({ children }: { children: ReactNode }) {
  const storedMood = getStoredMood();
  const [mood, setMood] = useState<Mood>(storedMood ?? 'reflective');
  const [moodHistory, setMoodHistory] = useState<MoodLog[]>([]);
  const [hasCheckedIn, setHasCheckedIn] = useState<boolean>(storedMood !== null);
  // Phase 5.7: analytics event — อ่าน userId แบบ optional เหมือน HubContext
  // (useContext ตรงๆ ไม่ throw ถ้าไม่มี AuthProvider ห่ออยู่ในเทส)
  const authCtx = useContext(AuthContext);
  const userId = authCtx?.session?.user?.id;

  // ธีม (data-mood) ต้องตามทุกครั้งที่ mood เปลี่ยน ไม่ว่าจะเปลี่ยนจากจุดไหนของเว็บ
  // และต้องถูก apply ทันทีตั้งแต่ mount แรก (รวมกรณี mood มาจาก localStorage เดิม)
  useEffect(() => {
    document.documentElement.setAttribute('data-mood', mood);
  }, [mood]);

  const updateMood = useCallback(
    (newMood: Mood) => {
      if (!MOODS.includes(newMood)) return;

      setMood((prevMood) => {
        if (prevMood !== newMood) {
          logEvent(userId, 'mood_change', { from: prevMood, to: newMood });
        }
        return newMood;
      });
      setHasCheckedIn(true);
      setMoodHistory((prev) => [...prev, { mood: newMood, timestamp: Date.now() }]);
      localStorage.setItem(MOOD_STORAGE_KEY, newMood);
    },
    [userId]
  );

  const value: EmotionContextType = {
    mood,
    moodHistory,
    updateMood,
    hasCheckedIn,
  };

  return (
    <EmotionContext.Provider value={value}>
      {children}
    </EmotionContext.Provider>
  );
}

export function useEmotion() {
  const context = React.useContext(EmotionContext);
  if (!context) {
    throw new Error('useEmotion must be used within EmotionProvider');
  }
  return context;
}
