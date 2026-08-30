/**
 * 🎤 VoiceChat Component — Chat ด้วยเสียงกับ AI Twin
 *
 * **ทำหน้าที่:**
 * - Speech-to-text บันทึกเสียง
 * - Text-to-speech อ่านคำตอบ
 * - Conversation history
 * - Voice settings (tone, pace, language)
 * - Adaptive personality
 */

import React, { useState, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
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
  audioUrl?: string;
}

interface VoiceSettings {
  tone: 'warm' | 'professional' | 'friendly' | 'analytical';
  pace: 'slow' | 'normal' | 'fast';
  language: 'th' | 'en';
  volume: number; // 0-100
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
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [settings, setSettings] = useState<VoiceSettings>({
    tone: 'warm',
    pace: 'normal',
    language: isTh ? 'th' : 'en',
    volume: 100,
  });
  const [showSettings, setShowSettings] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // ===================================================
  // Handlers
  // ===================================================

  const handleUserMessage = async (transcript: string) => {
    if (!transcript.trim()) return;

    // Add user message
    const userMsg: Message = {
      id: `msg_${Date.now()}`,
      role: 'user',
      text: transcript,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);

    // Simulate AI response (mock)
    setTimeout(() => {
      const assistantMsg: Message = {
        id: `msg_${Date.now() + 1}`,
        role: 'assistant',
        text: isTh
          ? `คุณพูดว่า: "${transcript}"\n\nนี่คือคำตอบจาก AI Twin... (ยังไม่มี backend)`
          : `You said: "${transcript}"\n\nThis is a response from your AI Twin... (no backend yet)`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMsg]);
      setIsSpeaking(false);
    }, 1000);
  };

  const handleClearHistory = () => {
    if (confirm(isTh ? 'ลบประวัติการสนทนาทั้งหมดหรือ?' : 'Clear the entire conversation history?')) {
      setMessages([]);
    }
  };

  // ===================================================
  // Render
  // ===================================================

  if (!userId) {
    return (
      <div className="voice-chat">
        <p>{isTh ? 'กรุณาเข้าสู่ระบบ' : 'Please log in'}</p>
      </div>
    );
  }

  return (
    <div className="voice-chat">
      {/* Header */}
      <div className="voice-chat__header">
        <h1>🎤 {isTh ? 'คุยกับ AI Twin' : 'Talk with your AI Twin'}</h1>
        <p>{isTh ? 'พูดคุยกับ AI Twin ด้วยเสียง เพื่อสนทนาและรับคำแนะนำ' : 'Talk with your AI Twin by voice to converse and get guidance'}</p>
        <button
          className="voice-chat__settings-btn"
          onClick={() => setShowSettings(!showSettings)}
        >
          ⚙️ {isTh ? 'ตั้งค่า' : 'Settings'}
        </button>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="voice-chat__settings-panel">
          <VoiceSettings
            settings={settings}
            onChange={setSettings}
          />
        </div>
      )}

      {/* Main Chat */}
      <div className="voice-chat__container">
        {/* History */}
        <div className="voice-chat__history">
          <ConversationHistory
            messages={messages}
            onClear={handleClearHistory}
          />
          <div ref={messagesEndRef} />
        </div>

        {/* Input/Output Controls */}
        <div className="voice-chat__controls">
          <VoiceInput
            isListening={isListening}
            onStart={() => setIsListening(true)}
            onStop={() => setIsListening(false)}
            onTranscript={handleUserMessage}
            language={settings.language}
          />

          <VoiceOutput
            isSpeaking={isSpeaking}
            message={messages[messages.length - 1]?.text || ''}
            settings={settings}
          />
        </div>
      </div>

      {/* Status */}
      <div className="voice-chat__status">
        {isListening && <span className="status-badge status-listening">🎙️ {isTh ? 'กำลังฟัง...' : 'Listening...'}</span>}
        {isSpeaking && <span className="status-badge status-speaking">🔊 {isTh ? 'กำลังพูด...' : 'Speaking...'}</span>}
        {!isListening && !isSpeaking && (
          <span className="status-badge status-ready">✅ {isTh ? 'พร้อม' : 'Ready'}</span>
        )}
        <span className="message-count">{isTh ? 'ข้อความทั้งหมด' : 'Total messages'}: {messages.length}</span>
      </div>
    </div>
  );
};

export default VoiceChat;
