/**
 * 🎤 VoiceChat Component — Chat ด้วยเสียงกับ AI Twin
 *
 * Pipeline: STT (Web Speech API) → /api/nova → TTS (Web Speech API)
 * ไม่ต้องมี audio backend — ใช้ browser-native APIs ทั้งหมด
 */

import React, { useState, useRef, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { useVoiceTwin } from '@/hooks/useVoiceTwin';
import VoiceInput from './VoiceInput';
import VoiceOutput from './VoiceOutput';
import ConversationHistory from './ConversationHistory';
import VoiceSettings from './VoiceSettings';
import './voice-chat.css';

// ============================================================================
// Types
// ============================================================================

interface Message {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  timestamp: Date;
}

interface VoiceSettingsType {
  tone: 'warm' | 'professional' | 'friendly' | 'analytical';
  pace: 'slow' | 'normal' | 'fast';
  language: 'th' | 'en';
  volume: number;
}

// ============================================================================
// Nova API call
// ============================================================================

async function callNova(
  userText: string,
  history: Message[],
  accessToken: string,
  isTh: boolean
): Promise<string> {
  const systemPrompt = isTh
    ? 'คุณคือ AI Twin ของผู้ใช้ — ตอบสั้น กระชับ เหมาะกับการสนทนาด้วยเสียง ไม่เกิน 2-3 ประโยค ใช้ภาษาไทยที่เป็นกันเองและอบอุ่น'
    : 'You are the user\'s AI Twin. Reply briefly and concisely for voice conversation — 2-3 sentences max. Be warm and personal.';

  const messages = [
    ...history.slice(-10).map((m) => ({ role: m.role, content: m.text })),
    { role: 'user' as const, content: userText },
  ];

  const res = await fetch('/api/nova', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ system: systemPrompt, messages, max_tokens: 200 }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error((err as { error?: string }).error ?? `Nova error ${res.status}`);
  }

  const data = (await res.json()) as { content: string };
  return data.content ?? '';
}

// ============================================================================
// Component
// ============================================================================

