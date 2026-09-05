/**
 * 🔊 VoiceOutput Component — Text-to-speech output
 */

import React from 'react';
import { useLanguage } from '@/context/LanguageContext';
import './voice-output.css';

interface VoiceOutputProps {
  isSpeaking: boolean;
  message: string;
  settings: {
    tone: string;
    pace: string;
    language: string;
    volume: number;
  };
}

const VoiceOutput: React.FC<VoiceOutputProps> = ({
  isSpeaking,
  message,
  // STUB-001: settings intentionally unused — voice output is a stub.
  settings: _settings,
}) => {
  const { language } = useLanguage();
  const isTh = language === 'th';

  const handleSpeak = () => {
    if (!message) {
      alert(isTh ? 'ไม่มีข้อความให้อ่าน' : 'No message to read');
      return;
    }

    // STUB-001 (5 ก.ย. 2026): Voice output disabled — TTS backend not wired.
    // Previously the "Speak" button alerted a fake "Reading…" message which
    // gave the impression that TTS was working. Now it honestly reports
    // that the feature is coming soon.
    alert(
      isTh
        ? '🔊 การอ่านออกเสียงกำลังจะมาเร็วๆ นี้ — ขณะนี้ยังไม่มี TTS backend'
        : '🔊 Voice output is coming soon — no TTS backend is wired yet.'
    );
  };

  return (
    <div className="voice-output">
      <button
        className={`voice-output__btn${isSpeaking ? ' speaking' : ''}`}
        onClick={handleSpeak}
        disabled={!message}
        title={isTh ? 'อ่านคำตอบ' : 'Read the answer'}
      >
        🔊
      </button>
      <span className="voice-output__status">
        {isSpeaking ? (isTh ? 'กำลังอ่าน...' : 'Speaking...') : (isTh ? 'พร้อมอ่าน' : 'Ready to speak')}
      </span>
    </div>
  );
};

export default VoiceOutput;
