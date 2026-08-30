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
  const isTh = language === 'th';
  const [transcript, setTranscript] = useState('');
  const [isBrowserSupported] = useState(
    'webkitSpeechRecognition' in window || 'SpeechRecognition' in window
  );

  const handleStartListening = () => {
    if (!isBrowserSupported) {
      alert(isTh ? 'เบราว์เซอร์ของคุณไม่รองรับ Speech Recognition' : 'Your browser does not support Speech Recognition');
      return;
    }

    onStart();
    setTranscript('');

    // Mock speech recognition
    const mockText = isTh ? 'สวัสดี ฉันต้องการพูดคุยกับ AI Twin' : 'Hello, I want to talk with my AI Twin';
    setTimeout(() => {
      setTranscript(mockText);
      onTranscript(mockText);
      onStop();
    }, 3000);
  };

  return (
    <div className="voice-input">
      <div className="voice-input__display">
        <p className="voice-input__text">
          {transcript || (isTh ? 'กดปุ่มไมโครโฟนและพูดได้เลย...' : 'Press the microphone button and speak...')}
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