const VoiceChat: React.FC = () => {
  const { session } = useAuth();
  const userId = session?.user?.id ?? '';
  const { language } = useLanguage();
  const isTh = language === 'th';

  const [messages, setMessages] = useState<Message[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [settings, setSettings] = useState<VoiceSettingsType>({
    tone: 'warm',
    pace: 'normal',
    language: isTh ? 'th' : 'en',
    volume: 100,
  });
  const [showSettings, setShowSettings] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // ── onTranscript: called by useVoiceTwin when STT gives a final result ──
  const handleTranscript = useCallback(
    async (transcript: string) => {
      if (!transcript.trim() || isProcessing) return;
      if (!session?.access_token) {
        setErrorMsg(isTh ? 'ไม่พบ session — กรุณาเข้าสู่ระบบ' : 'No session — please log in');
        return;
      }

      setErrorMsg(null);
      setIsProcessing(true);
      stopListening();

      const userMsg: Message = {
        id: `msg_${Date.now()}`,
        role: 'user',
        text: transcript,
        timestamp: new Date(),
      };
      setMessages((prev) => {
        const updated = [...prev, userMsg];
        // Scroll after render
        requestAnimationFrame(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }));
        return updated;
      });

      try {
        // Use functional update to get latest messages snapshot
        let latestMessages: Message[] = [];
        setMessages((prev) => { latestMessages = prev; return prev; });

        const reply = await callNova(transcript, latestMessages, session.access_token, isTh);

        const assistantMsg: Message = {
          id: `msg_${Date.now() + 1}`,
          role: 'assistant',
          text: reply,
          timestamp: new Date(),
        };
        setMessages((prev) => {
          const updated = [...prev, assistantMsg];
          requestAnimationFrame(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }));
          return updated;
        });

        // Speak the reply (mood: warm for voice)
        speak(reply, 'calm');
      } catch (err) {
        setErrorMsg(err instanceof Error ? err.message : 'เกิดข้อผิดพลาด');
      } finally {
        setIsProcessing(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isProcessing, session, isTh]
  );

  const voiceLang = settings.language === 'th' ? 'th-TH' : 'en-US';
  const { state: voiceState, startListening, stopListening, speak } = useVoiceTwin({
    language: voiceLang,
    onTranscript: handleTranscript,
    onSpeakEnd: () => { /* ready for next input */ },
  });

  const handleClearHistory = () => {
    if (confirm(isTh ? 'ลบประวัติการสนทนาทั้งหมดหรือ?' : 'Clear all conversation history?')) {
      setMessages([]);
    }
  };

  // ── Not logged in ──────────────────────────────────────────────────────
  if (!userId) {
    return (
      <div className="voice-chat">
        <p>{isTh ? 'กรุณาเข้าสู่ระบบ' : 'Please log in'}</p>
      </div>
    );
  }

  // ── Browser not supported ─────────────────────────────────────────────
  if (!voiceState.supported) {
    return (
      <div className="voice-chat">
        <p>
          {isTh
            ? '⚠️ เบราว์เซอร์นี้ไม่รองรับ Voice Chat — ลอง Chrome หรือ Edge'
            : '⚠️ This browser does not support Voice Chat — try Chrome or Edge'}
        </p>
      </div>
    );
  }

  const isListening = voiceState.mode === 'listening';
  const isSpeaking = voiceState.mode === 'speaking';

  // ============================================================================
  // Render
  // ============================================================================

  return (
    <div className="voice-chat">
      {/* Header */}
      <div className="voice-chat__header">
        <h1>🎤 {isTh ? 'คุยกับ AI Twin' : 'Talk with your AI Twin'}</h1>
        <p>
          {isTh
            ? 'พูดคุยกับ AI Twin ด้วยเสียง — ใช้ Web Speech API'
            : 'Voice conversation with your AI Twin — powered by Web Speech API'}
        </p>
        <button className="voice-chat__settings-btn" onClick={() => setShowSettings(!showSettings)}>
          ⚙️ {isTh ? 'ตั้งค่า' : 'Settings'}
        </button>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="voice-chat__settings-panel">
          <VoiceSettings settings={settings} onChange={setSettings} />
        </div>
      )}

      {/* Error */}
      {(errorMsg ?? voiceState.sttError ?? voiceState.ttsError) && (
        <div className="voice-chat__error">
          ⚠️ {errorMsg ?? voiceState.sttError ?? voiceState.ttsError}
        </div>
      )}

      {/* Live transcript */}
      {isListening && voiceState.transcript && (
        <div className="voice-chat__live-transcript">
          🎙️ {voiceState.transcript}
        </div>
      )}

      {/* Processing */}
      {isProcessing && (
        <div className="voice-chat__processing">
          ⏳ {isTh ? 'AI กำลังคิด...' : 'AI is thinking...'}
        </div>
      )}

      {/* Main Chat */}
      <div className="voice-chat__container">
        <div className="voice-chat__history">
          <ConversationHistory messages={messages} onClear={handleClearHistory} />
          <div ref={messagesEndRef} />
        </div>

        <div className="voice-chat__controls">
          <VoiceInput
            isListening={isListening}
            isDisabled={isProcessing || isSpeaking}
            transcript={voiceState.transcript}
            onStart={startListening}
            onStop={stopListening}
            language={settings.language}
          />

          <VoiceOutput
            isSpeaking={isSpeaking}
            lastMessage={messages.findLast((m) => m.role === 'assistant')?.text ?? ''}
            onSpeak={(text) => speak(text, 'calm')}
          />
        </div>
      </div>

      {/* Status bar */}
      <div className="voice-chat__status">
        {isListening && (
          <span className="status-badge status-listening">
            🎙️ {isTh ? 'กำลังฟัง...' : 'Listening...'}
          </span>
        )}
        {isSpeaking && (
          <span className="status-badge status-speaking">
            🔊 {isTh ? 'กำลังพูด...' : 'Speaking...'}
          </span>
        )}
        {isProcessing && (
          <span className="status-badge status-processing">
            ⏳ {isTh ? 'กำลังประมวลผล...' : 'Processing...'}
          </span>
        )}
        {!isListening && !isSpeaking && !isProcessing && (
          <span className="status-badge status-ready">
            ✅ {isTh ? 'พร้อม' : 'Ready'}
          </span>
        )}
        <span className="message-count">
          {isTh ? 'ข้อความทั้งหมด' : 'Total messages'}: {messages.length}
        </span>
      </div>
    </div>
  );
};

export default VoiceChat;
