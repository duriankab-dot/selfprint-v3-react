import { useState, useEffect, useRef } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import type { Mood } from '@/context/EmotionContext';
import { DobSelect, TimeSelect } from './BirthDateTimeSelect';
import { isDobComplete, isTimeComplete, dobToISODate, timeToHHMM } from '@/lib/geo/birthDateTime';
import type { DobValue, TimeValue } from '@/lib/geo/birthDateTime';
import { BirthPlaceSelect } from './BirthPlaceSelect';
import type { BirthPlace } from '@/lib/geo/birthPlace.types';

interface BirthData {
  dob: string;
  time?: string;
  place?: string;
}

interface NovaConversationProps {
  onComplete: (data: BirthData) => void;
  mood?: Mood;
}

type ConversationStage = 'greeting' | 'dob' | 'time' | 'place' | 'confirm';

interface Message {
  id: string;
  role: 'nova' | 'user';
  text: string;
  timestamp: number;
}

// TROJAN-BRIDGE: Explicit messaging that DOB = behavioral analysis, not divination
// Available in Thai and English for all markets
// TROJAN-BRIDGE: Nova messaging bridges horoscope/fortune-telling intent → behavioral science.
// Lead with language familiar to astrology users, then anchor in data — never cold-open with
// scientific jargon. The DOB ask in particular must feel like a natural extension of "knowing
// you" rather than an impersonal form field.
const NOVA_MESSAGES_TH = {
  greeting:
    'สวัสดีครับ 👁️ ผมคือ SELFPRINT — คุณมาที่นี่เพราะอยากเข้าใจตัวเอง หรืออยากรู้ว่าอนาคตควรเดินทางไหน ผมจะไม่ทำนายดวง — แต่ผมจะให้สิ่งที่แม่นกว่า: ถอดรหัสรูปแบบพฤติกรรมที่ซ่อนอยู่ในตัวคุณ ข้อมูลบอกได้มากกว่าดาว',
  dob: 'ขอนำวันเดือนปีเกิดของคุณไปคำนวณหน่อยนะ (ไม่ใช่การดูดวงตามดวงดาว — แต่ระบบจะใช้ข้อมูลช่วงเวลาเพื่อถอดรหัส Initial State Matrix สภาวะเริ่มต้น เพื่อดูแนวโน้มพฤติกรรมที่ซ่อนอยู่ของคุณ — เช่น วงจรการตัดสินใจ และ chronotype ที่ทำให้คุณเป็นแบบที่เป็น) เลือกจากรายการด้านล่างได้เลย',
  time: 'เกิดเวลาไหน? (ไม่บังคับ — ยิ่งละเอียดยิ่ง calibrate behavioral rhythm ได้แม่นขึ้น)',
  place: 'แล้วเกิดที่ไหน? (ไม่บังคับ — ใช้ตั้ง environmental baseline)',
  confirm: (dob: string, time?: string, place?: string) => {
    let msg = `รับทราบ ✓ ${dob}`;
    if (time) msg += ` เวลา ${time}`;
    if (place) msg += ` ที่ ${place}`;
    msg += ' — ข้อมูลเหล่านี้ไม่ใช่ดวงชะตา แต่เป็น Initial State Matrix — baseline ที่ Twin ของคุณจะเรียนรู้และพัฒนาต่อไปตามตัวคุณจริงๆ พร้อมเจอ AI Twin ของตัวเองหรือยัง?';
    return msg;
  },
};

const NOVA_MESSAGES_EN = {
  greeting:
    "Hello 👁️ I'm SELFPRINT. Whether you came here curious about your future or wanting to understand yourself better — I won't tell your fortune. Instead, I'll give you something more accurate: a behavioral pattern analysis built from your actual data. Statistics reveal more than stars ever could.",
  dob: "Let me take your birth date to start building your profile. (This isn't fortune-telling — the system uses temporal data to decode your Initial State Matrix: the behavioral tendencies and decision-cycle patterns that make you who you are.) Pick it from the list below.",
  time: 'What time were you born? (Optional — the more precise, the better we can calibrate your behavioral rhythm.)',
  place: 'Where were you born? (Optional — used for environmental baseline calibration.)',
  confirm: (dob: string, time?: string, place?: string) => {
    let msg = `Got it ✓ ${dob}`;
    if (time) msg += ` at ${time}`;
    if (place) msg += ` in ${place}`;
    msg += " — this isn't your destiny. It's your Initial State Matrix — a behavioral baseline your Twin will learn from and refine as you grow. Ready to meet your AI Twin?";
    return msg;
  },
};

