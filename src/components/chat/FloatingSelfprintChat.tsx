/**
 * FloatingSelfprintChat.tsx
 *
 * SELFPRINTCHAT-001: floating, draggable "Selfprint Chat" button — a
 * general assistant for how-to-use / general questions about the app,
 * deliberately distinct from the Twin (which knows the user personally).
 * If a conversation turns deep/personal, the assistant itself suggests
 * switching to the Twin (see callSelfprintAssistant's system prompt) —
 * this component just surfaces that suggestion with a quick "คุยกับทวิน"
 * shortcut.
 *
 * Mounted globally in App.tsx alongside TwinEvolution/ContextualPopup, and
 * — like those — renders nothing until a session exists (no point showing
 * an in-app assistant on the public marketing pages).
 */

import { useState, useRef, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { useLangNavigate as useNavigate } from '@/hooks/useLangNavigate';
import { callSelfprintAssistant } from '@/services/NovaAPIService';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

const BUTTON_SIZE = 56;
const DRAG_THRESHOLD = 6; // px of movement before a press counts as a drag, not a click

export function FloatingSelfprintChat() {
  const { session } = useAuth();
  const { language } = useLanguage();
  const navigate = useNavigate();
  const isTh = language === 'th';

  const [position, setPosition] = useState<{ x: number; y: number } | null>(null); // null = default bottom-right
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);

  const dragState = useRef<{ startX: number; startY: number; origX: number; origY: number; dragged: boolean } | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const getCurrentPos = useCallback((): { x: number; y: number } => {
    if (position) return position;
    const rect = buttonRef.current?.getBoundingClientRect();
    return {
      x: rect ? rect.left : window.innerWidth - BUTTON_SIZE - 20,
      y: rect ? rect.top : window.innerHeight - BUTTON_SIZE - 88, // clears BottomNav
    };
  }, [position]);

  const handlePointerDown = (e: React.PointerEvent) => {
    const current = getCurrentPos();
    dragState.current = { startX: e.clientX, startY: e.clientY, origX: current.x, origY: current.y, dragged: false };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!dragState.current) return;
    const dx = e.clientX - dragState.current.startX;
    const dy = e.clientY - dragState.current.startY;
    if (Math.abs(dx) > DRAG_THRESHOLD || Math.abs(dy) > DRAG_THRESHOLD) {
      dragState.current.dragged = true;
    }
    if (!dragState.current.dragged) return;
    const maxX = window.innerWidth - BUTTON_SIZE - 8;
    const maxY = window.innerHeight - BUTTON_SIZE - 8;
    setPosition({
      x: Math.min(Math.max(8, dragState.current.origX + dx), maxX),
      y: Math.min(Math.max(8, dragState.current.origY + dy), maxY),
    });
  };

  const handlePointerUp = () => {
    const wasDragged = dragState.current?.dragged ?? false;
    dragState.current = null;
    if (!wasDragged) {
      setIsOpen((v) => !v);
    }
  };

  const handleSend = async () => {
    const text = input.trim();
    if (!text || isSending) return;
    setInput('');
    const nextMessages: ChatMessage[] = [...messages, { role: 'user', content: text }];
    setMessages(nextMessages);
    setIsSending(true);
    try {
      const reply = await callSelfprintAssistant(nextMessages, isTh ? 'th' : 'en');
      setMessages((prev) => [...prev, { role: 'assistant', content: reply }]);
    } catch {
      setMessages((prev) => [...prev, {
        role: 'assistant',
        content: isTh ? 'ขอโทษค่ะ ตอนนี้ตอบไม่ได้ ลองใหม่อีกครั้งนะ' : "Sorry, I couldn't respond just now — please try again.",
      }]);
    } finally {
      setIsSending(false);
    }
  };

  if (!session?.user?.id) return null;

  const pos = position;
  const buttonStyle: React.CSSProperties = pos
    ? { position: 'fixed', left: pos.x, top: pos.y, right: 'auto', bottom: 'auto' }
    : { position: 'fixed', right: 20, bottom: 88 };

  return (
    <>
      <button
        ref={buttonRef}
        aria-label={isTh ? 'เปิดแชท Selfprint' : 'Open Selfprint chat'}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        style={{
          ...buttonStyle,
          width: BUTTON_SIZE,
          height: BUTTON_SIZE,
          borderRadius: '50%',
          border: 'none',
          background: 'var(--color-accent-primary)',
          color: '#fff',
          fontSize: '1.5rem',
          display: isOpen ? 'none' : 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: 'var(--shadow-md, 0 4px 16px rgba(0,0,0,0.25))',
          cursor: 'grab',
          zIndex: 400,
          touchAction: 'none',
        }}
      >
        💬
      </button>

      {isOpen && (
        <div
          style={{
            position: 'fixed',
            ...(pos
              ? { left: Math.min(pos.x, window.innerWidth - 340), top: Math.min(pos.y, window.innerHeight - 440) }
              : { right: 20, bottom: 88 }),
            width: 'min(320px, calc(100vw - 32px))',
            height: 'min(420px, calc(100vh - 140px))',
            display: 'flex',
            flexDirection: 'column',
            background: 'var(--color-bg-secondary)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-xl, 16px)',
            boxShadow: 'var(--shadow-md, 0 8px 32px rgba(0,0,0,0.3))',
            zIndex: 400,
            overflow: 'hidden',
          }}
        >
          {/* Header */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 14px',
              borderBottom: '1px solid var(--color-border)',
              background: 'var(--color-bg-tertiary)',
            }}
          >
            <span style={{ fontWeight: 700, color: 'var(--color-text-primary)' }}>
              💬 {isTh ? 'แชทกับ SELFPRINT' : 'Chat with SELFPRINT'}
            </span>
            <button
              onClick={() => setIsOpen(false)}
              aria-label={isTh ? 'ปิด' : 'Close'}
              style={{ background: 'none', border: 'none', fontSize: '1.1rem', cursor: 'pointer', color: 'var(--color-text-secondary)' }}
            >
              ✕
            </button>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 8 }}>
            {messages.length === 0 && (
              <p style={{ fontSize: '0.85rem', color: 'var(--color-text-tertiary)', margin: 0 }}>
                {isTh
                  ? 'ถามได้เลยเกี่ยวกับวิธีใช้งานแอป เช่น "12 โลกคืออะไร" หรือ "ตั้งค่าเสียงยังไง" — ถ้าเรื่องลึกหรือเป็นส่วนตัว จะแนะนำให้คุยกับทวินของคุณแทน'
                  : 'Ask anything about how to use the app — e.g. "what are the 12 Worlds" or "how do I turn on voice". For deep or personal questions, I\'ll suggest chatting with your Twin instead.'}
              </p>
            )}
            {messages.map((m, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
                <div
                  style={{
                    maxWidth: '85%',
                    padding: '8px 12px',
                    borderRadius: 12,
                    fontSize: '0.88rem',
                    lineHeight: 1.5,
                    background: m.role === 'user' ? 'var(--color-accent-primary)' : 'var(--color-bg-tertiary)',
                    color: m.role === 'user' ? '#fff' : 'var(--color-text-primary)',
                  }}
                >
                  {m.content}
                </div>
              </div>
            ))}
            {isSending && (
              <div style={{ fontSize: '0.8rem', color: 'var(--color-text-tertiary)' }}>
                {isTh ? 'กำลังพิมพ์...' : 'Typing...'}
              </div>
            )}
          </div>

          {/* Switch-to-Twin shortcut — always available, not just on suggestion */}
          <div style={{ padding: '0 14px' }}>
            <button
              onClick={() => { setIsOpen(false); navigate('/chat/twin'); }}
              style={{
                width: '100%',
                padding: '8px',
                marginBottom: 8,
                borderRadius: 8,
                border: '1px solid var(--color-border)',
                background: 'transparent',
                color: 'var(--color-text-secondary)',
                fontSize: '0.78rem',
                cursor: 'pointer',
              }}
            >
              {isTh ? '💫 อยากคุยลึกขึ้น? ไปคุยกับทวินของคุณ →' : '💫 Want to go deeper? Talk to your Twin →'}
            </button>
          </div>

          {/* Input */}
          <div style={{ display: 'flex', gap: 8, padding: '0 14px 14px' }}>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !isSending && handleSend()}
              placeholder={isTh ? 'พิมพ์คำถาม...' : 'Type a question...'}
              disabled={isSending}
              style={{
                flex: 1,
                padding: '9px 12px',
                borderRadius: 8,
                border: '1px solid var(--color-border)',
                background: 'var(--color-bg-primary)',
                color: 'var(--color-text-primary)',
                fontSize: '0.88rem',
              }}
            />
            <button
              onClick={handleSend}
              disabled={isSending || !input.trim()}
              style={{
                padding: '9px 14px',
                borderRadius: 8,
                border: 'none',
                background: 'var(--color-accent-primary)',
                color: '#fff',
                fontWeight: 600,
                fontSize: '0.85rem',
                cursor: 'pointer',
                opacity: isSending || !input.trim() ? 0.5 : 1,
              }}
            >
              {isTh ? 'ส่ง' : 'Send'}
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default FloatingSelfprintChat;
