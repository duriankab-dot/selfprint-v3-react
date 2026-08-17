/**
 * AskCoach.tsx
 *
 * Phase 5.5 UI: หน้าตาของ "ถาม Coach" — เชื่อมกับ /api/coach (backend เสร็จ
 * ตั้งแต่ commit `ed819f4`, ไฟล์นี้คือ UI ที่ยังไม่เคยมี) ต้อง login จริง
 * (ใช้ birthDate จาก /api/profile + mood ปัจจุบันจาก EmotionContext)
 *
 * เปิดใช้แบบ staged rollout (Phase 5.6) — ดู src/lib/rollout.ts — คนที่ไม่
 * อยู่ใน rollout bucket จะไม่เห็น section นี้เลย (return null เงียบ ๆ ไม่ใช่
 * ข้อความ "ฟีเจอร์นี้ยังไม่เปิด" ที่จะสร้างความสับสนโดยไม่จำเป็น)
 */

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useEmotion } from '@/context/EmotionContext';
import { isInRollout } from '@/lib/rollout';
import './AskCoach.css';

const ROLLOUT_PERCENT = Number(import.meta.env.VITE_COACH_ROLLOUT_PERCENT ?? 10);

type AskState = 'idle' | 'loading' | 'answered' | 'error';

interface CoachAnswer {
  answer: string;
  contextUsed: { decisionStyle: string; patternsFound: number };
}

const AskCoach: React.FC = () => {
  const { session } = useAuth();
  const { mood } = useEmotion();
  const [birthDate, setBirthDate] = useState<string | null>(null);
  const [question, setQuestion] = useState('');
  const [state, setState] = useState<AskState>('idle');
  const [result, setResult] = useState<CoachAnswer | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  const userId = session?.user?.id;
  const inRollout = isInRollout(userId, 'ask-coach', ROLLOUT_PERCENT);

  useEffect(() => {
    if (!inRollout || !session?.access_token) return;

    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/profile', {
          headers: { Authorization: `Bearer ${session.access_token}` },
        });
        if (!res.ok) return;
        const json = await res.json();
        if (!cancelled) setBirthDate(json.profile?.date_of_birth ?? null);
      } catch {
        // เงียบ — ถ้าดึง birthDate ไม่ได้ ปุ่มถามจะ disabled เอง (เช็คด้านล่าง)
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [inRollout, session]);

  if (!inRollout) return null;

  const canAsk = Boolean(session?.access_token) && Boolean(birthDate) && question.trim().length > 0;

  const handleAsk = async () => {
    if (!canAsk || !session?.access_token || !birthDate) return;

    setState('loading');
    setErrorMessage('');

    try {
      const res = await fetch('/api/coach', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ birthDate, mood, question: question.trim() }),
      });

      const json = await res.json();

      if (!res.ok) {
        setErrorMessage(json.message || 'ถามไม่สำเร็จ ลองใหม่อีกครั้ง');
        setState('error');
        return;
      }

      setResult({ answer: json.answer, contextUsed: json.contextUsed });
      setState('answered');
    } catch {
      setErrorMessage('เชื่อมต่อไม่สำเร็จ ลองใหม่อีกครั้ง');
      setState('error');
    }
  };

  return (
    <div className="coach-section">
      <h2>ถาม Coach</h2>
      <div className="coach-card">
        {!session?.access_token && (
          <p className="coach-hint">ต้อง login ก่อนเพื่อถาม Coach</p>
        )}
        {session?.access_token && !birthDate && (
          <p className="coach-hint">ต้องมีวันเกิดในโปรไฟล์ก่อน (ทำ onboarding ให้ครบ)</p>
        )}

        <textarea
          className="coach-input"
          placeholder="พิมพ์คำถามเชิงการตัดสินใจ เช่น 'ควรเปลี่ยนงานตอนนี้ไหม'"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          disabled={state === 'loading'}
          rows={3}
        />

        <button
          type="button"
          className="coach-ask-btn"
          onClick={handleAsk}
          disabled={!canAsk || state === 'loading'}
        >
          {state === 'loading' ? 'กำลังคิด...' : 'ถาม Coach'}
        </button>

        {state === 'error' && <p className="coach-error">⚠️ {errorMessage}</p>}

        {state === 'answered' && result && (
          <div className="coach-answer">
            <p className="coach-answer-text">{result.answer}</p>
            {result.contextUsed.patternsFound > 0 && (
              <p className="coach-answer-meta">
                อ้างอิงจากรูปแบบที่พบในประวัติการใช้งานของคุณ ({result.contextUsed.patternsFound} รูปแบบ)
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AskCoach;
