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

  const [messages, setMessages] = useState<Message[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [settings, setSettings] = useState<VoiceSettings>({
    tone: 'warm',
    pace: 'normal',
    language: 'th',
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
        text: `คุณพูดว่า: "${transcript}"\n\nนี่คือคำตอบจาก AI Twin... (ยังไม่มี backend)`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMsg]);
      setIsSpeaking(false);
    }, 1000);
  };

  const handleClearHistory = () => {
    if (confirm('ลบประวัติการสนทนาทั้งหมดหรือ?')) {
      setMessages([]);
    }
  };

  // ===================================================
  // Render
  // ===================================================

  if (!userId) {
    return (
      <div className="voice-chat">
        <p>กรุณาเข้าสู่ระบบ</p>
      </div>
    );
  }

  return (
    <div className="voice-chat">
      {/* Header */}
      <div className="voice-chat__header">
        <h1>🎤 คุยกับ AI Twin</h1>
        <p>พูดคุยกับ AI Twin ด้วยเสียง เพื่อสนทนาและรับคำแนะนำ</p>
        <button
          className="voice-chat__settings-btn"
          onClick={() => setShowSettings(!showSettings)}
        >
          ⚙️ ตั้งค่า
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
        {isListening && <span className="status-badge status-listening">🎙️ กำลังฟัง...</span>}
        {isSpeaking && <span className="status-badge status-speaking">🔊 กำลังพูด...</span>}
        {!isListening && !isSpeaking && (
          <span className="status-badge status-ready">✅ พร้อม</span>
        )}
        <span className="message-count">ข้อความทั้งหมด: {messages.length}</span>
      </div>
    </div>
  );
};

export default VoiceChat;
