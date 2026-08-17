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
  onStart,
  onStop,
  onTranscript,
  language,
}) => {
  const [transcript, setTranscript] = useState('');
  const [isBrowserSupported] = useState(
    'webkitSpeechRecognition' in window || 'SpeechRecognition' in window
  );

  const handleStartListening = () => {
    if (!isBrowserSupported) {
      alert('เบราว์เซอร์ของคุณไม่รองรับ Speech Recognition');
      return;
    }

    onStart();
    setTranscript('');

    // Mock speech recognition
    setTimeout(() => {
      setTranscript('สวัสดี ฉันต้องการพูดคุยกับ AI Twin');
      onTranscript('สวัสดี ฉันต้องการพูดคุยกับ AI Twin');
      onStop();
    }, 3000);
  };

  return (
    <div className="voice-input">
      <div className="voice-input__display">
        <p className="voice-input__text">
          {transcript || 'กดปุ่มไมโครโฟนและพูดได้เลย...'}
        </p>
      </div>

      <div className="voice-input__controls">
        <button
          className={`voice-input__btn${isListening ? ' listening' : ''}`}
          onClick={handleStartListening}
          disabled={isListening}
          title="กดแล้วพูด"
        >
          🎙️
        </button>
        <span className="voice-input__lang">
          {language === 'th' ? '🇹🇭 Thai' : '🇺🇸 English'}
        </span>
      </div>
    </div>
  );
};

export default VoiceInput;
