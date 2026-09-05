/**
 * 🎙️ VoiceInput Component — Speech-to-text input
 */

import React, { useState } from 'react';
import './voice-input.css';

interface VoiceInputProps {
  isListening: boolean;
  onStart: () => void;
  onStop: () => void;
  onTranscript: (text: string) => void;
  language: 'th' | 'en';
}

const VoiceInput: React.FC<VoiceInputProps> = ({
  isListening,
  language,
  // STUB-001: onStart/onStop/onTranscript are intentionally unused — voice input
  // is a stub now and only fires a "coming soon" alert. Prefix with _ to satisfy
  // TS6133 until the feature is properly wired to a backend.
  onStart: _onStart,
  onStop: _onStop,
  onTranscript: _onTranscript,
}) => {
  const isTh = language === 'th';
  const [isBrowserSupported] = useState(
    'webkitSpeechRecognition' in window || 'SpeechRecognition' in window
  );

  const handleStartListening = () => {
    if (!isBrowserSupported) {
      alert(isTh ? 'เบราว์เซอร์ของคุณไม่รองรับ Speech Recognition' : 'Your browser does not support Speech Recognition');
      return;
    }

    // STUB-001 (5 ก.ย. 2026): Voice input disabled — STT backend not wired.
    // Previously this fired a 3s setTimeout returning fake transcript text,
    // which made the UI look like a working voice feature. Now it surfaces a
    // honest "coming soon" alert instead.
    alert(
      isTh
        ? '🎙️ การป้อนด้วยเสียงกำลังจะมาเร็วๆ นี้ — ขณะนี้ยังไม่มี backend'
        : '🎙️ Voice input is coming soon — no STT backend is wired yet.'
    );
  };

  return (
    <div className="voice-input">
      <div className="voice-input__display">
        <p className="voice-input__text">
          {isTh ? 'กดปุ่มไมโครโฟนและพูดได้เลย...' : 'Press the microphone button and speak...'}
        </p>
      </div>

      <div className="voice-input__controls">
        <button
          className={`voice-input__btn${isListening ? ' listening' : ''}`}
          onClick={handleStartListening}
          disabled={isListening}
          title={isTh ? 'กดแล้วพูด' : 'Press and speak'}
        >
          🎙️
        </button>
        <span className="voice-input__lang">
          {isTh ? '🇹🇭 Thai' : '🇺🇸 English'}
        </span>
      </div>
    </div>
  );
};

export default VoiceInput;
