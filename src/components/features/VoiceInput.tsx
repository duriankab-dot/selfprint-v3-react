/**
 * 🎙️ VoiceInput — Speech-to-text UI control
 * useVoiceTwin hook ใน VoiceChat.tsx จัดการ Web Speech API ทั้งหมด
 * Component นี้รับ callbacks + state จาก parent เท่านั้น
 */

import React from 'react';
import './voice-input.css';

interface VoiceInputProps {
  isListening: boolean;
  isDisabled: boolean;
  transcript: string;
  onStart: () => void;
  onStop: () => void;
  language: 'th' | 'en';
}

const VoiceInput: React.FC<VoiceInputProps> = ({
  isListening,
  isDisabled,
  transcript,
  onStart,
  onStop,
  language,
}) => {
  const isTh = language === 'th';

  const handleClick = () => {
    if (isListening) {
      onStop();
    } else {
      onStart();
    }
  };

  return (
    <div className="voice-input">
      <div className="voice-input__display">
        <p className="voice-input__text">
          {isListening
            ? (transcript || (isTh ? 'กำลังฟัง...' : 'Listening...'))
            : (isTh ? 'กดปุ่มไมโครโฟนและพูดได้เลย' : 'Press the microphone button and speak')}
        </p>
      </div>

      <div className="voice-input__controls">
        <button
          className={`voice-input__btn${isListening ? ' listening' : ''}`}
          onClick={handleClick}
          disabled={isDisabled && !isListening}
          aria-label={isListening
            ? (isTh ? 'หยุดฟัง' : 'Stop listening')
            : (isTh ? 'เริ่มฟัง' : 'Start listening')}
        >
          {isListening ? '⏹️' : '🎙️'}
        </button>
      </div>

      <p className="voice-input__hint">
        {isListening
          ? (isTh ? 'กดอีกครั้งเพื่อหยุด' : 'Press again to stop')
          : (isTh ? 'STT ผ่าน Web Speech API' : 'STT via Web Speech API')}
      </p>
    </div>
  );
};

export default VoiceInput;
