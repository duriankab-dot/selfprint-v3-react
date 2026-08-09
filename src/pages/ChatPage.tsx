/**
 * ChatPage.tsx
 *
 * หน้า Chat หลัก — รวม Nova AI
 *
 * ส่วนประกอบ:
 * 1. HubSwitcher (เลือก hub)
 * 2. EmotionSelector (เลือก mood)
 * 3. ChatWindow (แสดง messages)
 * 4. ChatInput (ส่งข้อความ)
 */

import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { HubSwitcher } from '@/components/features/HubSwitcher';
import { EmotionSelector } from '@/components/features/EmotionSelector';
import { TypingIndicator } from '@/components/chat/TypingIndicator';
import { NavBar } from '@/components/layout/NavBar';
import { useChat } from '@/features/chat/hooks/useChat';
import { useHub } from '@/context/HubContext';
import { useEmotion } from '@/context/EmotionContext';
import { useAuth } from '@/context/AuthContext';
import { useTwinStore } from '@/store/twinStore';
import { logEvent } from '@/services/analytics';


export const ChatPage: React.FC = () => {
  const { currentHub: hub } = useHub();
  const { mood } = useEmotion();
  const { session } = useAuth();
  const recordFeedback = useTwinStore((s) => s.recordFeedback);

  // Alias สำหรับให้ readable
  const currentHub = hub;
  const currentMood = mood;

  // Autonomy tracking state
  const [autonomyLevel, setAutonomyLevel] = useState(50);

  const { messages, isLoading, error, sendMessage, clearChat } = useChat(autonomyLevel);
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  // Phase 5.7: 👍/👎 ต่อข้อความ (ไม่ผูกกับ twinStore.messages ที่แยกอิสระจาก
  // messages ของ useChat ตรงนี้ — เก็บแค่ index ที่ให้ feedback ไปแล้วในหน้านี้)
  const [feedbackGiven, setFeedbackGiven] = useState<Record<number, 'helpful' | 'unhelpful'>>({});

  const handleFeedback = (idx: number, type: 'helpful' | 'unhelpful') => {
    if (feedbackGiven[idx]) return;
    setFeedbackGiven((prev) => ({ ...prev, [idx]: type }));
    recordFeedback(type);
    logEvent(session?.user?.id, 'feedback', { type, hub: currentHub, mood: currentMood, messageIndex: idx });
  };

  // Auto-scroll ไปล่างสุด เมื่อมี message ใหม่
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // ส่งข้อความ
  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;
    if (!currentHub || !currentMood) {
      alert('ต้องเลือก hub และ mood ก่อนเซนด์');
      return;
    }

    await sendMessage(inputValue);
    setInputValue('');
  };

  // ปุ่ม Enter ส่งข้อความ
  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        background: 'linear-gradient(135deg, var(--accent-light, var(--color-bg-secondary)) 0%, var(--color-bg-primary) 100%)',
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}
    >
      <NavBar />
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '300px 1fr',
          flex: 1,
          minHeight: 0,
          gap: '16px',
          padding: '16px',
        }}
      >
      {/* LEFT SIDEBAR: Selectors */}
      <aside
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
          overflowY: 'auto',
          paddingRight: '8px',
        }}
      >
        <div>
          <h2
            style={{
              fontSize: '18px',
              fontWeight: 700,
              color: 'var(--color-text-primary)',
              marginBottom: '12px',
            }}
          >
            ⚙️ ตั้งค่า
          </h2>
          <HubSwitcher />
        </div>

        <div>
          <EmotionSelector />
        </div>

        {/* Autonomy Slider */}
        <div>
          <h2
            style={{
              fontSize: '18px',
              fontWeight: 700,
              color: 'var(--color-text-primary)',
              marginBottom: '12px',
            }}
          >
            🎯 ระดับความเป็นอิสระ
          </h2>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
            }}
          >
            <input
              type="range"
              min="0"
              max="100"
              value={autonomyLevel}
              onChange={(e) => setAutonomyLevel(Number(e.target.value))}
              style={{
                width: '100%',
                height: '6px',
                borderRadius: '3px',
                background: 'var(--color-border)',
                outline: 'none',
                cursor: 'pointer',
                accentColor: 'var(--color-accent-primary)',
              }}
            />
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontSize: '13px',
                color: 'var(--color-text-secondary)',
              }}
            >
              <span>ต่ำ</span>
              <span
                style={{
                  padding: '4px 8px',
                  borderRadius: '4px',
                  background: 'var(--color-accent-primary)20',
                  color: 'var(--color-accent-primary)',
                  fontWeight: 600,
                }}
              >
                {autonomyLevel}%
              </span>
              <span>สูง</span>
            </div>
            <p
              style={{
                fontSize: '12px',
                color: 'var(--color-text-secondary)',
                margin: '4px 0 0 0',
                lineHeight: '1.5',
              }}
            >
              {autonomyLevel < 30 && '🤔 พึ่งพามาก — ขอคำแนะนำทุกครั้ง'}
              {autonomyLevel >= 30 && autonomyLevel < 50 && '📌 พึ่งพาบ้าง — ขอความเห็นก่อนตัดสินใจ'}
              {autonomyLevel >= 50 && autonomyLevel < 70 && '⚖️ สมดุล — ทำงานร่วมกัน'}
              {autonomyLevel >= 70 && autonomyLevel < 85 && '💪 อิสระเป็นส่วนใหญ่ — ตัดสินใจเอง'}
              {autonomyLevel >= 85 && '🚀 อิสระเต็มที่ — ควบคุมเอง'}
            </p>
          </div>
        </div>

        {/* Status */}
        <div
          style={{
            padding: '12px',
            background: 'var(--color-accent-primary)10',
            borderRadius: '8px',
            fontSize: '12px',
            color: 'var(--color-text-secondary)',
            lineHeight: '1.6',
          }}
        >
          <p style={{ margin: '0 0 6px 0', fontWeight: 600, color: 'var(--color-text-primary)' }}>
            📊 สถานะ
          </p>
          <p style={{ margin: 0 }}>
            Hub: <strong>{currentHub || '-'}</strong>
          </p>
          <p style={{ margin: 0 }}>
            Mood: <strong>{currentMood || '-'}</strong>
          </p>
          <p style={{ margin: 0 }}>
            ความเป็นอิสระ: <strong>{autonomyLevel}%</strong>
          </p>
          <p style={{ margin: 0 }}>
            ข้อความ: <strong>{messages.length}</strong>
          </p>
        </div>

        {/* Clear chat button */}
        <button
          onClick={clearChat}
          style={{
            padding: '10px 12px',
            background: 'var(--color-border)',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '13px',
            color: 'var(--color-text-primary)',
            fontWeight: 500,
            transition: 'all 0.2s',
          }}
          onMouseOver={(e) => {
            (e.target as HTMLElement).style.background = 'var(--color-accent-primary)20';
          }}
          onMouseOut={(e) => {
            (e.target as HTMLElement).style.background = 'var(--color-border)';
          }}
        >
          🗑️ ล้าง Chat
        </button>

        {/* Dashboard link */}
        <Link
          to="/dashboard"
          style={{
            display: 'block',
            padding: '10px 12px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '13px',
            color: 'white',
            fontWeight: 500,
            textAlign: 'center',
            textDecoration: 'none',
            transition: 'all 0.2s',
          }}
          onMouseOver={(e) => {
            (e.currentTarget as HTMLElement).style.opacity = '0.9';
            (e.currentTarget as HTMLElement).style.transform = 'scale(1.02)';
          }}
          onMouseOut={(e) => {
            (e.currentTarget as HTMLElement).style.opacity = '1';
            (e.currentTarget as HTMLElement).style.transform = 'scale(1)';
          }}
        >
          📊 แดชบอร์ด
        </Link>
      </aside>

      {/* RIGHT CONTENT: Chat Window */}
      <main
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          height: '100%',
        }}
      >
        {/* Chat Messages */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            borderRadius: '8px',
            background: 'var(--color-bg-secondary)',
            border: '1px solid var(--color-border)',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
          }}
        >
          {messages.length === 0 && (
            <div
              style={{
                margin: 'auto',
                textAlign: 'center',
                color: 'var(--color-text-secondary)',
              }}
            >
              <p style={{ fontSize: '48px', margin: '0 0 8px 0' }}>🤖</p>
              <p style={{ margin: 0 }}>ยินดีต้อนรับเข้า Nova Chat</p>
              <p style={{ fontSize: '12px', margin: '4px 0 0 0', opacity: 0.7 }}>
                เลือก hub และ mood แล้วพิมพ์ข้อความ
              </p>
            </div>
          )}

          {messages.map((msg, idx) => (
            <div
              key={idx}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start',
                gap: '4px',
              }}
            >
              <div
                style={{
                  maxWidth: '70%',
                  padding: '12px',
                  borderRadius: '8px',
                  background:
                    msg.role === 'user'
                      ? 'var(--color-accent-primary)'
                      : 'var(--color-accent-secondary)20',
                  color: msg.role === 'user' ? 'white' : 'var(--color-text-primary)',
                  fontSize: '14px',
                  lineHeight: '1.5',
                  wordWrap: 'break-word',
                  whiteSpace: 'pre-wrap',
                }}
              >
                {msg.content}
              </div>

              {/* Phase 5.7: feedback 👍/👎 — เฉพาะข้อความของ Nova */}
              {msg.role === 'assistant' && (
                <div style={{ display: 'flex', gap: '6px', paddingLeft: '4px' }}>
                  <button
                    type="button"
                    aria-label="helpful"
                    onClick={() => handleFeedback(idx, 'helpful')}
                    disabled={Boolean(feedbackGiven[idx])}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: feedbackGiven[idx] ? 'default' : 'pointer',
                      fontSize: '14px',
                      opacity: feedbackGiven[idx] && feedbackGiven[idx] !== 'helpful' ? 0.3 : 1,
                    }}
                  >
                    👍
                  </button>
                  <button
                    type="button"
                    aria-label="unhelpful"
                    onClick={() => handleFeedback(idx, 'unhelpful')}
                    disabled={Boolean(feedbackGiven[idx])}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: feedbackGiven[idx] ? 'default' : 'pointer',
                      fontSize: '14px',
                      opacity: feedbackGiven[idx] && feedbackGiven[idx] !== 'unhelpful' ? 0.3 : 1,
                    }}
                  >
                    👎
                  </button>
                </div>
              )}
            </div>
          ))}

          {/* Typing indicator with animation */}
          <TypingIndicator show={isLoading} />

          {/* Error message */}
          {error && (
            <div
              style={{
                padding: '12px',
                borderRadius: '8px',
                background: '#ff4444',
                color: 'white',
                fontSize: '13px',
              }}
            >
              ❌ {error}
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Chat Input */}
        <div
          style={{
            display: 'flex',
            gap: '8px',
            alignItems: 'flex-end',
          }}
        >
          <textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="พิมพ์ข้อความ... (Shift+Enter = ขึ้นบรรทัดใหม่)"
            disabled={isLoading}
            style={{
              flex: 1,
              padding: '12px',
              borderRadius: '8px',
              border: '1px solid var(--color-border)',
              background: 'var(--color-bg-secondary)',
              color: 'var(--color-text-primary)',
              fontSize: '14px',
              fontFamily: 'inherit',
              resize: 'none',
              maxHeight: '100px',
              opacity: isLoading ? 0.5 : 1,
              cursor: isLoading ? 'not-allowed' : 'text',
            }}
            rows={2}
          />
          <button
            onClick={handleSendMessage}
            disabled={isLoading || !inputValue.trim()}
            style={{
              padding: '12px 20px',
              borderRadius: '8px',
              border: 'none',
              background: isLoading ? 'var(--color-border)' : 'var(--color-accent-primary)',
              color: isLoading ? 'var(--color-text-secondary)' : 'white',
              fontSize: '14px',
              fontWeight: 600,
              cursor: isLoading ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s',
              minWidth: '80px',
            }}
            onMouseOver={(e) => {
              if (!isLoading) {
                (e.target as HTMLElement).style.opacity = '0.9';
              }
            }}
            onMouseOut={(e) => {
              if (!isLoading) {
                (e.target as HTMLElement).style.opacity = '1';
              }
            }}
          >
            {isLoading ? '⏳' : '📤 ส่ง'}
          </button>
        </div>
      </main>
      </div>
    </div>
  );
};

export default ChatPage;
