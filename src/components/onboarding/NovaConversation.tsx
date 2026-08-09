/**
 * NovaConversation.tsx
 *
 * Nova-guided conversation for birth data collection
 * Replaces form with natural conversational flow
 * MEMO V4: "Nova teaches, not a survey"
 */

import { useState, useRef, useEffect } from 'react';
import type { Mood } from '@/context/EmotionContext';

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

const NOVA_MESSAGES = {
  greeting:
    'ขอถามอะไรบางอย่างที่สำคัญเพื่อให้รู้จักคุณลึกขึ้นนะ เดี๋ยวจะพาตอบทีละคำถาม',
  dob: 'คุณเกิดวันไหน? บอกแค่วันที่ก็พอ เช่น 15 มกราคม 1990 (รูปแบบ: YYYY-MM-DD)',
  time: 'เกิดเวลาไหน? (ไม่บังคับ - ถ้ารู้ ใช้รูปแบบ HH:MM เช่น 14:30)',
  place: 'แล้วเกิดที่ไหน? (ไม่บังคับ - บอกแค่ชื่อเมืองก็พอ เช่น กรุงเทพฯ)',
  confirm: (dob: string, time?: string, place?: string) => {
    let msg = `รับทราบ! ${dob}`;
    if (time) msg += ` เกิดเวลา ${time}`;
    if (place) msg += ` ที่ ${place}`;
    msg += ' นี่คือพื้นฐานที่จะใช้สร้าง AI Twin พร้อมพบ AI Twin ของคุณหรือยัง?';
    return msg;
  },
};

export const NovaConversation: React.FC<NovaConversationProps> = ({
  onComplete,
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

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
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<string>('');

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Auto-focus input
  useEffect(() => {
    inputRef.current?.focus();
  }, [stage]);

  // Move to next stage after greeting
  useEffect(() => {
    if (stage === 'greeting' && messages.length === 1) {
      const timer = setTimeout(() => {
        addNovaMessage(NOVA_MESSAGES.dob);
        setStage('dob');
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [stage, messages.length]);

  const addNovaMessage = (text: string) => {
    const newMessage: Message = {
      id: String(Date.now()),
      role: 'nova',
      text,
      timestamp: Date.now(),
    };
    setMessages((prev) => [...prev, newMessage]);
  };

  const addUserMessage = (text: string) => {
    const newMessage: Message = {
      id: String(Date.now()),
      role: 'user',
      text,
      timestamp: Date.now(),
    };
    setMessages((prev) => [...prev, newMessage]);
  };

  const validateDate = (dateString: string): boolean => {
    if (!dateString) return false;
    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date.getTime());
  };

  const validateTime = (timeString: string): boolean => {
    const timeRegex = /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/;
    return timeRegex.test(timeString);
  };

  const handleSubmitInput = async () => {
    if (!inputValue.trim()) return;

    const userInput = inputValue.trim();
    addUserMessage(userInput);
    setInputValue('');
    setErrors('');
    setLoading(true);

    // Simulate processing delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    try {
      if (stage === 'dob') {
        if (!validateDate(userInput)) {
          setErrors('รูปแบบวันที่ไม่ถูกต้อง กรุณาใช้ YYYY-MM-DD');
          addNovaMessage(
            'ไม่แน่ใจว่าเข้าใจถูกไหม ช่วยบอกวันเกิดอีกครั้งในรูปแบบ YYYY-MM-DD ได้ไหม?'
          );
          setLoading(false);
          return;
        }
        setBirthData((prev) => ({ ...prev, dob: userInput }));
        addNovaMessage(NOVA_MESSAGES.time);
        setStage('time');
      } else if (stage === 'time') {
        if (userInput.toLowerCase() !== 'skip' && userInput !== '') {
          if (!validateTime(userInput)) {
            setErrors('รูปแบบเวลาไม่ถูกต้อง กรุณาใช้ HH:MM หรือพิมพ์ "skip"');
            addNovaMessage(
              'รูปแบบเวลาควรเป็น HH:MM (เช่น 14:30) หรือพิมพ์ "skip" เพื่อข้าม'
            );
            setLoading(false);
            return;
          }
          setBirthData((prev) => ({ ...prev, time: userInput }));
        }
        addNovaMessage(NOVA_MESSAGES.place);
        setStage('place');
      } else if (stage === 'place') {
        if (userInput.toLowerCase() !== 'skip') {
          setBirthData((prev) => ({ ...prev, place: userInput }));
        }
        addNovaMessage(
          NOVA_MESSAGES.confirm(birthData.dob, birthData.time, userInput)
        );
        setStage('confirm');
      } else if (stage === 'confirm') {
        if (
          userInput.toLowerCase() === 'yes' ||
          userInput.toLowerCase() === 'y' ||
          userInput === 'ใช่'
        ) {
          onComplete(birthData);
        } else {
          addNovaMessage('งั้นเริ่มใหม่ตั้งแต่ต้นนะ');
          setStage('dob');
          setBirthData({ dob: '', time: '', place: '' });
          addNovaMessage(NOVA_MESSAGES.dob);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !loading) {
      handleSubmitInput();
    }
  };

  const getPlaceholder = (): string => {
    switch (stage) {
      case 'dob':
        return 'เช่น 1990-01-15';
      case 'time':
        return 'เช่น 14:30 หรือ skip';
      case 'place':
        return 'เช่น กรุงเทพฯ หรือ skip';
      case 'confirm':
        return 'Yes หรือ No';
      default:
        return 'คำตอบของคุณ...';
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
          <span>🤖</span> Nova
        </h2>
        <p
          style={{
            margin: '4px 0 0 0',
            fontSize: '12px',
            color: 'var(--color-text-secondary)',
          }}
        >
          มาทำความรู้จักกันหน่อย
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

      {/* Error message */}
      {errors && (
        <div
          style={{
            padding: '8px 24px',
            backgroundColor: '#ffebee',
            color: '#c62828',
            fontSize: '12px',
            borderTop: '1px solid #ef5350',
          }}
        >
          {errors}
        </div>
      )}

      {/* Input */}
      <div
        style={{
          padding: '16px 24px',
          borderTop: '1px solid var(--color-border)',
          background: 'var(--color-bg-secondary)',
          display: 'flex',
          gap: '8px',
        }}
      >
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={loading}
          placeholder={getPlaceholder()}
          style={{
            flex: 1,
            padding: '10px 12px',
            borderRadius: '8px',
            border: '1px solid var(--color-border)',
            background: 'var(--color-bg-primary)',
            color: 'var(--color-text-primary)',
            fontSize: '14px',
            opacity: loading ? 0.6 : 1,
          }}
        />
        <button
          onClick={handleSubmitInput}
          disabled={!inputValue.trim() || loading}
          style={{
            padding: '10px 16px',
            borderRadius: '8px',
            border: 'none',
            backgroundColor: 'var(--color-accent-primary)',
            color: 'white',
            fontWeight: 600,
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: !inputValue.trim() || loading ? 0.5 : 1,
            transition: 'opacity 0.2s',
          }}
        >
          {stage === 'confirm' ? '✓' : '→'}
        </button>
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