// Formats a canonical BirthPlace into the display string persisted on BirthData.place.
// BirthData.place stays a plain string (consumed downstream by CoreAwakening/analysis
// exactly as before) — the full BirthPlace (lat/lng/timezone) lives in
// src/lib/geo/birthPlaceRegistry.ts for a future feature to consume end-to-end.
function formatPlace(place: BirthPlace, isTh: boolean): string {
  if (place.countryCode === 'TH') return isTh ? place.nameTh : place.nameEn;
  const city = isTh ? place.nameTh : place.nameEn;
  return place.admin1 ? `${city}, ${place.admin1}` : city;
}

export const NovaConversation: React.FC<NovaConversationProps> = ({
  onComplete,
}) => {
  const { language } = useLanguage();
  const isTh = language === 'th';
  const NOVA_MESSAGES = isTh ? NOVA_MESSAGES_TH : NOVA_MESSAGES_EN;

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [stage, setStage] = useState<ConversationStage>('greeting');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '0',
      role: 'nova',
      text: NOVA_MESSAGES.greeting,
      timestamp: Date.now(),
    },
  ]);
  const [birthData, setBirthData] = useState<BirthData>({
    dob: '',
    time: '',
    place: '',
  });

  // Draft values for the control currently on screen — committed into
  // birthData (as strings) only once the user presses Next/Skip/Yes.
  const [dobDraft, setDobDraft] = useState<DobValue>({ day: null, month: null, year: null });
  const [timeDraft, setTimeDraft] = useState<TimeValue>({ hour: null, minute: null });
  const [placeDraft, setPlaceDraft] = useState<BirthPlace | null>(null);
  const [loading, setLoading] = useState(false);

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Move to next stage after greeting
  useEffect(() => {
    if (stage === 'greeting' && messages.length === 1) {
      const timer = setTimeout(() => {
        addNovaMessage(NOVA_MESSAGES.dob);
        setStage('dob');
      }, 1500);
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage, messages.length]);

  const addNovaMessage = (text: string) => {
    const newMessage: Message = { id: String(Date.now()), role: 'nova', text, timestamp: Date.now() };
    setMessages((prev) => [...prev, newMessage]);
  };

  const addUserMessage = (text: string) => {
    const newMessage: Message = { id: String(Date.now() + 1), role: 'user', text, timestamp: Date.now() };
    setMessages((prev) => [...prev, newMessage]);
  };

  const advanceAfter = (fn: () => void) => {
    setLoading(true);
    setTimeout(() => {
      fn();
      setLoading(false);
    }, 400);
  };

  const handleDobNext = () => {
    if (!isDobComplete(dobDraft) || loading) return;
    const iso = dobToISODate(dobDraft);
    const display = isTh
      ? `${dobDraft.day} ${['มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน', 'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'][dobDraft.month - 1]} ${dobDraft.year + 543}`
      : iso;
    addUserMessage(display);
    advanceAfter(() => {
      setBirthData((prev) => ({ ...prev, dob: iso }));
      addNovaMessage(NOVA_MESSAGES.time);
      setStage('time');
    });
  };

  const handleTimeNext = (skip: boolean) => {
    if (loading) return;
    if (!skip && !isTimeComplete(timeDraft)) return;
    const hhmm = !skip && isTimeComplete(timeDraft) ? timeToHHMM(timeDraft) : undefined;
    addUserMessage(skip ? (isTh ? 'ข้าม' : 'Skip') : hhmm!);
    advanceAfter(() => {
      setBirthData((prev) => ({ ...prev, time: hhmm ?? '' }));
      addNovaMessage(NOVA_MESSAGES.place);
      setStage('place');
    });
  };

  const handlePlaceNext = (skip: boolean) => {
    if (loading) return;
    const placeStr = !skip && placeDraft ? formatPlace(placeDraft, isTh) : undefined;
    addUserMessage(skip ? (isTh ? 'ข้าม' : 'Skip') : placeStr!);
    advanceAfter(() => {
      const finalData = { ...birthData, place: placeStr ?? '' };
      setBirthData(finalData);
      addNovaMessage(NOVA_MESSAGES.confirm(finalData.dob, finalData.time, placeStr));
      setStage('confirm');
    });
  };

  const handleConfirm = (yes: boolean) => {
    if (loading) return;
    addUserMessage(yes ? (isTh ? 'ใช่' : 'Yes') : isTh ? 'ไม่ใช่' : 'No');
    if (yes) {
      advanceAfter(() => onComplete(birthData));
    } else {
      advanceAfter(() => {
        addNovaMessage(isTh ? 'งั้นเริ่มใหม่ตั้งแต่ต้นนะ' : "Alright, let's start over from the beginning");
        setStage('dob');
        setBirthData({ dob: '', time: '', place: '' });
        setDobDraft({ day: null, month: null, year: null });
        setTimeDraft({ hour: null, minute: null });
        setPlaceDraft(null);
        addNovaMessage(NOVA_MESSAGES.dob);
      });
    }
  };

  const nextButtonStyle = (enabled: boolean): React.CSSProperties => ({
    padding: '10px 20px',
    borderRadius: '8px',
    border: 'none',
    backgroundColor: 'var(--color-accent-primary)',
    color: 'white',
    fontWeight: 600,
    cursor: enabled ? 'pointer' : 'not-allowed',
    opacity: enabled ? 1 : 0.5,
    transition: 'opacity 0.2s',
  });

  const skipButtonStyle: React.CSSProperties = {
    padding: '10px 20px',
    borderRadius: '8px',
    border: '1px solid var(--color-border)',
    backgroundColor: 'transparent',
    color: 'var(--color-text-secondary)',
    fontWeight: 500,
    cursor: 'pointer',
  };

  const renderStageControl = () => {
    if (loading) {
      return null;
    }
    switch (stage) {
      case 'dob':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <DobSelect value={dobDraft} onChange={setDobDraft} />
            <button onClick={handleDobNext} disabled={!isDobComplete(dobDraft)} style={nextButtonStyle(isDobComplete(dobDraft))}>
              {isTh ? 'ต่อไป →' : 'Next →'}
            </button>
          </div>
        );
      case 'time':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <TimeSelect value={timeDraft} onChange={setTimeDraft} />
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={() => handleTimeNext(true)} style={skipButtonStyle}>
                {isTh ? 'ข้าม' : 'Skip'}
              </button>
              <button
                onClick={() => handleTimeNext(false)}
                disabled={!isTimeComplete(timeDraft)}
                style={{ ...nextButtonStyle(isTimeComplete(timeDraft)), flex: 1 }}
              >
                {isTh ? 'ต่อไป →' : 'Next →'}
              </button>
            </div>
          </div>
        );
      case 'place':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <BirthPlaceSelect onSelect={setPlaceDraft} />
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={() => handlePlaceNext(true)} style={skipButtonStyle}>
                {isTh ? 'ข้าม' : 'Skip'}
              </button>
              <button onClick={() => handlePlaceNext(false)} style={{ ...nextButtonStyle(true), flex: 1 }}>
                {isTh ? 'ต่อไป →' : 'Next →'}
              </button>
            </div>
          </div>
        );
      case 'confirm':
        return (
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={() => handleConfirm(false)} style={{ ...skipButtonStyle, flex: 1 }}>
              {isTh ? 'ไม่ใช่' : 'No'}
            </button>
            <button onClick={() => handleConfirm(true)} style={{ ...nextButtonStyle(true), flex: 1 }}>
              {isTh ? 'ใช่ ✓' : 'Yes ✓'}
            </button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div
      style={{
        maxWidth: '600px',
        height: '100vh',
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        background: `var(--color-bg-primary)`,
        color: `var(--color-text-primary)`,
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '24px',
          borderBottom: '1px solid var(--color-border)',
          background: `var(--color-bg-secondary)`,
        }}
      >
        <h2
          style={{
            margin: '0',
            fontSize: '18px',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <span>🤖</span> SELFPRINT
        </h2>
        <p
          style={{
            margin: '4px 0 0 0',
            fontSize: '12px',
            color: 'var(--color-text-secondary)',
          }}
        >
          {isTh ? 'มาทำความรู้จักกันหน่อย' : "Let's get to know each other"}
        </p>
      </div>

      {/* Messages */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
        }}
      >
        {messages.map((msg) => (
          <div
            key={msg.id}
            style={{
              display: 'flex',
              justifyContent:
                msg.role === 'nova' ? 'flex-start' : 'flex-end',
            }}
          >
            <div
              style={{
                maxWidth: '80%',
                padding: '12px 16px',
                borderRadius: '12px',
                backgroundColor:
                  msg.role === 'nova'
                    ? 'var(--color-bg-secondary)'
                    : 'var(--color-accent-primary)',
                color:
                  msg.role === 'nova'
                    ? 'var(--color-text-primary)'
                    : 'white',
                fontSize: '14px',
                lineHeight: 1.5,
                wordBreak: 'break-word',
              }}
            >
              {msg.text}
            </div>
          </div>
        ))}
        {loading && (
          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-start',
            }}
          >
            <div
              style={{
                padding: '12px 16px',
                borderRadius: '12px',
                backgroundColor: 'var(--color-bg-secondary)',
                fontSize: '14px',
              }}
            >
              <span
                style={{
                  display: 'inline-block',
                  animation: 'pulse 1.5s infinite',
                }}
              >
                ●●●
              </span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Stage control — dropdowns + buttons only, no free-text input */}
      <div
        style={{
          padding: '16px 24px',
          borderTop: '1px solid var(--color-border)',
          background: 'var(--color-bg-secondary)',
        }}
      >
        {renderStageControl()}
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
};

export default NovaConversation;
