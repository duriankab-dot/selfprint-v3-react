/**
 * 🔊 VoiceOutput Component — Text-to-speech output
 */

import React from 'react';
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
  settings,
}) => {
  const handleSpeak = () => {
    if (!message) {
      alert('ไม่มีข้อความให้อ่าน');
      return;
    }

    // Mock text-to-speech
    alert(`กำลังอ่าน (Tone: ${settings.tone}, Pace: ${settings.pace}, Volume: ${settings.volume}%)`);
  };

  return (
    <div className="voice-output">
      <button
        className={`voice-output__btn${isSpeaking ? ' speaking' : ''}`}
        onClick={handleSpeak}
        disabled={!message}
        title="อ่านคำตอบ"
      >
        🔊
      </button>
      <span className="voice-output__status">
        {isSpeaking ? 'กำลังอ่าน...' : 'พร้อมอ่าน'}
      </span>
    </div>
  );
};

export default VoiceOutput;
